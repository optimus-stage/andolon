// ---------- police side: you lead the police, the protesters are AI ----------
const P_SPEED = 235, HIT_BASE = 70, SQUAD_MAX = 14;
function newPoliceGame(){
  gates = []; stalls = []; teas = []; shutdowns = []; bubbles = []; toasts = []; fx = []; smokes = []; marchers = []; rivals = [];
  RINGS.forEach((r, i) => {
    const n = GATES_PER_RING[i], base = rand(-Math.PI, Math.PI);
    for (let k = 0; k < n; k++){ const ang = base + k * 2 * Math.PI / n, p = polar(ang, r); gates.push({r, ring: i, ang, x: p.x, y: p.y, need: GATE_NEEDS[i], open: 0}); }
  });
  neutrals = []; followers = []; patrols = [];
  for (let z = 0; z < 4; z++){
    const r0 = ZR[z + 1] + 70, r1 = ZR[z] - 70;
    for (let i = 0; i < BYSTANDERS[z]; i++){ const p = spawnIn(Math.max(r0, 60), r1); neutrals.push(mkNeutral(p.x, p.y)); }
    for (let i = 0; i < 2; i++){ const p = spawnIn(Math.max(r0, 220), r1); stalls.push({x: p.x, y: p.y, r: 55}); }
    for (let i = 0; i < POLICE_PER_ZONE[z]; i++) patrols.push(mkPatrol(z));   // officers waiting to join you
  }
  player = {x: -57, y: -320, r: 12, morale: 100, injured: false, skin: pick(SKINS), moving: false, hidden: false, swing: 0, fx: 0, fy: 1, police: true};
  game = {t: 0, day: 1, hold: 0, started: true, mode: 'play', msg: '', msgT: 0, flash: 0, van: null, arrest: null, contested: false,
    anger: 0, lastForce: 0, smoke: 3, gun: 6, refSmoke: 18, refGun: 12, cdS: 0, cdG: 0, cdSm: 0, spawnT: 3, bystT: 4, reinT: 30, chantT: 6, cone: null, hit: null,
    stats: {dispersed: 0, squadPeak: 1, smokes: 0, shots: 0, strikes: 0}};
  for (let i = 0; i < 5; i++){ const p = spawnIn(2400, 2900); marchers.push(mkCrowd(p.x, p.y, 3, 10 + i * 3)); }
  say(IS_TOUCH ? 'Use STRIKE, SMOKE and FIRE. Walk into officers to recruit them.' : 'Click or Space: strike. G: smoke. F: fire. Walk into officers to recruit them.', 6);
}
function mkCrowd(x, y, n, delay){
  const c = {x, y, members: [], delay, moving: false, hp: 2, smokeT: 0, recT: 0, stun: 0, holdT: 0};
  for (let i = 0; i < n; i++) c.members.push({x: x + rand(-30, 30), y: y + rand(-30, 30), skin: pick(SKINS)});
  return c;
}
function addAnger(n){ game.anger = Math.min(100, game.anger + n); game.lastForce = 0; }
function scatter(r, k, ox, oy){   // members run away and stay out of the march for a while
  let c = 0;
  for (let i = 0; i < k && r.members.length; i++){
    const m = r.members.pop(), a = Math.atan2(m.y - oy, m.x - ox), nb = mkNeutral(m.x, m.y);
    nb.skin = m.skin; nb.cool = 9; nb.rcool = 14; nb.vx = Math.cos(a) * 90; nb.vy = Math.sin(a) * 90; nb.wt = 1.5; neutrals.push(nb); c++;
  }
  return c;
}
function disperse(r){
  if (r.dead) return; r.dead = true;
  const nb = mkNeutral(r.x, r.y); nb.cool = 9; nb.rcool = 14; nb.vx = rand(-90, 90); nb.vy = rand(-90, 90); nb.wt = 1.5; neutrals.push(nb);
  game.stats.dispersed++; sfxChime(); say('Crowd dispersed! ' + game.stats.dispersed + ' of ' + DISPERSE_GOAL, 2.5);
}
function canAct(){ return role === 'police' && game && game.started && game.mode === 'play'; }
function doStrike(){
  if (!canAct() || game.cdS > 0) return;
  game.cdS = 0.5; player.swing = 0.35; followers.forEach(f => f.swing = 0.35); sfxWhack(); game.hit = {x: player.x, y: player.y, t: 0}; game.stats.strikes++;
  let hit = false; const k = 2 + Math.floor(followers.length / 2);
  for (const r of marchers){
    if (r.dead) continue;
    if (dist(player, r) < HIT_BASE + Math.min(60, 11 * Math.sqrt(r.members.length))){
      hit = true;
      if (r.members.length) scatter(r, k, player.x, player.y); else { r.hp--; r.stun = 1; if (r.hp <= 0) disperse(r); }
    }
  }
  if (hit) addAnger(3);
}
function doSmoke(){
  if (!canAct() || game.cdSm > 0) return;
  if (game.smoke <= 0){ say('Out of smoke grenades. One comes back every few seconds.', 2); return; }
  game.cdSm = 1.2; game.smoke--; game.stats.smokes++; addAnger(10); sfxGrenade();
  smokes.push({x: player.x + player.fx * 90, y: player.y + player.fy * 90, t: 0, life: 5.5, r: 110 + Math.min(40, followers.length * 4)});
}
function doGun(){
  if (!canAct() || game.cdG > 0) return;
  if (game.gun <= 0){ say('Out of rounds. One comes back every few seconds.', 2); return; }
  game.cdG = 0.45; game.gun--; game.stats.shots++; addAnger(12); sfxGunshot();
  const ang = Math.atan2(player.fy, player.fx);
  addFx(player.x + player.fx * 26, player.y + player.fy * 26 - 10, 'shot');
  game.cone = {x: player.x, y: player.y, ang, t: 0};
  for (const r of marchers){   // warning shots scatter people; nobody is hurt
    if (r.dead) continue;
    const d = dist(player, r); if (d > 300) continue;
    const diff = Math.abs(wrap(Math.atan2(r.y - player.y, r.x - player.x) - ang));
    if (diff < 0.5 + (22 + 11 * Math.sqrt(r.members.length)) / Math.max(60, d)){
      if (r.members.length) scatter(r, 3 + Math.floor(followers.length / 4), player.x, player.y); else { r.hp--; r.stun = 2; if (r.hp <= 0) disperse(r); }
    }
  }
}
function doAction(id){ if (id === 'strike'){ input.strike = true; doStrike(); } else if (id === 'smoke') doSmoke(); else if (id === 'gun') doGun(); }
function crowdNeed(r){ const dr = Math.hypot(r.x, r.y), ri = RINGS.findIndex(rr => rr < dr - 20); return ri >= 0 ? GATE_NEEDS[ri] : NEED_CROWD; }
function spawnCrowd(){
  const z = Math.random() < 0.65 ? 0 : 1, p = spawnIn(ZR[z + 1] + 100, ZR[z] - 120);
  if (Math.hypot(p.x - player.x, p.y - player.y) < 700) return false;
  marchers.push(mkCrowd(p.x, p.y, 3, game.t + 8)); return true;
}
function updateCrowds(dt){
  const G = game;
  for (const r of marchers){
    if (r.dead) continue;
    r.moving = false; r.stun = Math.max(0, r.stun - dt);
    const smoke = smokes.find(s => dist(s, r) < s.r);
    if (smoke){
      r.smk = (r.smk || 0) - dt;
      if (r.smk <= 0 && r.members.length){ r.smk = 0.9; scatter(r, 1, smoke.x, smoke.y); }
      if (!r.members.length){ r.smokeT += dt; if (r.smokeT > 2.2){ disperse(r); continue; } }
    }
    const n = r.members.length, need = crowdNeed(r), z = zoneOf(r.x, r.y);
    let tgt = null, best = 1e9;
    if (n < Math.max(need, 6) && n < MARCH_MAX) for (const nb of neutrals){ const dd = dist(nb, r); if (nb.cool <= 0 && !(nb.rcool > 0) && dd < best && dd < 800 && zoneOf(nb.x, nb.y) === z){ best = dd; tgt = nb; } }
    if (!tgt && n < need && G.t > r.delay){   // nobody left to recruit nearby: join the nearest other crowd
      let o = null, bd = 1e9; for (const q of marchers) if (q !== r && !q.dead){ const dd = dist(q, r); if (dd < bd){ bd = dd; o = q; } }
      if (o) tgt = o;
    }
    if (!tgt && G.t > r.delay){
      const dr = Math.hypot(r.x, r.y), ri = RINGS.findIndex(rr => rr < dr - 20);
      if (ri >= 0){
        const g = gates.filter(g => g.ring === ri).sort((a, b) => dist(a, r) - dist(b, r))[0];
        tgt = g.open >= 1 ? polar(g.ang, g.r - 90) : polar(g.ang, g.r + 70);
      } else tgt = {x: 0, y: 0};
    }
    if (tgt && r.stun <= 0){
      const tdx = tgt.x - r.x, tdy = tgt.y - r.y, td = Math.hypot(tdx, tdy);
      if (td > 6){ const sp = Math.max(38, 82 - n * 1.2) * (smoke ? 0.35 : 1); r.x += tdx / td * sp * dt; r.y += tdy / td * sp * dt; r.moving = true; }
    }
    collide(r, 12);
    followRing(r.members, r, dt);
    // recruiting: quicker when public anger is high
    r.recT -= dt;
    if (r.recT <= 0 && r.members.length < MARCH_MAX){
      const rr = 24 + G.anger * 0.25, ri2 = neutrals.findIndex(nb => nb.cool <= 0 && !(nb.rcool > 0) && dist(nb, r) < rr);
      if (ri2 >= 0){ const nb = neutrals.splice(ri2, 1)[0]; r.members.push({x: nb.x, y: nb.y, skin: nb.skin}); r.recT = 1.1 / (1 + G.anger / 50); }
    }
    // two crowds that meet join up
    for (const q of marchers){
      if (q === r || q.dead || r.dead) continue;
      if (dist(q, r) < 45 && (r.members.length > q.members.length || (r.members.length === q.members.length && marchers.indexOf(r) < marchers.indexOf(q)))){
        r.members.push(...q.members.slice(0, Math.max(0, MARCH_MAX - r.members.length)), {x: q.x, y: q.y, skin: SKINS[0]}); q.dead = true;
      }
    }
    for (const g of gates) if (g.open < 1 && dist(r, g) < 130 && r.members.length >= g.need) g.open = Math.min(1, g.open + dt / 3);
    if (dist(r, GOAL) < GOAL.r && r.members.length + 1 >= NEED_CROWD) r.holdT += dt; else r.holdT = Math.max(0, r.holdT - dt);
  }
  marchers = marchers.filter(r => !r.dead);
  G.hold = marchers.reduce((m, r) => Math.max(m, r.holdT), 0);
}
function updatePolice(dt){
  const G = game; if (!G.started) return;
  G.t += dt; G.msgT -= dt; G.flash = Math.max(0, G.flash - dt); G.day = 1 + Math.floor(G.t / DAY_SECONDS);
  for (let i = fx.length - 1; i >= 0; i--){ fx[i].t += dt; if (fx[i].t > (fx[i].kind === 'boom' ? 1.1 : fx[i].kind === 'dust' ? 0.9 : 0.3)) fx.splice(i, 1); }
  for (let i = smokes.length - 1; i >= 0; i--){ smokes[i].t += dt; if (smokes[i].t > smokes[i].life) smokes.splice(i, 1); }
  if (G.cone){ G.cone.t += dt; if (G.cone.t > 0.2) G.cone = null; }
  if (G.hit){ G.hit.t += dt; if (G.hit.t > 0.25) G.hit = null; }
  updateBubbles(dt);
  player.swing = Math.max(0, player.swing - dt); followers.forEach(f => f.swing = Math.max(0, (f.swing || 0) - dt));
  G.cdS = Math.max(0, G.cdS - dt); G.cdG = Math.max(0, G.cdG - dt); G.cdSm = Math.max(0, G.cdSm - dt);
  if (G.smoke < 3){ G.refSmoke -= dt; if (G.refSmoke <= 0){ G.smoke++; G.refSmoke = 18; } }
  if (G.gun < 6){ G.refGun -= dt; if (G.refGun <= 0){ G.gun++; G.refGun = 12; } }
  G.lastForce += dt; if (G.lastForce > 3) G.anger = Math.max(0, G.anger - 1.4 * dt);
  if (G.anger >= 100){ endPolice(false, 'anger'); return; }

  // you: faster than any crowd
  if (pad.id !== null && (pad.ux || pad.uy)){ mouse.x = (player.x + pad.ux * 200 - cam.x) * Z; mouse.y = (player.y + pad.uy * 200 - cam.y) * Z; }
  const mw = {x: mouse.x / Z + cam.x, y: mouse.y / Z + cam.y}, dx = mw.x - player.x, dy = mw.y - player.y, d = Math.hypot(dx, dy);
  const speed = Math.max(170, P_SPEED - followers.length * 3);
  player.moving = d > 8;
  if (player.moving){ player.x += dx / d * speed * dt; player.y += dy / d * speed * dt; player.fx = dx / d; player.fy = dy / d; }
  collide(player, player.r);
  followRing(followers, player, dt);
  if (input.strike) doStrike();

  // bystanders wander; crowds recruit them
  for (const n of neutrals){
    n.cool -= dt; n.wt -= dt; n.rcool = Math.max(0, (n.rcool || 0) - dt);
    if (n.wt <= 0){ const a = rand(0, 6.28), sp = rand(0, 25); n.vx = Math.cos(a) * sp; n.vy = Math.sin(a) * sp; n.wt = rand(1, 3); }
    n.x += n.vx * dt; n.y += n.vy * dt; collide(n, 7);
  }
  G.bystT -= dt; if (G.bystT <= 0){ G.bystT = 4; spawnBystander(); }

  // officers waiting on the streets join your squad when you walk up to them
  for (let i = patrols.length - 1; i >= 0; i--){
    const p = patrols[i], ddx = p.tx - p.x, ddy = p.ty - p.y, dd = Math.hypot(ddx, ddy);
    if (dd < 10) pickWaypoint(p); else { p.x += ddx / dd * 40 * dt; p.y += ddy / dd * 40 * dt; }
    collide(p, 14);
    if (followers.length < SQUAD_MAX && dist(p, player) < 42){
      patrols.splice(i, 1); followers.push({x: p.x, y: p.y, skin: p.skin, swing: 0, police: true}); G.stats.squadPeak = Math.max(G.stats.squadPeak, followers.length + 1);
      sfxJoin(); say('An officer joins your squad (' + (followers.length + 1) + ')', 2);
    }
  }
  G.reinT -= dt; if (G.reinT <= 0){ G.reinT = 30; if (patrols.length < 6) patrols.push(mkPatrol(Math.floor(Math.random() * 4))); }

  // crowds
  updateCrowds(dt);
  G.spawnT -= dt; if (G.spawnT <= 0){ G.spawnT = Math.max(8, 18 - G.day * 0.3); if (marchers.length < 8) spawnCrowd(); }
  G.chantT -= dt;
  if (G.chantT <= 0){
    G.chantT = 5;
    const near = marchers.filter(r => dist(r, player) < 520 && r.members.length >= 2);
    if (near.length){ const r = pick(near), c = pick(CHANTS); bubble(r, c.call[0], c.call[1], 1.6); }
  }
  // gates: open for a big enough crowd, close again when nobody is there
  for (const g of gates){
    if (g.open >= 1) continue;
    if (!marchers.some(r => dist(r, g) < 130 && r.members.length >= g.need)) g.open = Math.max(0, g.open - dt * 0.5);
  }
  for (const g of gates) if (g.open >= 1 && !g.broken){ g.broken = true; if (dist(player, g) < 1200){ sfxWallBreak(); addFx(g.x, g.y, 'dust'); } }
  if (G.hold >= NEED_HOLD){ endPolice(false, 'held'); return; }
  if (G.stats.dispersed >= DISPERSE_GOAL) endPolice(true);
}
function policeScore(won, live){
  const st = game.stats; let sc = st.dispersed * 100 + st.squadPeak * 10;
  if (won) sc += 1000 + Math.max(0, Math.round((420 - game.t) * 3)) + Math.round((100 - game.anger) * 4);
  else if (!live) sc = Math.round(sc * 0.7);
  return Math.round(sc);
}
function endPolice(won, why){
  stopSiren(); game.started = false; input.strike = false;
  const st = game.stats, score = policeScore(won), rank = PRANKS.reduce((b, r) => score >= r.min ? r : b, PRANKS[0]);
  let tag;
  if (won) tag = game.anger < 25 ? PTAGS.calm : game.t < 260 ? PTAGS.swift : st.squadPeak >= 10 ? PTAGS.full : st.smokes >= 5 ? PTAGS.smoke : PTAGS.steady;
  else tag = why === 'anger' ? PTAGS.overreach : st.squadPeak < 5 ? PTAGS.outnumbered : PTAGS.slow;
  const nxt = PRANKS.find(r => r.min > score);
  const nextText = nxt ? ['NEXT: ' + nxt.metal.toUpperCase(), (nxt.min - score).toLocaleString('en-US') + ' pts'] : ['NEXT RANK', 'Maxed'];
  let best = 0, newBest = false; try { best = +localStorage.getItem('da_best_police') || 0; if (score > best){ newBest = best > 0; localStorage.setItem('da_best_police', String(score)); best = score; } } catch (e) {}
  const cardInfo = {role: 'police', tier: rank, name: playerName, skin: player.skin, score, rankBn: rank.bn, tagBn: tag.bn, tagDesc: tag.desc, day: game.day, best, newBest, nextText,
    stampLabel: won ? 'ORDER HELD' : why === 'anger' ? 'STOOD DOWN' : 'LINE BROKEN', stampSub: won ? 'SQUARE SECURED' : why === 'anger' ? 'TOO MUCH FORCE' : 'MINAR HELD',
    stampCol: won ? '#1f4e79' : '#a32d2d', dayText: 'Andolon · Day ' + game.day,
    row2Title: 'Crowds dispersed', row2Value: st.dispersed, row2Desc: 'Marches broken up before the Minar.', foot3: ['SQUAD PEAK', String(st.squadPeak)]};
  const build = () => renderCard(won ? 'win' : 'lose', Object.assign({photo: playerPhoto}, cardInfo));
  let canvas = build();
  const box = document.getElementById('card');
  const head = won ? '<h1>Order <span>restored!</span></h1><p>Your squad dispersed <b>' + st.dispersed + '</b> crowds by <b>Day ' + game.day + '</b>.</p>'
    : why === 'anger' ? '<h1>Stood <span>down</span></h1><p>Too much force: public anger reached its limit and you were pulled back.</p>'
    : '<h1>The Minar <span>was held</span></h1><p>A crowd held the Shaheed Minar. Break up marches sooner next time.</p>';
  box.innerHTML = head + '<img id="cardimg" alt="Photo card" src="' + canvas.toDataURL('image/png') + '">' +
    '<label>Put your own photo on the card (optional)<input id="photo2" type="file" accept="image/*"></label>' +
    '<button id="share">Share card</button><button id="dl" class="alt">' + (IS_TOUCH ? 'Save to Photos' : 'Download') + '</button><button id="go">Patrol again</button>' +
    (IS_TOUCH ? '<small>Tip: press and hold the card to save it to your Photos.</small><br>' : '') +
    (playerPhoto ? '<button id="nophoto" class="alt">Use default avatar</button>' : '') +
    supportHTML() + '<a href="#" class="aboutlink">About &amp; Disclaimer</a><br>' +
    '<small>Your photo stays on your device. It is only drawn onto this card. Fictional game; characters and events are not real people or incidents.</small>';
  const text = won ? 'I led the police squad in Andolon and dispersed ' + st.dispersed + ' crowds. ' + rank.en + ', ' + score.toLocaleString('en-US') + ' pts.'
    : 'The crowds beat my police squad in Andolon. ' + score.toLocaleString('en-US') + ' pts. Can you do better?';
  const refresh = () => { canvas = build(); document.getElementById('cardimg').src = canvas.toDataURL('image/png'); const b = document.getElementById('nophoto'); if (!b && playerPhoto){ const n = document.createElement('button'); n.id = 'nophoto'; n.className = 'alt'; n.textContent = 'Use default avatar'; n.onclick = () => { playerPhoto = null; n.remove(); refresh(); }; document.getElementById('go').after(n); } };
  document.getElementById('photo2').onchange = e => loadPhoto(e.target.files[0], refresh);
  const np = document.getElementById('nophoto'); if (np) np.onclick = () => { playerPhoto = null; np.remove(); refresh(); };
  document.getElementById('share').onclick = () => shareCard(canvas, text);
  document.getElementById('dl').onclick = () => downloadCard(canvas);
  document.getElementById('go').onclick = start;
  addSwitch();
  document.getElementById('menu').style.display = 'flex';
}
function addSwitch(){   // button on the result screen to play the other side
  const go = document.getElementById('go'); if (!go) return;
  const b = document.createElement('button'); b.className = 'alt'; b.textContent = role === 'police' ? 'Play as Andolonkari' : 'Play as Police';
  b.onclick = () => { role = role === 'police' ? 'protester' : 'police'; try { localStorage.setItem('da_role', role); } catch (e) {} start(); };
  go.after(b);
}

