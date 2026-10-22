const IS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
// ---------- loop ----------
let last = 0;
let rotShown = false;
function frame(ts){
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
  // only if the player chose horizontal play and holds the phone upright: ask them to turn it (or switch to vertical), and pause meanwhile
  const needRotate = IS_TOUCH && ORIENT === 'landscape' && !!(game && game.started) && innerHeight > innerWidth;
  if (needRotate !== rotShown){ rotShown = needRotate; document.getElementById('rotate').classList.toggle('open', needRotate); }
  if (game && game.started && !rotShown) update(dt);
  if (game) draw();
  requestAnimationFrame(frame);
}
// ---------- vertical or horizontal play: the player's choice ----------
// Vertical is the default and needs nothing. Horizontal asks the browser to lock landscape (Android Chrome allows it in fullscreen);
// the screen layout always follows the real shape of the window.
let ORIENT = 'portrait'; try { if (localStorage.getItem('da_orient') === 'landscape') ORIENT = 'landscape'; } catch (e) {}
function applyOrientation(){
  if (!IS_TOUCH || !(screen.orientation && screen.orientation.lock)) return;
  try {
    if (ORIENT === 'landscape'){
      const lock = () => screen.orientation.lock('landscape').catch(() => {});
      screen.orientation.lock('landscape').catch(() => {
        const el = document.documentElement, rf = el.requestFullscreen || el.webkitRequestFullscreen;
        if (rf) Promise.resolve(rf.call(el)).then(lock).catch(() => {});
      });
    } else {   // vertical: release any landscape lock and leave fullscreen, so the phone is free again
      if (screen.orientation.unlock) screen.orientation.unlock();
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  } catch (e) {}
}
function setOrient(o){
  ORIENT = o === 'landscape' ? 'landscape' : 'portrait';
  try { localStorage.setItem('da_orient', ORIENT); } catch (e) {}
  applyOrientation(); refreshOrient();
}
const orientRows = [];
function refreshOrient(){
  for (let i = orientRows.length - 1; i >= 0; i--){
    const r = orientRows[i]; if (!r.isConnected){ orientRows.splice(i, 1); continue; }
    r.querySelector('span').textContent = tr('Play style');
    r.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.o === ORIENT); b.textContent = (b.dataset.o === 'portrait' ? '▯ ' : '▭ ') + tr(b.dataset.o === 'portrait' ? 'Vertical' : 'Horizontal'); });
  }
}
function orientRow(){   // touch screens only: a computer cannot be turned
  const r = document.createElement('div'); r.className = 'orient';
  r.innerHTML = '<span></span><button type="button" data-o="portrait"></button><button type="button" data-o="landscape"></button>';
  r.querySelectorAll('button').forEach(b => { b.onclick = () => setOrient(b.dataset.o); });
  if (!IS_TOUCH) r.style.display = 'none';
  orientRows.push(r); refreshOrient();
  return r;
}
document.addEventListener('click', e => { if (e.target && e.target.id === 'rotportrait') setOrient('portrait'); });
function start(isDaily){
  if (isDaily !== true){ DAILY = null; TWIST = null; CH_NOW = null; RUNSEED = (Math.random() * 4294967296) >>> 0; seedGame(RUNSEED); }   // every game gets its own seed, so it can be shared as a challenge
  const inp = document.getElementById('pname');
  const typed = inp ? inp.value.trim() : '';
  if (typed && typed !== 'Protester' && typed !== 'Officer') playerName = typed;
  else if (playerName === 'Protester' || playerName === 'Officer') playerName = role === 'police' ? 'Officer' : 'Protester';
  try { localStorage.setItem('da_name', playerName); } catch (e) {}
  ac();   // unlock audio on the user's click
  applyOrientation();
  document.getElementById('menu').style.display = 'none';
  if (role === 'police') newPoliceGame(); else newGame();
  if (typeof trackStart === 'function') trackStart(role);
}
document.getElementById('go').onclick = () => { if (tutSeen(role)) start(); else showTutorial(role, start); };
const hb = document.getElementById('howbtn'); if (hb) hb.onclick = () => showTutorial(role);
const mb = document.getElementById('mute'); if (mb) mb.onclick = toggleMute;
function showRole(){
  const a = document.getElementById('role-prot'), b = document.getElementById('role-pol'); if (!a || !b) return;
  a.classList.toggle('sel', role === 'protester'); b.classList.toggle('sel', role === 'police'); if (typeof refreshDaily === 'function') refreshDaily();
  const r1 = document.getElementById('rules'), r2 = document.getElementById('rules2'); if (r1) r1.style.display = role === 'police' ? 'none' : ''; if (r2) r2.style.display = role === 'police' ? '' : 'none';
  const pn = document.getElementById('pname'); if (pn) pn.placeholder = tr(role === 'police' ? 'Officer' : 'Protester');
  const go = document.getElementById('go'); if (go) go.textContent = tr(role === 'police' ? 'Start patrol' : 'Start marching');
}
try { if (localStorage.getItem('da_role') === 'police') role = 'police'; } catch (e) {}
if (document.getElementById('role-prot')){
  document.getElementById('role-prot').onclick = () => { role = 'protester'; try { localStorage.setItem('da_role', role); } catch (e) {} showRole(); };
  document.getElementById('role-pol').onclick = () => { role = 'police'; try { localStorage.setItem('da_role', role); } catch (e) {} showRole(); };
  showRole();
}
const photoEl = document.getElementById('photo'); if (photoEl) photoEl.onchange = e => loadPhoto(e.target.files[0]);   // the photo is chosen on the final card
cv.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
cv.addEventListener('mousedown', e => { if (e.button !== 0) return; if (role === 'police'){ input.strike = true; doStrike(); } else doBreak(); });
addEventListener('mouseup', () => { input.strike = false; });
addEventListener('keydown', e => {
  if (!game || !game.started) return;
  if (role !== 'police'){ if (e.code === 'Space'){ e.preventDefault(); doBreak(); } return; }
  if (e.code === 'Space'){ e.preventDefault(); input.strike = true; doStrike(); }
  else if (e.key === 'g' || e.key === 'G') doSmoke();
  else if (e.key === 'f' || e.key === 'F') doGun();
});
addEventListener('keyup', e => { if (e.code === 'Space') input.strike = false; });
// touch: a round pad at the bottom left. Touch and hold a direction on it to walk that way; lift to stop.
// (touching anywhere else on the screen still walks toward the finger)
const pad = {id: null, kx: 0, ky: 0, ux: 0, uy: 0};
const isTall = () => innerHeight > innerWidth;   // vertical play: the movement pad sits at the bottom middle
const padGeom = () => { const R = Math.max(46, Math.min(66, innerWidth * 0.16)); return {x: isTall() ? innerWidth / 2 : R + 18, y: innerHeight - R - (innerHeight < 500 ? 30 : 46), R}; };
const stopWalk = () => { mouse.x = vw / 2; mouse.y = vh / 2; };
function padSet(t){
  const g = padGeom(); let dx = t.clientX - g.x, dy = t.clientY - g.y; const d = Math.hypot(dx, dy);
  if (d > g.R){ dx = dx / d * g.R; dy = dy / d * g.R; }
  pad.kx = dx; pad.ky = dy;
  if (d > g.R * 0.2){ pad.ux = dx / Math.hypot(dx, dy); pad.uy = dy / Math.hypot(dx, dy); } else { pad.ux = pad.uy = 0; stopWalk(); }
}
const onPad = t => { const g = padGeom(); return Math.hypot(t.clientX - g.x, t.clientY - g.y) < g.R * 1.5; };
const screenWalk = t => { mouse.x = t.clientX; mouse.y = t.clientY; };
const actIds = new Map();   // touches that are holding an action button (police side)
const actGeom = () => { const H = innerHeight, W = innerWidth;
  if (isTall()){   // vertical: the action buttons stack on the right, beside the middle pad
    const x = W - 50, y = H - 92;
    return role !== 'police' ? [{id: 'strike', x, y, r: 38, t: tr('STRIKE')}] : [{id: 'strike', x, y, r: 38, t: tr('STRIKE')}, {id: 'smoke', x, y: y - 80, r: 28, t: tr('SMOKE')}, {id: 'gun', x, y: y - 140, r: 28, t: tr('FIRE')}];
  }
  if (role !== 'police') return [{id: 'strike', x: W - 64, y: H - 96, r: 42, t: tr('STRIKE')}]; return [{id: 'strike', x: W - 64, y: H - 96, r: 42, t: tr('STRIKE')}, {id: 'smoke', x: W - 150, y: H - 70, r: 30, t: tr('SMOKE')}, {id: 'gun', x: W - 146, y: H - 142, r: 30, t: tr('FIRE')}]; };
const touchGo = e => {
  for (const t of e.changedTouches){
    if (e.type === 'touchstart'){
      const a = actGeom().find(b => Math.hypot(t.clientX - b.x, t.clientY - b.y) < b.r + 10);
      if (a){ actIds.set(t.identifier, a.id); doAction(a.id); continue; }
    }
    if (actIds.has(t.identifier)) continue;
    if (pad.id === t.identifier) padSet(t);
    else if (pad.id === null && e.type === 'touchstart' && onPad(t)){ pad.id = t.identifier; padSet(t); }
    else if (pad.id === null) screenWalk(t);
  }
  e.preventDefault();
};
const touchEnd = e => {
  for (const t of e.changedTouches){
    if (actIds.has(t.identifier)){ if (actIds.get(t.identifier) === 'strike') input.strike = false; actIds.delete(t.identifier); continue; }
    if (t.identifier === pad.id){ pad.id = null; pad.kx = pad.ky = pad.ux = pad.uy = 0; stopWalk(); }
    else if (pad.id === null) stopWalk();
  }
};
cv.addEventListener('touchstart', touchGo, {passive: false});
cv.addEventListener('touchmove', touchGo, {passive: false});
cv.addEventListener('touchend', touchEnd); cv.addEventListener('touchcancel', touchEnd);
function drawPad(){
  if (!IS_TOUCH || !game || !game.started || game.mode === 'arrest') return;
  const g = padGeom(), on = pad.id !== null;
  ctx.save(); ctx.translate(g.x, g.y);
  ctx.fillStyle = on ? 'rgba(0,0,0,.5)' : 'rgba(0,0,0,.38)'; ctx.beginPath(); ctx.arc(0, 0, g.R, 0, 6.283); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  for (let i = 0; i < 4; i++){ ctx.save(); ctx.rotate(i * Math.PI / 2); ctx.beginPath(); ctx.moveTo(g.R - 10, 0); ctx.lineTo(g.R - 22, -8); ctx.lineTo(g.R - 22, 8); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = on ? '#fff' : 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(pad.kx * 0.75, pad.ky * 0.75, g.R * 0.36, 0, 6.283); ctx.fill();
  ctx.restore();
  drawActions();
}
function drawActions(){
  for (const b of actGeom()){
    const held = b.id === 'strike' && input.strike, cnt = b.id === 'smoke' ? game.smoke : b.id === 'gun' ? game.gun : null;
    ctx.fillStyle = held ? 'rgba(255,255,255,.5)' : role === 'police' ? 'rgba(20,40,80,.55)' : 'rgba(120,40,20,.6)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold ' + (b.r > 35 ? 14 : 11) + 'px system-ui'; ctx.fillText(b.t, b.x, b.y + (cnt === null ? 5 : 0));
    if (cnt !== null){ ctx.font = 'bold 13px system-ui'; ctx.fillStyle = cnt ? '#ffd54f' : '#ff8a80'; ctx.fillText(String(cnt), b.x, b.y + 15); }
  }
}
// breaking news: one long line that scrolls by itself (the text is doubled so the loop is seamless)
const tk = document.getElementById('tk');
function setupTicker(){
  const line = HEADLINES.join('   \u25CF   ') + '   \u25CF   ';
  tk.textContent = line + line;
  const speed = innerWidth < 700 ? 55 : 80;   // pixels per second
  tk.style.animationDuration = Math.max(20, (tk.scrollWidth / 2) / speed) + 's';
}
setupTicker(); addEventListener('resize', setupTicker);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(setupTicker);
try { const n = localStorage.getItem('da_name'); if (n){ playerName = n; document.getElementById('pname').value = n; } } catch (e) {}
mouse.x = innerWidth / 2; mouse.y = innerHeight / 2;
requestAnimationFrame(frame);

// ---------- optional support line: "Buy your Neta a cha" ----------
const hasSupport = () => !!(SUPPORT.bkashNumber || SUPPORT.closedMessage);
const hasWhatsapp = () => !!(WHATSAPP.qr || WHATSAPP.link);
function supportHTML(){
  if (!hasSupport() && !hasWhatsapp()) return '';
  return (hasSupport() ? coffeeHTML() : '') + (hasWhatsapp() ? whatsappHTML() : '');
}
function whatsappHTML(){
  let p = '<div class="wtext">' + tr('New updates are coming. Join the WhatsApp group to hear first') + (WHATSAPP.qr ? tr(': scan the QR code.') : '.') + '</div>';
  if (WHATSAPP.qr) p += '<img class="waqr" alt="WhatsApp group QR code" src="' + WHATSAPP.qr + '">';
  if (WHATSAPP.link) p += '<a class="wabtn" href="' + WHATSAPP.link + '" target="_blank" rel="noopener">' + tr('Open WhatsApp group') + '</a>';
  return '<div class="support"><button type="button" class="supportbtn wa alt">' + tr('Get game updates on WhatsApp') + '</button><div class="supportpanel">' + p + '</div></div>';
}
function coffeeHTML(){
  let p = '';
  if (SUPPORT.bkashNumber) p += '<div class="bknum">bKash (Send Money): <b>' + SUPPORT.bkashNumber + '</b> <button type="button" class="copybtn alt" data-num="' + SUPPORT.bkashNumber + '">' + tr('Copy') + '</button></div>';
  if (!SUPPORT.bkashNumber && SUPPORT.closedMessage) p += '<div class="bknum">' + tr(SUPPORT.closedMessage) + '</div>';
  else p += '<small>' + tr('Optional and non-refundable. It does not unlock anything in the game.') + '</small>';
  return '<div class="support"><button type="button" class="supportbtn alt">' + tr('Enjoyed the game? Gift your Neta a cup of tea 🍵') + '</button><div class="supportpanel">' + p + '</div></div>';
}
document.addEventListener('click', e => {
  const c = e.target.closest && e.target.closest('.copybtn'); if (!c) return;
  const num = c.dataset.num, done = () => { c.textContent = tr('Copied ✓'); setTimeout(() => { c.textContent = tr('Copy'); }, 1800); };
  const fallback = () => { const t = document.createElement('textarea'); t.value = num; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (er) {} t.remove(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(num).then(done, fallback); else fallback();
});
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.supportbtn'); if (b) b.nextElementSibling.classList.toggle('open'); });
(function(){ const slot = document.getElementById('supportslot'); if (slot) slot.innerHTML = supportHTML(); })();

// ---------- about game pop-up ----------
(function(){
  const box = document.getElementById('about'); if (!box) return;
  const open = () => { box.classList.add('open'); document.getElementById('aboutx').focus(); };
  const close = () => box.classList.remove('open');
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('.aboutlink')){ e.preventDefault(); open(); } });
  document.getElementById('aboutx').onclick = close;
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// installable web app: opens full screen from the home screen, without the browser bars
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) navigator.serviceWorker.register('sw.js').catch(() => {});
(function(){
  const tip = document.getElementById('installtip'); if (!tip) return;
  const installed = (matchMedia && matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches) || navigator.standalone;
  if (IS_TOUCH && !installed) tip.style.display = 'block';
})();

// language toggle (menu and end screens) and first paint in the saved language
(function(){
  const b = document.getElementById('langbtn'); if (b) b.onclick = () => setLang(isBn() ? 'en' : 'bn');
  applyLang();
  showRole();
})();

// vertical / horizontal choice on the menu (the end screens add their own copy)
(function(){ const row = orientRow(), at = document.getElementById('dailybox') || document.getElementById('roles'); if (at) at.after(row); })();
