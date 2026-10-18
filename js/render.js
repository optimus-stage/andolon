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
  followers.forEach((f, i) => { if (v(f)) list.push([f.y, () => role === 'police'
    ? person(ctx, f.x, f.y, {dress: BLUE, skin: f.skin, hat: 'cap', legs: '#14284f', scale: 1.3, moving: player.moving, stick: true, swing: (f.swing || 0) / 0.35})
    : person(ctx, f.x, f.y, {dress: WHITE, skin: f.skin, moving: player.moving, flag: i % 6 === 0, hat: i % 4 === 0 ? 'band' : null})]); });
  for (const r of marchers){   // AI protester crowds (police side)
    r.members.forEach((m, i) => { if (v(m)) list.push([m.y, () => person(ctx, m.x, m.y, {dress: WHITE, skin: m.skin, moving: r.moving, flag: i % 6 === 0, hat: i % 4 === 0 ? 'band' : null})]); });
    list.push([r.y, () => { person(ctx, r.x, r.y, {dress: WHITE, skin: SKINS[1], hat: 'band', scale: 1.25, moving: r.moving, flag: true}); label(ctx, 'CROWD ' + (r.members.length + 1), r.x, r.y - 30, 'bold 11px system-ui', '#0b6b3a'); }]);
  }
  for (const r of rivals){
    r.members.forEach(m => { if (v(m)) list.push([m.y, () => person(ctx, m.x, m.y, {dress: BLACK, skin: m.skin, hat: 'helmet', moving: r.moving})]); });
    list.push([r.y, () => { person(ctx, r.x, r.y, {dress: BLACK, skin: SKINS[1], hat: 'helmet', scale: 1.25, moving: r.moving}); label(ctx, (r.armed ? 'ARMED ' : 'RIVAL ') + (r.members.length + 1), r.x, r.y - 28, 'bold 11px system-ui', r.armed ? '#c8102e' : '#111');
    if (r.armed){ ctx.strokeStyle = r.aim > 0 ? '#ff1744' : 'rgba(200,16,46,.6)'; ctx.lineWidth = r.aim > 0 ? 4 : 2; ctx.beginPath(); ctx.arc(r.x, r.y, 34, 0, 6.28); ctx.stroke(); if (r.aim > 0) label(ctx, '!', r.x, r.y - 46, 'bold 22px system-ui', '#ff1744'); } }]);
  }
  if (!player.hidden) list.push([player.y, () => {
    if (role === 'police') person(ctx, player.x, player.y, {dress: BLUE, skin: player.skin, hat: 'cap', legs: '#14284f', scale: 1.4, moving: player.moving, stick: true, swing: player.swing / 0.35});
    else person(ctx, player.x, player.y, {dress: WHITE, skin: player.skin, hat: 'band', scale: 1.35, moving: player.moving, flag: true});
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
  const mr = 62, mx = vw - mr - 12, my = 12 + mr, ay = my + mr + 34, s = mr / MAP_R;
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.28); ctx.fill();
  ctx.strokeStyle = '#888'; ctx.lineWidth = 1; for (const r of RINGS){ ctx.beginPath(); ctx.arc(mx, my, r * s, 0, 6.28); ctx.stroke(); }
  ctx.fillStyle = '#4caf50'; ctx.fillRect(mx - 3, my - 3, 6, 6);
  ctx.fillStyle = '#4a8bff'; for (const p of patrols) ctx.fillRect(mx + p.x * s - 1, my + p.y * s - 1, 3, 3);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#e53935'; for (const r of marchers){ const q = 3 + Math.min(4, r.members.length / 6); ctx.fillRect(mx + r.x * s - q / 2, my + r.y * s - q / 2, q, q); ctx.strokeRect(mx + r.x * s - q / 2, my + r.y * s - q / 2, q, q); }
  ctx.fillStyle = '#4fc3f7'; ctx.fillRect(mx + player.x * s - 2, my + player.y * s - 2, 5, 5);
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

  const mr = 80, mx = vw - mr - 12, my = 12 + mr, ay = my + mr + 34, s = mr / MAP_R;   // map top right, red arrow under it
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
    ctx.fillStyle = '#4caf50'; ctx.fillRect(mx - 3, my - 3, 6, 6);
    ctx.fillStyle = '#ff5252'; for (const h of HOSPITALS) ctx.fillRect(mx + h.x * s - 2, my + h.y * s - 2, 4, 4);
    ctx.fillStyle = '#4a8bff'; for (const p of patrols) ctx.fillRect(mx + p.x * s - 1, my + p.y * s - 1, 3, 3);
    ctx.fillStyle = '#ff8c00'; for (const stn of STATIONS) if (heldAt(stn).length){ ctx.beginPath(); ctx.arc(mx + stn.x * s, my + stn.y * s, 4, 0, 6.28); ctx.fill(); }
    ctx.fillStyle = '#000'; ctx.strokeStyle = '#fff'; for (const r of rivals){ ctx.fillRect(mx + r.x * s - 2, my + r.y * s - 2, 5, 5); ctx.strokeRect(mx + r.x * s - 2, my + r.y * s - 2, 5, 5); }
    ctx.fillStyle = '#fff'; ctx.fillRect(mx + player.x * s - 2, my + player.y * s - 2, 5, 5);
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
    person(ctx, x + 50, y + 62, {dress: WHITE, skin: t.skin, scale: 2.2});
    const rel = t.kind === 'released';
    ctx.fillStyle = rel ? '#1b8a3e' : '#c8102e'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.fillText(rel ? 'RELEASED' : 'DETAINED', x + 50, y + 88);
    ctx.fillStyle = '#222'; ctx.font = '11px ' + BN_FONT; ctx.fillText(rel ? t.count + ' freed · ' + t.station.replace(' Thana', '') : t.name + ' · ' + t.station.replace(' Thana', ''), x + 50, y + 102);
    if (rel){ ctx.strokeStyle = '#1b8a3e'; ctx.lineWidth = 5; ctx.strokeRect(x + 2.5, y + 2.5, 95, 103); ctx.fillStyle = 'rgba(27,138,62,.18)'; ctx.fillRect(x + 6, y + 6, 88, 66); }
    ctx.restore();
  });
  if (game.flash > 0){ ctx.fillStyle = 'rgba(200,0,0,' + (game.flash * 0.9) + ')'; ctx.fillRect(0, 0, vw, vh); }
  ctx.restore();
}

