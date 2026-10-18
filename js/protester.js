// ---------- update ----------
function update(dt){
  if (role === 'police'){ updatePolice(dt); return; }
  game.t += dt; game.msgT -= dt; game.flash = Math.max(0, game.flash - dt);
  for (let i = fx.length - 1; i >= 0; i--){ fx[i].t += dt; if (fx[i].t > fxLife(fx[i].kind)) fx.splice(i, 1); }
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
    if (n.cool <= 0 && dist(n, player) < RECRUIT_R){ followers.push(n); neutrals.splice(i, 1); game.stats.recruits++; sfxJoin(); addFx(n.x, n.y, 'join'); }
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

  updateRescue(dt);
  if (inShutdown()){   // internet shutdown: static on the radio, and the crowd drifts away after 4 seconds
    if (game.shutT === 0) say('Internet shutdown! Leave within 4 seconds or you will lose your crowd.', 3);
    game.shutT += dt; game.staticT -= dt; if (game.staticT <= 0){ sfxStatic(); game.staticT = 0.45; }
    if (game.shutT >= 4 && followers.length){
      game.shutLoseT -= dt;
      if (game.shutLoseT <= 0){ game.shutLoseT = 1.2; const n = Math.max(1, Math.ceil(followers.length * 0.2)); for (let i = 0; i < n && followers.length; i++){ const f = followers.pop(); f.cool = 6; f.rcool = 10; f.vx = rand(-70, 70); f.vy = rand(-70, 70); f.wt = 1; neutrals.push(f); } say('No signal: ' + n + ' people lost contact and left. Get out of the shutdown zone!', 2.5); }
    }
  } else { game.shutT = 0; game.shutLoseT = 0; }

  // rivals (support the police, never struck by them)
  for (const r of rivals){
    r.moving = false;
    const z = zoneOf(r.x, r.y);
    const pz = zoneOf(player.x, player.y), pd = dist(r, player);
    if (r.hunt){ if (pd > RIVAL_LOSE || pz !== z || player.hidden) r.hunt = false; }
    else if (pd < RIVAL_HUNT && pz === z && !player.hidden) r.hunt = true;
    let tgt = null, best = 1e9;
    if (r.hunt) tgt = player;
    else {
      if (r.members.length < RIVAL_MAX) for (const n of neutrals){ const dd = dist(n, r); if (n.cool <= 0 && !(n.rcool > 0) && dd < best && dd < 600 && zoneOf(n.x, n.y) === z){ best = dd; tgt = n; } }
      if (!tgt && r.patrol){
        if (!r.wp || dist(r, r.wp) < 24 || game.t > (r.wpT || 0)){ r.wp = spawnIn(Math.max(ZR[z + 1] + 100, 100), ZR[z] - 100); r.wpT = game.t + 25; }
        tgt = r.wp;
      } else if (!tgt && game.t > r.delay){
        const dr = Math.hypot(r.x, r.y), ri = RINGS.findIndex(rr => rr < dr - 20);
        if (ri >= 0){
          const g = gates.filter(g => g.ring === ri).sort((a, b) => dist(a, r) - dist(b, r))[0];
          tgt = g.open >= 1 ? polar(g.ang, g.r - 90) : polar(g.ang, g.r + 70);
        } else tgt = {x: 0, y: 0};
      }
    }
    if (tgt){
      const tdx = tgt.x - r.x, tdy = tgt.y - r.y, td = Math.hypot(tdx, tdy);
      if (td > 6){ const s = r.hunt ? RIVAL_HUNT_SPEED : Math.max(40, 70 - r.members.length); r.x += tdx / td * s * dt; r.y += tdy / td * s * dt; r.moving = true; }
    }
    // armed crowds: a short warning, then a shot if you are in range and no building is in the way
    r.gunCd = Math.max(0, (r.gunCd || 0) - dt);
    if (r.armed && r.members.length && r.gunCd <= 0 && pd < GUN_RANGE && !player.hidden && clearShot(r, player)){ r.aim += dt; if (r.aim >= GUN_AIM) rivalFire(r); } else r.aim = 0;
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
  if (rivals.length < RIVAL_TARGET){ game.rivalSpawnT -= dt; if (game.rivalSpawnT <= 0 && spawnRival()) game.rivalSpawnT = 20; }

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

