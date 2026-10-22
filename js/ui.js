// ---------- shareable photo card ----------
function fitText(g, text, maxW, size, weight, family){
  let s = size; g.font = weight + ' ' + s + 'px ' + family;
  while (textW(g, text) > maxW && s > 14){ s -= 2; g.font = weight + ' ' + s + 'px ' + family; }
}
function rrect(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function starPath(g, cx, cy, R){ g.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * 0.45 : R; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); }
function lin(g, x0, y0, x1, y1, cols){ const l = g.createLinearGradient(x0, y0, x1, y1); cols.forEach((c, i) => l.addColorStop(i / (cols.length - 1), c)); return l; }
function hexPath(g, R){ g.beginPath(); for (let i = 0; i < 6; i++){ const a = Math.PI / 6 + i * Math.PI / 3; g.lineTo(Math.cos(a) * R, Math.sin(a) * R); } g.closePath(); }
// rank medal: stars, hexagon badge with gem, ribbon, wings for the top tiers
function rankMedal(g, T, cx, cy, s){
  g.save(); g.translate(cx, cy); g.scale(s, s);
  if (T.glow){ g.shadowColor = T.m[1]; g.shadowBlur = 28; }
  if (T.wings) for (const d of [-1, 1]){ g.fillStyle = lin(g, 0, -20, 0, 50, [T.m[0], T.m[2]]); g.strokeStyle = '#0008'; g.lineWidth = 2;
    for (let k = 0; k < 3; k++){ g.beginPath(); g.moveTo(d * 50, -14 + k * 14); g.lineTo(d * (92 - k * 6), -34 + k * 16); g.lineTo(d * (86 - k * 6), -12 + k * 16); g.lineTo(d * 50, 4 + k * 14); g.closePath(); g.fill(); g.stroke(); } }
  g.shadowBlur = 0;
  g.fillStyle = lin(g, 0, 40, 0, 110, T.ribbon); g.strokeStyle = '#0009'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-26, 38); g.lineTo(26, 38); g.lineTo(26, 108); g.lineTo(0, 90); g.lineTo(-26, 108); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#0003'; g.lineWidth = 5; g.beginPath(); g.moveTo(-9, 44); g.lineTo(-9, 94); g.moveTo(9, 44); g.lineTo(9, 94); g.stroke();
  g.strokeStyle = '#0009'; g.lineWidth = 4; g.fillStyle = lin(g, -40, -50, 40, 50, T.m); hexPath(g, 58); g.fill(); g.stroke();
  g.fillStyle = lin(g, 40, 50, -40, -50, T.m); g.lineWidth = 3; hexPath(g, 44); g.fill(); g.stroke();
  g.fillStyle = lin(g, -20, -20, 20, 20, [T.m[1], T.m[2]]); hexPath(g, 32); g.fill(); g.stroke();
  g.fillStyle = lin(g, -14, -14, 14, 14, ['#fff', T.m[0], T.m[1]]); g.lineWidth = 2; hexPath(g, 16); g.fill(); g.stroke();
  g.strokeStyle = '#fff9'; g.lineWidth = 3; g.beginPath(); g.moveTo(-6, 9); g.lineTo(6, -9); g.moveTo(1, 10); g.lineTo(11, -4); g.stroke();
  const sp = 34, x0 = -(T.stars - 1) * sp / 2;
  for (let i = 0; i < T.stars; i++){ g.fillStyle = lin(g, 0, -96, 0, -64, [T.m[0], T.m[1]]); g.strokeStyle = '#0008'; g.lineWidth = 2.5; starPath(g, x0 + i * sp, -80, 15); g.fill(); g.stroke(); }
  g.restore();
}
// trading-card layout: gold when the player wins, blue when detained or out of time
function renderCard(kind, info){
  const W = 720, H = 1000, win = kind === 'win';
  const pol = info.role === 'police';
  const tier = pol && info.tier;
  const T = tier ? tier
        : win ? {frame: '#f2cf45', edge: '#c79a12', strip: '#e8d27a', box: '#f7e9a8', ink: '#412402', art: '#2b2f3a', art2: '#343947', dot: '#d9a93a'}
                : {frame: '#7fb2e5', edge: '#185fa5', strip: '#b5d4f4', box: '#e1eefb', ink: '#042c53', art: '#1d2b4a', art2: '#27406b', dot: '#378add'};
  if (tier){ T.frame = tier.fr[0]; T.dot = tier.m[1]; }
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = tier ? lin(g, 0, 0, W, H, tier.fr) : T.frame; rrect(g, 0, 0, W, H, 38); g.fill();
  g.strokeStyle = T.edge; g.lineWidth = 6; rrect(g, 3, 3, W - 6, H - 6, 36); g.stroke();
  if (tier && tier.dark){ g.strokeStyle = '#e8b53a55'; g.lineWidth = 2; rrect(g, 14, 14, W - 28, H - 28, 28); g.stroke(); }
  g.textBaseline = 'alphabetic'; g.fillStyle = T.ink;

  // title row: name on the left, score on the right
  g.textAlign = 'left'; fitText(g, dispName(info.name), 330, 46, 'bold', BN_FONT); g.fillText(dispName(info.name), 44, 76);
  g.textAlign = 'right'; g.fillStyle = T.dot; g.strokeStyle = T.edge; g.lineWidth = 3; g.beginPath(); g.arc(W - 62, 60, 24, 0, 7); g.fill(); g.stroke();
  g.fillStyle = T.ink; starPath(g, W - 62, 61, 14); g.fill();
  g.font = 'bold 46px system-ui'; g.fillText(loc(info.score), W - 98, 76);
  const sw = g.measureText(loc(info.score)).width;
  g.font = 'bold 20px system-ui'; g.fillText(tr('SCORE'), W - 98 - sw - 10, 76);

  // art window: photo or avatar, with the stamp on top
  const AX = 36, AY = 100, AW = 648, AH = 440;
  g.fillStyle = '#e8e6dc'; rrect(g, AX - 8, AY - 8, AW + 16, AH + 16, 8); g.fill();
  g.save(); g.beginPath(); g.rect(AX, AY, AW, AH); g.clip();
  g.fillStyle = T.art; g.fillRect(AX, AY, AW, AH);
  g.strokeStyle = T.art2; g.lineWidth = 8; for (let k = -AH; k < AW; k += 28){ g.beginPath(); g.moveTo(AX + k, AY + AH); g.lineTo(AX + k + AH, AY); g.stroke(); }
  if (tier){ const rg = g.createRadialGradient(AX + AW / 2, AY + AH / 2, 10, AX + AW / 2, AY + AH / 2, 320); rg.addColorStop(0, tier.m[1] + '66'); rg.addColorStop(1, '#0000'); g.fillStyle = rg; g.fillRect(AX, AY, AW, AH); }
  g.translate(AX + AW / 2, AY);
  if (info.photo){
    const im = info.photo, k = Math.max(AW / im.width, AH / im.height), dw = im.width * k, dh = im.height * k;
    if (!win) g.filter = 'grayscale(0.7)';
    g.drawImage(im, (AW - dw) / 2 - AW / 2, (AH - dh) / 2, dw, dh); g.filter = 'none';
  } else if (pol) person(g, 0, AH - 100, {dress: BLUE, skin: info.skin, hat: 'cap', legs: '#14284f', scale: 9, stick: true, noBase: true});
  else person(g, 0, AH - 100, {dress: WHITE, skin: info.skin, hat: 'band', scale: 9, flag: win, noBase: true});
  g.save(); g.translate(0, info.photo || tier ? AH - 90 : 80); g.rotate(-0.2);
  const col = info.stampCol || (win ? '#27500a' : info.station ? '#c8102e' : '#5f5e5a');
  const label = info.stampLabel || tr(win ? 'VICTORY' : info.station ? 'DETAINED' : 'TIME UP');
  const sub = info.stampSub || (win ? tr('HELD THE MINAR') : info.station ? (isBn() ? tr(info.station) : info.station.toUpperCase()) : tr('DAY {n} ENDED', {n: MAX_DAY}));
  g.textAlign = 'center'; fitText(g, label, 440, 76, 'bold', 'system-ui'); const lw = g.measureText(label).width;
  fitText(g, sub, 440, 30, 'bold', 'system-ui'); const sbw = g.measureText(sub).width, bw = Math.max(lw, sbw, 240) + 44;
  g.fillStyle = 'rgba(247,244,234,.8)'; g.strokeStyle = col; g.lineWidth = 8; g.globalAlpha = 0.92; g.fillRect(-bw / 2, -62, bw, 140); g.strokeRect(-bw / 2, -62, bw, 140);
  g.fillStyle = col; fitText(g, label, 440, 76, 'bold', 'system-ui'); g.fillText(label, 0, 12);
  fitText(g, sub, 440, 30, 'bold', 'system-ui'); g.fillText(sub, 0, 56);
  g.restore(); g.restore();
  if (tier) rankMedal(g, tier, AX + 92, AY + 160, 1.15);

  // rank strip
  g.fillStyle = tier ? lin(g, AX, 0, AX + AW, 0, [T.strip, tier.fr[0], T.strip]) : T.strip; g.fillRect(AX, AY + AH + 14, AW, 40);
  g.fillStyle = T.ink; g.textAlign = 'left'; g.font = 'bold 24px ' + BN_FONT; g.fillText(tier ? info.rankBn + '  ·  ' + (isBn() ? tr(tier.metal) : tier.metal.toUpperCase()) : info.rankBn, AX + 14, AY + AH + 43);
  g.textAlign = 'right'; g.font = 'italic 20px system-ui'; g.fillText(info.dayText || tr('Andolon · Day {n} of {m}', {n: info.day, m: MAX_DAY}), AX + AW - 14, AY + AH + 42);

  // two "attack" rows: special tag, peak crowd
  const BY = AY + AH + 68;
  g.fillStyle = T.box; g.strokeStyle = T.edge; g.lineWidth = 3; rrect(g, AX, BY, AW, 232, 12); g.fill(); g.stroke();
  const row = (y, title, value, desc, icon) => {
    g.fillStyle = '#fff'; g.strokeStyle = T.edge; g.lineWidth = 3; g.beginPath(); g.arc(AX + 38, y, 20, 0, 7); g.fill(); g.stroke();
    g.fillStyle = tier && tier.dark ? '#2a1015' : T.ink;
    if (icon === 'star'){ starPath(g, AX + 38, y + 1, 12); g.fill(); }
    else { g.beginPath(); g.arc(AX + 31, y - 4, 5, 0, 7); g.arc(AX + 45, y - 4, 5, 0, 7); g.fill(); g.beginPath(); g.arc(AX + 31, y + 14, 9, Math.PI, 0); g.arc(AX + 45, y + 14, 9, Math.PI, 0); g.fill(); }
    g.fillStyle = T.ink; g.textAlign = 'left'; fitText(g, title, 360, 30, 'bold', 'system-ui'); g.fillText(title, AX + 74, y + 10);
    if (value != null){ g.textAlign = 'right'; g.font = 'bold 30px system-ui'; g.fillText(nd(value), AX + AW - 24, y + 10); }
    g.textAlign = 'left'; fitText(g, desc, AW - 100, 21, 'normal', 'system-ui'); g.fillText(desc, AX + 74, y + 42);
  };
  row(BY + 42, info.tagBn, null, info.tagDesc, 'star');
  row(BY + 144, info.row2Title || tr('Peak crowd'), info.row2Value != null ? info.row2Value : info.peak, info.row2Desc || tr('Most people marching with you at once.'), 'crowd');

  // footer stats
  const FY = BY + 232 + 26, cw = AW / 3;
  const foot = [[info.nextText[0], info.nextText[1]], [tr(info.newBest ? 'NEW BEST' : 'BEST SCORE'), loc(info.best)], info.foot3 || [tr('BARRICADES'), tr('{a} of {b}', {a: info.rings, b: RINGS.length})]];
  g.textAlign = 'center';
  foot.forEach((f, i) => { const x = AX + cw * i + cw / 2; g.fillStyle = T.ink; g.font = '17px system-ui'; g.fillText(f[0], x, FY); g.font = 'bold 28px system-ui'; g.fillText(f[1], x, FY + 32); });
  g.font = '16px system-ui'; g.textAlign = 'left'; g.fillText(tr('Fictional game · Play Andolon') + (location.protocol.startsWith('http') ? ' · ' + location.host + location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') : ''), AX, H - 22);
  g.textAlign = 'right'; g.fillText(nd(String(info.day).padStart(3, '0') + '/' + String(MAX_DAY).padStart(3, '0')), AX + AW, H - 22);
  return c;
}
const cardBlob = canvas => new Promise(r => canvas.toBlob(r, 'image/png'));
// On phones the share sheet is the way into the gallery ("Save Image" / "Save to Photos"); a plain download goes to Files on iPhone.
async function shareCard(canvas, text, saveMode){
  const blob = await cardBlob(canvas);
  const file = new File([blob], 'andolon.png', {type: 'image/png'});
  if (navigator.canShare && navigator.canShare({files: [file]})){
    try { await navigator.share(text ? {files: [file], text, title: 'Andolon'} : {files: [file]}); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  downloadCard(canvas, blob);
}
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function toast(msg){
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;left:50%;bottom:18%;transform:translateX(-50%);z-index:80;max-width:86%;background:rgba(0,0,0,.85);color:#fff;font:15px system-ui;padding:12px 16px;border-radius:10px;text-align:center';
  t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 5000);
}
function fileDownload(blob){
  const a = document.createElement('a'); a.download = 'andolon-card.png'; a.href = URL.createObjectURL(blob);
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
}
async function downloadCard(canvas, blob){
  blob = blob || await cardBlob(canvas);
  if (IS_IOS){   // iPhone: the share sheet has "Save Image"; otherwise show the picture to press and hold
    const file = new File([blob], 'andolon.png', {type: 'image/png'});
    if (navigator.canShare && navigator.canShare({files: [file]})){ try { await navigator.share({files: [file]}); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    saveOverlay(canvas); return;
  }
  fileDownload(blob);   // Android Chrome and desktop: a real download, which lands in Downloads and shows up in Gallery / Photos
  if (IS_TOUCH){ toast(tr('Card saved to your Downloads. Open Gallery or Google Photos and look in the Downloads folder.')); setTimeout(() => saveOverlay(canvas, true), 600); }
}
function saveOverlay(canvas, androidExtra){
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;gap:12px;color:#fff;font:16px system-ui;text-align:center';
  o.innerHTML = '<div>' + tr(androidExtra ? 'Saved! If you do not see it in Gallery, press and hold the card and tap <b>Download image</b>.' : 'Press and hold the card, then tap <b>Save to Photos</b> (or Save Image).') + '</div><img alt="' + tr('Your card') + '" style="max-width:100%;max-height:70vh;border-radius:10px" src="' + canvas.toDataURL('image/png') + '"><button style="padding:10px 24px;font-size:16px;border-radius:8px;border:0">' + tr('Close') + '</button>';
  o.querySelector('button').onclick = () => o.remove();
  document.body.appendChild(o);
}

// ---------- player photo (optional, stays in the browser) ----------
let playerPhoto = null;
function loadPhoto(file, cb){
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas');   // shrink big photos
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      playerPhoto = c; if (cb) cb();
    };
    im.src = rd.result;
  };
  rd.readAsDataURL(file);
}

// ---------- scoring ----------
function computeScore(won, outcome, live){
  const st = game.stats, crowd = followers.length + 1;
  let sc = st.recruits * SCORE.recruit + (won ? crowd : st.peak) * SCORE.crowd + st.rings * SCORE.ring + st.clashWins * SCORE.clash;
  if (won) sc += SCORE.win + Math.max(0, Math.round((TIME_PAR - game.t) * SCORE.speed));
  else if (!live) sc *= outcome === 'detained' ? SCORE.detained : SCORE.timeout;
  return Math.round(sc);
}
function rankFor(score){ let r = RANKS[0]; for (const x of RANKS) if (score >= x.min) r = x; return r; }
function pickTag(won, outcome){
  const st = game.stats;
  if (won){ if (game.t < 150) return TAGS.fast; if (st.beaten === 0) return TAGS.unbreakable; if (st.peak >= 60) return TAGS.mass; if (st.cures > 0) return TAGS.laststand; return TAGS.breaker; }
  return st.rings === 0 ? TAGS.first : st.rings >= 2 ? TAGS.inner : TAGS.mid;
}
function pickRoast(){
  const st = game.stats;
  if (st.stallT >= 25 || st.teas >= 3) return ROASTS.biriyani;
  if (st.peak < 5) return ROASTS.alone;
  if (st.rings === 0) return ROASTS.afraid;
  return ROASTS.fb;
}

// ---------- end / menu ----------
function end(won, info){
  info = info || {};
  stopSiren();
  game.started = false;
  const outcome = won ? 'win' : info.timeout ? 'timeout' : 'detained', st = game.stats, crowd = followers.length + 1;
  const score = computeScore(won, outcome), rank = rankFor(score);
  const tag = outcome === 'timeout' ? pickRoast() : pickTag(won, outcome);
  const tagBn = tag.bn || tag.tag, tagDesc = tag.desc;
  const nxt = RANKS.find(r => r.min > score);
  const nextText = nxt ? ['NEXT: ' + nxt.bn, loc((nxt.min - score)) + ' pts'] : ['NEXT RANK', 'Maxed'];
  let best = 0, newBest = false; try { best = +localStorage.getItem('da_best') || 0; if (score > best){ newBest = best > 0; localStorage.setItem('da_best', String(score)); best = score; } } catch (e) {}
  const mkInfo = () => ({name: playerName, skin: player.skin, station: info.station, timeout: !!info.timeout, score, rankBn: rank.bn, tagBn, tagDesc: tr(tag.desc), peak: st.peak, rings: st.rings, day: game.day, best, newBest,
    nextText: nxt ? [tr('NEXT: {n}', {n: nxt.bn}), tr('{n} pts', {n: loc(nxt.min - score)})] : [tr('NEXT RANK'), tr('Maxed')]});
  let canvas;
  const build = () => renderCard(won ? 'win' : 'lose', Object.assign({photo: playerPhoto}, mkInfo()));
  const box = document.getElementById('card');
  const show = () => {
    canvas = build();
    let head;
    if (won) head = '<h1>' + tr('Shaheed Minar <span>held!</span>') + '</h1><p>' + tr('Your crowd of <b>{n}</b> held the square on <b>Day {d}</b>.', {n: crowd, d: game.day}) + '</p>';
    else if (outcome === 'timeout') head = '<h1>' + tr('Day {n} <span>is over</span>', {n: MAX_DAY}) + '</h1><p>' + tr('You are a <b>{t}</b>. {d}', {t: tagBn, d: tr(tag.desc)}) + '</p>';
    else if (info.aynaghor) head = '<h1>' + tr('Taken to <span>Aynaghor</span>') + '</h1><p>' + tr('The police van took you to Aynaghor. The game is over.') + '</p>';
    else head = '<h1>' + tr('Detained at <span>{s}</span>', {s: tr(info.station)}) + '</h1><p>' + tr('You were caught by the police and taken by van. The game is over.') + '</p>';
    box.innerHTML = '<button id="langbtn" class="langbtn" type="button">' + (isBn() ? 'English' : 'বাংলা') + '</button>' + head + '<img id="cardimg" alt="Photo card" src="' + canvas.toDataURL('image/png') + '">' +
      '<label>' + tr('Put your own photo on the card (optional)') + '<input id="photo2" type="file" accept="image/*"></label>' +
      '<button id="share">' + tr('Share card') + '</button><button id="dl" class="alt">' + tr(IS_TOUCH ? 'Save to Photos' : 'Download') + '</button><button id="go">' + tr('March again') + '</button>' +
      (IS_TOUCH ? '<small>' + tr('Tip: tap Save to Photos, or press and hold the card, to keep it in your Gallery.') + '</small><br>' : '') +
      (playerPhoto ? '<button id="nophoto" class="alt">' + tr('Use default avatar') + '</button>' : '') +
      supportHTML() + '<a href="#" class="aboutlink">' + tr('About &amp; Disclaimer') + '</a><br>' +
      '<small>' + tr('Your photo stays on your device. It is only drawn onto this card. Fictional game; characters and events are not real people or incidents.') + '</small>';
    const text = won ? tr('I held the Central Shaheed Minar in Andolon! {r}, {s} pts.', {r: isBn() ? rank.bn : rank.en, s: loc(score)})
      : outcome === 'timeout' ? tr('Andolon called me "{t}". Can you do better?', {t: tagBn})
      : tr('I was detained at {st} in Andolon. {s} pts.', {st: tr(info.station), s: loc(score)});
    const refresh = () => { canvas = build(); document.getElementById('cardimg').src = canvas.toDataURL('image/png'); const b = document.getElementById('nophoto'); if (!b && playerPhoto){ const n = document.createElement('button'); n.id = 'nophoto'; n.className = 'alt'; n.textContent = tr('Use default avatar'); n.onclick = () => { playerPhoto = null; n.remove(); refresh(); }; document.getElementById('go').after(n); } };
    document.getElementById('photo2').onchange = e => loadPhoto(e.target.files[0], refresh);
    const np = document.getElementById('nophoto'); if (np) np.onclick = () => { playerPhoto = null; np.remove(); refresh(); };
    document.getElementById('share').onclick = () => shareCard(canvas, text);
    document.getElementById('dl').onclick = () => downloadCard(canvas);
    document.getElementById('go').onclick = start;
    document.getElementById('langbtn').onclick = () => { setLang(isBn() ? 'en' : 'bn'); show(); };
    addSwitch();
    addLeaderboard('protester', {score, rank: rank.en, stat: st.peak, day: game.day});
  };
  show();
  document.getElementById('menu').style.display = 'flex';
}

