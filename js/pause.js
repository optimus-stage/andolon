// ---------- pause ----------
// Computer: Esc (or P). Phone: the pause button at the top left. The game also pauses by itself when the page is hidden.
let paused = false, quitArmed = false;
const pauseEl = () => document.getElementById('pause');
const playing = () => !!(game && game.started && document.getElementById('menu').style.display === 'none');
const overlayOpen = () => !!document.querySelector('#about.open, #tut.open, #lb.open, #avedit.open, #rotate.open');
function refreshPauseText(){
  const t = (id, s) => { const el = document.getElementById(id); if (el) el.textContent = tr(s); };
  t('pausetitle', 'Paused'); t('presume', 'Resume'); t('pquit', quitArmed ? 'Tap again to quit' : 'Quit to menu'); t('phint', 'Press Esc to resume');
  const pb = document.getElementById('pausebtn'); if (pb) pb.setAttribute('aria-label', tr('Pause'));
}
function syncPauseUI(){
  const show = paused && playing();
  pauseEl().classList.toggle('open', show);
  document.getElementById('phint').style.display = IS_TOUCH ? 'none' : 'block';
  if (show) document.getElementById('presume').focus();
}
function pauseGame(){
  if (paused || !playing()) return;
  paused = true; quitArmed = false;
  input.strike = false; pad.id = null; pad.ux = pad.uy = 0; pad.kx = pad.ky = 0; actIds.clear(); stopWalk();   // let go of every control
  if (audio && audio.suspend) audio.suspend().catch(() => {});
  refreshPauseText(); syncPauseUI();
}
function resumeGame(){
  if (!paused) return;
  paused = false; quitArmed = false;
  if (audio && audio.resume && !muted) audio.resume().catch(() => {});
  syncPauseUI(); refreshPauseText();
}
function quitToMenu(){
  paused = false; quitArmed = false; stopSiren(); game.started = false; input.strike = false;
  pauseEl().classList.remove('open');
  document.getElementById('menu').style.display = 'flex';
  if (typeof showRole === 'function') showRole();
}
document.getElementById('pausebtn').onclick = pauseGame;
document.getElementById('presume').onclick = resumeGame;
document.getElementById('pquit').onclick = () => { if (!quitArmed){ quitArmed = true; refreshPauseText(); } else quitToMenu(); };
addEventListener('keydown', e => {
  if (e.key !== 'Escape' && e.key !== 'p' && e.key !== 'P') return;
  if (paused){ e.preventDefault(); resumeGame(); }
  else if (playing() && !overlayOpen()){ e.preventDefault(); pauseGame(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
addEventListener('pagehide', pauseGame);
// sound and pause sit side by side at the top middle; on a small screen they squeeze into the gap between the score bar (left) and the map (right)
let lastLay = '';
function layoutTopButtons(){
  const k = hudScale(), hudR = 310 * k, mapL = innerWidth - (role === 'police' ? 164 : 204) * k, gap = 6, pad = 6;
  const bs = Math.round(Math.max(30, Math.min(44, (mapL - hudR - 2 * pad - gap) / 2))), w = bs * 2 + gap;
  const left = Math.round(Math.max(hudR + pad, Math.min(innerWidth / 2 - w / 2, mapL - pad - w)));
  const key = bs + ',' + left; if (key === lastLay) return; lastLay = key;
  const st = document.documentElement.style; st.setProperty('--bs', bs + 'px'); st.setProperty('--pl', left + 'px'); st.setProperty('--ml', (left + bs + gap) + 'px');
}
addEventListener('resize', layoutTopButtons);
// the pause button shows only on touch screens, and only while a game is on
setInterval(() => { layoutTopButtons(); document.body.classList.toggle('canpause', IS_TOUCH && playing() && !paused); }, 250);
