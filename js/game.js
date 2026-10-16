// Andolon (আন্দোলন): single-player march game. Depends on data.js.
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
let vw, vh, Z = 1, dpr = 1;
function resize(){
  vw = innerWidth; vh = innerHeight; dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);   // sharp on phone screens
  Z = Math.max(0.7, Math.min(1, Math.min(vw, vh) / 700));   // zoom out a little on small screens
}
addEventListener('resize', resize); resize();

const rand = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const pick = a => a[Math.floor(Math.random() * a.length)];
const wrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const polar = (ang, r) => ({x: Math.cos(ang) * r, y: Math.sin(ang) * r});
const SKINS = ['#f1c9a5', '#d9a679', '#b97d56', '#8d5a3b'];
const WHITE = '#f7f7f2', BLUE = '#2f6fd0', BLACK = '#232323';
const BN_FONT = '"Nirmala UI","Noto Sans Bengali",system-ui';

// Some browsers (notably Safari on iPhone) measure and centre Bangla text wrongly on a canvas, so the text lands off-centre
// and spills out of its box. To be safe on every device, Bangla text is measured by drawing it once off-screen and
// scanning for the pixels that were actually painted ("ink"). The result is cached per font and text.
const BN_RE = /[\u0980-\u09FF]/;
const inkCache = new Map();
let inkCv = null;
function inkBounds(font, text){
  const key = font + '|' + text, hit = inkCache.get(key);
  if (hit) return hit;
  let r = {ok: false, minX: 0, maxX: 0, asc: 0, desc: 0};
  try {
    const W = 800, H = 160, OX = 40, BY = 100;
    if (!inkCv){ inkCv = document.createElement('canvas'); inkCv.width = W; inkCv.height = H; }
    const g = inkCv.getContext('2d', {willReadFrequently: true});
    g.clearRect(0, 0, W, H); g.font = font; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = '#000';
    g.fillText(text, OX, BY);
    const d = g.getImageData(0, 0, W, H).data;
    let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 40){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 >= 0) r = {ok: true, minX: x0 - OX, maxX: x1 - OX + 1, asc: BY - y0, desc: y1 - BY + 1};
  } catch (e) {}
  inkCache.set(key, r);
  return r;
}
// width of text in the context's current font; uses real ink width for Bangla
function textW(c, text){
  if (BN_RE.test(text)){ const b = inkBounds(c.font, String(text)); if (b.ok) return b.maxX - b.minX; }
  return c.measureText(text).width;
}
// every centred or right-aligned Bangla fillText gets positioned from its ink instead of the browser's metrics
if (typeof CanvasRenderingContext2D !== 'undefined'){
  const origFill = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxW){
    const al = this.textAlign;
    if ((al === 'center' || al === 'right' || al === 'end') && BN_RE.test(text)){
      const b = inkBounds(this.font, String(text));
      if (b.ok){
        this.textAlign = 'left';
        origFill.call(this, text, al === 'center' ? x - (b.minX + b.maxX) / 2 : x - b.maxX, y);
        this.textAlign = al;
        return;
      }
    }
    return origFill.call(this, text, x, y);
  };
}
const ZR = [MAP_R, ...RINGS, 0];                       // zone z spans ZR[z+1]..ZR[z]
const zoneOf = (x, y) => { const d = Math.hypot(x, y); return d > RINGS[0] ? 0 : d > RINGS[1] ? 1 : d > RINGS[2] ? 2 : 3; };
const spawnIn = (r0, r1) => { const a = rand(0, 6.283), r = Math.sqrt(rand(r0 * r0, r1 * r1)); return polar(a, r); };

// ---------- sound (synthesised, no files) ----------
let audio = null, muted = false;
function ac(){
  if (!audio){ try { const A = typeof AudioContext !== 'undefined' ? AudioContext : (typeof webkitAudioContext !== 'undefined' ? webkitAudioContext : null); if (A) audio = new A(); } catch (e) {} }
  if (audio && audio.state === 'suspended') audio.resume();
  return audio;
}
function sfxWhack(){   // stick hitting: a noise crack plus a low thud
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  const len = Math.floor(a.sampleRate * 0.14), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = a.createBufferSource(); src.buffer = buf;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
  const g = a.createGain(); g.gain.value = 0.7; src.connect(lp); lp.connect(g); g.connect(a.destination); src.start(t);
  const o = a.createOscillator(), og = a.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
  og.gain.setValueAtTime(0.9, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o.connect(og); og.connect(a.destination); o.start(t); o.stop(t + 0.22);
}
function sfxChime(){
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  [660, 880].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + i * 0.1); g.gain.exponentialRampToValueAtTime(0.25, t + i * 0.1 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.25);
    o.connect(g); g.connect(a.destination); o.start(t + i * 0.1); o.stop(t + i * 0.1 + 0.3); });
}
let lastJoin = 0;
function sfxJoin(){   // two quick rising blips; the pitch climbs a little as the crowd grows
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  if (t - lastJoin < 0.08) return; lastJoin = t;
  const base = 520 + Math.min(followers.length, 30) * 14;
  [base, base * 1.5].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + i * 0.07); g.gain.exponentialRampToValueAtTime(0.3, t + i * 0.07 + 0.015); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.16);
    o.connect(g); g.connect(a.destination); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.2); });
}
function sfxGunshot(){   // sharp crack plus a short pop
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  const len = Math.floor(a.sampleRate * 0.2), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
  const src = a.createBufferSource(); src.buffer = buf;
  const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
  const g = a.createGain(); g.gain.value = 0.8; src.connect(hp); hp.connect(g); g.connect(a.destination); src.start(t);
  const o = a.createOscillator(), og = a.createGain(); o.type = 'square';
  o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.08);
  og.gain.setValueAtTime(0.35, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  o.connect(og); og.connect(a.destination); o.start(t); o.stop(t + 0.12);
}
function sfxGrenade(){   // deep boom with a rumbling tail
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  const len = Math.floor(a.sampleRate * 1.0), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.6);
  const src = a.createBufferSource(); src.buffer = buf;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(120, t + 0.9);
  const g = a.createGain(); g.gain.value = 1.0; src.connect(lp); lp.connect(g); g.connect(a.destination); src.start(t);
  const o = a.createOscillator(), og = a.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(26, t + 0.9);
  og.gain.setValueAtTime(1.0, t); og.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
  o.connect(og); og.connect(a.destination); o.start(t); o.stop(t + 1.05);
}
function sfxWallBreak(){   // concrete cracking and crumbling
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  const crack = a.createBuffer(1, Math.floor(a.sampleRate * 0.12), a.sampleRate), cd = crack.getChannelData(0);
  for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / cd.length, 2);
  const cs = a.createBufferSource(); cs.buffer = crack; const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500;
  const cg = a.createGain(); cg.gain.value = 0.7; cs.connect(hp); hp.connect(cg); cg.connect(a.destination); cs.start(t);
  for (let k = 0; k < 6; k++){   // falling chunks
    const len = Math.floor(a.sampleRate * 0.14), b = a.createBuffer(1, len, a.sampleRate), d2 = b.getChannelData(0);
    for (let i = 0; i < len; i++) d2[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    const s2 = a.createBufferSource(); s2.buffer = b; const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 250 + Math.random() * 700; bp.Q.value = 0.8;
    const g2 = a.createGain(); g2.gain.value = 0.55 * (1 - k * 0.12); s2.connect(bp); bp.connect(g2); g2.connect(a.destination); s2.start(t + 0.05 + k * 0.08 + Math.random() * 0.03);
  }
  const o = a.createOscillator(), og = a.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(85, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.5);
  og.gain.setValueAtTime(0.9, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  o.connect(og); og.connect(a.destination); o.start(t); o.stop(t + 0.65);
}
let sirenNode = null;
function sfxSiren(){   // two-tone police wail that runs for the whole arrest
  if (muted) return; const a = ac(); if (!a) return; stopSiren(); const t = a.currentTime;
  const o = a.createOscillator(), g = a.createGain(), lp = a.createBiquadFilter();
  o.type = 'sawtooth'; lp.type = 'lowpass'; lp.frequency.value = 2200; g.gain.value = 0.13;
  o.frequency.setValueAtTime(650, t);
  for (let i = 0; i < 20; i++) o.frequency.linearRampToValueAtTime(i % 2 ? 650 : 1000, t + (i + 1) * 0.45);
  o.connect(lp); lp.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 9.5);
  sirenNode = {o, g, a};
}
function stopSiren(){
  if (!sirenNode) return;
  try { sirenNode.g.gain.cancelScheduledValues(sirenNode.a.currentTime); sirenNode.g.gain.setTargetAtTime(0, sirenNode.a.currentTime, 0.08); sirenNode.o.stop(sirenNode.a.currentTime + 0.4); } catch (e) {}
  sirenNode = null;
}
// Fight effects: sticks always; gunshots and grenade blasts now and then (sound plus a flash on screen)
let fx = [];
function addFx(x, y, kind){ fx.push({x, y, t: 0, kind}); }
function fightSfx(x, y){
  sfxWhack();
  if (Math.random() < 0.45){ setTimeout(sfxGunshot, 120); addFx(x + rand(-25, 25), y + rand(-25, 10), 'shot'); }
  if (Math.random() < 0.18){ setTimeout(sfxGrenade, 250); addFx(x + rand(-45, 45), y + rand(-35, 35), 'boom'); }
}
function updateMute(){ const b = document.getElementById('mute'); if (b) b.textContent = muted ? '\u{1F507}' : '\u{1F50A}'; }
function toggleMute(){ muted = !muted; updateMute(); }
addEventListener('keydown', e => { if (e.key === 'm' || e.key === 'M') toggleMute(); });

// ---------- town (houses, mosques, coffee shops): generated once, same every game ----------
function mulberry(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function distToRiver(x, y){
  let best = 1e9;
  for (let i = 0; i < RIVER.length - 1; i++){
    const [ax, ay] = RIVER[i], [bx, by] = RIVER[i + 1], dx = bx - ax, dy = by - ay;
    let t = ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy); t = Math.max(0, Math.min(1, t));
    best = Math.min(best, Math.hypot(x - (ax + dx * t), y - (ay + dy * t)));
  }
  return best;
}
function blocked(x, y, margin){
  const d = Math.hypot(x, y);
  if (d < 190 || d > MAP_R - 90) return true;
  if (Math.hypot(x - START.x, y - START.y) < 220) return true;
  for (const r of RINGS.concat([MAP_R - 60])) if (Math.abs(d - r) < 70 + margin) return true;
  const step = Math.PI / 4; let m = ((Math.atan2(y, x) % step) + step) % step; m = Math.min(m, step - m);
  if (d * Math.sin(m) < 50 + margin) return true;
  if (distToRiver(x, y) < 85) return true;
  if (Math.hypot(x - 130, y + 380) < 140) return true;
  for (const s of STATIONS.concat([AYNAGHOR], HOSPITALS, NAMED_MOSQUES, NAMED_COFFEE)) if (Math.hypot(x - s.x, y - s.y) < 90) return true;
  for (const l of LANDMARKS) if (Math.hypot(x - l.x, y - l.y) < 55) return true;
  return false;
}
function genTown(){
  const rng = mulberry(7771999), houses = [], occ = new Set(), mosques = NAMED_MOSQUES.slice(), coffee = NAMED_COFFEE.slice();
  for (let i = 0; i < 40000 && houses.length < HOUSE_COUNT; i++){
    const a = rng() * 6.283, r = Math.sqrt(rng()) * MAP_R, x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (blocked(x, y, 0)) continue;
    const key = Math.floor(x / 150) + ',' + Math.floor(y / 150); if (occ.has(key)) continue; occ.add(key);
    houses.push({x, y, w: 44 + rng() * 30, h: 36 + rng() * 28, c: ['#d8c9a8', '#c9a98f', '#b9b7a0', '#cfd2c4', '#d9b8a5', '#c4b69a'][Math.floor(rng() * 6)]});
  }
  while (mosques.length < 15 || coffee.length < 13){
    const a = rng() * 6.283, r = Math.sqrt(rng()) * (MAP_R - 150), x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (blocked(x, y, 10)) continue;
    if (mosques.length < 15 && rng() < 0.5) mosques.push({name: '', x, y}); else if (coffee.length < 13) coffee.push({name: '', x, y});
  }
  // every building is solid: nobody walks over them
  const solids = houses.map(h => ({x: h.x, y: h.y, w: h.w, h: h.h}))
    .concat(mosques.map(m => ({x: m.x - 24, y: m.y - 14, w: 48, h: 32})))
    .concat(coffee.map(s => ({x: s.x - 18, y: s.y - 10, w: 36, h: 24})))
    .concat(HOSPITALS.map(h => ({x: h.x - 30, y: h.y - 22, w: 60, h: 44})));
  return {houses, mosques, coffee, solids};
}
const TOWN = genTown();

// ---------- state ----------
let gates, neutrals, followers, patrols, rivals, stalls, teas, shutdowns, player, game, chant, bubbles, toasts;
let mouse = {x: 0, y: 0}, cam = {x: 0, y: 0}, playerName = 'Protester';

function newGame(){
  gates = []; stalls = []; teas = []; shutdowns = []; bubbles = []; toasts = []; fx = [];
  RINGS.forEach((r, i) => {
    const n = GATES_PER_RING[i], base = rand(-Math.PI, Math.PI);
    for (let k = 0; k < n; k++){ const ang = base + k * 2 * Math.PI / n, p = polar(ang, r); gates.push({r, ring: i, ang, x: p.x, y: p.y, need: GATE_NEEDS[i], open: 0}); }
  });
  neutrals = []; followers = []; patrols = []; rivals = [];
  const counts = BYSTANDERS;
  for (let z = 0; z < 4; z++){
    const r0 = ZR[z + 1] + 70, r1 = ZR[z] - 70;
    for (let i = 0; i < counts[z]; i++){ const p = spawnIn(Math.max(r0, 60), r1); neutrals.push(mkNeutral(p.x, p.y)); }
    for (let i = 0; i < 2; i++){ const p = spawnIn(Math.max(r0, 220), r1); stalls.push({x: p.x, y: p.y, r: 55}); }
    for (let i = 0; i < (z === 0 ? 2 : 1); i++){ const p = spawnIn(Math.max(r0, 220), r1); teas.push({x: p.x, y: p.y, cd: 0}); }
    for (let i = 0; i < POLICE_PER_ZONE[z]; i++) patrols.push(mkPatrol(z));   // fewer police in the outer zones
  }
  [[2, 3, 180], [3, 3, 140]].forEach(([z, n, delay]) => {
    const p = spawnIn(ZR[z + 1] + 100, ZR[z] - 100), r = {x: p.x, y: p.y, members: [], delay, moving: false};
    for (let i = 0; i < n; i++) r.members.push({x: r.x + rand(-30, 30), y: r.y + rand(-30, 30), skin: pick(SKINS)});
    rivals.push(r);
  });
  shutdowns.push({x: -900, y: -1100, r: 300}, {x: 700, y: 900, r: 260});
  player = {x: START.x, y: START.y, r: 12, morale: 100, injured: false, skin: pick(SKINS), moving: false, hidden: false};
  game = {t: 0, day: 1, hold: 0, started: true, spawnT: 4, rivalSpawnT: 60, stats: {recruits: 0, peak: 1, rings: 0, clashWins: 0, beaten: 0, cures: 0, teas: 0, stallT: 0}, mode: 'play', msg: '', msgT: 0, viralT: 40 + rand(0, 20), drain: 0, boost: 0, flash: 0, van: null, arrest: null, contested: false};
  chant = {i: 0, timer: 3, phase: 0};
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) say('Touch and hold a direction on the round pad to walk. Lift to stop.', 6);
}
function mkNeutral(x, y){
  const tones = ['#c9a27a', '#7a9cc9', '#c97a8f', '#8fc97a', '#c9b97a', '#9a7ac9'];
  return {x, y, vx: 0, vy: 0, wt: 0, cool: 0, skin: pick(SKINS), dress: pick(tones)};
}
function mkPatrol(z){
  const p = {x: 0, y: 0, z, tx: 0, ty: 0, skin: pick(SKINS), moving: true, swing: 0, cool: 0, ftimer: 0};
  const s = spawnIn(ZR[z + 1] + 70, ZR[z] - 70); p.x = s.x; p.y = s.y; pickWaypoint(p); return p;
}
function pickWaypoint(p){ const s = spawnIn(Math.max(ZR[p.z + 1] + 70, 60), ZR[p.z] - 70); p.tx = s.x; p.ty = s.y; }
function say(m, t){ game.msg = m; game.msgT = t || 3; }
function spawnBystander(){   // slow refill so the map never runs empty
  if (neutrals.length >= 640) return;
  const w = [0.35, 0.3, 0.2, 0.15]; let z = 0, x = Math.random(); while (z < 3 && x > w[z]){ x -= w[z]; z++; }
  const p = spawnIn(Math.max(ZR[z + 1] + 70, 60), ZR[z] - 70);
  if (Math.hypot(p.x - player.x, p.y - player.y) < 450) return;
  neutrals.push(mkNeutral(p.x, p.y));
}
function spawnRival(){   // a new small rival crowd appears after one gives up
  const z = Math.random() < 0.5 ? 1 : 2, p = spawnIn(ZR[z + 1] + 100, ZR[z] - 100);
  if (Math.hypot(p.x - player.x, p.y - player.y) < 600) return false;
  const r = {x: p.x, y: p.y, members: [], delay: game.t + 40, moving: false};
  for (let i = 0; i < 3; i++) r.members.push({x: r.x + rand(-30, 30), y: r.y + rand(-30, 30), skin: pick(SKINS)});
  rivals.push(r); return true;
}

// ---------- collision ----------
function resolveRect(o, r, rad){
  const cx = Math.max(r.x, Math.min(o.x, r.x + r.w)), cy = Math.max(r.y, Math.min(o.y, r.y + r.h));
  let dx = o.x - cx, dy = o.y - cy, d = Math.hypot(dx, dy);
  if (d < rad){
    if (d === 0){ dx = (o.x - (r.x + r.w / 2)) || 0.01; dy = o.y - (r.y + r.h / 2); d = Math.hypot(dx, dy); o.x = r.x + r.w / 2 + dx / d * (Math.max(r.w, r.h) / 2 + rad); o.y = r.y + r.h / 2 + dy / d * (Math.max(r.w, r.h) / 2 + rad); return; }
    o.x = cx + dx / d * rad; o.y = cy + dy / d * rad;
  }
}
function collide(o, rad){
  let d = Math.hypot(o.x, o.y) || 0.001;
  for (let i = 0; i < RINGS.length; i++){
    const r = RINGS[i], off = d - r;
    if (Math.abs(off) < rad + 15){
      const ang = Math.atan2(o.y, o.x);
      let pass = false;
      for (const g of gates) if (g.ring === i && g.open >= 1 && Math.abs(wrap(ang - g.ang)) * r < GATE_HALF){ pass = true; break; }
      if (pass) continue;
      const target = off >= 0 ? r + rad + 15 : r - rad - 15;
      o.x = o.x / d * target; o.y = o.y / d * target; d = target;
    }
  }
  for (const s of TOWN.solids){
    if (Math.abs(o.x - (s.x + s.w / 2)) < s.w / 2 + rad + 1 && Math.abs(o.y - (s.y + s.h / 2)) < s.h / 2 + rad + 1) resolveRect(o, s, rad);
  }
  d = Math.hypot(o.x, o.y) || 0.001;
  if (d > MAP_R - rad){ o.x = o.x / d * (MAP_R - rad); o.y = o.y / d * (MAP_R - rad); }
}
function followRing(list, leader, dt){
  list.forEach((f, i) => {
    const a = i * 2.4, rr = 22 + 11 * Math.sqrt(i);
    const fx = leader.x + Math.cos(a) * rr - f.x, fy = leader.y + Math.sin(a) * rr - f.y, fd = Math.hypot(fx, fy);
    const sp = Math.min(fd * 4, 260);
    if (fd > 1){ f.x += fx / fd * sp * dt; f.y += fy / fd * sp * dt; }
    collide(f, 7);
  });
}
function nearestStations(p){ return [...STATIONS].sort((a, b) => dist(a, p) - dist(b, p)); }
function nearestHospital(p){ return HOSPITALS.reduce((b, h) => !b || dist(h, p) < dist(b, p) ? h : b, null); }

// ---------- update ----------
function update(dt){
  game.t += dt; game.msgT -= dt; game.flash = Math.max(0, game.flash - dt);
  for (let i = fx.length - 1; i >= 0; i--){ fx[i].t += dt; if (fx[i].t > (fx[i].kind === 'boom' ? 1.1 : fx[i].kind === 'dust' ? 0.9 : 0.3)) fx.splice(i, 1); }
  game.day = Math.min(MAX_DAY, 1 + Math.floor(game.t / DAY_SECONDS));
  for (let i = toasts.length - 1; i >= 0; i--){ toasts[i].t -= dt; if (toasts[i].t <= 0) toasts.splice(i, 1); }
  updateBubbles(dt);
  if (game.mode === 'arrest'){ updateArrest(dt); return; }
  if (game.t >= MAX_DAY * DAY_SECONDS){ end(false, {timeout: true}); return; }   // 30 days are up

  // player
  game.boost = Math.max(0, game.boost - dt);
  if (pad.id !== null && (pad.ux || pad.uy)){ mouse.x = (player.x + pad.ux * 200 - cam.x) * Z; mouse.y = (player.y + pad.uy * 200 - cam.y) * Z; }   // pad: head exactly the way the thumb points
  const mw = {x: mouse.x / Z + cam.x, y: mouse.y / Z + cam.y};
  const dx = mw.x - player.x, dy = mw.y - player.y, d = Math.hypot(dx, dy);
  const speed = Math.max(110, 210 - Math.min(followers.length, 40) * 2) * (player.injured ? 0.75 : 1) * (game.boost > 0 ? 1.4 : 1);
  player.moving = d > 8;
  if (player.moving){ player.x += dx / d * speed * dt; player.y += dy / d * speed * dt; }
  collide(player, player.r);
  followRing(followers, player, dt);

  // neutrals
  for (let i = neutrals.length - 1; i >= 0; i--){
    const n = neutrals[i];
    n.cool -= dt; n.wt -= dt; n.rcool = Math.max(0, (n.rcool || 0) - dt);
    if (n.wt <= 0){ const a = rand(0, 6.28), s = rand(0, 25); n.vx = Math.cos(a) * s; n.vy = Math.sin(a) * s; n.wt = rand(1, 3); }
    n.x += n.vx * dt; n.y += n.vy * dt; collide(n, 7);
    if (n.cool <= 0 && dist(n, player) < RECRUIT_R){ followers.push(n); neutrals.splice(i, 1); game.stats.recruits++; sfxJoin(); }
  }

  // police: slow, short-range chase, strike with sticks
  for (const p of patrols){
    p.swing = Math.max(0, p.swing - dt); p.cool = Math.max(0, p.cool - dt);
    const near = dist(p, player) < 170;
    const tx = near ? player.x : p.tx, ty = near ? player.y : p.ty;
    const ddx = tx - p.x, ddy = ty - p.y, dd = Math.hypot(ddx, ddy);
    if (!near && dd < 10) pickWaypoint(p);
    else if (dd > 30){ const s = near ? 100 : 70; p.x += ddx / dd * s * dt; p.y += ddy / dd * s * dt; }
    collide(p, 14);
    if (p.cool <= 0){
      if (dist(p, player) < 42){ strikePlayer(p); if (game.mode === 'arrest') return; }
      else {
        const idx = followers.findIndex(f => dist(p, f) < 32);
        if (idx >= 0) strikeFollower(p, idx);
      }
    }
  }

  // rivals (support the police, never struck by them)
  for (const r of rivals){
    r.moving = false;
    const z = zoneOf(r.x, r.y);
    let tgt = null, best = 1e9;
    if (r.members.length < RIVAL_MAX) for (const n of neutrals){ const dd = dist(n, r); if (n.cool <= 0 && !(n.rcool > 0) && dd < best && dd < 600 && zoneOf(n.x, n.y) === z){ best = dd; tgt = n; } }
    if (!tgt && game.t > r.delay){
      const dr = Math.hypot(r.x, r.y), ri = RINGS.findIndex(rr => rr < dr - 20);
      if (ri >= 0){
        const g = gates.filter(g => g.ring === ri).sort((a, b) => dist(a, r) - dist(b, r))[0];
        tgt = g.open >= 1 ? polar(g.ang, g.r - 90) : polar(g.ang, g.r + 70);
      } else tgt = {x: 0, y: 0};
    }
    if (tgt){
      const tdx = tgt.x - r.x, tdy = tgt.y - r.y, td = Math.hypot(tdx, tdy);
      if (td > 6){ const s = Math.max(40, 70 - r.members.length); r.x += tdx / td * s * dt; r.y += tdy / td * s * dt; r.moving = true; }
    }
    collide(r, 12);
    followRing(r.members, r, dt);
    r.recT = (r.recT || 0) - dt;   // rivals recruit slowly and never beyond their cap
    if (r.recT <= 0 && r.members.length < RIVAL_MAX){ const ri = neutrals.findIndex(n => n.cool <= 0 && !(n.rcool > 0) && dist(n, r) < 24); if (ri >= 0){ const n = neutrals.splice(ri, 1)[0]; r.members.push({x: n.x, y: n.y, skin: n.skin}); r.recT = RIVAL_RECRUIT_EVERY; } }
    for (const g of gates) if (g.open < 1 && dist(r, g) < 130 && r.members.length >= g.need) g.open = Math.min(1, g.open + dt / 3);
    // clash: when protesters and a rival crowd meet they fight; ties go to the protesters
    r.fightT = (r.fightT || 0) - dt;
    if (r.fightT <= 0 && r.members.length && (dist(r, player) < 110 || followers.some(f => dist(f, r) < 55))){ r.fightT = 1.3; clash(r); }
  }
  const nRiv = rivals.length; rivals = rivals.filter(r => !r.dead); if (rivals.length < nRiv) say('A rival crowd gave up and left', 3);
  if (rivals.length < 2){ game.rivalSpawnT -= dt; if (game.rivalSpawnT <= 0 && spawnRival()) game.rivalSpawnT = 60; }

  // police barricades
  for (const g of gates){
    if (g.open >= 1) continue;
    const near = dist(player, g) < 130;
    if (near && followers.length >= g.need){ g.open = Math.min(1, g.open + dt / 3); if (g.open >= 1) say('The police barricade gives way. Keep moving!'); }
    else if (!rivals.some(r => dist(r, g) < 130 && r.members.length >= g.need)) g.open = Math.max(0, g.open - dt * 0.5);
    if (near && followers.length < g.need && game.msgT <= 0) say('This police barricade needs ' + g.need + ' people. You have ' + followers.length + '.');
  }

  for (const g of gates) if (g.open >= 1 && !g.broken){   // the barricade just broke: crumble sound and dust (only if it is near you)
    g.broken = true; if (dist(player, g) < 1200){ sfxWallBreak(); addFx(g.x, g.y, 'dust'); }
  }
  // morale: drains slowly; Biriyani stalls and hospitals restore it; Mama r Tong er Cha gives a boost
  const inStall = stalls.some(s => dist(s, player) < s.r + 10); let restoring = inStall ? 30 : 0; if (inStall) game.stats.stallT += dt;
  const hosp = HOSPITALS.find(h => dist(h, player) < 62);
  if (hosp){ restoring = Math.max(restoring, 45); if (player.injured && player.morale > 60){ player.injured = false; game.stats.cures++; sfxChime(); say('Treated at ' + hosp.name + '. You are back on your feet!'); } }
  if (restoring) player.morale = Math.min(100, player.morale + restoring * dt);
  else player.morale = Math.max(0, player.morale - (followers.length ? 0.9 : 0) * dt);
  for (const t of teas){
    t.cd = Math.max(0, t.cd - dt);
    if (t.cd <= 0 && dist(t, player) < 34){ t.cd = 45; game.stats.teas++; player.morale = Math.min(100, player.morale + 50); game.boost = 6; sfxChime(); say('মামার টঙের চা! Morale boost and extra speed'); }
  }
  if (player.morale <= 0){
    game.drain += dt;
    if (game.drain > 2 && followers.length){ game.drain = 0; const f = followers.pop(); f.cool = 4; neutrals.push(f); say('Tired and hungry: someone headed home'); }
  }

  game.viralT -= dt;
  if (game.viralT <= 0){
    game.viralT = 40 + rand(0, 20);
    let c = 0;
    for (let i = neutrals.length - 1; i >= 0; i--) if (dist(neutrals[i], player) < 380 && neutrals[i].cool <= 0){ followers.push(neutrals[i]); neutrals.splice(i, 1); c++; }
    if (c) sfxJoin();
    say('A video goes viral. ' + c + ' more people join you!');
  }

  updateChant(dt);
  const st = game.stats, dpl = Math.hypot(player.x, player.y);
  st.peak = Math.max(st.peak, followers.length + 1); st.rings = Math.max(st.rings, RINGS.filter(r => dpl < r - 20).length);
  game.spawnT -= dt; if (game.spawnT <= 0){ game.spawnT = 4; spawnBystander(); }

  // the Shaheed Minar: a bigger rival crowd standing in it blocks you; ties go to the protesters
  const pIn = dist(player, GOAL) < GOAL.r;
  const rIn = rivals.find(r => dist(r, GOAL) < GOAL.r && r.members.length >= RIVAL_BLOCK);
  const rivalAhead = rIn && rIn.members.length > followers.length;
  game.contested = pIn && !!rivalAhead;
  if (pIn && followers.length + 1 >= NEED_CROWD && !rivalAhead) game.hold += dt; else game.hold = Math.max(0, game.hold - dt);
  if (game.hold >= NEED_HOLD) end(true);
}

// ---------- rival clash ----------
function clash(r){
  const pP = followers.length + 1, pR = r.members.length + 1;
  let dmgP = Math.ceil(0.2 * pR * (pR > pP ? 1 : 0.5)), dmgR = Math.ceil(0.2 * pP * (pP >= pR ? 1 : 0.5));
  dmgP = Math.min(dmgP, followers.length); dmgR = Math.min(dmgR, r.members.length);
  for (let i = 0; i < dmgP; i++){ const f = followers.pop(); f.cool = 6; f.rcool = 15; f.vx = rand(-70, 70); f.vy = rand(-70, 70); f.wt = 1; neutrals.push(f); }
  let switched = 0;
  for (let i = 0; i < dmgR; i++){
    const m = r.members.pop();
    if (Math.random() < 0.4){ const n = mkNeutral(m.x, m.y); n.skin = m.skin; followers.push(n); switched++; game.stats.recruits++; }   // persuaded to join the protesters
    else { const n = mkNeutral(m.x, m.y); n.skin = m.skin; n.cool = 6; n.rcool = 25; n.vx = rand(-70, 70); n.vy = rand(-70, 70); n.wt = 1; neutrals.push(n); }   // goes home for a while
  }
  if (switched) sfxJoin();
  if (dmgR > dmgP) game.stats.clashWins++;
  if (!r.members.length) r.dead = true;
  player.morale = Math.max(0, player.morale - 4);
  fightSfx((r.x + player.x) / 2, (r.y + player.y) / 2);
  say('Clash with a rival crowd! You lost ' + dmgP + ', they lost ' + dmgR + (switched ? ' (' + switched + ' switched sides)' : ''), 2.5);
}

// ---------- police strikes ----------
function strikePlayer(p){
  p.swing = 0.35; p.cool = 1.4; fightSfx(player.x, player.y); game.flash = 0.4; game.stats.beaten++;
  if (player.morale <= 25){ startArrest(p); return; }   // too exhausted to get away: detained
  player.morale -= 25; player.injured = true;
  const a = Math.atan2(player.y - p.y, player.x - p.x); player.x += Math.cos(a) * 45; player.y += Math.sin(a) * 45; collide(player, player.r);
  const h = nearestHospital(player);
  say('Beaten by the police! Find a hospital' + (h ? ' (' + h.name + ')' : '') + ' to recover.', 4);
}
function strikeFollower(p, idx){
  p.swing = 0.35; p.cool = 1.8;
  const f = followers.splice(idx, 1)[0]; fightSfx(f.x, f.y);
  if (Math.random() < 0.4){ detainFollower(f); return; }   // taken to a station
  const a = Math.atan2(f.y - p.y, f.x - p.x);
  f.cool = 6; f.vx = Math.cos(a) * 80; f.vy = Math.sin(a) * 80; f.wt = 1; neutrals.push(f);
  say('Police beat back part of your crowd', 2);
}
function detainFollower(f){
  const st = nearestStations(f)[0].name;
  toasts.push({name: pick(NAMES), station: st, skin: f.skin, t: 4});
  say('Someone from your crowd was detained at ' + st);
}
function startArrest(police){
  const dest = Math.random() < 0.3 ? AYNAGHOR : pick(nearestStations(player).slice(0, 3));
  const a = Math.atan2(police.y - player.y, police.x - player.x);
  game.mode = 'arrest';
  sfxSiren();
  game.arrest = {phase: 0, t: 0, dest};
  game.van = {x: player.x + Math.cos(a) * 520, y: player.y + Math.sin(a) * 520, dir: 1, sx: 0, sy: 0};
  say('The police have caught you!', 2);
}
function updateArrest(dt){
  const A = game.arrest, v = game.van;
  A.t += dt;
  if (A.phase === 0){ if (A.t > 0.8){ A.phase = 1; A.t = 0; v.sx = v.x; v.sy = v.y; } }
  else if (A.phase === 1){
    const k = Math.min(1, A.t / 1.6); v.x = v.sx + (player.x - v.sx) * k; v.y = v.sy + (player.y - v.sy) * k; v.dir = player.x < v.sx ? -1 : 1;
    if (k >= 1){
      A.phase = 2; A.t = 0; player.hidden = true;
      followers.forEach(f => { f.cool = 5; f.vx = rand(-40, 40); f.vy = rand(-40, 40); neutrals.push(f); }); followers = [];
      v.sx = v.x; v.sy = v.y; A.dur = Math.max(2, Math.min(4, dist(v, A.dest) / 600)); say('Taken to ' + A.dest.name, 3);
    }
  } else {
    const k = Math.min(1, A.t / A.dur); v.x = v.sx + (A.dest.x - v.sx) * k; v.y = v.sy + (A.dest.y - v.sy) * k; v.dir = A.dest.x < v.sx ? -1 : 1;
    if (k >= 1) end(false, {station: A.dest.name, aynaghor: A.dest === AYNAGHOR});
  }
}

// ---------- chants ----------
function bubble(who, bn, rom, t){ bubbles.push({who, bn, rom, t}); }
function updateBubbles(dt){ for (let i = bubbles.length - 1; i >= 0; i--){ bubbles[i].t -= dt; if (bubbles[i].t <= 0) bubbles.splice(i, 1); } }
function updateChant(dt){
  if (followers.length < 3){ chant.timer = Math.max(chant.timer, 1); return; }
  chant.timer -= dt;
  if (chant.timer > 0) return;
  const c = CHANTS[chant.i];
  if (chant.phase === 0){ bubble(player, c.call[0], c.call[1], 1.3); chant.phase = 1; chant.timer = 1.3; }
  else {
    [...followers].sort(() => Math.random() - 0.5).slice(0, Math.min(vw < 700 ? 2 : 4, followers.length)).forEach(f => bubble(f, c.resp[0], c.resp[1], 1.8));
    chant.phase = 0; chant.i = (chant.i + 1) % CHANTS.length; chant.timer = 3;
  }
}

// ---------- sprites ----------
function person(c, x, y, o){
  const s = o.scale || 1, ph = (x + y) * 0.05, t = (game && game.t) || 0, bob = o.moving ? Math.sin(t * 11 + ph) * 1.6 : 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 9, 8, 3, 0, 0, 6.28); c.fill();
  const sw = o.moving ? Math.sin(t * 11 + ph) * 3 : 0;
  c.fillStyle = o.legs || '#2b2b2b'; c.fillRect(-4 + sw, 3, 3, 7); c.fillRect(1 - sw, 3, 3, 7);
  c.fillStyle = o.dress; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1;
  c.beginPath(); c.roundRect(-6, -7 + bob, 12, 12, 3); c.fill(); c.stroke();
  c.fillStyle = o.dress; c.fillRect(-8, -6 + bob, 2.5, 8); c.fillRect(5.5, -6 + bob, 2.5, 8);
  c.fillStyle = o.skin; c.beginPath(); c.arc(0, -12 + bob, 5, 0, 6.28); c.fill();
  if (o.hat === 'helmet'){
    c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(0, -13 + bob, 5.8, Math.PI, 0); c.fill(); c.fillRect(-6, -13 + bob, 12, 2.5);
    c.fillStyle = 'rgba(180,200,220,.6)'; c.fillRect(-4, -11 + bob, 8, 2);
  } else if (o.hat === 'cap'){
    c.fillStyle = '#12306b'; c.beginPath(); c.arc(0, -13 + bob, 5.5, Math.PI, 0); c.fill(); c.fillRect(-1, -13 + bob, 8, 2);
  } else if (o.hat === 'band'){
    c.fillStyle = '#c8102e'; c.fillRect(-5, -15 + bob, 10, 2.5);
  } else { c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(0, -14 + bob, 5, Math.PI, 0); c.fill(); }
  if (o.flag){  // Bangladesh flag: green field, red disc (only protesters carry it)
    c.fillStyle = '#6b4a2a'; c.fillRect(7, -26 + bob, 1.6, 22);
    c.fillStyle = '#0b6b3a'; c.fillRect(8.6, -26 + bob, 11, 8);
    c.fillStyle = '#c8102e'; c.beginPath(); c.arc(13.6, -22 + bob, 2.6, 0, 6.28); c.fill();
  }
  if (o.stick){  // police lathi (stick); swings down when striking
    const sw2 = o.swing || 0, ang = -0.7 + (sw2 > 0 ? (1 - sw2) * 2.0 : 0);
    c.save(); c.translate(7, -3 + bob); c.rotate(ang);
    c.fillStyle = '#8b5a2b'; c.fillRect(0, -1.5, 17, 3); c.fillStyle = '#5a3a1a'; c.fillRect(12, -1.5, 5, 3);
    c.restore();
  }
  c.restore();
}

function drawVan(c, v){
  c.save(); c.translate(v.x, v.y); c.scale(v.dir, 1);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 20, 38, 7, 0, 0, 6.28); c.fill();
  c.fillStyle = '#f2f2f2'; c.strokeStyle = '#222'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(-36, -14, 72, 30, 5); c.fill(); c.stroke();
  c.fillStyle = '#2f6fd0'; c.fillRect(-36, 2, 72, 6);
  c.fillStyle = '#9fd3f5'; c.fillRect(18, -11, 14, 11);
  c.fillStyle = '#222'; c.font = 'bold 9px system-ui'; c.textAlign = 'center'; c.fillText('POLICE', -6, 0);
  c.fillStyle = '#111'; c.beginPath(); c.arc(-22, 16, 6, 0, 6.28); c.arc(22, 16, 6, 0, 6.28); c.fill();
  const flash = Math.floor((game ? game.t : 0) * 6) % 2;
  c.fillStyle = flash ? '#e53935' : '#1e88e5'; c.fillRect(-12, -19, 10, 5);
  c.fillStyle = flash ? '#1e88e5' : '#e53935'; c.fillRect(2, -19, 10, 5);
  c.restore();
}

function drawMonument(c){
  c.fillStyle = 'rgba(200,16,46,.9)'; c.beginPath(); c.arc(0, -52, 62, 0, 6.28); c.fill();
  c.fillStyle = '#cfc7ae'; c.fillRect(-105, 34, 210, 18); c.fillRect(-88, 20, 176, 16); c.fillRect(-70, 8, 140, 14);
  const slab = (cx, h, lean, w) => {
    c.fillStyle = '#f2eee2'; c.strokeStyle = '#8a8470'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(cx - w / 2, 8); c.lineTo(cx - w / 2 + lean, 8 - h); c.lineTo(cx + w / 2 + lean, 8 - h); c.lineTo(cx + w / 2, 8); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.moveTo(cx + w / 2, 8); c.lineTo(cx + w / 2 + lean, 8 - h); c.lineTo(cx + w / 2 + lean - 5, 8 - h); c.lineTo(cx + w / 2 - 5, 8); c.fill();
  };
  slab(-62, 62, 12, 20); slab(-34, 82, 8, 22); slab(0, 112, 0, 26); slab(34, 82, -8, 22); slab(62, 62, -12, 20);
}

function label(c, text, x, y, font, color){ c.font = font; c.textAlign = 'center'; c.fillStyle = color; c.fillText(text, x, y); }
function drawMosque(c, m){
  c.fillStyle = '#e9efe6'; c.strokeStyle = '#6b7f70'; c.lineWidth = 1.5; c.fillRect(m.x - 24, m.y - 14, 48, 32); c.strokeRect(m.x - 24, m.y - 14, 48, 32);
  c.fillStyle = '#2e8b57'; c.beginPath(); c.arc(m.x, m.y - 14, 15, Math.PI, 0); c.fill();
  c.fillStyle = '#e9efe6'; c.fillRect(m.x - 31, m.y - 34, 6, 52); c.fillRect(m.x + 25, m.y - 34, 6, 52);
  c.fillStyle = '#2e8b57'; c.beginPath(); c.arc(m.x - 28, m.y - 34, 4, Math.PI, 0); c.arc(m.x + 28, m.y - 34, 4, Math.PI, 0); c.fill();
  label(c, m.name || 'Mosque', m.x, m.y + 32, '600 11px system-ui', '#2e5d44');
}
function drawCoffee(c, s){
  c.fillStyle = '#8b5a3c'; c.fillRect(s.x - 18, s.y - 10, 36, 24);
  for (let i = 0; i < 6; i++){ c.fillStyle = i % 2 ? '#fff' : '#c8102e'; c.fillRect(s.x - 20 + i * 7, s.y - 16, 7, 8); }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(s.x, s.y + 4, 5, 0, 6.28); c.fill(); c.fillStyle = '#5a3a1a'; c.fillRect(s.x - 3, s.y + 1, 6, 2);
  label(c, s.name || 'Coffee Shop', s.x, s.y + 28, '600 11px system-ui', '#5a3a1a');
}
function drawHospital(c, h){
  c.fillStyle = '#fff'; c.strokeStyle = '#c8102e'; c.lineWidth = 2; c.fillRect(h.x - 30, h.y - 22, 60, 44); c.strokeRect(h.x - 30, h.y - 22, 60, 44);
  c.fillStyle = '#c8102e'; c.fillRect(h.x - 4, h.y - 14, 8, 24); c.fillRect(h.x - 12, h.y - 6, 24, 8);
  c.fillStyle = 'rgba(200,16,46,.12)'; c.beginPath(); c.arc(h.x, h.y, 62, 0, 6.28); c.fill();
  label(c, h.name, h.x, h.y - 30, 'bold 11px system-ui', '#a00d26');
}
function drawBiriyani(c, s){
  c.fillStyle = 'rgba(255,170,40,.2)'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 6.28); c.fill();
  c.fillStyle = '#7a4a1e'; c.beginPath(); c.ellipse(s.x, s.y + 4, 17, 11, 0, 0, 6.28); c.fill();
  c.fillStyle = '#e8b04a'; c.beginPath(); c.ellipse(s.x, s.y, 17, 9, 0, 0, 6.28); c.fill();
  c.fillStyle = '#c8102e'; c.fillRect(s.x - 4, s.y - 3, 3, 3); c.fillRect(s.x + 3, s.y, 3, 3); c.fillStyle = '#fff'; c.fillRect(s.x - 8, s.y + 1, 3, 2);
  label(c, 'বিরিয়ানি', s.x, s.y - 20, 'bold 14px ' + BN_FONT, '#7a4a1e');
}
function drawTea(c, t){
  c.globalAlpha = t.cd > 0 ? 0.45 : 1;
  c.fillStyle = '#9a6a3a'; c.fillRect(t.x - 15, t.y - 8, 30, 20);
  c.fillStyle = '#4a7a3a'; c.beginPath(); c.moveTo(t.x - 19, t.y - 8); c.lineTo(t.x, t.y - 22); c.lineTo(t.x + 19, t.y - 8); c.closePath(); c.fill();
  c.fillStyle = '#fff'; c.fillRect(t.x - 4, t.y - 2, 8, 6); c.fillStyle = '#c8102e'; c.fillRect(t.x - 4, t.y - 2, 8, 2);
  label(c, 'মামার টঙের চা', t.x, t.y - 28, 'bold 13px ' + BN_FONT, '#3a5a2a');
  c.globalAlpha = 1;
}

// ---------- draw ----------
function draw(){
  const target = game.mode === 'arrest' && game.van && game.arrest.phase > 0 ? game.van : player;
  cam.x = target.x - vw / (2 * Z); cam.y = target.y - vh / (2 * Z);
  const VWZ = vw / Z, VHZ = vh / Z, zf = 1 / Z;
  const v = o => o.x > cam.x - 100 && o.x < cam.x + VWZ + 100 && o.y > cam.y - 100 && o.y < cam.y + VHZ + 100;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#0f2a1c'; ctx.fillRect(0, 0, vw, vh);
  ctx.save(); ctx.scale(Z, Z); ctx.translate(-cam.x, -cam.y);
  ctx.beginPath(); ctx.arc(0, 0, MAP_R, 0, 6.283); ctx.fillStyle = '#e8dfc4'; ctx.fill();
  ctx.save(); ctx.clip();

  ctx.strokeStyle = '#c9c3ae'; ctx.lineWidth = 54;
  for (let k = 0; k < 8; k++){ const p = polar(k * Math.PI / 4, MAP_R); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(p.x, p.y); ctx.stroke(); }
  ctx.lineWidth = 64; for (const r of RINGS.concat([MAP_R - 60])){ ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke(); }
  ctx.strokeStyle = '#8ec3e6'; ctx.lineWidth = 90; ctx.lineJoin = 'round'; ctx.beginPath();
  RIVER.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  label(ctx, 'Buriganga', -600, 1330, 'italic 16px system-ui', '#4b7ea3');
  ctx.fillStyle = '#8ec3e6'; ctx.beginPath(); ctx.ellipse(130, -380, 110, 50, -0.5, 0, 6.28); ctx.fill();

  // houses
  for (const h of TOWN.houses) if (h.x > cam.x - 80 && h.x < cam.x + VWZ + 80 && h.y > cam.y - 80 && h.y < cam.y + VHZ + 80){
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(h.x + 3, h.y + 3, h.w, h.h);
    ctx.fillStyle = h.c; ctx.fillRect(h.x, h.y, h.w, h.h);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(h.x, h.y, h.w, 5);
  }
  for (const l of LANDMARKS) label(ctx, l.name, l.x, l.y, '600 14px system-ui', 'rgba(40,40,40,.65)');
  for (const m of TOWN.mosques) if (v(m)) drawMosque(ctx, m);
  for (const s of TOWN.coffee) if (v(s)) drawCoffee(ctx, s);
  for (const h of HOSPITALS) if (v(h)) drawHospital(ctx, h);
  for (const s of STATIONS.concat([AYNAGHOR])){
    const ay = s === AYNAGHOR;
    ctx.fillStyle = ay ? '#3a2a2a' : '#2f6fd0'; ctx.fillRect(s.x - 14, s.y - 10, 28, 20);
    ctx.fillStyle = '#fff'; ctx.fillRect(s.x - 4, s.y - 2, 8, 12);
    label(ctx, s.name, s.x, s.y - 16, 'bold 12px system-ui', ay ? '#7a1a1a' : '#12306b');
  }
  for (const s of shutdowns){
    ctx.fillStyle = 'rgba(60,60,90,.28)'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#334'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'INTERNET SHUTDOWN', s.x, s.y, 'bold 16px system-ui', '#334');
  }
  for (const s of stalls) if (v(s)) drawBiriyani(ctx, s);
  for (const t of teas) if (v(t)) drawTea(ctx, t);
  ctx.restore();

  // goal
  ctx.fillStyle = 'rgba(11,107,58,.18)'; ctx.beginPath(); ctx.arc(0, 0, GOAL.r, 0, 6.28); ctx.fill();
  ctx.strokeStyle = '#0b6b3a'; ctx.lineWidth = 4; ctx.stroke();
  drawMonument(ctx);
  label(ctx, 'কেন্দ্রীয় শহীদ মিনার', 0, -GOAL.r - 12, 'bold ' + Math.round(20 * zf) + 'px ' + BN_FONT, '#0b6b3a');

  // police barricade rings
  RINGS.forEach((r, i) => {
    const gs = gates.filter(g => g.ring === i).sort((a, b) => a.ang - b.ang), half = GATE_HALF / r;
    ctx.strokeStyle = '#6c6c6c'; ctx.lineWidth = 30;
    gs.forEach((g, k) => { const nx = gs[(k + 1) % gs.length], end = k + 1 < gs.length ? nx.ang : nx.ang + 2 * Math.PI; ctx.beginPath(); ctx.arc(0, 0, r, g.ang + half, end - half); ctx.stroke(); });
    for (const g of gs){
      ctx.globalAlpha = 1 - g.open * 0.85; ctx.strokeStyle = '#b5532a'; ctx.beginPath(); ctx.arc(0, 0, r, g.ang - half, g.ang + half); ctx.stroke(); ctx.globalAlpha = 1;
      const lp = polar(g.ang, r + 32); label(ctx, g.open >= 1 ? 'OPEN' : 'POLICE BARRICADE: ' + g.need + ' people', lp.x, lp.y, 'bold ' + Math.round(14 * zf) + 'px system-ui', '#111');
    }
  });

  // people (depth-sorted)
  const list = [];
  for (const n of neutrals) if (v(n)) list.push([n.y, () => person(ctx, n.x, n.y, {dress: n.dress, skin: n.skin, moving: Math.abs(n.vx) + Math.abs(n.vy) > 4})]);
  followers.forEach((f, i) => { if (v(f)) list.push([f.y, () => person(ctx, f.x, f.y, {dress: WHITE, skin: f.skin, moving: player.moving, flag: i % 6 === 0, hat: i % 4 === 0 ? 'band' : null})]); });
  for (const r of rivals){
    r.members.forEach(m => { if (v(m)) list.push([m.y, () => person(ctx, m.x, m.y, {dress: BLACK, skin: m.skin, hat: 'helmet', moving: r.moving})]); });
    list.push([r.y, () => { person(ctx, r.x, r.y, {dress: BLACK, skin: SKINS[1], hat: 'helmet', scale: 1.25, moving: r.moving}); label(ctx, 'RIVAL ' + (r.members.length + 1), r.x, r.y - 28, 'bold 11px system-ui', '#111'); }]);
  }
  if (!player.hidden) list.push([player.y, () => {
    person(ctx, player.x, player.y, {dress: WHITE, skin: player.skin, hat: 'band', scale: 1.35, moving: player.moving, flag: true});
    // name tag above the head so you can find yourself
    ctx.save(); ctx.translate(player.x, player.y - 36); ctx.scale(zf, zf);   // keeps the tag readable when zoomed out
    ctx.font = 'bold 14px ' + BN_FONT; const nb = inkBounds(ctx.font, playerName), w = textW(ctx, playerName) + 18;
    const ta = Math.max(nb.ok ? nb.asc : 0, 14 * 0.95), td = Math.max(nb.ok ? nb.desc : 0, 14 * 0.35), th = ta + td + 10;
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.beginPath(); ctx.roundRect(-w / 2, -th, w, th, 7); ctx.fill();
    ctx.fillStyle = '#ffd54f'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(playerName, 0, -(td + 5));
    ctx.restore();
  }]);
  list.sort((a, b) => a[0] - b[0]).forEach(e => e[1]());
  for (const p of patrols) if (v(p)){   // police: blue, stick, no flag
    ctx.strokeStyle = 'rgba(47,111,208,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, 26, 0, 6.28); ctx.stroke();
    person(ctx, p.x, p.y, {dress: BLUE, skin: p.skin, hat: 'cap', legs: '#14284f', scale: 1.3, moving: true, stick: true, swing: p.swing / 0.35});
  }
  if (game.van) drawVan(ctx, game.van);
  for (const e of fx){   // gunshot flashes and grenade blasts (smoke and light, nothing graphic)
    if (e.kind === 'shot'){
      const a = 1 - e.t / 0.3; ctx.globalAlpha = a; ctx.fillStyle = '#fff6b0'; ctx.beginPath();
      for (let k = 0; k < 8; k++){ const ang = k * Math.PI / 4, rr = k % 2 ? 7 : 16; ctx.lineTo(e.x + Math.cos(ang) * rr, e.y + Math.sin(ang) * rr); }
      ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    } else if (e.kind === 'dust'){   // dust cloud from a broken barricade
      const k = e.t / 0.9; ctx.globalAlpha = Math.max(0, 0.6 * (1 - k)); ctx.fillStyle = '#b9aa8f';
      for (const [ox, oy, r0] of [[-22, 0, 14], [20, -6, 12], [0, -16, 16]]){ ctx.beginPath(); ctx.arc(e.x + ox, e.y + oy - k * 14, r0 + k * 42, 0, 6.28); ctx.fill(); }
      ctx.globalAlpha = 1;
    } else {
      const k = e.t / 1.1, rr = 18 + k * 62;
      ctx.globalAlpha = Math.max(0, 0.75 * (1 - k)); ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.arc(e.x, e.y, rr, 0, 6.28); ctx.fill();
      ctx.globalAlpha = Math.max(0, 0.55 * (1 - k)); ctx.fillStyle = '#7a7a7a'; ctx.beginPath(); ctx.arc(e.x - 12, e.y - 10 - k * 28, rr * 0.7, 0, 6.28); ctx.arc(e.x + 14, e.y - 4 - k * 22, rr * 0.6, 0, 6.28); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  const placed = [];   // screen rectangles of bubbles already drawn, so bubbles do not sit on top of each other
  for (const b of bubbles){
    if (!v(b.who)) continue;
    const bx = b.who.x, by = b.who.y - 38 - (b.who === player ? 36 * zf : 0);
    ctx.save(); ctx.translate(bx, by); ctx.scale(zf, zf);   // from here 1 unit = 1 screen pixel
    ctx.globalAlpha = Math.min(1, b.t * 2); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    let fs = 16; ctx.font = '700 ' + fs + 'px ' + BN_FONT;
    const maxW = Math.min(vw - 20, 320);
    while (textW(ctx, b.bn) + 28 > maxW && fs > 11){ fs--; ctx.font = '700 ' + fs + 'px ' + BN_FONT; }
    const ib = inkBounds(ctx.font, b.bn), w1 = textW(ctx, b.bn);
    // real glyph height from the painted pixels: Bangla marks reach well above and below the baseline
    const asc = Math.max(ib.ok ? ib.asc : 0, fs * 0.95), desc = Math.max(ib.ok ? ib.desc : 0, fs * 0.35);
    ctx.font = '11px system-ui'; const w2 = ctx.measureText(b.rom).width;
    const w = Math.max(w1, w2, 70) + 28, h = 10 + asc + desc + 6 + 13 + 8, top = 12 - h;
    // keep the whole bubble on screen
    const sx = (bx - cam.x) * Z, sy = (by - cam.y) * Z;
    let dx = 0, dy = 0;
    if (sx - w / 2 < 6) dx = 6 - (sx - w / 2); else if (sx + w / 2 > vw - 6) dx = (vw - 6) - (sx + w / 2);
    if (sy + top < 6) dy = 6 - (sy + top);
    let moved = dy !== 0;
    for (let n = 0; n < 5; n++){   // stack upward if another bubble is in the way
      const rx = sx - w / 2 + dx, ry = sy + top + dy;
      if (!placed.some(q => rx < q.x + q.w && rx + w > q.x && ry < q.y + q.h && ry + h > q.y)) break;
      dy -= h + 4; moved = true;
    }
    placed.push({x: sx - w / 2 + dx, y: sy + top + dy, w, h});
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(-w / 2 + dx, top + dy, w, h, 10); ctx.fill(); ctx.stroke();
    if (!moved){ const tx = Math.max(-w / 2 + dx + 12, Math.min(w / 2 + dx - 12, 0)); ctx.beginPath(); ctx.moveTo(tx - 6, 12); ctx.lineTo(tx, 20); ctx.lineTo(tx + 6, 12); ctx.fillStyle = '#fff'; ctx.fill(); }
    const y1 = top + dy + 10 + asc;   // Bangla baseline, with room above for the marks
    ctx.font = '700 ' + fs + 'px ' + BN_FONT; ctx.fillStyle = '#0b6b3a'; ctx.fillText(b.bn, dx, y1);   // centred from its ink by the fillText wrapper
    ctx.font = '11px system-ui'; ctx.fillStyle = '#666'; ctx.fillText(b.rom, dx, y1 + desc + 6 + 10);
    ctx.globalAlpha = 1; ctx.restore();
  }
  ctx.restore();
  drawHUD();
  drawPad();
}

function inShutdown(){ return shutdowns.some(s => dist(s, player) < s.r); }

function drawHUD(){
  // draw the HUD on a virtual screen that shrinks on small displays so nothing overlaps
  const k = Math.max(0.6, Math.min(1, innerWidth / 760, innerHeight / 540)), vw = innerWidth / k, vh = innerHeight / k;
  const barY = vw < 800 ? Math.round(vh * 0.62) : 20, bannerY = vw < 800 ? Math.round(vh * 0.5) : 70;
  ctx.save(); ctx.scale(k, k);
  ctx.textAlign = 'left';
  const ph = 58;
  ctx.fillStyle = 'rgba(0,0,0,.68)'; ctx.fillRect(10, 10, 300, ph);
  ctx.fillStyle = '#ffd54f'; ctx.font = 'bold 34px system-ui'; ctx.fillText('Day ' + game.day, 22, 52);
  const dayW = ctx.measureText('Day ' + game.day).width;
  ctx.fillStyle = '#cfd8dc'; ctx.font = '15px system-ui'; ctx.fillText('of ' + MAX_DAY, 22 + dayW + 8, 50);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 17px system-ui'; ctx.textAlign = 'right'; ctx.fillText('Score ' + computeScore(false, 'timeout', true).toLocaleString('en-US'), 300, 49); ctx.textAlign = 'left';
  const y0 = 10 + ph + 10;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(10, y0, 230, 78);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 16px system-ui';
  ctx.fillText('Crowd: ' + (followers.length + 1), 20, y0 + 22);
  ctx.fillText('Time: ' + Math.floor(game.t) + 's', 130, y0 + 22);
  ctx.font = '12px system-ui'; ctx.fillText('Morale', 20, y0 + 44);
  ctx.fillStyle = '#444'; ctx.fillRect(70, y0 + 35, 160, 10);
  ctx.fillStyle = player.morale > 30 ? '#4caf50' : '#e53935'; ctx.fillRect(70, y0 + 35, 1.6 * player.morale, 10);
  const ri = RINGS.findIndex(r => r < Math.hypot(player.x, player.y) - 20);
  ctx.fillStyle = '#fff'; ctx.fillText(ri >= 0 ? 'Next police barricade needs ' + GATE_NEEDS[ri] + ' people' : 'All barricades passed!', 20, y0 + 68);
  if (player.injured){ ctx.fillStyle = '#e53935'; ctx.font = 'bold 13px system-ui'; ctx.fillText('INJURED: find a hospital', 20, y0 + 96); }

  const mr = 62, mx = vw - mr - 12, my = 12 + mr, ay = my + mr + 34, s = mr / MAP_R;   // map top right, red arrow under it
  if (!inShutdown()){
    const a = Math.atan2(GOAL.y - player.y, GOAL.x - player.x);
    ctx.save(); ctx.translate(mx, ay); ctx.rotate(a);
    ctx.fillStyle = '#c8102e'; ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(-12, -14); ctx.lineTo(-6, 0); ctx.lineTo(-12, 14); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '11px system-ui'; ctx.fillText((dist(player, GOAL) / 190).toFixed(1) + ' km', mx, ay + 34);
    if (player.injured){
      const h = nearestHospital(player), ha = Math.atan2(h.y - player.y, h.x - player.x);
      ctx.save(); ctx.translate(mx, ay + 78); ctx.rotate(ha);
      ctx.fillStyle = '#2e9e5b'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-10, -11); ctx.lineTo(-5, 0); ctx.lineTo(-10, 11); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = '11px system-ui'; ctx.fillText('Hospital ' + (dist(player, h) / 190).toFixed(1) + ' km', mx, ay + 106);
    }
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#888'; ctx.lineWidth = 1; for (const r of RINGS){ ctx.beginPath(); ctx.arc(mx, my, r * s, 0, 6.28); ctx.stroke(); }
    ctx.fillStyle = '#4caf50'; ctx.fillRect(mx - 3, my - 3, 6, 6);
    ctx.fillStyle = '#ff5252'; for (const h of HOSPITALS) ctx.fillRect(mx + h.x * s - 2, my + h.y * s - 2, 4, 4);
    ctx.fillStyle = '#4a8bff'; for (const p of patrols) ctx.fillRect(mx + p.x * s - 1, my + p.y * s - 1, 3, 3);
    ctx.fillStyle = '#000'; ctx.strokeStyle = '#fff'; for (const r of rivals){ ctx.fillRect(mx + r.x * s - 2, my + r.y * s - 2, 5, 5); ctx.strokeRect(mx + r.x * s - 2, my + r.y * s - 2, 5, 5); }
    ctx.fillStyle = '#fff'; ctx.fillRect(mx + player.x * s - 2, my + player.y * s - 2, 5, 5);
  } else { ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 12px system-ui'; ctx.fillText('NO SIGNAL', mx, my + 4); }

  ctx.textAlign = 'center';
  if (game.contested){ ctx.fillStyle = '#fff'; ctx.font = 'bold 16px system-ui'; ctx.fillText('A bigger rival crowd is in the square. Out-recruit them.', vw / 2, barY + 18); }
  else if (game.hold > 0){
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(vw / 2 - 150, barY, 300, 26);
    ctx.fillStyle = '#4caf50'; ctx.fillRect(vw / 2 - 150, barY, 300 * game.hold / NEED_HOLD, 26);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.fillText('HOLDING THE SHAHEED MINAR', vw / 2, barY + 18);
  } else if (dist(player, GOAL) < GOAL.r && followers.length + 1 < NEED_CROWD){
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px system-ui'; ctx.fillText('You need ' + NEED_CROWD + ' people to hold the Shaheed Minar', vw / 2, barY + 18);
  }
  if (game.msgT > 0){
    let mf = 17; ctx.font = 'bold ' + mf + 'px ' + BN_FONT;
    while (textW(ctx, game.msg) + 30 > vw - 16 && mf > 11){ mf -= 1; ctx.font = 'bold ' + mf + 'px ' + BN_FONT; }
    const w = textW(ctx, game.msg) + 30;
    ctx.fillStyle = 'rgba(0,0,0,.72)'; const my0 = IS_TOUCH ? Math.round(vh * 0.72) : vh - 110;
    ctx.fillRect(vw / 2 - w / 2, my0, w, 34);
    ctx.fillStyle = '#fff'; ctx.fillText(game.msg, vw / 2, my0 + 23);
  }
  toasts.forEach((t, i) => {
    const x = 12, y = vh - 60 - (i + 1) * 118;
    ctx.save(); ctx.globalAlpha = Math.min(1, t.t);
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, 100, 108); ctx.fillStyle = '#d7d3c8'; ctx.fillRect(x + 6, y + 6, 88, 66);
    person(ctx, x + 50, y + 62, {dress: WHITE, skin: t.skin, scale: 2.2});
    ctx.fillStyle = '#c8102e'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.fillText('DETAINED', x + 50, y + 88);
    ctx.fillStyle = '#222'; ctx.font = '11px ' + BN_FONT; ctx.fillText(t.name + ' · ' + t.station.replace(' Thana', ''), x + 50, y + 102);
    ctx.restore();
  });
  if (game.flash > 0){ ctx.fillStyle = 'rgba(200,0,0,' + (game.flash * 0.9) + ')'; ctx.fillRect(0, 0, vw, vh); }
  ctx.restore();
}

// ---------- shareable photo card ----------
function fitText(g, text, maxW, size, weight, family){
  let s = size; g.font = weight + ' ' + s + 'px ' + family;
  while (textW(g, text) > maxW && s > 14){ s -= 2; g.font = weight + ' ' + s + 'px ' + family; }
}
function rrect(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function starPath(g, cx, cy, R){ g.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * 0.45 : R; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); }
// trading-card layout: gold when the player wins, blue when detained or out of time
function renderCard(kind, info){
  const W = 720, H = 1000, win = kind === 'win';
  const T = win ? {frame: '#f2cf45', edge: '#c79a12', strip: '#e8d27a', box: '#f7e9a8', ink: '#412402', art: '#2b2f3a', art2: '#343947', dot: '#d9a93a'}
                : {frame: '#7fb2e5', edge: '#185fa5', strip: '#b5d4f4', box: '#e1eefb', ink: '#042c53', art: '#1d2b4a', art2: '#27406b', dot: '#378add'};
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = T.frame; rrect(g, 0, 0, W, H, 38); g.fill();
  g.strokeStyle = T.edge; g.lineWidth = 6; rrect(g, 3, 3, W - 6, H - 6, 36); g.stroke();
  g.textBaseline = 'alphabetic'; g.fillStyle = T.ink;

  // title row: name on the left, score on the right
  g.textAlign = 'left'; fitText(g, info.name, 330, 46, 'bold', BN_FONT); g.fillText(info.name, 44, 76);
  g.textAlign = 'right'; g.fillStyle = T.dot; g.strokeStyle = T.edge; g.lineWidth = 3; g.beginPath(); g.arc(W - 62, 60, 24, 0, 7); g.fill(); g.stroke();
  g.fillStyle = T.ink; starPath(g, W - 62, 61, 14); g.fill();
  g.font = 'bold 46px system-ui'; g.fillText(info.score.toLocaleString('en-US'), W - 98, 76);
  const sw = g.measureText(info.score.toLocaleString('en-US')).width;
  g.font = 'bold 20px system-ui'; g.fillText('SCORE', W - 98 - sw - 10, 76);

  // art window: photo or avatar, with the stamp on top
  const AX = 36, AY = 100, AW = 648, AH = 440;
  g.fillStyle = '#e8e6dc'; rrect(g, AX - 8, AY - 8, AW + 16, AH + 16, 8); g.fill();
  g.save(); g.beginPath(); g.rect(AX, AY, AW, AH); g.clip();
  g.fillStyle = T.art; g.fillRect(AX, AY, AW, AH);
  g.strokeStyle = T.art2; g.lineWidth = 8; for (let k = -AH; k < AW; k += 28){ g.beginPath(); g.moveTo(AX + k, AY + AH); g.lineTo(AX + k + AH, AY); g.stroke(); }
  g.translate(AX + AW / 2, AY);
  if (info.photo){
    const im = info.photo, k = Math.max(AW / im.width, AH / im.height), dw = im.width * k, dh = im.height * k;
    if (!win) g.filter = 'grayscale(0.7)';
    g.drawImage(im, (AW - dw) / 2 - AW / 2, (AH - dh) / 2, dw, dh); g.filter = 'none';
  } else person(g, 0, AH - 100, {dress: WHITE, skin: info.skin, hat: 'band', scale: 9, flag: win});
  g.save(); g.translate(0, info.photo ? AH - 100 : 80); g.rotate(-0.2);
  const col = win ? '#27500a' : info.station ? '#c8102e' : '#5f5e5a';
  const label = win ? 'VICTORY' : info.station ? 'DETAINED' : 'TIME UP';
  const sub = win ? 'HELD THE MINAR' : info.station ? info.station.toUpperCase() : 'DAY ' + MAX_DAY + ' ENDED';
  g.textAlign = 'center'; fitText(g, label, 440, 76, 'bold', 'system-ui'); const lw = g.measureText(label).width;
  fitText(g, sub, 440, 30, 'bold', 'system-ui'); const sbw = g.measureText(sub).width, bw = Math.max(lw, sbw, 240) + 44;
  g.fillStyle = 'rgba(247,244,234,.8)'; g.strokeStyle = col; g.lineWidth = 8; g.globalAlpha = 0.92; g.fillRect(-bw / 2, -62, bw, 140); g.strokeRect(-bw / 2, -62, bw, 140);
  g.fillStyle = col; fitText(g, label, 440, 76, 'bold', 'system-ui'); g.fillText(label, 0, 12);
  fitText(g, sub, 440, 30, 'bold', 'system-ui'); g.fillText(sub, 0, 56);
  g.restore(); g.restore();

  // rank strip
  g.fillStyle = T.strip; g.fillRect(AX, AY + AH + 14, AW, 40);
  g.fillStyle = T.ink; g.textAlign = 'left'; g.font = 'bold 24px ' + BN_FONT; g.fillText(info.rankBn, AX + 14, AY + AH + 43);
  g.textAlign = 'right'; g.font = 'italic 20px system-ui'; g.fillText('Andolon · Day ' + info.day + ' of ' + MAX_DAY, AX + AW - 14, AY + AH + 42);

  // two "attack" rows: special tag, peak crowd
  const BY = AY + AH + 68;
  g.fillStyle = T.box; g.strokeStyle = T.edge; g.lineWidth = 3; rrect(g, AX, BY, AW, 232, 12); g.fill(); g.stroke();
  const row = (y, title, value, desc, icon) => {
    g.fillStyle = '#fff'; g.strokeStyle = T.edge; g.lineWidth = 3; g.beginPath(); g.arc(AX + 38, y, 20, 0, 7); g.fill(); g.stroke();
    g.fillStyle = T.ink;
    if (icon === 'star'){ starPath(g, AX + 38, y + 1, 12); g.fill(); }
    else { g.beginPath(); g.arc(AX + 31, y - 4, 5, 0, 7); g.arc(AX + 45, y - 4, 5, 0, 7); g.fill(); g.beginPath(); g.arc(AX + 31, y + 14, 9, Math.PI, 0); g.arc(AX + 45, y + 14, 9, Math.PI, 0); g.fill(); }
    g.textAlign = 'left'; fitText(g, title, 360, 30, 'bold', 'system-ui'); g.fillText(title, AX + 74, y + 10);
    if (value != null){ g.textAlign = 'right'; g.font = 'bold 30px system-ui'; g.fillText(String(value), AX + AW - 24, y + 10); }
    g.textAlign = 'left'; fitText(g, desc, AW - 100, 21, 'normal', 'system-ui'); g.fillText(desc, AX + 74, y + 42);
  };
  row(BY + 42, info.tagBn, null, info.tagDesc, 'star');
  row(BY + 144, 'Peak crowd', info.peak, 'Most people marching with you at once.', 'crowd');

  // footer stats
  const FY = BY + 232 + 26, cw = AW / 3;
  const foot = [[info.nextText[0], info.nextText[1]], [info.newBest ? 'NEW BEST' : 'BEST SCORE', info.best.toLocaleString('en-US')], ['BARRICADES', info.rings + ' of ' + RINGS.length]];
  g.textAlign = 'center';
  foot.forEach((f, i) => { const x = AX + cw * i + cw / 2; g.fillStyle = T.ink; g.font = '17px system-ui'; g.fillText(f[0], x, FY); g.font = 'bold 28px system-ui'; g.fillText(f[1], x, FY + 32); });
  g.font = '16px system-ui'; g.textAlign = 'left'; g.fillText('Fictional game · Play Andolon' + (location.protocol.startsWith('http') ? ' · ' + location.host + location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') : ''), AX, H - 22);
  g.textAlign = 'right'; g.fillText(String(info.day).padStart(3, '0') + '/' + String(MAX_DAY).padStart(3, '0'), AX + AW, H - 22);
  return c;
}
const cardBlob = canvas => new Promise(r => canvas.toBlob(r, 'image/png'));
// On phones the share sheet is the way into the gallery ("Save Image" / "Save to Photos"); a plain download goes to Files on iPhone.
async function shareCard(canvas, text, saveMode){
  const blob = await cardBlob(canvas);
  const file = new File([blob], 'andolon.png', {type: 'image/png'});
  if (navigator.canShare && navigator.canShare({files: [file]})){
    try { await navigator.share(text ? {files: [file], text, title: 'Andolon'} : {files: [file]}); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  downloadCard(canvas, blob);
}
async function downloadCard(canvas, blob){
  blob = blob || await cardBlob(canvas);
  if (IS_TOUCH && !blob.__tried){   // phone: share sheet first
    const file = new File([blob], 'andolon.png', {type: 'image/png'});
    if (navigator.canShare && navigator.canShare({files: [file]})){ try { await navigator.share({files: [file]}); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    saveOverlay(canvas); return;      // no share sheet: show the picture so it can be pressed and held
  }
  const a = document.createElement('a'); a.download = 'andolon.png'; a.href = URL.createObjectURL(blob);
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function saveOverlay(canvas){
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;gap:12px;color:#fff;font:16px system-ui;text-align:center';
  o.innerHTML = '<div>Press and hold the card, then tap <b>Save to Photos</b> (or Save Image).</div><img alt="Your card" style="max-width:100%;max-height:70vh;border-radius:10px" src="' + canvas.toDataURL('image/png') + '"><button style="padding:10px 24px;font-size:16px;border-radius:8px;border:0">Close</button>';
  o.querySelector('button').onclick = () => o.remove();
  document.body.appendChild(o);
}

// ---------- player photo (optional, stays in the browser) ----------
let playerPhoto = null;
function loadPhoto(file, cb){
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas');   // shrink big photos
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      playerPhoto = c; if (cb) cb();
    };
    im.src = rd.result;
  };
  rd.readAsDataURL(file);
}

// ---------- scoring ----------
function computeScore(won, outcome, live){
  const st = game.stats, crowd = followers.length + 1;
  let sc = st.recruits * SCORE.recruit + (won ? crowd : st.peak) * SCORE.crowd + st.rings * SCORE.ring + st.clashWins * SCORE.clash;
  if (won) sc += SCORE.win + Math.max(0, Math.round((TIME_PAR - game.t) * SCORE.speed));
  else if (!live) sc *= outcome === 'detained' ? SCORE.detained : SCORE.timeout;
  return Math.round(sc);
}
function rankFor(score){ let r = RANKS[0]; for (const x of RANKS) if (score >= x.min) r = x; return r; }
function pickTag(won, outcome){
  const st = game.stats;
  if (won){ if (game.t < 150) return TAGS.fast; if (st.beaten === 0) return TAGS.unbreakable; if (st.peak >= 60) return TAGS.mass; if (st.cures > 0) return TAGS.laststand; return TAGS.breaker; }
  return st.rings === 0 ? TAGS.first : st.rings >= 2 ? TAGS.inner : TAGS.mid;
}
function pickRoast(){
  const st = game.stats;
  if (st.stallT >= 25 || st.teas >= 3) return ROASTS.biriyani;
  if (st.peak < 5) return ROASTS.alone;
  if (st.rings === 0) return ROASTS.afraid;
  return ROASTS.fb;
}

// ---------- end / menu ----------
function end(won, info){
  info = info || {};
  stopSiren();
  game.started = false;
  const outcome = won ? 'win' : info.timeout ? 'timeout' : 'detained', st = game.stats, crowd = followers.length + 1;
  const score = computeScore(won, outcome), rank = rankFor(score);
  const tag = outcome === 'timeout' ? pickRoast() : pickTag(won, outcome);
  const tagBn = tag.bn || tag.tag, tagDesc = tag.desc;
  const nxt = RANKS.find(r => r.min > score);
  const nextText = nxt ? ['NEXT: ' + nxt.bn, (nxt.min - score).toLocaleString('en-US') + ' pts'] : ['NEXT RANK', 'Maxed'];
  let best = 0, newBest = false; try { best = +localStorage.getItem('da_best') || 0; if (score > best){ newBest = best > 0; localStorage.setItem('da_best', String(score)); best = score; } } catch (e) {}
  const cardInfo = {name: playerName, skin: player.skin, station: info.station, timeout: !!info.timeout, score, rankBn: rank.bn, tagBn, tagDesc, peak: st.peak, rings: st.rings, day: game.day, best, newBest, nextText};
  const build = () => renderCard(won ? 'win' : 'lose', Object.assign({photo: playerPhoto}, cardInfo));
  let canvas = build();
  const box = document.getElementById('card');
  let head;
  if (won) head = '<h1>Shaheed Minar <span>held!</span></h1><p>Your crowd of <b>' + crowd + '</b> held the square on <b>Day ' + game.day + '</b>.</p>';
  else if (outcome === 'timeout') head = '<h1>Day ' + MAX_DAY + ' <span>is over</span></h1><p>You are a <b>' + tagBn + '</b>. ' + tagDesc + '</p>';
  else if (info.aynaghor) head = '<h1>Taken to <span>Aynaghor</span></h1><p>The police van took you to Aynaghor. The game is over.</p>';
  else head = '<h1>Detained at <span>' + info.station + '</span></h1><p>You were caught by the police and taken by van. The game is over.</p>';
  box.innerHTML = head + '<img id="cardimg" alt="Photo card" src="' + canvas.toDataURL('image/png') + '">' +
    '<label>Put your own photo on the card (optional)<input id="photo2" type="file" accept="image/*"></label>' +
    '<button id="share">Share card</button><button id="dl" class="alt">' + (IS_TOUCH ? 'Save to Photos' : 'Download') + '</button><button id="go">March again</button>' +
    (IS_TOUCH ? '<small>Tip: press and hold the card to save it to your Photos.</small><br>' : '') +
    (playerPhoto ? '<button id="nophoto" class="alt">Use default avatar</button>' : '') +
    '<a href="#" class="aboutlink">About &amp; Disclaimer</a><br>' +
    '<small>Your photo stays on your device. It is only drawn onto this card. Fictional game; characters and events are not real people or incidents.</small>';
  const text = won ? 'I held the Central Shaheed Minar in Andolon! ' + rank.en + ', ' + score.toLocaleString('en-US') + ' pts.'
    : outcome === 'timeout' ? 'Andolon called me "' + tagBn + '". Can you do better?'
    : 'I was detained at ' + info.station + ' in Andolon. ' + score.toLocaleString('en-US') + ' pts.';
  const refresh = () => { canvas = build(); document.getElementById('cardimg').src = canvas.toDataURL('image/png'); const b = document.getElementById('nophoto'); if (!b && playerPhoto){ const n = document.createElement('button'); n.id = 'nophoto'; n.className = 'alt'; n.textContent = 'Use default avatar'; n.onclick = () => { playerPhoto = null; n.remove(); refresh(); }; document.getElementById('go').after(n); } };
  document.getElementById('photo2').onchange = e => loadPhoto(e.target.files[0], refresh);
  const np = document.getElementById('nophoto'); if (np) np.onclick = () => { playerPhoto = null; np.remove(); refresh(); };
  document.getElementById('share').onclick = () => shareCard(canvas, text);
  document.getElementById('dl').onclick = () => downloadCard(canvas);
  document.getElementById('go').onclick = start;
  document.getElementById('menu').style.display = 'flex';
}

// ---------- loop ----------
let last = 0;
function frame(ts){
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
  if (game && game.started) update(dt);
  if (game) draw();
  requestAnimationFrame(frame);
}
function start(){
  const inp = document.getElementById('pname');
  if (inp && inp.value.trim()) playerName = inp.value.trim();
  try { localStorage.setItem('da_name', playerName); } catch (e) {}
  ac();   // unlock audio on the user's click
  document.getElementById('menu').style.display = 'none';
  newGame();
}
document.getElementById('go').onclick = start;
const mb = document.getElementById('mute'); if (mb) mb.onclick = toggleMute;
const rulesEl = document.getElementById('rules'); if (rulesEl && innerWidth > 640) rulesEl.open = true;   // rules start folded on phones
document.getElementById('photo').onchange = e => loadPhoto(e.target.files[0]);
cv.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
// touch: a round pad at the bottom right. Touch and hold a direction on it to walk that way; lift to stop.
// (touching anywhere else on the screen still walks toward the finger)
const IS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const pad = {id: null, kx: 0, ky: 0, ux: 0, uy: 0};
const padGeom = () => { const R = Math.max(46, Math.min(66, innerWidth * 0.16)); return {x: innerWidth - R - 14, y: innerHeight - R - 46, R}; };
const stopWalk = () => { mouse.x = vw / 2; mouse.y = vh / 2; };
function padSet(t){
  const g = padGeom(); let dx = t.clientX - g.x, dy = t.clientY - g.y; const d = Math.hypot(dx, dy);
  if (d > g.R){ dx = dx / d * g.R; dy = dy / d * g.R; }
  pad.kx = dx; pad.ky = dy;
  if (d > g.R * 0.2){ pad.ux = dx / Math.hypot(dx, dy); pad.uy = dy / Math.hypot(dx, dy); } else { pad.ux = pad.uy = 0; stopWalk(); }
}
const onPad = t => { const g = padGeom(); return Math.hypot(t.clientX - g.x, t.clientY - g.y) < g.R * 1.5; };
const screenWalk = t => { mouse.x = t.clientX; mouse.y = t.clientY; };
const touchGo = e => {
  for (const t of e.changedTouches){
    if (pad.id === t.identifier) padSet(t);
    else if (pad.id === null && e.type === 'touchstart' && onPad(t)){ pad.id = t.identifier; padSet(t); }
    else if (pad.id === null) screenWalk(t);
  }
  e.preventDefault();
};
const touchEnd = e => {
  for (const t of e.changedTouches){
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
