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
const pick2 = (a, rng) => a[Math.floor(rng() * a.length)];
function genTown(){
  const rng = mulberry(7771999), houses = [], occ = new Set(), mosques = NAMED_MOSQUES.slice(), coffee = NAMED_COFFEE.slice(), temples = [], monasteries = [], churches = [];
  for (let i = 0; i < 40000 && houses.length < HOUSE_COUNT; i++){
    const a = rng() * 6.283, r = Math.sqrt(rng()) * MAP_R, x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (blocked(x, y, 0)) continue;
    const key = Math.floor(x / 150) + ',' + Math.floor(y / 150); if (occ.has(key)) continue; occ.add(key);
    houses.push({x, y, w: 44 + rng() * 30, h: 36 + rng() * 28, c: ['#d8c9a8', '#c9a98f', '#b9b7a0', '#cfd2c4', '#d9b8a5', '#c4b69a'][Math.floor(rng() * 6)]});
  }
  const WANT = {mosque: 7, coffee: 6, temple: 3, monastery: 2, church: 3};
  while (mosques.length < WANT.mosque || coffee.length < WANT.coffee || temples.length < WANT.temple || monasteries.length < WANT.monastery || churches.length < WANT.church){
    const a = rng() * 6.283, r = Math.sqrt(rng()) * (MAP_R - 150), x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (blocked(x, y, 10)) continue;
    const kinds = [['mosque', mosques], ['coffee', coffee], ['temple', temples], ['monastery', monasteries], ['church', churches]].filter(k => k[1].length < WANT[k[0]]);
    const k = kinds[Math.floor(rng() * kinds.length)]; k[1].push({name: '', x, y});
  }
  // every building is solid: nobody walks over them
  const solids = houses.map(h => ({x: h.x, y: h.y, w: h.w, h: h.h}))
    .concat(mosques.map(m => ({x: m.x - 24, y: m.y - 14, w: 48, h: 32})))
    .concat(coffee.map(s => ({x: s.x - 18, y: s.y - 10, w: 36, h: 24})))
    .concat(temples.concat(monasteries, churches).map(s => ({x: s.x - 20, y: s.y - 14, w: 40, h: 30})))
    .concat(HOSPITALS.map(h => ({x: h.x - 30, y: h.y - 22, w: 60, h: 44})));
  // scenery only (nobody collides with it): trees and grass patches on the map, a forest around its edge.
  // It uses its own random stream so the buildings above stay exactly where they were.
  const sr = mulberry(424242), trees = [], patches = [], forest = [];
  for (let i = 0; i < 4000 && trees.length < 260; i++){
    const a = sr() * 6.283, r = Math.sqrt(sr()) * (MAP_R - 60), x = Math.cos(a) * r, y = Math.sin(a) * r, size = 11 + sr() * 9, tone = sr();
    if (blocked(x, y, 14) || houses.some(h => x > h.x - 24 && x < h.x + h.w + 24 && y > h.y - 24 && y < h.y + h.h + 24)) continue;
    trees.push({x, y, r: size, c: tone});
  }
  for (let i = 0; i < 70; i++){ const a = sr() * 6.283, r = Math.sqrt(sr()) * (MAP_R - 100); patches.push({x: Math.cos(a) * r, y: Math.sin(a) * r, rx: 80 + sr() * 140, ry: 50 + sr() * 90, rot: sr() * 3}); }
  for (let i = 0; i < 360; i++){ const a = sr() * 6.283, r = MAP_R + 30 + sr() * 560; forest.push({x: Math.cos(a) * r, y: Math.sin(a) * r, r: 16 + sr() * 14, c: sr()}); }
  // street furniture along the roads: lamp posts and parked rickshaws (decoration only)
  const lamps = [], rickshaws = [], step = Math.PI / 4;
  for (const r of RINGS.concat([MAP_R - 60])){
    const n = Math.round(6.283 * r / 240), off = sr() * 6.283;
    for (let i = 0; i < n; i++){ const a = off + i * 6.283 / n; lamps.push({x: Math.cos(a) * (r + 44), y: Math.sin(a) * (r + 44)}); }
  }
  for (let k = 0; k < 8; k++) for (let d = 260; d < MAP_R - 120; d += 260){
    const a = k * step, px = -Math.sin(a) * 44, py = Math.cos(a) * 44; lamps.push({x: Math.cos(a) * d + px, y: Math.sin(a) * d + py});
  }
  for (let i = 0; i < 110; i++){
    const ring = sr() < 0.6, tones = ['#d9402e', '#2e8b57', '#2f6fd0', '#e0b030', '#c86ab0'];
    let x, y, ang;
    if (ring){ const r = pick2(RINGS.concat([MAP_R - 60]), sr) + (sr() - 0.5) * 36, a = sr() * 6.283; x = Math.cos(a) * r; y = Math.sin(a) * r; ang = a + Math.PI / 2; }
    else { const a = Math.floor(sr() * 8) * step, d = 260 + sr() * (MAP_R - 520), side = (sr() - 0.5) * 36; x = Math.cos(a) * d - Math.sin(a) * side; y = Math.sin(a) * d + Math.cos(a) * side; ang = a; }
    if (Math.hypot(x, y) < 200) continue;
    rickshaws.push({x, y, ang, c: tones[Math.floor(sr() * tones.length)]});
  }
  return {houses, mosques, coffee, temples, monasteries, churches, solids, trees, patches, forest, lamps, rickshaws};
}
const TOWN = genTown();

