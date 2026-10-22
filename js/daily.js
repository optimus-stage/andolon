// ---------- daily challenge: the same map, crowds and twist for everyone each day (Bangladesh time) ----------
// The date seeds the game's random numbers (see seedGame in core.js). Attempts and the streak are kept on the device;
// scores go to the daily board in Firestore (leaderboard.js).
const MAX_ATTEMPTS = 3;
const DAILY_TWISTS = {protester: ['turnout', 'surge', 'thin'], police: ['big', 'more', 'standard']};
const TWIST_NAMES = {turnout: 'Big turnout', surge: 'Rival surge', thin: 'Thin crowds', big: 'Big marches', more: 'More marches', standard: 'Standard day'};
const bdNow = () => new Date(Date.now() + 6 * 36e5);   // Bangladesh is UTC+6: the day changes at midnight there
const keyOf = d => 'd' + d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, '0') + String(d.getUTCDate()).padStart(2, '0');
const dayKey = () => keyOf(bdNow());
const dayLabel = () => bdNow().toLocaleDateString(isBn() ? 'bn-BD' : 'en-GB', {day: 'numeric', month: 'short', timeZone: 'UTC'});
const msToReset = () => { const d = bdNow(); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - d.getTime(); };
const resetText = () => { const m = Math.floor(msToReset() / 6e4), h = Math.floor(m / 60); return isBn() ? h + ' ঘণ্টা ' + (m % 60) + ' মিনিট' : h + 'h ' + (m % 60) + 'm'; };
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
const dailyInfo = r => { const key = dayKey(), h = hashStr(key + r); return {key, role: r, seed: h, twist: DAILY_TWISTS[r][(h >>> 8) % 3]}; };
function dailyLocal(){
  let s = {}; try { s = JSON.parse(localStorage.getItem('da_daily') || '{}'); } catch (e) {}
  if (s.day !== dayKey() || !s.n) s = {day: dayKey(), n: {protester: 0, police: 0}, best: {protester: 0, police: 0}};
  return s;
}
const dailySave = s => { try { localStorage.setItem('da_daily', JSON.stringify(s)); } catch (e) {} };
const attemptsLeft = r => MAX_ATTEMPTS - dailyLocal().n[r];
function streakNow(){   // current streak, if it is still alive today or yesterday
  let s = {}; try { s = JSON.parse(localStorage.getItem('da_streak') || '{}'); } catch (e) {}
  const y = keyOf(new Date(bdNow().getTime() - 864e5));
  return s.last === dayKey() || s.last === y ? s.n || 0 : 0;
}
function bumpStreak(){   // call when a daily run finishes
  let s = {}; try { s = JSON.parse(localStorage.getItem('da_streak') || '{}'); } catch (e) {}
  const today = dayKey(), y = keyOf(new Date(bdNow().getTime() - 864e5));
  if (s.last !== today) s = {last: today, n: s.last === y ? (s.n || 0) + 1 : 1};
  try { localStorage.setItem('da_streak', JSON.stringify(s)); } catch (e) {}
  return s.n;
}
function startDaily(){
  if (attemptsLeft(role) <= 0) return;
  const s = dailyLocal(); s.n[role]++; dailySave(s);
  DAILY = dailyInfo(role); seedGame(DAILY.seed);
  start(true);
}

// menu: the daily challenge card under the role buttons
function refreshDaily(){
  const box = document.getElementById('dailybox'); if (!box) return;
  const left = attemptsLeft(role), st = streakNow(), twist = tr(TWIST_NAMES[dailyInfo(role).twist]);
  box.querySelector('b').textContent = '★ ' + tr('Daily Challenge');
  document.getElementById('dailydate').textContent = dayLabel();
  document.getElementById('dailyinfo').textContent = tr('Today\'s twist: {t}', {t: twist}) + ' · ' + tr('{n} of {m} attempts left', {n: left, m: MAX_ATTEMPTS}) + (st ? ' · ' + tr('🔥 {n}-day streak', {n: st}) : '') + ' · ' + tr('Resets in {t}', {t: resetText()});
  const go = document.getElementById('dailygo'); go.textContent = tr(left > 0 ? "Play today's challenge" : 'Come back tomorrow'); go.disabled = left <= 0;
  const lb = document.getElementById('dailylb'); lb.textContent = tr("Today's board"); lb.style.display = typeof LB_ON !== 'undefined' && LB_ON ? '' : 'none';
}
(function(){
  const roles = document.getElementById('roles'); if (!roles) return;
  const d = document.createElement('div'); d.id = 'dailybox';
  d.innerHTML = '<div class="dailyhead"><b></b> <span id="dailydate"></span></div><small id="dailyinfo"></small><button id="dailygo" type="button"></button><button id="dailylb" class="alt" type="button"></button>';
  roles.after(d);
  document.getElementById('dailygo').onclick = () => { if (tutSeen(role)) startDaily(); else showTutorial(role, startDaily); };
  document.getElementById('dailylb').onclick = () => openLeaderboard(role, true);
  refreshDaily();
})();
