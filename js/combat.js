// ---------- rival clash ----------
function clash(r){
  const pP = followers.length + 1, pR = r.members.length + 1;
  let dmgP = Math.ceil(0.2 * pR * (pR > pP ? 1 : 0.5)), dmgR = Math.ceil(0.2 * pP * (pP >= pR ? 1 : 0.5));
  dmgP = Math.min(dmgP, followers.length); dmgR = Math.min(dmgR, r.members.length);
  for (let i = 0; i < dmgP; i++){ const f = followers.pop(); f.cool = 6; f.rcool = 15; f.vx = rand(-70, 70); f.vy = rand(-70, 70); f.wt = 1; neutrals.push(f); }
  let switched = 0;
  for (let i = 0; i < dmgR; i++){
    const m = r.members.pop();
    if (Math.random() < 0.4){ const n = mkNeutral(m.x, m.y); n.skin = m.skin; if (m.look) n.look = m.look; followers.push(n); switched++; game.stats.recruits++; }   // persuaded to join the protesters
    else { const n = mkNeutral(m.x, m.y); n.skin = m.skin; if (m.look) n.look = m.look; n.cool = 6; n.rcool = 25; n.vx = rand(-70, 70); n.vy = rand(-70, 70); n.wt = 1; neutrals.push(n); }   // goes home for a while
  }
  if (switched) sfxJoin();
  if (dmgR > dmgP) game.stats.clashWins++;
  if (!r.members.length) r.dead = true;
  player.morale = Math.max(0, player.morale - 4);
  fightSfx((r.x + player.x) / 2, (r.y + player.y) / 2);
  say(tr(pP === pR ? 'Equal crowds: the protesters win the clash! You lost {a}, they lost {b}{s}' : 'Clash with a rival crowd! You lost {a}, they lost {b}{s}', {a: dmgP, b: dmgR, s: switched ? tr(' ({n} switched sides)', {n: switched}) : ''}), 2.5);
}

// ---------- police strikes ----------
function strikePlayer(p){
  p.swing = 0.35; p.cool = 1.4; fightSfx(player.x, player.y); game.flash = 0.4; game.stats.beaten++;
  if (player.morale <= 25){ startArrest(p); return; }   // too exhausted to get away: detained
  player.morale -= 25; player.injured = true;
  const a = Math.atan2(player.y - p.y, player.x - p.x); player.x += Math.cos(a) * 45; player.y += Math.sin(a) * 45; collide(player, player.r);
  const h = nearestHospital(player);
  say(tr('Beaten by the police! Find a hospital{h} to recover.', {h: h ? ' (' + tr(h.name) + ')' : ''}), 4);
}
function strikeFollower(p, idx){
  p.swing = 0.35; p.cool = 1.8;
  const f = followers.splice(idx, 1)[0]; fightSfx(f.x, f.y);
  if (Math.random() < 0.4){ detainFollower(f); return; }   // taken to a station
  const a = Math.atan2(f.y - p.y, f.x - p.x);
  f.cool = 6; f.vx = Math.cos(a) * 80; f.vy = Math.sin(a) * 80; f.wt = 1; neutrals.push(f);
  say(tr('Police beat back part of your crowd'), 2);
}
function detainFollower(f){
  const stn = nearestStations(f)[0];
  game.detainees.push({st: stn, skin: f.skin, t: DETAIN_HOLD});
  toasts.push({name: pick(NAMES), station: stn.name, skin: f.skin, t: 4});
  say(tr('Someone from your crowd was detained at {s}. Rescue them!', {s: tr(stn.name)}));
}
const heldAt = stn => game.detainees.filter(d => d.st === stn);
function nearestHeld(p){ let b = null; for (const d of game.detainees) if (!b || dist(d.st, p) < dist(b, p)) b = d.st; return b; }
function updateRescue(dt){
  for (let i = game.detainees.length - 1; i >= 0; i--){   // held people are let go on their own after a while
    const d = game.detainees[i]; d.t -= dt;
    if (d.t <= 0){ game.detainees.splice(i, 1); const n = mkNeutral(d.st.x + rand(-40, 40), d.st.y + 40); n.skin = d.skin; n.cool = 6; neutrals.push(n); }
  }
  for (const stn of STATIONS){
    const held = heldAt(stn).length, R = game.rescue[stn.name] || (game.rescue[stn.name] = {p: 0, cd: 0});
    R.cd = Math.max(0, R.cd - dt);
    if (!held){ R.p = 0; continue; }
    const crowd = followers.filter(f => dist(f, stn) < RESCUE_R).length;
    const rate = crowd >= RESCUE_NEED ? 1 : -0.5;
    R.p = Math.max(0, Math.min(RESCUE_TIME, R.p + rate * dt));
    if (R.p >= RESCUE_TIME){
      const out = game.detainees.filter(d => d.st === stn); game.detainees = game.detainees.filter(d => d.st !== stn); R.p = 0;
      for (const d of out){ const n = mkNeutral(stn.x + rand(-30, 30), stn.y + 40); n.skin = d.skin; followers.push(n); game.stats.recruits++; }
      sfxJoin(); sfxChime(); toasts.push({kind: 'released', station: stn.name, count: out.length, skin: out[0].skin, t: 5});
    }
  }
}
function startArrest(police){
  const dest = Math.random() < 0.3 ? AYNAGHOR : pick(nearestStations(player).slice(0, 3));
  const a = Math.atan2(police.y - player.y, police.x - player.x);
  game.mode = 'arrest';
  sfxSiren();
  game.arrest = {phase: 0, t: 0, dest};
  game.van = {x: player.x + Math.cos(a) * 520, y: player.y + Math.sin(a) * 520, dir: 1, sx: 0, sy: 0};
  say(tr('The police have caught you!'), 2);
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
      v.sx = v.x; v.sy = v.y; A.dur = Math.max(2, Math.min(4, dist(v, A.dest) / 600)); say(tr('Taken to {s}', {s: tr(A.dest.name)}), 3);
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

