// ---------- online leaderboard (Firebase Firestore, anonymous sign-in) ----------
const DIVISIONS = ['Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet', 'Outside Bangladesh'];
const LB_ON = typeof FIREBASE_CONFIG !== 'undefined' && !!FIREBASE_CONFIG.apiKey;
const lbName = () => (typeof playerName === 'string' ? playerName : 'Protester');
let fbp = null;
function fbInit(){
  if (fbp) return fbp;
  fbp = (async () => {
    const base = 'https://www.gstatic.com/firebasejs/10.12.2/';
    const [app, auth, fs] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]);
    const a = app.initializeApp(FIREBASE_CONFIG), au = auth.getAuth(a);
    await au.authStateReady();
    if (!au.currentUser) await auth.signInAnonymously(au);
    return {fs, db: fs.getFirestore(a), uid: au.currentUser.uid};
  })();
  fbp.catch(() => { fbp = null; });
  return fbp;
}
const getDivision = () => { try { return localStorage.getItem('da_div') || ''; } catch (e) { return ''; } };
const setDivision = d => { try { localStorage.setItem('da_div', d); } catch (e) {} };
const divOptions = sel => '<option value="">' + tr('Select your division') + '</option>' + DIVISIONS.map(d => '<option value="' + d + '"' + (d === sel ? ' selected' : '') + '>' + tr(d) + '</option>').join('');
const boardName = r => 'lb_' + (r === 'police' ? 'police' : 'protester');

// save the best score for this player and return their rank on the board
async function submitScore(r, name, division, e){
  const {fs, db, uid} = await fbInit(), ref = fs.doc(db, boardName(r), uid), old = await fs.getDoc(ref);
  const score = Math.max(0, Math.min(100000, Math.round(e.score)));
  const data = {uid, name: name.slice(0, 24), division, score, rank: String(e.rank).slice(0, 40), stat: Math.max(0, Math.round(e.stat)), day: Math.round(e.day), updatedAt: fs.serverTimestamp()};
  let mine = score;
  if (!old.exists()) await fs.setDoc(ref, data);
  else if (score > old.data().score) await fs.setDoc(ref, data);
  else { mine = old.data().score; await fs.updateDoc(ref, {name: data.name, division, updatedAt: data.updatedAt}); }   // lower run: keep the best, refresh name and division
  const col = fs.collection(db, boardName(r));
  const [above, all] = await Promise.all([fs.getCountFromServer(fs.query(col, fs.where('score', '>', mine))), fs.getCountFromServer(col)]);
  return {place: above.data().count + 1, total: all.data().count, best: mine};
}
async function topScores(r){
  const {fs, db, uid} = await fbInit();
  const s = await fs.getDocs(fs.query(fs.collection(db, boardName(r)), fs.orderBy('score', 'desc'), fs.limit(100)));
  return {uid, rows: s.docs.map(d => d.data())};
}

// full-screen leaderboard
function openLeaderboard(startRole){
  let r = startRole || 'protester', div = '';
  const o = document.createElement('div'); o.id = 'lb';
  o.innerHTML = '<div id="lbbox"><button id="lbx" aria-label="' + tr('Close') + '">&times;</button><h2>' + tr('Leaderboard') + '</h2>' +
    '<div id="lbtabs"><button type="button" data-r="protester">' + tr('Andolonkari') + '</button><button type="button" data-r="police">' + tr('Police') + '</button></div>' +
    '<select id="lbdiv"><option value="">' + tr('All divisions') + '</option>' + DIVISIONS.map(d => '<option value="' + d + '">' + tr(d) + '</option>').join('') + '</select>' +
    '<div id="lbmsg"></div><ol id="lblist"></ol></div>';
  document.body.appendChild(o);
  const close = () => o.remove(); o.querySelector('#lbx').onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); });
  const msg = o.querySelector('#lbmsg'), list = o.querySelector('#lblist');
  const load = async () => {
    o.querySelectorAll('#lbtabs button').forEach(b => b.classList.toggle('on', b.dataset.r === r));
    list.textContent = ''; msg.textContent = tr('Loading...');
    try {
      const {uid, rows} = await topScores(r), shown = rows.filter(x => !div || x.division === div).slice(0, 20);
      msg.textContent = shown.length ? '' : tr('No scores yet. Be the first!');
      shown.forEach((x, i) => {
        const li = document.createElement('li'); if (x.uid === uid) li.className = 'me';
        const n = document.createElement('b'); n.textContent = dispName(x.name);
        const d = document.createElement('small'); d.textContent = tr(x.division) + ' · ' + tr(x.rank);
        const s = document.createElement('span'); s.textContent = loc(x.score);
        const w = document.createElement('div'); w.append(n, d); li.append(w, s); list.appendChild(li);
      });
    } catch (e) { msg.textContent = tr('Could not load the leaderboard. Check your connection and try again.'); }
  };
  o.querySelectorAll('#lbtabs button').forEach(b => b.onclick = () => { r = b.dataset.r; load(); });
  o.querySelector('#lbdiv').onchange = e => { div = e.target.value; load(); };
  load();
}

// buttons on the result screen: choose division, submit the score, open the board
function addLeaderboard(r, e){
  const go = document.getElementById('go'); if (!go || !LB_ON) return;
  const w = document.createElement('div'); w.className = 'lbsubmit';
  w.innerHTML = '<label>' + tr('Division') + '<select id="lbsel">' + divOptions(getDivision()) + '</select></label>' +
    '<button type="button" id="lbsend">' + tr('Submit score to leaderboard') + '</button><button type="button" id="lbview" class="alt">' + tr('View leaderboard') + '</button><small id="lbstat">' + tr('Submits your name, division and score. Your photo is never uploaded.') + '</small>';
  go.before(w);
  const st = w.querySelector('#lbstat'), send = w.querySelector('#lbsend'), sel = w.querySelector('#lbsel');
  w.querySelector('#lbview').onclick = () => openLeaderboard(r);
  send.onclick = async () => {
    if (!sel.value){ st.textContent = tr('Please choose your division first.'); sel.focus(); return; }
    setDivision(sel.value); send.disabled = true; st.textContent = tr('Submitting...');
    try {
      const res = await submitScore(r, lbName(), sel.value, e);
      st.textContent = tr('You are #{n} of {m} on the board (your best: {b}).', {n: res.place, m: res.total, b: loc(res.best)});
      send.textContent = tr('Submitted ✓');
    } catch (er) { st.textContent = tr('Could not submit. Check your connection and try again.'); send.disabled = false; }
  };
}

// menu: division picker and leaderboard button
(function(){
  if (!LB_ON) return;
  const nameLbl = document.getElementById('pname'); if (!nameLbl) return;
  const l = document.createElement('label'); l.id = 'mdivlbl'; l.innerHTML = tr('Your division (for the leaderboard)') + ' <select id="mdiv">' + divOptions(getDivision()) + '</select>';
  nameLbl.parentNode.after(l);
  l.querySelector('select').onchange = e => setDivision(e.target.value);
  const hb = document.getElementById('howbtn');
  const b = document.createElement('button'); b.type = 'button'; b.className = 'alt'; b.id = 'lbbtn'; b.textContent = tr('Leaderboard');
  b.onclick = () => openLeaderboard(role); if (hb) hb.after(b);
})();

// ---------- play counter: stats/global holds players (new devices), games (every start), games_protester, games_police ----------
// Nothing personal is stored. View the numbers in the Firebase console under Firestore > stats > global.
async function trackStart(r){
  if (!LB_ON) return;
  try {
    const first = !localStorage.getItem('da_counted');
    const {fs, db} = await fbInit(), inc = {games: fs.increment(1)};
    inc[r === 'police' ? 'games_police' : 'games_protester'] = fs.increment(1);
    if (first) inc.players = fs.increment(1);
    await fs.setDoc(fs.doc(db, 'stats', 'global'), inc, {merge: true});
    if (first) localStorage.setItem('da_counted', '1');
  } catch (e) {}   // counting must never get in the way of playing
}
