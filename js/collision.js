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
    if (o.police) break;   // police walk through their own barricades
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

