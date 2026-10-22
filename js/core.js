// Andolon (আন্দোলন): single-player march game. Depends on data.js.
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
let vw, vh, Z = 1, dpr = 1;
function resize(){
  vw = innerWidth; vh = innerHeight; dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);   // sharp on phone screens
  Z = Math.max(0.7, Math.min(1, Math.min(vw, vh) / 700));   // zoom out a little on small screens
}
addEventListener('resize', resize); resize();

// game randomness: normally Math.random; the daily challenge swaps in a generator seeded from the date so everyone gets the same day
let RNG = Math.random;
let DAILY = null;   // set while a daily challenge run is active: {key, role, seed, twist}
let TWIST = null, CH_NOW = null, RUNSEED = null;   // twist in use, the friend challenge being played, and the seed of the current run (so a run can be shared as a challenge)
const seedGame = s => { RNG = s == null ? Math.random : mulberry(s); };
const rand = (a, b) => a + RNG() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const pick = a => a[Math.floor(RNG() * a.length)];
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

