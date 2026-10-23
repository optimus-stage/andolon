// ---------- avatar: choose how you look before you march (protester) or patrol (police) ----------
// An avatar is a short list of option numbers, saved as a string like "0.1.0.0.3.0.0.0.0.1". It is drawn by person() in render.js.
// Choices never use the game's seeded RNG (daily challenges and friend challenges must stay identical for everyone).
const AV_HAIR = ['short', 'long', 'bun', 'curly', 'bald'];
const AV_HAIR_N = ['Short', 'Long', 'Bun', 'Curly', 'Bald'];
const AV_HAIRC = ['#1b1210', '#3a2418', '#5a4a40', '#8a6a3a', '#b5651d', '#9aa0a6'];
const AV_HEAD = [null, 'topi', 'hijab', 'band'];
const AV_HEAD_N = ['None', 'Prayer cap', 'Hijab', 'Headband'];
const AV_HJ = ['#7a4a8a', '#2e7d6b', '#b5476a', '#3d5a8a', '#8a6a3a', '#f4f1e6'];
const AV_OUTFIT = ['shirt', 'panjabi', 'lungi', 'saree', 'kameez'];
const AV_OUTFIT_N = ['Shirt', 'Panjabi', 'Lungi', 'Saree', 'Kameez'];
const AV_DRESSC = [WHITE, '#c8102e', '#0b6b3a', '#2f6fd0', '#e0a96a', '#232323', '#7a3b7a', '#f0c419'];
const AV_LEGC = ['#2b2b2b', '#3a4a6a', '#4a3a2a', '#2f6fd0', '#2e7d5b', '#8a2f3f'];
const AV_ACC_N = ['None', 'Flag', 'Glasses', 'Mask', 'Bag'];
const AV_CP_N = ['Cap', 'Beret', 'None', 'Helmet'];   // saved numbers keep their meaning: 0 cap, 1 beret; 2 none and 3 helmet were added later
const AV_CP_HAT = ['cap', 'beret', null, 'helmet'];
const AV_W_N = ['Stick', 'Gun', 'Shield'];
const AV_UNI = [{n: 'Navy', dress: BLUE, legs: '#14284f', cap: '#12306b'}, {n: 'Khaki', dress: '#b59f6a', legs: '#6a5a34', cap: '#6a5a34'},
  {n: 'Olive', dress: '#5f7a3a', legs: '#2f3f1c', cap: '#2f3f1c'}, {n: 'Black', dress: '#2b2b30', legs: '#111111', cap: '#111111'}];
// what each gender can pick (numbers index the lists above)
const AV_ALLOW = {h: [[0, 3, 4], [1, 2, 0]], hd: [[0, 1, 3], [0, 2, 3]], o: [[0, 1, 2], [0, 3, 4]]};
const AV_KEYS = {protester: ['g', 's', 'h', 'hc', 'hd', 'hj', 'o', 'dc', 'lc', 'a'], police: ['g', 's', 'h', 'hc', 'cp', 'uc', 'b', 'a', 'w']};
const AV_MAX = {protester: {g: 2, s: 4, h: 5, hc: 6, hd: 4, hj: 6, o: 5, dc: 8, lc: 6, a: 5}, police: {g: 2, s: 4, h: 5, hc: 6, cp: 4, uc: 4, b: 4, a: 2, w: 3}};
const AV_DEFAULT = {protester: {g: 0, s: 1, h: 0, hc: 0, hd: 3, hj: 0, o: 0, dc: 0, lc: 0, a: 1}, police: {g: 0, s: 1, h: 0, hc: 0, cp: 0, uc: 0, b: 0, a: 0, w: 0}};
const avRole = r => r === 'police' ? 'police' : 'protester';

function avFix(a, r){   // keep every value in range, and only the choices that suit the gender
  for (const k of AV_KEYS[r]){ const v = Math.floor(+a[k]); a[k] = v >= 0 && v < AV_MAX[r][k] ? v : AV_DEFAULT[r][k]; }
  for (const k of ['h', 'hd', 'o']) if (k in a && AV_ALLOW[k][a.g].indexOf(a[k]) < 0) a[k] = AV_ALLOW[k][a.g][0];
  return a;
}
function avDecode(str, r){
  r = avRole(r); const a = Object.assign({}, AV_DEFAULT[r]);
  if (typeof str === 'string' && /^[0-9.]{1,40}$/.test(str)){ const p = str.split('.'); AV_KEYS[r].forEach((k, i) => { if (i < p.length) a[k] = +p[i]; }); }
  return avFix(a, r);
}
const avEncode = (a, r) => AV_KEYS[avRole(r)].map(k => a[k]).join('.');

// saved on this device; for players signed in with Google also copied to profiles/{uid} (see leaderboard.js)
let avStore = {};
try { avStore = JSON.parse(localStorage.getItem('da_avatar') || '{}') || {}; } catch (e) { avStore = {}; }
const avStr = r => (typeof avStore[avRole(r)] === 'string' ? avStore[avRole(r)] : '');
const getAvatar = r => avDecode(avStr(r), r);
function avSave(){ try { localStorage.setItem('da_avatar', JSON.stringify(avStore)); } catch (e) {} }
function setAvatar(r, a){
  avStore[avRole(r)] = avEncode(avFix(a, avRole(r)), r); avSave();
  try { localStorage.setItem('da_avatar_dirty', '1'); } catch (e) {}
  if (typeof syncProfile === 'function') syncProfile();
}
const avCloud = () => { const o = {}; if (avStore.protester) o.p = avStore.protester; if (avStore.police) o.c = avStore.police; return o; };
function avApplyCloud(c){   // the account's saved looks replace this device's, unless this device has edits that are not saved yet
  if (!c) return false;
  try { if (localStorage.getItem('da_avatar_dirty')) return false; } catch (e) {}
  let changed = false;
  [['p', 'protester'], ['c', 'police']].forEach(([k, r]) => { if (typeof c[k] === 'string' && /^[0-9.]{1,40}$/.test(c[k]) && avStore[r] !== c[k]){ avStore[r] = avEncode(avDecode(c[k], r), r); changed = true; } });
  if (changed){ avSave(); refreshAvatarUI(); }
  return changed;
}

// everything person() needs to draw this avatar: skin, clothes, hat, and the look object
function avatarProps(a, r){
  r = avRole(r); const L = {h: 1, g: a.g, hair: AV_HAIR[a.h], hc: AV_HAIRC[a.hc], head: null, hj: AV_HJ[0], outfit: 'shirt', legs: AV_LEGC[0], lungi: AV_LEGC[0], bag: false};
  if (r === 'police'){
    const u = AV_UNI[a.uc]; L.glasses = a.a === 1;
    return {skin: SKINS[a.s], dress: u.dress, legs: u.legs, hat: AV_CP_HAT[a.cp], capC: u.cap, badge: a.b, hairBack: true, stick: a.w === 0, gun: a.w === 1, shield: a.w === 2, look: L};
  }
  const hd = AV_HEAD[a.hd]; L.head = hd === 'band' ? null : hd; L.hj = AV_HJ[a.hj]; L.outfit = AV_OUTFIT[a.o]; L.legs = L.lungi = AV_LEGC[a.lc];
  L.bag = a.a === 4; L.glasses = a.a === 2; L.mask = a.a === 3;
  return {skin: SKINS[a.s], dress: AV_DRESSC[a.dc], hat: hd === 'band' ? 'band' : null, hairBack: hd === 'band', flag: a.a === 1, look: L};
}
const avatarPropsFor = (str, r) => avatarProps(avDecode(str, r), r);
function applyAvatar(p, r){   // put the chosen avatar on the player (called when a game is set up)
  const pr = avatarProps(getAvatar(r), r); p.skin = pr.skin; if (avRole(r) === 'protester' && typeof activeBanner === 'function') pr.banner = activeBanner(); p.avp = pr;
}

// draw an avatar into a canvas (menu preview, editor, leaderboard rows). w and h are the canvas's CSS size: a canvas that is not in the page yet
// reports no size, and falling back to its default 300x150 bitmap would squash the picture.
function drawAvatar(cv, str, r, scale, extra, w, h){
  const k = Math.min(2, window.devicePixelRatio || 1); w = w || cv.clientWidth || +cv.dataset.w || 100; h = h || cv.clientHeight || +cv.dataset.h || 100;
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  cv.width = Math.round(w * k); cv.height = Math.round(h * k);
  const c = cv.getContext('2d'); c.scale(k, k); c.clearRect(0, 0, w, h);
  person(c, w / 2 - 3 * scale, h - Math.round(10 * scale) - 4, Object.assign({scale, noBase: true, stick: avRole(r) === 'police'}, extra || {}, avatarPropsFor(str, r)));
}

// ---------- editor ----------
const avSwatches = {s: () => SKINS, hc: () => AV_HAIRC, hj: () => AV_HJ, dc: () => AV_DRESSC, lc: () => AV_LEGC, uc: () => AV_UNI.map(u => u.dress)};
function avRows(r, a){   // the option rows to show for this side and this gender
  const g = a.g, allow = k => AV_ALLOW[k][g];
  const chips = (k, label, vals, names) => ({k, label, chips: vals.map(v => [v, names[v]])});
  const sw = (k, label, names) => ({k, label, sw: avSwatches[k](), names});
  const base = [chips('g', 'Gender', [0, 1], ['Male', 'Female']), sw('s', 'Skin tone'), chips('h', 'Hair', allow('h'), AV_HAIR_N), sw('hc', 'Hair colour')];
  if (r === 'police') return base.concat([chips('cp', 'Headgear', [2, 0, 1, 3], AV_CP_N), sw('uc', 'Uniform colour', AV_UNI.map(u => u.n)), chips('b', 'Rank badge', [0, 1, 2, 3], ['None', '1 star', '2 stars', '3 stars']), chips('a', 'Glasses', [0, 1], ['No', 'Yes']), chips('w', 'Equipment', [0, 1, 2], AV_W_N)]);
  return base.concat([chips('hd', 'Head', allow('hd'), AV_HEAD_N)], a.hd === 2 ? [sw('hj', 'Hijab colour')] : [], [chips('o', 'Outfit', allow('o'), AV_OUTFIT_N), sw('dc', 'Outfit colour')],
    a.o === 3 ? [] : [sw('lc', a.o === 2 ? 'Lungi colour' : 'Trousers colour')], [chips('a', 'Accessory', [0, 1, 2, 3, 4], AV_ACC_N)]);
}
function openAvatarEditor(r){
  r = avRole(r || role); let a = getAvatar(r);
  const o = document.createElement('div'); o.id = 'avedit';
  o.innerHTML = '<div id="avbox"><button id="avx" type="button" aria-label="' + tr('Close') + '">&times;</button><h2>' + tr(r === 'police' ? 'Your officer' : 'Your protester') + '</h2>' +
    '<canvas id="avbig"></canvas><div id="avrows"></div>' +
    '<div class="avbtns"><button type="button" id="avrand" class="alt">' + tr('Randomise') + '</button><button type="button" id="avreset" class="alt">' + tr('Reset') + '</button><button type="button" id="avdone">' + tr('Done') + '</button></div>' +
    '<small>' + tr(r === 'police' ? 'Officers keep their uniform; you choose the person and the details.' : 'Your look shows on the leaderboard and your share card. A photo you add to the card replaces it there.') + '</small></div>';
  document.body.appendChild(o);
  const rows = o.querySelector('#avrows'), big = o.querySelector('#avbig');
  const paint = () => {
    a = avFix(a, r); setAvatar(r, a);
    rows.textContent = '';
    avRows(r, a).forEach(row => {
      const d = document.createElement('div'); d.className = 'avrow'; const lab = document.createElement('span'); lab.textContent = tr(row.label); d.appendChild(lab);
      const box = document.createElement('div');
      (row.chips || row.sw).forEach((it, i) => {
        const b = document.createElement('button'); b.type = 'button'; const v = row.chips ? it[0] : i;
        if (row.chips){ b.className = 'avchip'; b.textContent = tr(it[1]); } else { b.className = 'avsw'; b.style.background = it; const nm = row.names ? row.names[i] : ''; if (nm){ b.title = tr(nm); b.setAttribute('aria-label', tr(nm)); } else b.setAttribute('aria-label', tr(row.label) + ' ' + (i + 1)); }
        if (a[row.k] === v) b.classList.add('on');
        b.onclick = () => { a[row.k] = v; paint(); };
        box.appendChild(b);
      });
      d.appendChild(box); rows.appendChild(d);
    });
    drawAvatar(big, avEncode(a, r), r, 4.8, null, 220, 190);
    refreshAvatarUI();
  };
  const close = () => { o.remove(); refreshAvatarUI(); if (typeof cardRefresh === 'function' && document.getElementById('cardimg')) cardRefresh(); };
  o.querySelector('#avx').onclick = close; o.querySelector('#avdone').onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); });
  o.querySelector('#avrand').onclick = () => {   // Math.random on purpose: never the seeded game RNG
    const pick1 = n => Math.floor(Math.random() * n), g = pick1(2), n = {g};
    AV_KEYS[r].forEach(k => { if (k !== 'g') n[k] = pick1(AV_MAX[r][k]); });
    a = n; paint();
  };
  o.querySelector('#avreset').onclick = () => { a = Object.assign({}, AV_DEFAULT[r]); paint(); };
  paint();
}

// ---------- menu: small preview with a button to open the editor ----------
const avatarButtons = [];
function avatarButton(cls){   // a "Customize avatar" button with a live thumbnail
  const b = document.createElement('button'); b.type = 'button'; b.className = cls || 'alt'; b.onclick = () => openAvatarEditor(role);
  avatarButtons.push(b); paintAvatarButton(b); return b;
}
function paintAvatarButton(b){ b.textContent = tr('Customize avatar'); }
function refreshAvatarUI(){
  const c = document.getElementById('avprev'); if (c) drawAvatar(c, avStr(role), role, 2.6, null, 100, 104);
  const bn = document.getElementById('bnbtn'); if (bn){ bn.style.display = role === 'police' ? 'none' : ''; bn.textContent = tr('Banner') + (activeBanner() ? ' ✓' : ''); }
  const t = document.getElementById('avtitle'); if (t) t.textContent = tr(role === 'police' ? 'Your officer' : 'Your protester');
  for (let i = avatarButtons.length - 1; i >= 0; i--){ if (!avatarButtons[i].isConnected && avatarButtons[i].dataset.menu !== '1') avatarButtons.splice(i, 1); else paintAvatarButton(avatarButtons[i]); }
}
(function(){
  const roles = document.getElementById('roles'); if (!roles) return;
  const row = document.createElement('div'); row.id = 'avatarrow';
  row.innerHTML = '<canvas id="avprev" width="100" height="104" aria-hidden="true"></canvas><div><b id="avtitle"></b></div>';
  const b = avatarButton('alt'); b.id = 'avbtn'; b.dataset.menu = '1'; row.lastChild.appendChild(b);
  const bb = document.createElement('button'); bb.type = 'button'; bb.className = 'alt'; bb.id = 'bnbtn'; bb.onclick = () => openBannerEditor(); row.lastChild.appendChild(bb);
  roles.after(row); refreshAvatarUI();
})();
