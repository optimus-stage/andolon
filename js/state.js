// ---------- state ----------
let gates, neutrals, followers, patrols, rivals, stalls, teas, shutdowns, player, game, chant, bubbles, toasts;
let mouse = {x: 0, y: 0}, cam = {x: 0, y: 0}, playerName = 'Protester';
let role = 'protester', marchers = [], smokes = [];   // role: 'protester' or 'police'
const input = {strike: false};

function newGame(){
  gates = []; stalls = []; teas = []; shutdowns = []; bubbles = []; toasts = []; fx = []; marchers = []; smokes = [];
  RINGS.forEach((r, i) => {
    const n = GATES_PER_RING[i], base = rand(-Math.PI, Math.PI);
    for (let k = 0; k < n; k++){ const ang = base + k * 2 * Math.PI / n, p = polar(ang, r); gates.push({r, ring: i, ang, x: p.x, y: p.y, need: GATE_NEEDS[i], open: 0, hits: GATE_HITS}); }
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
  shutdowns.push({x: -900, y: -1100, r: 300}, {x: 700, y: 900, r: 260});
  player = {x: START.x, y: START.y, r: 12, morale: 100, injured: false, skin: pick(SKINS), moving: false, hidden: false};
  game = {t: 0, day: 1, hold: 0, started: true, spawnT: 4, rivalSpawnT: 20, stats: {recruits: 0, peak: 1, rings: 0, clashWins: 0, beaten: 0, cures: 0, teas: 0, stallT: 0}, mode: 'play', msg: '', msgT: 0, viralT: 40 + rand(0, 20), detainees: [], rescue: {}, shutT: 0, staticT: 0, shutLoseT: 0, drain: 0, boost: 0, flash: 0, van: null, arrest: null, contested: false};
  chant = {i: 0, timer: 3, phase: 0};
  for (let z = 0; z < 4; z++) for (let i = 0; i < 3; i++) mkRival(z, 60 + rand(0, 180));
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) say('Touch and hold a direction on the round pad to walk. Lift to stop.', 6);
}
// Each person gets a stable look: height, hair, head covering, outfit and legs. It is drawn by person() in render.js.
function mkLook(){
  const r = Math.random(), hr = Math.random(), or = Math.random();
  return {
    h: 0.9 + Math.random() * 0.22,                                         // height
    hair: hr < 0.55 ? 'short' : hr < 0.8 ? 'long' : hr < 0.9 ? 'bun' : 'bald',
    hc: pick(['#1b1210', '#1b1210', '#2a1a10', '#3a2418', '#5a4a40']),      // hair colour
    head: r < 0.12 ? 'topi' : r < 0.22 ? 'hijab' : null,                    // prayer cap or head scarf
    hj: pick(['#7a4a8a', '#2e7d6b', '#b5476a', '#3d5a8a', '#8a6a3a']),      // scarf colour
    outfit: or < 0.5 ? 'shirt' : or < 0.72 ? 'panjabi' : or < 0.86 ? 'saree' : 'lungi',
    legs: pick(['#2b2b2b', '#3a4a6a', '#4a3a2a', '#5a5a60', '#27432f']),
    lungi: pick(['#2f6fd0', '#7a3b7a', '#2e7d5b', '#b5651d', '#8a2f3f']),
    bag: Math.random() < 0.15,
  };
}
function mkNeutral(x, y){
  const tones = ['#c9a27a', '#7a9cc9', '#c97a8f', '#8fc97a', '#c9b97a', '#9a7ac9', '#e0a96a', '#5f9ea0', '#d98c8c', '#a6b86a'];
  return {x, y, vx: 0, vy: 0, wt: 0, cool: 0, skin: pick(SKINS), dress: pick(tones), look: mkLook()};
}
function mkPatrol(z){
  const p = {x: 0, y: 0, z, tx: 0, ty: 0, skin: pick(SKINS), moving: true, swing: 0, cool: 0, ftimer: 0, police: role === 'police'};
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
function mkRival(z, delay){   // a small rival crowd; about 1 in 4 is armed
  let p, ok = false; const ref = player || START;
  for (let i = 0; i < 20 && !ok; i++){ p = spawnIn(Math.max(ZR[z + 1] + 100, 100), ZR[z] - 100); ok = Math.hypot(p.x - ref.x, p.y - ref.y) > 700; }
  if (!ok) return false;
  const r = {x: p.x, y: p.y, members: [], delay: game ? game.t + delay : delay, moving: false, armed: Math.random() < RIVAL_ARMED_CHANCE, patrol: Math.random() < 0.7, hunt: false, gunCd: 0, aim: 0};
  for (let i = 0, n = 2 + Math.floor(Math.random() * 3); i < n; i++) r.members.push({x: r.x + rand(-30, 30), y: r.y + rand(-30, 30), skin: pick(SKINS)});
  rivals.push(r); return true;
}
function spawnRival(){ return mkRival(Math.floor(Math.random() * 4), 30); }
function clearShot(a, b){   // no building between the two points
  const n = Math.ceil(dist(a, b) / 16);
  for (let i = 1; i < n; i++){
    const x = a.x + (b.x - a.x) * i / n, y = a.y + (b.y - a.y) * i / n;
    for (const s of TOWN.solids) if (x > s.x && x < s.x + s.w && y > s.y && y < s.y + s.h) return false;
  }
  return true;
}
function rivalFire(r){   // an armed crowd shoots: part of your crowd scatters
  r.gunCd = GUN_CD; r.aim = 0; sfxGunshot(); addFx((r.x + player.x) / 2, (r.y + player.y) / 2 - 10, 'shot'); game.flash = 0.3;
  const n = Math.min(followers.length, Math.ceil((followers.length + 1) * 0.25));
  for (let i = 0; i < n; i++){ const f = followers.pop(); f.cool = 6; f.rcool = 15; f.vx = rand(-90, 90); f.vy = rand(-90, 90); f.wt = 1; neutrals.push(f); }
  player.morale = Math.max(0, player.morale - 20);
  say('Armed rivals fired! ' + (n ? n + ' people scattered. ' : '') + 'Get out of their range!', 3);
}

