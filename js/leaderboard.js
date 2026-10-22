// ---------- online leaderboard (Firebase Firestore, anonymous sign-in, optional Google sign-in) ----------
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
    return {fs, db: fs.getFirestore(a), au, A: auth, get uid(){ return au.currentUser.uid; }};   // uid is read live: it changes if the player signs in with Google
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


// daily board: daily/{dayKey}/{role}/{uid}, one best score per player per day
async function submitDaily(r, name, division, e, streak){
  const {fs, db, uid} = await fbInit(), day = dayKey(), ref = fs.doc(db, 'daily', day, r, uid), old = await fs.getDoc(ref);
  const score = Math.max(0, Math.min(100000, Math.round(e.score)));
  const data = {uid, name: name.slice(0, 24), division, score, rank: String(e.rank).slice(0, 40), stat: Math.max(0, Math.round(e.stat)), day: Math.round(e.day), streak: Math.max(0, Math.min(1000, streak || 0)), updatedAt: fs.serverTimestamp()};
  let mine = score;
  if (!old.exists() || score > old.data().score) await fs.setDoc(ref, data);
  else { mine = old.data().score; await fs.updateDoc(ref, {name: data.name, division, streak: data.streak, updatedAt: data.updatedAt}); }
  const col = fs.collection(db, 'daily', day, r);
  const [above, all] = await Promise.all([fs.getCountFromServer(fs.query(col, fs.where('score', '>', mine))), fs.getCountFromServer(col)]);
  return {place: above.data().count + 1, total: all.data().count, best: mine};
}
async function topDaily(r){
  const {fs, db, uid} = await fbInit();
  const s = await fs.getDocs(fs.query(fs.collection(db, 'daily', dayKey(), r), fs.orderBy('score', 'desc'), fs.limit(100)));
  return {uid, rows: s.docs.map(d => d.data())};
}

// ---------- nicknames: unique (enforced by firestore.rules) ----------
const NAME_RE = /^[\p{L}\p{M}\p{N}_.-]([\p{L}\p{M}\p{N} _.-]{0,22}[\p{L}\p{M}\p{N}_.-])?$/u;
const RESERVED_NAMES = ['protester', 'officer', 'admin', 'administrator', 'andolon', 'আন্দোলন', 'আন্দোলনকারী', 'অফিসার'];
const cleanName = n => String(n || '').replace(/\s+/g, ' ').trim();
const nameError = n => !n ? 'Please enter a nickname.' : !NAME_RE.test(n) ? 'Use 1 to 24 letters, numbers, spaces, dots, dashes or underscores.' : RESERVED_NAMES.indexOf(n.toLowerCase()) >= 0 ? 'That nickname is reserved. Please pick another.' : '';
function setPlayerName(n){
  playerName = n; try { localStorage.setItem('da_name', n); } catch (e) {}
  const i = document.getElementById('pname'); if (i) i.value = n;
}
async function registerName(raw, division){
  const name = cleanName(raw), bad = nameError(name); if (bad) throw {code: 'invalid', msg: bad};
  const {fs, db, uid} = await fbInit(), pref = fs.doc(db, 'players', uid), ps = await fs.getDoc(pref);
  if (ps.exists()){
    const cur = ps.data();
    if (cur.name.toLowerCase() === name.toLowerCase()){   // already this nickname
      if (cur.division !== division) await fs.updateDoc(pref, {division});
      return cur.name;
    }
  }
  const key = name.toLowerCase(), taken = await fs.getDoc(fs.doc(db, 'names', key));
  if (taken.exists() && taken.data().uid !== uid) throw {code: 'taken'};
  const w = fs.writeBatch(db);   // claim the new nickname, release the old one, update the player and any leaderboard entries together
  if (ps.exists()) w.delete(fs.doc(db, 'names', ps.data().name.toLowerCase()));
  w.set(fs.doc(db, 'names', key), {uid, name});
  w.set(pref, {name, division, nameChangedAt: fs.serverTimestamp()});
  for (const b of ['protester', 'police']){ const ref = fs.doc(db, boardName(b), uid); if ((await fs.getDoc(ref)).exists()) w.update(ref, {name, updatedAt: fs.serverTimestamp()}); }
  await w.commit();
  try { localStorage.setItem('da_nick', '1'); } catch (e) {}
  return name;
}
const nameErrText = er => er && er.code === 'invalid' ? tr(er.msg) : er && er.code === 'taken' ? tr('That nickname is already taken. Please pick another.')
  : er && er.code === 'permission-denied' ? tr('Could not save that nickname. It may be taken or reserved. Please try another.')
  : tr('Could not submit. Check your connection and try again.');

// ---------- optional Google sign-in: links the anonymous player to a Google account so the record follows them to any device ----------
// keep the lifetime profile (profile.js) in profiles/{uid} for players signed in with Google; the larger counter wins on merge
let syncing = false, syncAgain = false;
async function syncProfile(){
  if (!LB_ON || !fbp) return;
  if (syncing){ syncAgain = true; return; }
  syncing = true;
  try {
    const {fs, db, au, uid} = await fbInit(); if (!au.currentUser || au.currentUser.isAnonymous) return;
    const ref = fs.doc(db, 'profiles', uid), snap = await fs.getDoc(ref);
    if (snap.exists()) mergeProfile(snap.data());
    await fs.setDoc(ref, {n: profile.n, ach: profile.ach, updatedAt: fs.serverTimestamp()});
  } catch (e) {}
  finally { syncing = false; if (syncAgain){ syncAgain = false; syncProfile(); } }
}
async function loadProfile(){   // after signing in on a new device: bring back the saved nickname and division
  try {
    const {fs, db, uid} = await fbInit(), s = await fs.getDoc(fs.doc(db, 'players', uid));
    if (s.exists()){ const p = s.data(); setPlayerName(p.name); setDivision(p.division); const m = document.getElementById('mdiv'); if (m) m.value = p.division; }
  } catch (e) {}
  syncProfile();
}
async function googleLink(){
  const {au, A} = await fbInit(), prov = new A.GoogleAuthProvider(); let how = 'linked';
  try { await A.linkWithPopup(au.currentUser, prov); }
  catch (e){
    if (e && (e.code === 'auth/credential-already-in-use' || e.code === 'auth/email-already-in-use')){   // this Google account already has a record: switch to it
      const cred = A.GoogleAuthProvider.credentialFromError(e); if (!cred) throw e;
      await A.signInWithCredential(au, cred); how = 'switched';
    } else throw e;
  }
  try { localStorage.setItem('da_google', '1'); } catch (e) {}
  trackEvent('google_links');
  await loadProfile();
  return how;
}
async function accountSignOut(){
  const {au, A} = await fbInit(); await A.signOut(au); await A.signInAnonymously(au);
  try { localStorage.removeItem('da_google'); localStorage.removeItem('da_nick'); } catch (e) {}
}
const escH = t => String(t).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const accountRows = [];
function repaintAccounts(){ for (let i = accountRows.length - 1; i >= 0; i--){ if (!accountRows[i].el.isConnected) accountRows.splice(i, 1); else accountRows[i].paint(); } }
function accountRow(){
  const el = document.createElement('div'); el.className = 'acct';
  const paint = async () => {
    let u = null;
    try { if (localStorage.getItem('da_google') || fbp) u = (await fbInit()).au.currentUser; } catch (e) {}
    if (u && !u.isAnonymous){
      el.innerHTML = '<small>' + tr('Signed in as {e}', {e: escH(u.email || u.displayName || '')}) + '</small><button type="button" class="alt acctout">' + tr('Sign out') + '</button>';
      el.querySelector('.acctout').onclick = async () => {
        if (!confirm(tr('Sign out? This device will become a new anonymous player. Your record stays on your Google account.'))) return;
        try { await accountSignOut(); } catch (e) {}
        repaintAccounts();
      };
    } else {
      el.innerHTML = '<small>' + tr('Keep your record on any device.') + '</small><button type="button" class="acctin">' + tr('Save my progress with Google') + '</button><small class="acctmsg"></small>';
      const msg = el.querySelector('.acctmsg'), b = el.querySelector('.acctin');
      b.onclick = async () => {
        b.disabled = true; msg.textContent = '';
        try { const how = await googleLink(); repaintAccounts(); const m2 = el.querySelector('.acctmsg'); if (m2) m2.textContent = how === 'switched' ? tr('Signed in. Welcome back, {n}!', {n: dispName(playerName)}) : tr('Saved. Your record now follows your Google account.'); }
        catch (er) { b.disabled = false; msg.textContent = tr(er && (er.code === 'auth/popup-closed-by-user' || er.code === 'auth/cancelled-popup-request') ? 'Sign-in was cancelled.' : 'Could not sign in. Try again.'); }
      };
    }
  };
  accountRows.push({el, paint}); paint();
  return el;
}

// full-screen leaderboard
function openLeaderboard(startRole, startToday){
  let r = startRole || 'protester', div = '', today = !!startToday;
  const o = document.createElement('div'); o.id = 'lb';
  o.innerHTML = '<div id="lbbox"><button id="lbx" aria-label="' + tr('Close') + '">&times;</button><h2>' + tr('Leaderboard') + '</h2>' +
    '<div id="lbmode"><button type="button" data-m="1">' + tr('Today') + '</button><button type="button" data-m="0">' + tr('All-time') + '</button></div><div id="lbreset"></div>' +
    '<div id="lbtabs"><button type="button" data-r="protester">' + tr('Andolonkari') + '</button><button type="button" data-r="police">' + tr('Police') + '</button></div>' +
    '<select id="lbdiv"><option value="">' + tr('All divisions') + '</option>' + DIVISIONS.map(d => '<option value="' + d + '">' + tr(d) + '</option>').join('') + '</select>' +
    '<div id="lbmsg"></div><ol id="lblist"></ol><a id="lbreport" href="mailto:bizwithsabbir@gmail.com?subject=Andolon%20leaderboard%20report">' + tr('Report an inappropriate name') + '</a></div>';
  document.body.appendChild(o);
  const close = () => o.remove(); o.querySelector('#lbx').onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); });
  const msg = o.querySelector('#lbmsg'), list = o.querySelector('#lblist');
  const load = async () => {
    o.querySelectorAll('#lbtabs button').forEach(b => b.classList.toggle('on', b.dataset.r === r));
    o.querySelectorAll('#lbmode button').forEach(b => b.classList.toggle('on', (b.dataset.m === '1') === today));
    o.querySelector('#lbreset').textContent = today ? tr('Daily Challenge') + ' · ' + dayLabel() + ' · ' + tr('Resets in {t}', {t: resetText()}) : '';
    list.textContent = ''; msg.textContent = tr('Loading...');
    try {
      const {uid, rows} = await (today ? topDaily(r) : topScores(r)), shown = rows.filter(x => !div || x.division === div).slice(0, 20);
      msg.textContent = shown.length ? '' : tr('No scores yet. Be the first!');
      shown.forEach((x, i) => {
        const li = document.createElement('li'); if (x.uid === uid) li.className = 'me';
        const n = document.createElement('b'); n.textContent = dispName(x.name);
        const d = document.createElement('small'); d.textContent = tr(x.division) + ' · ' + tr(x.rank) + (today && x.streak > 1 ? ' · ' + tr('🔥 {n}-day streak', {n: x.streak}) : '');
        const s = document.createElement('span'); s.textContent = loc(x.score);
        const w = document.createElement('div'); w.append(n, d); li.append(w, s); list.appendChild(li);
      });
    } catch (e) { msg.textContent = tr('Could not load the leaderboard. Check your connection and try again.'); }
  };
  o.querySelectorAll('#lbtabs button').forEach(b => b.onclick = () => { r = b.dataset.r; load(); });
  o.querySelectorAll('#lbmode button').forEach(b => b.onclick = () => { today = b.dataset.m === '1'; load(); });
  o.querySelector('#lbdiv').onchange = e => { div = e.target.value; load(); };
  load();
}

// buttons on the result screen: choose division, submit the score, open the board
function addLeaderboard(r, e, daily){
  const go = document.getElementById('go'); if (!go || !LB_ON) return;
  const w = document.createElement('div'); w.className = 'lbsubmit';
  w.innerHTML = '<label>' + tr('Nickname') + '<input id="lbname" maxlength="24" value="' + escH(['Protester', 'Officer'].indexOf(lbName()) >= 0 ? '' : lbName()) + '" placeholder="' + escH(tr('Choose a nickname')) + '"></label><small>' + tr('Shown on the leaderboard.') + '</small><label>' + tr('Division') + '<select id="lbsel">' + divOptions(getDivision()) + '</select></label>' +
    '<button type="button" id="lbsend">' + tr(daily ? "Submit to today's board" : 'Submit score to leaderboard') + '</button><button type="button" id="lbview" class="alt">' + tr('View leaderboard') + '</button><small id="lbstat">' + tr('Submits your name, division and score. Your photo is never uploaded.') + '</small>';
  w.appendChild(accountRow()); go.before(w);
  const st = w.querySelector('#lbstat'), send = w.querySelector('#lbsend'), sel = w.querySelector('#lbsel'), nick = w.querySelector('#lbname');
  w.querySelector('#lbview').onclick = () => openLeaderboard(r, !!daily);
  send.onclick = async () => {
    const nm = cleanName(nick.value), bad = nameError(nm);
    if (bad){ st.textContent = tr(bad); nick.focus(); return; }
    if (!sel.value){ st.textContent = tr('Please choose your division first.'); sel.focus(); return; }
    setDivision(sel.value); send.disabled = true; st.textContent = tr('Submitting...');
    try {
      const name = await registerName(nm, sel.value); setPlayerName(name); nick.value = name;
      let res;
      if (daily){ await submitScore(r, name, sel.value, e); res = await submitDaily(r, name, sel.value, e, daily.streak); }   // a daily run also counts for the all-time board
      else res = await submitScore(r, name, sel.value, e);
      st.textContent = tr(daily ? "You are #{n} of {m} on today's board (your best today: {b})." : 'You are #{n} of {m} on the board (your best: {b}).', {n: res.place, m: res.total, b: loc(res.best)});
      send.textContent = tr('Submitted ✓'); trackEvent(daily ? 'daily_submits' : 'lb_submits');
    } catch (er) { st.textContent = nameErrText(er); send.disabled = false; }
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
  const tip = document.getElementById('installtip'); if (tip) tip.before(accountRow());
  try { if (localStorage.getItem('da_google') || localStorage.getItem('da_nick')) loadProfile(); } catch (e) {}   // returning players: restore nickname and division
})();

// ---------- analytics counters: totals only, no personal data ----------
// stats/global and stats/d<YYYYMMDD> (Bangladesh day) hold plain numbers: games started and finished, wins, where runs end, shares, returning players...
// View them with stats.html or in the Firebase console under Firestore > stats. Counting must never get in the way of playing.
async function statsAdd(obj){
  if (!LB_ON) return;
  try {
    const {fs, db} = await fbInit(), inc = {};
    for (const k in obj) if (obj[k] > 0) inc[k] = fs.increment(Math.min(5, obj[k]));
    if (!Object.keys(inc).length) return;
    const w = fs.writeBatch(db);
    w.set(fs.doc(db, 'stats', 'global'), inc, {merge: true});
    w.set(fs.doc(db, 'stats', dayKey()), inc, {merge: true});
    await w.commit();
  } catch (e) {}
}
const trackEvent = k => { const o = {}; o[k] = 1; return statsAdd(o); };
function trackStart(r){
  if (!LB_ON) return;
  const o = {games: 1}; o[r === 'police' ? 'games_police' : 'games_protester'] = 1;
  o[isBn() ? 'lang_bn' : 'lang_en'] = 1; o[IS_TOUCH ? 'dev_touch' : 'dev_desktop'] = 1;
  if (game && game.challenge) o.challenges = 1;   // started from a "Beat my score" link
  if (game && game.daily) o.daily_start = 1;
  try {
    if (!localStorage.getItem('da_counted')){ o.players = 1; localStorage.setItem('da_counted', '1'); }
    // returning players: back on a later day (once per device), and back a week or more later (once per device)
    const today = dayKey(); let first = localStorage.getItem('da_first');
    if (!first){ first = today; localStorage.setItem('da_first', first); }
    const days = Math.round((Date.UTC(+today.slice(1, 5), +today.slice(5, 7) - 1, +today.slice(7)) - Date.UTC(+first.slice(1, 5), +first.slice(5, 7) - 1, +first.slice(7))) / 864e5);
    if (days >= 1 && !localStorage.getItem('da_r1')){ o.ret_d1 = 1; localStorage.setItem('da_r1', '1'); }
    if (days >= 7 && !localStorage.getItem('da_r7')){ o.ret_d7 = 1; localStorage.setItem('da_r7', '1'); }
  } catch (e) {}
  return statsAdd(o);
}
// a finished game: how it ended, and how far a protester got (barricade rings passed), which shows where players give up
function trackEnd(x){
  if (!LB_ON) return;
  const o = {};
  if (x.role === 'police'){ o.fin_c = 1; if (x.won) o.win_c = 1; else o[x.why === 'anger' ? 'pend_anger' : 'pend_held'] = 1; }
  else { o.fin_p = 1; if (x.won) o.win_p = 1; else o[x.outcome === 'detained' ? 'end_detained' : 'end_timeout'] = 1; o['ring' + Math.max(0, Math.min(3, x.rings || 0))] = 1; }
  if (x.daily) o.daily_fin = 1;
  if (x.challengeWon) o.challenge_wins = 1;
  return statsAdd(o);
}
