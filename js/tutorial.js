// ---------- how-to-play tutorial: a few big cards, shown the first time each role is played ----------
function tutorialSteps(r){
  const touch = IS_TOUCH;
  if (r === 'police') return [
    {icon: '\u{1F3C3}', title: tr('You are fast'), text: tr(touch ? 'Hold the round pad to move.' : 'Move the mouse to walk.') + tr(' You are faster than any crowd and can run through barricades.')},
    {icon: '\u{1F46E}', title: tr('Build your squad'), text: tr('Walk into the blue officers on the streets to add them to your squad (up to 14). A bigger squad scatters more people.')},
    {icon: '\u{1F4A8}', title: tr('Break up the crowds'), text: tr(touch ? 'Tap STRIKE, SMOKE or FIRE. Nobody is hurt, people just run away.' : 'Click or Space to strike, G for smoke, F for warning shots. Nobody is hurt, people just run away.')},
    {icon: '\u{1F3DB}️', title: tr('Protect the Minar'), text: tr('Disperse {n} crowds before one holds the Shaheed Minar. Using force raises public anger, and at 100 you lose.', {n: DISPERSE_GOAL})},
  ];
  return [
    {icon: '\u{1F6B6}', title: tr('Walk and gather'), text: tr(touch ? 'Hold the round pad to walk.' : 'Move the mouse to walk.') + tr(' Walk into bystanders to bring them along.')},
    {icon: '\u{1F6A7}', title: tr('Pass the barricades'), text: tr(touch ? 'Bricks and barriers block the road. With enough people ({list}) stand at a checkpoint and tap STRIKE a few times to break it.' : 'Bricks and barriers block the road. With enough people ({list}) stand at a checkpoint and click or press Space a few times to break it.', {list: GATE_NEEDS.slice().reverse().join(', ')})},
    {icon: '\u{1F6E1}️', title: tr('Stay safe'), text: tr('Police sticks cost morale. Heal at hospitals or biryani stalls. If your morale runs out you will be detained.')},
    {icon: '\u{1F3DB}️', title: tr('Hold the Minar'), text: tr('Reach the Shaheed Minar with {a} people and hold it for {b} seconds. You have {c} days, about 4 minutes.', {a: NEED_CROWD, b: NEED_HOLD, c: MAX_DAY})},
  ];
}
const tutSeen = r => { try { return !!localStorage.getItem('da_tut_' + r); } catch (e) { return false; } };
function showTutorial(r, done){
  const steps = tutorialSteps(r), box = document.getElementById('tut'); let i = 0;
  const finish = () => {
    box.classList.remove('open'); document.removeEventListener('keydown', onKey);
    try { localStorage.setItem('da_tut_' + r, '1'); } catch (e) {}
    if (done) done();
  };
  const onKey = e => { if (e.key === 'Escape') finish(); };
  const render = () => {
    const s = steps[i], last = i === steps.length - 1;
    box.innerHTML = '<div class="tutcard ' + r + '"><div class="tuticon">' + s.icon + '</div><h2>' + s.title + '</h2><p>' + s.text + '</p>' +
      '<div class="tutdots">' + steps.map((_, k) => '<span' + (k === i ? ' class="on"' : '') + '></span>').join('') + '</div>' +
      '<button id="tutnext" type="button">' + tr(last ? (done ? "Let's go" : 'Got it') : 'Next') + '</button>' +
      (last ? '' : '<button id="tutskip" class="alt" type="button">' + tr('Skip') + '</button>') + '</div>';
    document.getElementById('tutnext').onclick = () => { if (last) finish(); else { i++; render(); } };
    const sk = document.getElementById('tutskip'); if (sk) sk.onclick = finish;
  };
  document.addEventListener('keydown', onKey);
  box.classList.add('open'); render();
}
