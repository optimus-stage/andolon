// ---------- lifetime player profile and achievements ----------
// Stored on the device (localStorage). When the player is signed in with Google, leaderboard.js keeps a copy in Firestore (profiles/{uid})
// so it follows them to other devices; counters are merged by taking the larger value, achievements by union.
const PROFILE_KEYS = ['games', 'wins', 'winsP', 'winsPol', 'secs', 'recruits', 'peak', 'bestP', 'bestPol', 'dispersed', 'breaks', 'clashes', 'detained', 'beaten', 'cures', 'teas', 'dailies', 'bestStreak', 'squadPeak', 'smokes'];
const MAX_KEYS = ['peak', 'bestP', 'bestPol', 'bestStreak', 'squadPeak'];   // the rest are running totals

// id, icon, name, description, test(profile, run), optional progress(profile) -> [now, goal]
const ACHIEVEMENTS = [
  {id: 'first_march', icon: '🚶', name: 'First Steps', desc: 'Finish your first game.', test: p => p.games >= 1},
  {id: 'minar_held', icon: '🏛️', name: 'Minar Held', desc: 'Hold the Shaheed Minar as Andolonkari.', test: p => p.winsP >= 1},
  {id: 'crowd_25', icon: '👥', name: 'Growing Crowd', desc: 'March with 25 people at once.', test: p => p.peak >= 25, prog: p => [p.peak, 25]},
  {id: 'crowd_60', icon: '🌊', name: 'Sea of People', desc: 'March with 60 people at once.', test: p => p.peak >= 60, prog: p => [p.peak, 60]},
  {id: 'breaker_10', icon: '🧱', name: 'Wall Breaker', desc: 'Break 10 police barricades.', test: p => p.breaks >= 10, prog: p => [p.breaks, 10]},
  {id: 'inner_ring', icon: '🎯', name: 'Deep Inside', desc: 'Reach the inner ring in one run.', test: (p, r) => !!r && r.role === 'protester' && r.rings >= 3},
  {id: 'unbreakable', icon: '🛡️', name: 'Unbreakable', desc: 'Win without a single beating.', test: (p, r) => !!r && r.role === 'protester' && r.won && r.beaten === 0},
  {id: 'fast_win', icon: '⚡', name: 'Storm Speed', desc: 'Win in under 150 seconds.', test: (p, r) => !!r && r.role === 'protester' && r.won && r.secs < 150},
  {id: 'rival_breaker', icon: '🥊', name: 'Rival Breaker', desc: 'Win 10 clashes against rival crowds.', test: p => p.clashes >= 10, prog: p => [p.clashes, 10]},
  {id: 'survivor', icon: '🏥', name: 'Back on Your Feet', desc: 'Recover at hospitals 5 times.', test: p => p.cures >= 5, prog: p => [p.cures, 5]},
  {id: 'chai', icon: '☕', name: 'Chai Break', desc: "Drink Mamar Tong's tea 5 times.", test: p => p.teas >= 5, prog: p => [p.teas, 5]},
  {id: 'caught', icon: '🚓', name: 'Taken to Thana', desc: 'Get detained once. It happens to the best.', test: p => p.detained >= 1},
  {id: 'daily_start', icon: '⭐', name: 'Daily Starter', desc: 'Finish a daily challenge.', test: p => p.dailies >= 1},
  {id: 'daily_habit', icon: '🔥', name: 'Daily Habit', desc: 'Reach a 3-day streak.', test: p => p.bestStreak >= 3, prog: p => [p.bestStreak, 3]},
  {id: 'daily_devotion', icon: '🏆', name: 'Daily Devotion', desc: 'Reach a 7-day streak.', test: p => p.bestStreak >= 7, prog: p => [p.bestStreak, 7]},
  {id: 'police_win', icon: '👮', name: 'Order Restored', desc: 'Win as Police.', test: p => p.winsPol >= 1},
  {id: 'cool_head', icon: '🧊', name: 'Cool Head', desc: 'Win as Police with public anger under 25.', test: (p, r) => !!r && r.role === 'police' && r.won && r.anger < 25},
  {id: 'full_force', icon: '🚨', name: 'Full Force', desc: 'Lead a squad of 10 officers.', test: p => p.squadPeak >= 10, prog: p => [p.squadPeak, 10]},
  {id: 'crowd_control', icon: '📣', name: 'Crowd Control', desc: 'Disperse 50 crowds in total.', test: p => p.dispersed >= 50, prog: p => [p.dispersed, 50]},
  {id: 'smoke_master', icon: '💨', name: 'Smoke Master', desc: 'Use 5 smoke grenades in one run.', test: (p, r) => !!r && r.role === 'police' && r.smokes >= 5},
  {id: 'veteran', icon: '🎖️', name: 'Veteran', desc: 'Play 25 games.', test: p => p.games >= 25, prog: p => [p.games, 25]},
  {id: 'both_sides', icon: '⚖️', name: 'Both Sides', desc: 'Win as Andolonkari and as Police.', test: p => p.winsP >= 1 && p.winsPol >= 1},
  {id: 'challenge_accept', icon: '⚔️', name: 'Challenge Accepted', desc: "Play a friend's challenge link.", test: (p, r) => !!r && !!r.challenge},
  {id: 'challenge_win', icon: '🤝', name: 'Challenge Won', desc: "Beat a friend's score.", test: (p, r) => !!r && !!r.challengeWon},
  {id: 'minar_legend', icon: '👑', name: 'Legend of the Minar', desc: 'Score 5,000 points as Andolonkari.', test: p => p.bestP >= 5000, prog: p => [p.bestP, 5000]},
];

function loadProfile0(){
  let p = {}; try { p = JSON.parse(localStorage.getItem('da_profile') || '{}'); } catch (e) {}
  const n = {}; PROFILE_KEYS.forEach(k => { n[k] = Math.max(0, +(p.n && p.n[k]) || 0); });
  return {n, ach: Array.isArray(p.ach) ? p.ach.filter(a => ACHIEVEMENTS.some(x => x.id === a)) : []};
}
const profile = loadProfile0();
function saveProfile(){ try { localStorage.setItem('da_profile', JSON.stringify(profile)); } catch (e) {} }

// fold a finished game into the profile; returns the achievements it unlocked
function recordRun(run){
  const n = profile.n, add = (k, v) => { n[k] += Math.max(0, Math.round(v || 0)); }, mx = (k, v) => { n[k] = Math.max(n[k], Math.round(v || 0)); };
  add('games', 1); if (run.won) add('wins', 1); add('secs', run.secs);
  if (run.role === 'police'){ if (run.won) add('winsPol', 1); mx('bestPol', run.score); add('dispersed', run.dispersed); mx('squadPeak', run.squadPeak); add('smokes', run.smokes); }
  else {
    if (run.won) add('winsP', 1); mx('bestP', run.score); mx('peak', run.peak); add('recruits', run.recruits); add('breaks', run.breaks);
    add('clashes', run.clashWins); add('beaten', run.beaten); add('cures', run.cures); add('teas', run.teas);
    if (run.outcome === 'detained') add('detained', 1);
  }
  if (run.daily){ add('dailies', 1); mx('bestStreak', run.streak); }
  const fresh = ACHIEVEMENTS.filter(a => profile.ach.indexOf(a.id) < 0 && a.test(n, run));
  fresh.forEach(a => profile.ach.push(a.id));
  saveProfile();
  if (typeof syncProfile === 'function') syncProfile();
  refreshProfileBtn();
  return fresh;
}
// merge a copy from another device: bigger counters win, achievements are combined
function mergeProfile(remote){
  if (!remote) return false;
  let changed = false;
  PROFILE_KEYS.forEach(k => { const v = Math.max(0, Math.round(+(remote.n && remote.n[k]) || 0)); if (v > profile.n[k]){ profile.n[k] = v; changed = true; } });
  (Array.isArray(remote.ach) ? remote.ach : []).forEach(a => { if (ACHIEVEMENTS.some(x => x.id === a) && profile.ach.indexOf(a) < 0){ profile.ach.push(a); changed = true; } });
  if (changed){ saveProfile(); refreshProfileBtn(); }
  return changed;
}

const fmtTime = s => { const m = Math.floor(s / 60); return m < 60 ? tr('{n} min', {n: m}) : tr('{h} h {m} min', {h: Math.floor(m / 60), m: m % 60}); };
const achHTML = list => list.length ? '<div class="achnew"><b>🏅 ' + tr(list.length > 1 ? 'New achievements' : 'New achievement') + '</b>' +
  list.map(a => '<div>' + a.icon + ' <b>' + escH(tr(a.name)) + '</b><small>' + escH(tr(a.desc)) + '</small></div>').join('') + '</div>' : '';

function openProfile(){
  if (typeof trackEvent === 'function') trackEvent('profile_opens');
  const n = profile.n, o = document.createElement('div'); o.id = 'lb'; o.className = 'profile';
  const rankP = n.bestP > 0 ? rankFor(n.bestP) : null, rankC = n.bestPol > 0 ? PRANKS.reduce((b, r) => n.bestPol >= r.min ? r : b, PRANKS[0]) : null;
  const div = typeof getDivision === 'function' ? getDivision() : '';
  const stats = [['Games played', loc(n.games)], ['Wins', loc(n.wins)], ['Win rate', n.games ? loc(Math.round(n.wins * 100 / n.games)) + '%' : '-'], ['Time played', fmtTime(n.secs)],
    ['Best crowd', loc(n.peak)], ['Best score (Andolonkari)', loc(n.bestP)], ['Best score (Police)', loc(n.bestPol)], ['Barricades broken', loc(n.breaks)],
    ['Rival clashes won', loc(n.clashes)], ['Crowds dispersed (total)', loc(n.dispersed)], ['Daily challenges', loc(n.dailies)], ['Best streak', loc(n.bestStreak)], ['Times detained', loc(n.detained)]];
  o.innerHTML = '<div id="lbbox"><button id="lbx" aria-label="' + escH(tr('Close')) + '">&times;</button>' +
    '<h2>' + escH(dispName(playerName)) + '</h2>' +
    '<div class="profsub">' + (div ? escH(tr(div)) + ' · ' : '') + (rankP ? escH(tr('Andolonkari') + ': ' + (isBn() ? rankP.bn : rankP.en)) : '') + (rankP && rankC ? ' · ' : '') + (rankC ? escH(tr('Police') + ': ' + (isBn() ? rankC.bn : rankC.en)) : '') + '</div>' +
    '<div class="statgrid">' + stats.map(s => '<div><span>' + escH(tr(s[0])) + '</span><b>' + s[1] + '</b></div>').join('') + '</div>' +
    '<h3>' + escH(tr('Achievements')) + ' <small>' + escH(tr('{n} of {m} unlocked', {n: profile.ach.length, m: ACHIEVEMENTS.length})) + '</small></h3>' +
    '<div class="achlist">' + ACHIEVEMENTS.map(a => {
      const got = profile.ach.indexOf(a.id) >= 0, pr = !got && a.prog ? a.prog(n) : null;
      return '<div class="ach' + (got ? ' got' : '') + '"><span class="achicon">' + (got ? a.icon : '🔒') + '</span><div><b>' + escH(tr(a.name)) + '</b><small>' + escH(tr(a.desc)) + '</small>' +
        (pr ? '<i class="achbar"><u style="width:' + Math.min(100, Math.round(pr[0] * 100 / pr[1])) + '%"></u></i><small>' + loc(Math.min(pr[0], pr[1])) + ' / ' + loc(pr[1]) + '</small>' : '') + '</div></div>';
    }).join('') + '</div>' +
    '<div id="profsync"></div></div>';
  document.body.appendChild(o);
  const close = () => o.remove(); o.querySelector('#lbx').onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); });
  const sync = o.querySelector('#profsync');
  if (typeof accountRow === 'function' && typeof LB_ON !== 'undefined' && LB_ON){ sync.appendChild(accountRow()); const s = document.createElement('small'); s.textContent = tr('Your profile is saved on this device. Sign in with Google to keep it on any device.'); sync.prepend(s); }
  else sync.innerHTML = '<small>' + escH(tr('Your profile is saved on this device.')) + '</small>';
}

function refreshProfileBtn(){
  const b = document.getElementById('profbtn0'); if (!b) return;
  b.textContent = tr('Profile') + (profile.ach.length ? ' · 🏅 ' + profile.ach.length : '');
}
(function(){
  const hb = document.getElementById('howbtn'); if (!hb) return;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'alt'; b.id = 'profbtn0'; b.onclick = openProfile;
  hb.after(b); refreshProfileBtn();
})();
