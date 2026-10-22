// ---------- "Beat my score" challenge links ----------
// Every game runs on a seed (RUNSEED). A link carries that seed, the sharer's score, side and name, so a friend plays the same map and
// starting crowds and sees whether they beat the score. Nothing is stored on a server; the link is the whole challenge.
let CHALLENGE = null;   // a challenge opened from a link, waiting to be accepted
const chBase = () => location.origin + location.pathname.replace(/index\.html$/, '');
const chSafe = n => String(n || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
function challengeLink(o){
  const q = new URLSearchParams({seed: String(o.seed), r: o.role === 'police' ? 'c' : 'p', s: String(Math.round(o.score)), n: chSafe(o.name)});
  if (o.twist) q.set('t', o.twist);
  return chBase() + '?' + q.toString();
}
function parseChallenge(){
  const q = new URLSearchParams(location.search); if (!q.has('seed')) return null;
  const seed = Number(q.get('seed')), s = Number(q.get('s')), r = q.get('r') === 'c' ? 'police' : q.get('r') === 'p' ? 'protester' : null;
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295 || !Number.isInteger(s) || s < 0 || s > 100000 || !r) return null;
  const t = q.get('t'), twist = DAILY_TWISTS[r].indexOf(t) >= 0 ? t : null;
  return {seed, score: s, role: r, name: chSafe(q.get('n')) || 'Protester', twist};
}
function startChallenge(){
  const c = CHALLENGE; if (!c) return;
  role = c.role; try { localStorage.setItem('da_role', role); } catch (e) {}
  if (typeof showRole === 'function') showRole();
  DAILY = null; TWIST = c.twist; CH_NOW = c; RUNSEED = c.seed; seedGame(c.seed);
  start(true);
}
async function shareChallenge(o){
  if (typeof trackEvent === 'function') trackEvent('share_challenge');
  const url = challengeLink(o), text = tr('I scored {s} as {r} in Andolon. Beat my score!', {s: loc(o.score), r: tr(o.role === 'police' ? 'Police' : 'Andolonkari')});
  if (navigator.share){ try { await navigator.share({title: 'Andolon', text, url}); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(text + ' ' + url); toast(tr('Link copied. Paste it in a chat to challenge a friend.')); }
  catch (e) { window.prompt(text, url); }
}
// result line for the end screen
function challengeResult(ch, score){
  const d = score - ch.score, n = escH(dispName(ch.name));
  return {win: d > 0, html: '<p class="dailychip">⚔️ ' + tr('Challenge from {n}: {s}', {n, s: loc(ch.score)}) + '</p><p class="chresult ' + (d > 0 ? 'win' : 'lose') + '">' +
    (d > 0 ? tr('You beat {n} by {d} points!', {n, d: loc(d)}) : d === 0 ? tr('A tie with {n}!', {n}) : tr('You fell short of {n} by {d} points. Try again!', {n, d: loc(-d)})) + '</p>'};
}

// menu banner when the page was opened from a challenge link
function showChallengeBanner(){
  const old = document.getElementById('chbanner'); if (old) old.remove();
  if (!CHALLENGE) return;
  const h = document.querySelector('#card h1'); if (!h) return;
  const b = document.createElement('div'); b.id = 'chbanner';
  const who = escH(dispName(CHALLENGE.name));
  b.innerHTML = '<b>⚔️ ' + tr('{n} challenges you!', {n: who}) + '</b><small>' + tr('Beat {s} points as {r} on the same map.', {s: loc(CHALLENGE.score), r: tr(CHALLENGE.role === 'police' ? 'Police' : 'Andolonkari')}) + '</small>' +
    '<button type="button" id="chgo">' + tr('Accept the challenge') + '</button><button type="button" id="chno" class="alt">' + tr('Play normally') + '</button>';
  h.after(b);
  document.getElementById('chgo').onclick = () => { if (tutSeen(CHALLENGE.role)) startChallenge(); else showTutorial(CHALLENGE.role, startChallenge); };
  document.getElementById('chno').onclick = () => { CHALLENGE = null; b.remove(); try { history.replaceState(null, '', chBase()); } catch (e) {} };
}
(function(){
  CHALLENGE = parseChallenge();
  if (CHALLENGE){ role = CHALLENGE.role; try { localStorage.setItem('da_role', role); } catch (e) {} }
  showChallengeBanner();
})();
