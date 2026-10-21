// ---------- sprites ----------
const lookOf = p => p.look || (p.look = mkLook());   // people created without a look get one the first time they are drawn
const PERSON_SCALE = 1.25;   // everyone is drawn a bit bigger than their collision size, so crowds read better on a phone
function person(c, x, y, o){
  const L = o.look, s = (o.scale || 1) * (o.noBase ? 1 : PERSON_SCALE) * (L ? L.h : 1), ph = (x + y) * 0.05, t = (game && game.t) || 0, bob = o.moving ? Math.sin(t * 11 + ph) * 1.6 : 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 9, 8, 3, 0, 0, 6.28); c.fill();
  const sw = o.moving ? Math.sin(t * 11 + ph) * 3 : 0, outfit = L && !o.legs ? L.outfit : null;
  // legs (or a sarong / skirt)
  if (outfit === 'lungi'){
    c.fillStyle = L.lungi; c.fillRect(-5.5, 3, 11, 6.5); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-5.5, 5.5, 11, 1);
    c.fillStyle = '#2b2b2b'; c.fillRect(-4 + sw, 9, 3, 1.6); c.fillRect(1 - sw, 9, 3, 1.6);
  } else if (outfit === 'saree'){
    c.fillStyle = o.dress; c.beginPath(); c.moveTo(-6, 2); c.lineTo(6, 2); c.lineTo(7.5 + sw * 0.15, 10); c.lineTo(-7.5 + sw * 0.15, 10); c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(-7, 8.2, 14, 1.8);
  } else {
    c.fillStyle = o.legs || (L ? L.legs : '#2b2b2b'); c.fillRect(-4 + sw, 3, 3, 7); c.fillRect(1 - sw, 3, 3, 7);
  }
  // hair behind the head
  if (L && !o.hat && L.hair === 'long' && L.head !== 'hijab'){ c.fillStyle = L.hc; c.fillRect(-5.4, -14 + bob, 10.8, 10); }
  // body
  c.fillStyle = o.dress; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1;
  c.beginPath(); c.roundRect(-6, -7 + bob, 12, outfit === 'panjabi' ? 16 : 12, 3); c.fill(); c.stroke();
  c.fillStyle = o.dress; c.fillRect(-8, -6 + bob, 2.5, 8); c.fillRect(5.5, -6 + bob, 2.5, 8);
  if (outfit === 'saree'){ c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.moveTo(-6, -7 + bob); c.lineTo(6, 3 + bob); c.lineTo(6, 5 + bob); c.lineTo(-6, -4 + bob); c.closePath(); c.fill(); }
  if (L && L.bag){ c.fillStyle = '#6b4a2a'; c.fillRect(-9.5, -1 + bob, 4, 6); c.fillRect(-7.5, -6 + bob, 1, 5); }
  // head
  if (L && L.head === 'hijab' && !o.hat){
    c.fillStyle = L.hj; c.beginPath(); c.arc(0, -12 + bob, 6.4, 0, 6.28); c.fill(); c.beginPath(); c.roundRect(-6.6, -9 + bob, 13.2, 6, 2.5); c.fill();
    c.fillStyle = o.skin; c.beginPath(); c.ellipse(0, -11.4 + bob, 3.7, 4.3, 0, 0, 6.28); c.fill();
  } else {
    c.fillStyle = o.skin; c.beginPath(); c.arc(0, -12 + bob, 5, 0, 6.28); c.fill();
  }
  if (o.hat === 'helmet'){
    c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(0, -13 + bob, 5.8, Math.PI, 0); c.fill(); c.fillRect(-6, -13 + bob, 12, 2.5);
    c.fillStyle = 'rgba(180,200,220,.6)'; c.fillRect(-4, -11 + bob, 8, 2);
  } else if (o.hat === 'cap'){
    c.fillStyle = '#12306b'; c.beginPath(); c.arc(0, -13 + bob, 5.5, Math.PI, 0); c.fill(); c.fillRect(-1, -13 + bob, 8, 2);
  } else if (o.hat === 'band'){
    c.fillStyle = L && L.hair !== 'bald' ? L.hc : '#2a1a10'; c.beginPath(); c.arc(0, -14 + bob, 5, Math.PI, 0); c.fill();
    c.fillStyle = '#c8102e'; c.fillRect(-5, -15 + bob, 10, 2.5);
  } else if (L){
    if (L.head === 'topi'){
      c.fillStyle = '#f4f1e6'; c.beginPath(); c.arc(0, -13.5 + bob, 5, Math.PI, 0); c.fill(); c.fillRect(-5, -14 + bob, 10, 2.5);
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-5, -12 + bob, 10, 0.8);
    } else if (L.head !== 'hijab' && L.hair !== 'bald'){
      c.fillStyle = L.hc; c.beginPath(); c.arc(0, -14 + bob, 5.2, Math.PI, 0); c.fill();
      if (L.hair === 'bun'){ c.beginPath(); c.arc(0, -19.5 + bob, 2.6, 0, 6.28); c.fill(); }
    }
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
function drawTemple(c, t){   // stepped shikhara tower with a flag
  c.fillStyle = '#f1dcc4'; c.strokeStyle = '#8a5a30'; c.lineWidth = 1.5; c.fillRect(t.x - 20, t.y - 4, 40, 20); c.strokeRect(t.x - 20, t.y - 4, 40, 20);
  c.fillStyle = '#e07a2f'; c.beginPath(); c.moveTo(t.x - 14, t.y - 4); c.lineTo(t.x, t.y - 34); c.lineTo(t.x + 14, t.y - 4); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#8a5a30'; c.beginPath(); c.moveTo(t.x, t.y - 34); c.lineTo(t.x, t.y - 44); c.stroke(); c.fillStyle = '#c8102e'; c.fillRect(t.x, t.y - 44, 9, 5);
  label(c, 'Temple', t.x, t.y + 30, '600 11px system-ui', '#8a4a10');
}
function drawMonastery(c, m){   // golden-roofed hall with a stupa
  c.fillStyle = '#f4ead0'; c.strokeStyle = '#8a7020'; c.lineWidth = 1.5; c.fillRect(m.x - 20, m.y - 4, 40, 20); c.strokeRect(m.x - 20, m.y - 4, 40, 20);
  c.fillStyle = '#d9a82a'; c.beginPath(); c.moveTo(m.x - 26, m.y - 4); c.lineTo(m.x - 14, m.y - 18); c.lineTo(m.x + 14, m.y - 18); c.lineTo(m.x + 26, m.y - 4); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(m.x, m.y - 22, 8, Math.PI, 0); c.fill(); c.stroke(); c.fillStyle = '#d9a82a'; c.fillRect(m.x - 1.5, m.y - 36, 3, 10);
  label(c, 'Monastery', m.x, m.y + 30, '600 11px system-ui', '#7a5f10');
}
function drawChurch(c, s){   // gabled nave, bell tower and cross
  c.fillStyle = '#f3f1ec'; c.strokeStyle = '#6a6a78'; c.lineWidth = 1.5; c.fillRect(s.x - 20, s.y - 4, 40, 20); c.strokeRect(s.x - 20, s.y - 4, 40, 20);
  c.fillStyle = '#7a6a78'; c.beginPath(); c.moveTo(s.x - 22, s.y - 4); c.lineTo(s.x, s.y - 18); c.lineTo(s.x + 22, s.y - 4); c.closePath(); c.fill();
  c.fillStyle = '#f3f1ec'; c.fillRect(s.x + 8, s.y - 30, 10, 26); c.strokeRect(s.x + 8, s.y - 30, 10, 26);
  c.strokeStyle = '#333'; c.lineWidth = 2; c.beginPath(); c.moveTo(s.x + 13, s.y - 42); c.lineTo(s.x + 13, s.y - 32); c.moveTo(s.x + 9, s.y - 38); c.lineTo(s.x + 17, s.y - 38); c.stroke();
  label(c, 'Church', s.x, s.y + 30, '600 11px system-ui', '#444458');
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

// ground texture: a small speckled tile, built once and repeated over the whole map
function drawLamp(c, l){
  c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(l.x + 2, l.y + 3, 4, 1.8, 0, 0, 6.283); c.fill();
  c.fillStyle = '#4a4a50'; c.fillRect(l.x - 1, l.y - 14, 2, 15);
  c.fillStyle = 'rgba(255,224,130,.22)'; c.beginPath(); c.arc(l.x, l.y - 15, 8, 0, 6.283); c.fill();
  c.fillStyle = '#ffe082'; c.beginPath(); c.arc(l.x, l.y - 15, 3, 0, 6.283); c.fill();
}
function drawRickshaw(c, r){
  c.save(); c.translate(r.x, r.y); c.rotate(r.ang);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 6, 13, 4, 0, 0, 6.283); c.fill();
  c.fillStyle = '#222'; c.beginPath(); c.arc(-9, 4, 3.4, 0, 6.283); c.arc(9, 4, 3.4, 0, 6.283); c.fill();
  c.fillStyle = r.c; c.fillRect(-10, -5, 15, 8);
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.arc(-3, -5, 7, Math.PI, 0); c.fill();
  c.fillStyle = '#f2e6b8'; c.fillRect(7, -3, 5, 2);
  c.restore();
}
let groundPat = null;
function groundPattern(){
  if (groundPat) return groundPat;
  const S = 256, t = document.createElement('canvas'); t.width = t.height = S;
  const g = t.getContext('2d'), rng = mulberry(1952);
  g.fillStyle = '#e8dfc4'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 520; i++){
    const x = rng() * S, y = rng() * S, r = 0.8 + rng() * 2.2, k = rng();
    g.fillStyle = k < 0.45 ? 'rgba(150,132,96,.16)' : k < 0.8 ? 'rgba(255,250,232,.30)' : 'rgba(120,150,90,.14)';
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    if (x < 4 || y < 4 || x > S - 4 || y > S - 4){ const wx = (x + S / 2) % S, wy = (y + S / 2) % S; g.beginPath(); g.arc(wx, wy, r, 0, 6.283); g.fill(); }   // a few extra specks hide the tile seams
  }
  groundPat = ctx.createPattern(t, 'repeat');
  return groundPat;
}
function drawTree(c, t, dark){
  c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(t.x + t.r * 0.3, t.y + t.r * 0.75, t.r * 0.95, t.r * 0.4, 0, 0, 6.283); c.fill();
  c.fillStyle = '#6b4a2a'; c.fillRect(t.x - 1.8, t.y, 3.6, t.r * 0.8);
  const g = dark ? [38, 92, 52] : [58 + t.c * 30, 130 + t.c * 30, 66];
  c.fillStyle = 'rgb(' + Math.round(g[0] * 0.78) + ',' + Math.round(g[1] * 0.78) + ',' + Math.round(g[2] * 0.78) + ')'; c.beginPath(); c.arc(t.x, t.y - t.r * 0.2, t.r, 0, 6.283); c.fill();
  c.fillStyle = 'rgb(' + Math.round(g[0]) + ',' + Math.round(g[1]) + ',' + Math.round(g[2]) + ')'; c.beginPath(); c.arc(t.x - t.r * 0.15, t.y - t.r * 0.45, t.r * 0.78, 0, 6.283); c.fill();
}


// ---------- police barricades: yellow-and-black barriers with officers on duty ----------
let barSprite = null;
function barricadeSprite(){
  if (barSprite) return barSprite;
  const W = 96, H = 30, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(4, 10, W - 8, 18);
  g.fillStyle = '#2a2a2a'; g.fillRect(8, 2, 8, 24); g.fillRect(W - 16, 2, 8, 24);   // legs
  g.save(); g.beginPath(); g.rect(2, 6, W - 4, 16); g.clip();
  g.fillStyle = '#f7c600'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#161616'; for (let x = -20; x < W + 20; x += 24){ g.beginPath(); g.moveTo(x, 6); g.lineTo(x + 12, 6); g.lineTo(x - 2, 22); g.lineTo(x - 14, 22); g.closePath(); g.fill(); }
  g.restore();
  g.strokeStyle = '#161616'; g.lineWidth = 2; g.strokeRect(2, 6, W - 4, 16);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(3, 7, W - 6, 3);
  return barSprite = c;
}
function drawBar(c, x, y, ang, alpha){
  c.save(); c.globalAlpha = alpha; c.translate(x, y); c.rotate(ang); c.drawImage(barricadeSprite(), -26, -8.5, 52, 17); c.restore();
}
// barrier line between the checkpoints, built once per game
function cordonUnits(){
  if (gates._cord) return gates._cord;
  const out = [];
  RINGS.forEach((r, i) => {
    const n = Math.floor(6.283 * r / 50), gs = gates.filter(g => g.ring === i);
    for (let k = 0; k < n; k++){
      const a = k * 6.283 / n;
      if (gs.some(g => Math.abs(wrap(a - g.ang)) * r < GATE_HALF + 26)) continue;   // the checkpoint fills this stretch
      const p = polar(a, r); out.push({x: p.x, y: p.y, ang: a + Math.PI / 2});
    }
  });
  return gates._cord = out;
}
// officers standing at a checkpoint: a row behind the barriers and one on each flank; they step aside as it opens
function gatePolice(g, gi){
  const rx = Math.cos(g.ang), ry = Math.sin(g.ang), tx = -ry, ty = rx, out = [];
  const spots = [[-70, -42], [-35, -46], [0, -42], [35, -46], [70, -42], [-124, 6], [124, 6]];
  spots.forEach((s, k) => {
    const along = s[0] + Math.sign(s[0]) * g.open * 70;
    out.push({x: g.x + tx * along + rx * s[1], y: g.y + ty * along + ry * s[1], skin: SKINS[(gi + k) % SKINS.length]});
  });
  return out;
}
function drawBarricades(c, v){
  for (const u of cordonUnits()) if (v(u)) drawBar(c, u.x, u.y, u.ang, 1);
  gates.forEach(g => {
    if (!v(g)) return;
    const rx = Math.cos(g.ang), ry = Math.sin(g.ang), tx = -ry, ty = rx, a = 1 - g.open * 0.85, ang = g.ang + Math.PI / 2;
    for (const o of [-75, -25, 25, 75]) drawBar(c, g.x + tx * o, g.y + ty * o, ang, a);
    for (const o of [-50, 0, 50]) drawBar(c, g.x + tx * o - rx * 18, g.y + ty * o - ry * 18, ang, a);
    const lp = polar(g.ang, g.r + 72);
    label(c, g.open >= 1 ? 'OPEN' : 'POLICE BARRICADE: ' + g.need + ' people', lp.x, lp.y, 'bold ' + Math.round(14 / Z) + 'px system-ui', '#111');
  });
}
function minarMark(c, x, y){   // blinking red star on the small map
  const on = Math.floor(performance.now() / 400) % 2 === 0;
  c.save();
  if (on){ c.fillStyle = 'rgba(255,40,40,.4)'; c.beginPath(); c.arc(x, y, 11, 0, 6.283); c.fill(); }
  c.globalAlpha = on ? 1 : 0.2; c.fillStyle = '#e8102e'; c.strokeStyle = '#fff'; c.lineWidth = 1.2;
  starPath(c, x, y, 8); c.fill(); c.stroke();
  c.restore();
}
function miniDot(c, x, y, r, fill, edge){   // round dot for people on the small map
  c.fillStyle = fill; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
  if (edge){ c.strokeStyle = edge; c.lineWidth = 1.2; c.stroke(); }
}

// ---------- draw ----------
function draw(){
  const target = game.mode === 'arrest' && game.van && game.arrest.phase > 0 ? game.van : player;
  cam.x = target.x - vw / (2 * Z); cam.y = target.y - vh / (2 * Z);
  const VWZ = vw / Z, VHZ = vh / Z, zf = 1 / Z;
  const v = o => o.x > cam.x - 100 && o.x < cam.x + VWZ + 100 && o.y > cam.y - 100 && o.y < cam.y + VHZ + 100;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#17402a'; ctx.fillRect(0, 0, vw, vh);
  ctx.save(); ctx.scale(Z, Z); ctx.translate(-cam.x, -cam.y);
  ctx.beginPath(); ctx.arc(0, 0, MAP_R, 0, 6.283); ctx.fillStyle = groundPattern(); ctx.fill();
  ctx.save(); ctx.clip();
  for (const p of TOWN.patches) if (v(p)){ ctx.fillStyle = 'rgba(120,160,90,.13)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, p.rot, 0, 6.283); ctx.fill(); }   // soft grass patches under the roads

  ctx.strokeStyle = '#c9c3ae'; ctx.lineWidth = 54;
  for (let k = 0; k < 8; k++){ const p = polar(k * Math.PI / 4, MAP_R); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(p.x, p.y); ctx.stroke(); }
  ctx.lineWidth = 64; for (const r of RINGS.concat([MAP_R - 60])){ ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke(); }
  ctx.strokeStyle = '#8ec3e6'; ctx.lineWidth = 90; ctx.lineJoin = 'round'; ctx.beginPath();
  RIVER.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  label(ctx, 'Buriganga', -600, 1330, 'italic 16px system-ui', '#4b7ea3');
  ctx.fillStyle = '#8ec3e6'; ctx.beginPath(); ctx.ellipse(130, -380, 110, 50, -0.5, 0, 6.28); ctx.fill();

  for (const t of TOWN.trees) if (v(t)) drawTree(ctx, t, false);
  for (const r of TOWN.rickshaws) if (v(r)) drawRickshaw(ctx, r);
  for (const l of TOWN.lamps) if (v(l)) drawLamp(ctx, l);

  // houses
  for (const h of TOWN.houses) if (h.x > cam.x - 80 && h.x < cam.x + VWZ + 80 && h.y > cam.y - 80 && h.y < cam.y + VHZ + 80){
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(h.x + 3, h.y + 3, h.w, h.h);
    ctx.fillStyle = h.c; ctx.fillRect(h.x, h.y, h.w, h.h);
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(h.x + 4, h.y + 8, h.w - 8, h.h - 13);   // lighter roof panel
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(h.x, h.y, h.w, 5);
  }
  for (const l of LANDMARKS) label(ctx, l.name, l.x, l.y, '600 14px system-ui', 'rgba(40,40,40,.65)');
  for (const m of TOWN.mosques) if (v(m)) drawMosque(ctx, m);
  for (const s of TOWN.coffee) if (v(s)) drawCoffee(ctx, s);
  for (const s of TOWN.temples) if (v(s)) drawTemple(ctx, s);
  for (const s of TOWN.monasteries) if (v(s)) drawMonastery(ctx, s);
  for (const s of TOWN.churches) if (v(s)) drawChurch(ctx, s);
  for (const h of HOSPITALS) if (v(h)) drawHospital(ctx, h);
  for (const s of STATIONS.concat([AYNAGHOR])){
    const ay = s === AYNAGHOR;
    ctx.fillStyle = ay ? '#3a2a2a' : '#2f6fd0'; ctx.fillRect(s.x - 14, s.y - 10, 28, 20);
    ctx.fillStyle = '#fff'; ctx.fillRect(s.x - 4, s.y - 2, 8, 12);
    label(ctx, s.name, s.x, s.y - 16, 'bold 12px system-ui', ay ? '#7a1a1a' : '#12306b');
  }
  if (role !== 'police' && game.detainees){
    const tgt = nearestHeld(player);
    if (tgt){ ctx.save(); ctx.strokeStyle = 'rgba(255,140,0,.75)'; ctx.lineWidth = 5; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(tgt.x, tgt.y); ctx.stroke(); ctx.restore(); }
    for (const stn of STATIONS){
      const n = heldAt(stn).length; if (!n) continue;
      const R = game.rescue[stn.name] || {p: 0};
      ctx.save(); ctx.strokeStyle = 'rgba(255,140,0,.8)'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(stn.x, stn.y, RESCUE_R, 0, 6.28); ctx.stroke(); ctx.setLineDash([]);
      if (R.p > 0){ ctx.lineWidth = 8; ctx.strokeStyle = '#4caf50'; ctx.beginPath(); ctx.arc(stn.x, stn.y, RESCUE_R, -Math.PI / 2, -Math.PI / 2 + 6.283 * R.p / RESCUE_TIME); ctx.stroke(); }
      ctx.fillStyle = '#ff8c00'; ctx.beginPath(); ctx.arc(stn.x + 24, stn.y - 22, 13, 0, 6.28); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center'; ctx.fillText(String(n), stn.x + 24, stn.y - 17);
      label(ctx, n + ' held · bring ' + RESCUE_NEED + ' people', stn.x, stn.y + 34, 'bold 12px system-ui', '#b35900');
      ctx.restore();
    }
  }
  for (const s of shutdowns){
    ctx.fillStyle = 'rgba(60,60,90,.28)'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#334'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'INTERNET SHUTDOWN', s.x, s.y, 'bold 16px system-ui', '#334');
  }
  for (const s of stalls) if (v(s)) drawBiriyani(ctx, s);
  for (const t of teas) if (v(t)) drawTea(ctx, t);
  ctx.restore();
  // the edge of the city: a forest and a low boundary, instead of a flat dark void
  for (const t of TOWN.forest) if (v(t)) drawTree(ctx, t, true);
  ctx.beginPath(); ctx.arc(0, 0, MAP_R, 0, 6.283); ctx.strokeStyle = 'rgba(30,70,40,.85)'; ctx.lineWidth = 34; ctx.stroke();

  // goal
  ctx.fillStyle = 'rgba(11,107,58,.18)'; ctx.beginPath(); ctx.arc(0, 0, GOAL.r, 0, 6.28); ctx.fill();
  ctx.strokeStyle = '#0b6b3a'; ctx.lineWidth = 4; ctx.stroke();
  drawMonument(ctx);
  label(ctx, 'কেন্দ্রীয় শহীদ মিনার', 0, -GOAL.r - 12, 'bold ' + Math.round(20 * zf) + 'px ' + BN_FONT, '#0b6b3a');

  drawBarricades(ctx, v);

  // people (depth-sorted)
  const list = [];
  gates.forEach((g, gi) => { if (v(g)) for (const p of gatePolice(g, gi)) list.push([p.y, () => person(ctx, p.x, p.y, {dress: BLUE, skin: p.skin, hat: 'cap', legs: '#14284f', scale: 1.3, moving: false, stick: true, swing: 0})]); });
  for (const n of neutrals) if (v(n)) list.push([n.y, () => person(ctx, n.x, n.y, {dress: n.dress, skin: n.skin, look: n.look, moving: Math.abs(n.vx) + Math.abs(n.vy) > 4})]);
  followers.forEach((f, i) => { if (v(f)) list.push([f.y, () => role === 'police'
    ? person(ctx, f.x, f.y, {dress: BLUE, skin: f.skin, hat: 'cap', legs: '#14284f', scale: 1.3, moving: player.moving, stick: true, swing: (f.swing || 0) / 0.35})
    : person(ctx, f.x, f.y, {dress: WHITE, skin: f.skin, look: lookOf(f), moving: player.moving, flag: i % 6 === 0, hat: i % 4 === 0 ? 'band' : null})]); });
  for (const r of marchers){   // AI protester crowds (police side)
    r.members.forEach((m, i) => { if (v(m)) list.push([m.y, () => person(ctx, m.x, m.y, {dress: WHITE, skin: m.skin, look: lookOf(m), moving: r.moving, flag: i % 6 === 0, hat: i % 4 === 0 ? 'band' : null})]); });
    list.push([r.y, () => { person(ctx, r.x, r.y, {dress: WHITE, skin: SKINS[1], hat: 'band', scale: 1.25, moving: r.moving, flag: true}); label(ctx, 'CROWD ' + (r.members.length + 1), r.x, r.y - 36, 'bold 11px system-ui', '#0b6b3a'); }]);
  }
  for (const r of rivals){
    r.members.forEach(m => { if (v(m)) list.push([m.y, () => person(ctx, m.x, m.y, {dress: BLACK, skin: m.skin, look: lookOf(m), hat: 'helmet', moving: r.moving})]); });
    list.push([r.y, () => { person(ctx, r.x, r.y, {dress: BLACK, skin: SKINS[1], hat: 'helmet', scale: 1.25, moving: r.moving}); label(ctx, (r.armed ? 'ARMED ' : 'RIVAL ') + (r.members.length + 1), r.x, r.y - 34, 'bold 11px system-ui', r.armed ? '#c8102e' : '#111');
    if (r.armed){ ctx.strokeStyle = r.aim > 0 ? '#ff1744' : 'rgba(200,16,46,.6)'; ctx.lineWidth = r.aim > 0 ? 4 : 2; ctx.beginPath(); ctx.arc(r.x, r.y, 34, 0, 6.28); ctx.stroke(); if (r.aim > 0) label(ctx, '!', r.x, r.y - 52, 'bold 22px system-ui', '#ff1744'); } }]);
  }
  if (!player.hidden) list.push([player.y, () => {
    if (role === 'police') person(ctx, player.x, player.y, {dress: BLUE, skin: player.skin, hat: 'cap', legs: '#14284f', scale: 1.4, moving: player.moving, stick: true, swing: player.swing / 0.35});
    else person(ctx, player.x, player.y, {dress: WHITE, skin: player.skin, hat: 'band', scale: 1.35, moving: player.moving, flag: true});
    // name tag above the head so you can find yourself
    ctx.save(); ctx.translate(player.x, player.y - 46); ctx.scale(zf, zf);   // keeps the tag readable when zoomed out
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
  if (role === 'police'){   // smoke clouds, the warning-shot cone and the strike ring
    for (const sm of smokes){
      const k = sm.t / sm.life, a = 0.5 * (1 - k * k);
      ctx.fillStyle = 'rgba(210,210,210,' + (a * 0.55) + ')'; ctx.beginPath(); ctx.arc(sm.x, sm.y, sm.r, 0, 6.28); ctx.fill();
      ctx.fillStyle = 'rgba(235,235,235,' + a + ')';
      for (let i = 0; i < 8; i++){ const an = i * 0.785 + sm.t * 0.35, rr = sm.r * (0.5 + 0.12 * Math.sin(sm.t * 2 + i)); ctx.beginPath(); ctx.arc(sm.x + Math.cos(an) * rr * 0.8, sm.y + Math.sin(an) * rr * 0.8, sm.r * 0.34, 0, 6.28); ctx.fill(); }
    }
    if (game.cone){ const c = game.cone, a = 0.35 * (1 - c.t / 0.2); ctx.fillStyle = 'rgba(255,230,120,' + a + ')'; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.arc(c.x, c.y, 300, c.ang - 0.5, c.ang + 0.5); ctx.closePath(); ctx.fill(); }
    if (game.hit){ const h = game.hit, k = h.t / 0.25; ctx.strokeStyle = 'rgba(255,255,255,' + (0.8 * (1 - k)) + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(h.x, h.y, HIT_BASE * (0.5 + k * 0.6), 0, 6.28); ctx.stroke(); }
  }
  for (const e of fx){   // gunshot flashes and grenade blasts (smoke and light, nothing graphic)
    if (e.kind === 'shot'){
      const a = 1 - e.t / 0.3; ctx.globalAlpha = a; ctx.fillStyle = '#fff6b0'; ctx.beginPath();
      for (let k = 0; k < 8; k++){ const ang = k * Math.PI / 4, rr = k % 2 ? 7 : 16; ctx.lineTo(e.x + Math.cos(ang) * rr, e.y + Math.sin(ang) * rr); }
      ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    } else if (e.kind === 'join'){   // a ring and a few sparks where someone joins
      const k = e.t / 0.55; ctx.globalAlpha = Math.max(0, 1 - k); ctx.strokeStyle = role === 'police' ? '#7fb2ff' : '#7fe3a4'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(e.x, e.y, 6 + k * 24, 0, 6.283); ctx.stroke(); ctx.fillStyle = '#fff';
      for (let q = 0; q < 5; q++){ const an = q * 1.2566 + 0.5, rr = 8 + k * 22; ctx.beginPath(); ctx.arc(e.x + Math.cos(an) * rr, e.y + Math.sin(an) * rr - k * 6, 2, 0, 6.283); ctx.fill(); }
      ctx.globalAlpha = 1;
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
    const bx = b.who.x, by = b.who.y - 46 - (b.who === player ? 36 * zf : 0);
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

function drawHUDPolice(){
  const k = Math.max(0.6, Math.min(1, innerWidth / 760, innerHeight / 540)), vw = innerWidth / k, vh = innerHeight / k, G = game, st = G.stats;
  const barY = vw < 800 ? Math.round(vh * 0.62) : 20;
  ctx.save(); ctx.scale(k, k); ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(0,0,0,.68)'; ctx.fillRect(10, 10, 300, 58);
  ctx.fillStyle = '#ffd54f'; ctx.font = 'bold 34px system-ui'; ctx.fillText('Day ' + G.day, 22, 52);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 17px system-ui'; ctx.textAlign = 'right'; ctx.fillText('Dispersed ' + st.dispersed + '/' + DISPERSE_GOAL, 300, 49); ctx.textAlign = 'left';
  const y0 = 78; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(10, y0, 240, IS_TOUCH ? 84 : 104);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 16px system-ui'; ctx.fillText('Squad: ' + (followers.length + 1), 20, y0 + 22);
  ctx.font = '12px system-ui'; ctx.fillText('Anger', 20, y0 + 44);
  ctx.fillStyle = '#444'; ctx.fillRect(70, y0 + 35, 170, 10);
  ctx.fillStyle = G.anger > 70 ? '#e53935' : G.anger > 40 ? '#ffb300' : '#4caf50'; ctx.fillRect(70, y0 + 35, 1.7 * G.anger, 10);
  ctx.fillStyle = '#fff'; ctx.fillText('Smoke ' + G.smoke + '/3     Rounds ' + G.gun + '/6', 20, y0 + 68);
  if (!IS_TOUCH){ ctx.fillStyle = '#cfd8dc'; ctx.fillText('Click/Space strike · G smoke · F fire', 20, y0 + 92); }
  // map top right, arrow to the nearest crowd under it
  const mr = 76, mx = vw - mr - 12, my = 12 + mr, ay = my + mr + 34, s = mr / MAP_R;
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.28); ctx.fill();
  ctx.strokeStyle = '#888'; ctx.lineWidth = 1; for (const r of RINGS){ ctx.beginPath(); ctx.arc(mx, my, r * s, 0, 6.28); ctx.stroke(); }
  for (const p of patrols) miniDot(ctx, mx + p.x * s, my + p.y * s, 3, '#4a8bff', '#fff');
  for (const r of marchers) miniDot(ctx, mx + r.x * s, my + r.y * s, 4 + Math.min(4, r.members.length / 6), '#fff', '#e53935');
  miniDot(ctx, mx + player.x * s, my + player.y * s, 5, '#4fc3f7', '#fff');
  minarMark(ctx, mx, my);
  const near = marchers.reduce((b, r) => !b || dist(r, player) < dist(b, player) ? r : b, null);
  if (near){
    const a = Math.atan2(near.y - player.y, near.x - player.x);
    ctx.save(); ctx.translate(mx, ay); ctx.rotate(a); ctx.fillStyle = '#c8102e'; ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(-12, -14); ctx.lineTo(-6, 0); ctx.lineTo(-12, 14); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '11px system-ui'; ctx.fillText((dist(player, near) / 190).toFixed(1) + ' km · ' + (near.members.length + 1) + ' people', mx, ay + 34);
  }
  ctx.textAlign = 'center';
  if (G.hold > 0){
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(vw / 2 - 150, barY, 300, 26);
    ctx.fillStyle = '#e53935'; ctx.fillRect(vw / 2 - 150, barY, 300 * G.hold / NEED_HOLD, 26);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.fillText('A CROWD IS HOLDING THE MINAR', vw / 2, barY + 18);
  }
  if (G.msgT > 0){
    let mf = 17; ctx.font = 'bold ' + mf + 'px ' + BN_FONT;
    while (textW(ctx, G.msg) + 30 > vw - 16 && mf > 11){ mf -= 1; ctx.font = 'bold ' + mf + 'px ' + BN_FONT; }
    const w = textW(ctx, G.msg) + 30, my0 = IS_TOUCH ? Math.round(vh * 0.72) : vh - 110;
    ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fillRect(vw / 2 - w / 2, my0, w, 34);
    ctx.fillStyle = '#fff'; ctx.fillText(G.msg, vw / 2, my0 + 23);
  }
  ctx.restore();
}

function drawHUD(){
  if (role === 'police'){ drawHUDPolice(); return; }
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

  const mr = 96, mx = vw - mr - 12, my = 12 + mr, ay = my + mr + 34, s = mr / MAP_R;   // map top right, red arrow under it
  if (!inShutdown()){
    const a = Math.atan2(GOAL.y - player.y, GOAL.x - player.x);
    ctx.save(); ctx.translate(mx, ay); ctx.rotate(a);
    ctx.fillStyle = '#c8102e'; ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(-12, -14); ctx.lineTo(-6, 0); ctx.lineTo(-12, 14); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.font = 'bold 12px system-ui'; ctx.fillText((dist(player, GOAL) / 190).toFixed(1) + ' km', mx, ay + 34);
    if (player.injured){
      const h = nearestHospital(player), ha = Math.atan2(h.y - player.y, h.x - player.x);
      ctx.save(); ctx.translate(mx, ay + 78); ctx.rotate(ha);
      ctx.fillStyle = '#2e9e5b'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-10, -11); ctx.lineTo(-5, 0); ctx.lineTo(-10, 11); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#111'; ctx.font = 'bold 12px system-ui'; ctx.fillText('Hospital ' + (dist(player, h) / 190).toFixed(1) + ' km', mx, ay + 106);
    }
    const hs = nearestHeld(player);
    if (hs){
      const oy = ay + (player.injured ? 150 : 78), ha2 = Math.atan2(hs.y - player.y, hs.x - player.x);
      ctx.save(); ctx.translate(mx, oy); ctx.rotate(ha2);
      ctx.fillStyle = '#ff8c00'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-10, -11); ctx.lineTo(-5, 0); ctx.lineTo(-10, 11); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#111'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.fillText(hs.name.replace(' Thana', '') + ' ' + (dist(player, hs) / 190).toFixed(1) + ' km', mx, oy + 28);
    }
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#888'; ctx.lineWidth = 1; for (const r of RINGS){ ctx.beginPath(); ctx.arc(mx, my, r * s, 0, 6.28); ctx.stroke(); }
    for (const h of HOSPITALS) miniDot(ctx, mx + h.x * s, my + h.y * s, 3, '#ff5252', '#fff');
    for (const p of patrols) miniDot(ctx, mx + p.x * s, my + p.y * s, 3.2, '#4a8bff', '#fff');
    ctx.fillStyle = '#ff8c00'; for (const stn of STATIONS) if (heldAt(stn).length){ ctx.beginPath(); ctx.arc(mx + stn.x * s, my + stn.y * s, 4, 0, 6.28); ctx.fill(); }
    for (const r of rivals) miniDot(ctx, mx + r.x * s, my + r.y * s, 4, '#000', '#fff');
    ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.arc(mx + player.x * s, my + player.y * s, 6 + Math.min(8, Math.sqrt(followers.length)), 0, 6.283); ctx.fill();   // your crowd
    miniDot(ctx, mx + player.x * s, my + player.y * s, 5, '#fff', '#0b6b3a');
    minarMark(ctx, mx, my);
  } else { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.28); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 12px system-ui'; ctx.fillText('NO SIGNAL', mx, my + 4); }

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
    person(ctx, x + 50, y + 62, {dress: WHITE, skin: t.skin, scale: 2.2, noBase: true});
    const rel = t.kind === 'released';
    ctx.fillStyle = rel ? '#1b8a3e' : '#c8102e'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.fillText(rel ? 'RELEASED' : 'DETAINED', x + 50, y + 88);
    ctx.fillStyle = '#222'; ctx.font = '11px ' + BN_FONT; ctx.fillText(rel ? t.count + ' freed · ' + t.station.replace(' Thana', '') : t.name + ' · ' + t.station.replace(' Thana', ''), x + 50, y + 102);
    if (rel){ ctx.strokeStyle = '#1b8a3e'; ctx.lineWidth = 5; ctx.strokeRect(x + 2.5, y + 2.5, 95, 103); ctx.fillStyle = 'rgba(27,138,62,.18)'; ctx.fillRect(x + 6, y + 6, 88, 66); }
    ctx.restore();
  });
  if (game.flash > 0){ ctx.fillStyle = 'rgba(200,0,0,' + (game.flash * 0.9) + ')'; ctx.fillRect(0, 0, vw, vh); }
  ctx.restore();
}

