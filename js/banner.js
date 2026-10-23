// ---------- banner: the protester leader can carry their own banner (cosmetic only, saved on this device) ----------
// A banner is {on, sh, cl, pl, tr, tx}: shown or not, cloth shape, cloth colour, pole, trim and the slogan text.
// It is not sent to the server, so it never reaches the leaderboard; it shows in the game and on your own share card.
const BN_SHAPES = ['Flag', 'Banner', 'Pennant'];
const BN_CLOTH = ['#c8102e', '#0b6b3a', '#2f6fd0', '#f0c419', '#f4f1e6', '#232323', '#7a3b7a', '#e0701a'];
const BN_POLES = ['Bamboo', 'Metal', 'Dark wood'];
const BN_POLEC = ['#b8934a', '#9aa3ad', '#4a2f1a'];
const BN_TRIMS = ['None', 'Border', 'Tassels'];
const BN_MAXLEN = 24;
const BN_DEFAULT = {on: false, sh: 0, cl: 0, pl: 0, tr: 0, tx: ''};
let bannerState = (function(){
  let s = null; try { s = JSON.parse(localStorage.getItem('da_banner') || 'null'); } catch (e) {}
  return bnFix(s);
})();
function bnFix(s){
  const b = Object.assign({}, BN_DEFAULT); if (!s || typeof s !== 'object') return b;
  const n = (v, max, d) => { v = Math.floor(+v); return v >= 0 && v < max ? v : d; };
  b.on = s.on === true; b.sh = n(s.sh, BN_SHAPES.length, 0); b.cl = n(s.cl, BN_CLOTH.length, 0); b.pl = n(s.pl, BN_POLES.length, 0); b.tr = n(s.tr, BN_TRIMS.length, 0);
  b.tx = String(s.tx || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').slice(0, BN_MAXLEN).trim();
  return b;
}
function saveBanner(){ try { localStorage.setItem('da_banner', JSON.stringify(bannerState)); } catch (e) {} }
const activeBanner = () => bannerState.on ? bannerState : null;

// readable text colour for a cloth colour
function bnInk(hex){ const n = parseInt(hex.slice(1), 16), l = ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000; return l > 150 ? '#1b1b1b' : '#ffffff'; }

// draws the banner in person()'s local coordinates (feet at 0, head near -16); bob follows the walking bounce
function drawBannerGfx(c, b, bob){
  const t = (typeof A11Y !== 'undefined' && A11Y.rm) ? 0 : performance.now() / 380, cloth = BN_CLOTH[b.cl], ink = bnInk(cloth);
  const px = 8, top = -50 + bob, wide = b.sh === 1;
  // pole
  c.fillStyle = BN_POLEC[b.pl]; c.fillRect(px - 0.8, top, 1.8, 46);
  if (b.pl === 1){ c.fillStyle = '#d8dde2'; c.fillRect(px - 0.8, top, 0.7, 46); }
  c.beginPath(); c.arc(px + 0.1, top, 1.5, 0, 6.28); c.fill();
  const w = wide ? 66 : 46, h = wide ? 16 : 22, x0 = px + 1.2, y0 = top + 2, wv = x => Math.sin(t + x / 9) * 1.1;
  if (wide){ c.fillStyle = BN_POLEC[b.pl]; c.fillRect(px - 0.8, y0 - 1, w + 2, 1.4); }   // cross-bar the banner hangs from
  c.save();
  c.beginPath();
  if (b.sh === 2){   // pennant with a swallow-tail
    c.moveTo(x0, y0); for (let x = 0; x <= w; x += 4) c.lineTo(x0 + x, y0 + wv(x));
    c.lineTo(x0 + w - 7, y0 + h / 2); c.lineTo(x0 + w, y0 + h); for (let x = w; x >= 0; x -= 4) c.lineTo(x0 + x, y0 + h + wv(x)); c.closePath();
  } else {
    c.moveTo(x0, y0 + (wide ? 1 : 0)); for (let x = 0; x <= w; x += 4) c.lineTo(x0 + x, y0 + (wide ? 1 : 0) + wv(x));
    for (let x = w; x >= 0; x -= 4) c.lineTo(x0 + x, y0 + (wide ? 1 : 0) + h + wv(x)); c.closePath();
  }
  c.fillStyle = cloth; c.fill();
  if (b.tr === 1){ c.strokeStyle = ink; c.globalAlpha = 0.75; c.lineWidth = 1; c.stroke(); c.globalAlpha = 1; }
  c.clip();
  // slogan: one line, or two when it is long, shrunk to fit the cloth
  if (b.tx){
    const fam = typeof BN_FONT !== 'undefined' ? BN_FONT : 'system-ui', avail = w - (b.sh === 2 ? 14 : 5), cy0 = y0 + h / 2 + (wide ? 1 : 0) + wv(w / 2);
    const fit = lines => { let fs = 7.5; c.font = 'bold ' + fs + 'px ' + fam; const tw = Math.max.apply(null, lines.map(l => c.measureText(l).width)); if (tw > avail) fs = fs * avail / tw; return Math.min(fs, (h - 3) / lines.length / 1.1); };
    let lines = [b.tx], fs = fit(lines);
    const sp = []; for (let k = 1; k < b.tx.length - 1; k++) if (b.tx[k] === ' ') sp.push(k);
    if (fs < 5.2 && sp.length){ const m = sp.reduce((q, k) => Math.abs(k - b.tx.length / 2) < Math.abs(q - b.tx.length / 2) ? k : q); const l2 = [b.tx.slice(0, m), b.tx.slice(m + 1)], f2 = fit(l2); if (f2 > fs){ lines = l2; fs = f2; } }
    fs = Math.max(2.6, fs); c.font = 'bold ' + fs + 'px ' + fam; c.fillStyle = ink; c.textAlign = 'left'; c.textBaseline = 'middle';
    lines.forEach((l, k) => c.fillText(l, x0 + 2.5, cy0 + (k - (lines.length - 1) / 2) * fs * 1.1));
  } else {   // no text: a small star so the cloth is not blank
    c.fillStyle = ink; c.globalAlpha = 0.85; c.beginPath(); const cx = x0 + w / 2 - (b.sh === 2 ? 3 : 0), cy = y0 + h / 2 + wv(w / 2);
    for (let k = 0; k < 10; k++){ const r = k % 2 ? 2 : 4.6, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.closePath(); c.fill(); c.globalAlpha = 1;
  }
  c.restore();
  if (b.tr === 2){   // tassels along the bottom edge
    c.fillStyle = ink === '#ffffff' ? '#f0c419' : '#8a6a1a';
    for (let x = 3; x < w; x += wide ? 9 : 8){ c.fillRect(x0 + x - 0.6, y0 + h + wv(x) + (wide ? 1 : 0), 1.2, 3.2); }
  }
}

// ---------- editor ----------
function openBannerEditor(){
  const o = document.createElement('div'); o.id = 'avedit';
  o.innerHTML = '<div id="avbox"><button id="avx" type="button" aria-label="' + tr('Close') + '">&times;</button><h2>' + tr('Your banner') + '</h2>' +
    '<canvas id="avbig"></canvas><div id="avrows"></div>' +
    '<div class="avbtns"><button type="button" id="avreset" class="alt">' + tr('Reset') + '</button><button type="button" id="avdone">' + tr('Done') + '</button></div>' +
    '<small>' + tr('The banner is carried by you in the game and shows on your share card. It stays on this device.') + '</small></div>';
  document.body.appendChild(o);
  const rows = o.querySelector('#avrows'), big = o.querySelector('#avbig'); let raf = 0;
  const preview = () => {
    if (!o.isConnected) return;
    const sa = avStr('protester'); drawAvatar(big, sa, 'protester', 2.6, {banner: Object.assign({}, bannerState, {on: true})}, 340, 200);
    raf = (typeof A11Y !== 'undefined' && A11Y.rm) ? 0 : requestAnimationFrame(preview);
  };
  const row = (label, build) => { const d = document.createElement('div'); d.className = 'avrow'; const l = document.createElement('span'); l.textContent = tr(label); d.appendChild(l); const bx = document.createElement('div'); build(bx); d.appendChild(bx); rows.appendChild(d); };
  const paint = () => {
    saveBanner(); rows.textContent = '';
    row('Show banner', bx => [[true, 'Yes'], [false, 'No']].forEach(([v, nm]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'avchip' + (bannerState.on === v ? ' on' : ''); b.textContent = tr(nm); b.onclick = () => { bannerState.on = v; paint(); }; bx.appendChild(b); }));
    const chips = (k, label, names) => row(label, bx => names.forEach((nm, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'avchip' + (bannerState[k] === i ? ' on' : ''); b.textContent = tr(nm); b.onclick = () => { bannerState[k] = i; paint(); }; bx.appendChild(b); }));
    const sws = (k, label, cols, names) => row(label, bx => cols.forEach((col, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'avsw' + (bannerState[k] === i ? ' on' : ''); b.style.background = col; const nm = tr(names ? names[i] : label) + ' ' + (names ? '' : i + 1); b.setAttribute('aria-label', nm.trim()); b.onclick = () => { bannerState[k] = i; paint(); }; bx.appendChild(b); }));
    chips('sh', 'Cloth shape', BN_SHAPES); sws('cl', 'Cloth colour', BN_CLOTH); chips('pl', 'Pole', BN_POLES); chips('tr', 'Trim', BN_TRIMS);
    row('Slogan', bx => {
      const inp = document.createElement('input'); inp.type = 'text'; inp.id = 'bntext'; inp.maxLength = BN_MAXLEN; inp.value = bannerState.tx; inp.placeholder = tr('Up to {n} characters', {n: BN_MAXLEN}); inp.setAttribute('aria-label', tr('Slogan'));
      inp.oninput = () => { bannerState.tx = bnFix({tx: inp.value}).tx; bannerState.on = true; saveBanner(); if (!raf) preview(); };
      inp.onchange = () => paint(); bx.appendChild(inp);
    });
    if (!raf) preview();
  };
  const close = () => { cancelAnimationFrame(raf); o.remove(); refreshAvatarUI(); if (typeof cardRefresh === 'function' && document.getElementById('cardimg')) cardRefresh(); };
  o.querySelector('#avx').onclick = close; o.querySelector('#avdone').onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); });
  o.querySelector('#avreset').onclick = () => { bannerState = Object.assign({}, BN_DEFAULT); paint(); };
  paint();
}
