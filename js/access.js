// ---------- accessibility: keyboard movement, reduced motion, bigger text ----------
// Settings live in localStorage (da_a11y) and apply as classes on <body> (rm, ts1, ts2) plus a few checks in the renderer.
const TEXT_SCALES = [1, 1.2, 1.4];   // Normal, Large, Extra large
const A11Y = {rm: false, ts: 0};
(function loadA11y(){
  let s = null; try { s = JSON.parse(localStorage.getItem('da_a11y') || 'null'); } catch (e) {}
  if (s && typeof s === 'object'){ A11Y.rm = !!s.rm; A11Y.ts = Math.max(0, Math.min(2, Math.floor(+s.ts) || 0)); }
  else A11Y.rm = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);   // follow the device setting until the player chooses
})();
function saveA11y(){ try { localStorage.setItem('da_a11y', JSON.stringify({rm: A11Y.rm, ts: A11Y.ts})); } catch (e) {} }

// Bigger text: for every font size set in px in style.css, a larger copy under body.ts1 / body.ts2 (built once, so new CSS scales too).
let textStyle = null;
function buildTextScaleCSS(){
  const sheet = Array.prototype.find.call(document.styleSheets, s => (s.href || '').indexOf('style.css') >= 0); if (!sheet) return '';
  const out = [], F = [TEXT_SCALES[1], TEXT_SCALES[2]];
  const walk = (rules, wrap) => {
    for (const r of rules){
      if (r.cssRules && r.media){ walk(r.cssRules, '@media ' + r.media.mediaText); continue; }
      if (!r.style || !r.selectorText) continue;
      const fs = r.style.getPropertyValue('font-size'); if (!/^[\d.]+px$/.test(fs)) continue;
      const px = parseFloat(fs), sels = r.selectorText.split(',').map(x => x.trim());
      for (let k = 0; k < 2; k++){
        const cls = 'ts' + (k + 1), sel = sels.map(x => x.indexOf('body') === 0 ? x.replace(/^body/, 'body.' + cls) : 'body.' + cls + ' ' + x).join(',');
        const rule = sel + '{font-size:' + (px * F[k]).toFixed(1) + 'px !important}'; out.push(wrap ? wrap + '{' + rule + '}' : rule);
      }
    }
  };
  try { walk(sheet.cssRules, ''); } catch (e) {}
  return out.join('\n');
}
function applyA11y(){
  const b = document.body; b.classList.toggle('rm', A11Y.rm); b.classList.toggle('ts1', A11Y.ts === 1); b.classList.toggle('ts2', A11Y.ts === 2);
  if (A11Y.ts > 0 && !textStyle){ textStyle = document.createElement('style'); textStyle.textContent = buildTextScaleCSS(); document.head.appendChild(textStyle); }
  if (typeof setupTicker === 'function') setupTicker();
  refreshA11yUI();
}
// the on-screen game panel (HUD) is drawn on a virtual screen; bigger text means a bigger virtual scale, kept inside what fits the display
function hudScale(){
  const k = Math.max(0.6, Math.min(1, innerWidth / 760, innerHeight / 540)), f = TEXT_SCALES[A11Y.ts];
  return f > 1 ? Math.max(k, Math.min(k * f, innerWidth / 560, innerHeight / 340)) : k;
}

// ---------- keyboard: WASD and the arrow keys walk (Space, G and F already work) ----------
const heldKeys = new Set(), MOVE_KEYS = {KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0]};
let kbWalking = false;
const typingIn = e => { const t = e.target && e.target.tagName; return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || (e.target && e.target.isContentEditable); };
const inPlay = () => !!(game && game.started && game.mode !== 'arrest' && document.getElementById('menu').style.display === 'none');
addEventListener('keydown', e => {
  if (!MOVE_KEYS[e.code] || e.ctrlKey || e.metaKey || e.altKey || typingIn(e) || !inPlay()) return;
  heldKeys.add(e.code); e.preventDefault();   // stops the arrow keys scrolling the page
});
addEventListener('keyup', e => { heldKeys.delete(e.code); });
addEventListener('blur', () => { heldKeys.clear(); });
function keyDir(){
  let x = 0, y = 0; for (const c of heldKeys){ x += MOVE_KEYS[c][0]; y += MOVE_KEYS[c][1]; }
  const d = Math.hypot(x, y); return d ? {x: x / d, y: y / d} : null;
}
// called every frame by both sides: head the way the keys point, and stand still when they are released (like the touch pad does)
function steerKeys(){
  if (pad.id !== null) return;
  const d = keyDir();
  if (d){ mouse.x = (player.x + d.x * 200 - cam.x) * Z; mouse.y = (player.y + d.y * 200 - cam.y) * Z; kbWalking = true; }
  else if (kbWalking){ kbWalking = false; stopWalk(); }
}

// ---------- settings panel on the menu ----------
const a11yLabels = () => [tr('Normal'), tr('Large'), tr('Extra large')];
function refreshA11yUI(){
  const box = document.getElementById('a11y'); if (!box) return;
  box.querySelector('summary').textContent = tr('Accessibility');
  box.querySelector('.ats').textContent = tr('Text size');
  box.querySelectorAll('.atsb').forEach((b, i) => { b.textContent = a11yLabels()[i]; b.classList.toggle('on', A11Y.ts === i); b.setAttribute('aria-pressed', A11Y.ts === i ? 'true' : 'false'); });
  box.querySelector('.arm').textContent = tr('Reduced motion');
  box.querySelector('.armh').textContent = tr('No screen flashes or shaking, and the news ticker stays still.');
  box.querySelector('.armc').checked = A11Y.rm;
  box.querySelector('.akh').textContent = tr('Keyboard: walk with W A S D or the arrow keys. Strike with Space. Police: G for smoke, F for warning shots.');
}
(function(){
  const at = document.getElementById('avatarrow') || document.getElementById('roles'); if (!at) return;
  const d = document.createElement('details'); d.id = 'a11y';
  d.innerHTML = '<summary></summary><div class="arow"><span class="ats"></span><div><button type="button" class="avchip atsb"></button><button type="button" class="avchip atsb"></button><button type="button" class="avchip atsb"></button></div></div>' +
    '<div class="arow"><label class="asw"><input type="checkbox" class="armc"><span class="arm"></span></label><small class="armh"></small></div><small class="akh"></small>';
  at.after(d);
  d.querySelectorAll('.atsb').forEach((b, i) => b.onclick = () => { A11Y.ts = i; saveA11y(); applyA11y(); });
  d.querySelector('.armc').onchange = e => { A11Y.rm = e.target.checked; saveA11y(); applyA11y(); };
  applyA11y();
})();
