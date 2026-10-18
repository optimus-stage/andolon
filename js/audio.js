// ---------- sound (synthesised, no files) ----------
let audio = null, muted = false;
function ac(){
  if (!audio){ try { const A = typeof AudioContext !== 'undefined' ? AudioContext : (typeof webkitAudioContext !== 'undefined' ? webkitAudioContext : null); if (A) audio = new A(); } catch (e) {} }
  if (audio && audio.state === 'suspended') audio.resume();
  return audio;
}
function sfxWhack(){   // stick hitting: a noise crack plus a low thud
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  const len = Math.floor(a.sampleRate * 0.14), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = a.createBufferSource(); src.buffer = buf;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
  const g = a.createGain(); g.gain.value = 0.7; src.connect(lp); lp.connect(g); g.connect(a.destination); src.start(t);
  const o = a.createOscillator(), og = a.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
  og.gain.setValueAtTime(0.9, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o.connect(og); og.connect(a.destination); o.start(t); o.stop(t + 0.22);
}
function sfxStatic(){   // short burst of radio static while the internet is shut down
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  const len = Math.floor(a.sampleRate * 0.4), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (i % 900 < 300 ? 1 : 0.35);
  const src = a.createBufferSource(); src.buffer = buf; const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.7;
  const g = a.createGain(); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  src.connect(bp); bp.connect(g); g.connect(a.destination); src.start(t);
}
function sfxChime(){
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  [660, 880].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + i * 0.1); g.gain.exponentialRampToValueAtTime(0.25, t + i * 0.1 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.25);
    o.connect(g); g.connect(a.destination); o.start(t + i * 0.1); o.stop(t + i * 0.1 + 0.3); });
}
let lastJoin = 0;
function sfxJoin(){   // two quick rising blips; the pitch climbs a little as the crowd grows
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  if (t - lastJoin < 0.08) return; lastJoin = t;
  const base = 520 + Math.min(followers.length, 30) * 14;
  [base, base * 1.5].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + i * 0.07); g.gain.exponentialRampToValueAtTime(0.3, t + i * 0.07 + 0.015); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.16);
    o.connect(g); g.connect(a.destination); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.2); });
}
function sfxGunshot(){   // sharp crack plus a short pop
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  const len = Math.floor(a.sampleRate * 0.2), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
  const src = a.createBufferSource(); src.buffer = buf;
  const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
  const g = a.createGain(); g.gain.value = 0.8; src.connect(hp); hp.connect(g); g.connect(a.destination); src.start(t);
  const o = a.createOscillator(), og = a.createGain(); o.type = 'square';
  o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.08);
  og.gain.setValueAtTime(0.35, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  o.connect(og); og.connect(a.destination); o.start(t); o.stop(t + 0.12);
}
function sfxGrenade(){   // deep boom with a rumbling tail
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  const len = Math.floor(a.sampleRate * 1.0), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.6);
  const src = a.createBufferSource(); src.buffer = buf;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(120, t + 0.9);
  const g = a.createGain(); g.gain.value = 1.0; src.connect(lp); lp.connect(g); g.connect(a.destination); src.start(t);
  const o = a.createOscillator(), og = a.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(26, t + 0.9);
  og.gain.setValueAtTime(1.0, t); og.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
  o.connect(og); og.connect(a.destination); o.start(t); o.stop(t + 1.05);
}
function sfxWallBreak(){   // concrete cracking and crumbling
  if (muted) return; const a = ac(); if (!a) return; const t = a.currentTime;
  const crack = a.createBuffer(1, Math.floor(a.sampleRate * 0.12), a.sampleRate), cd = crack.getChannelData(0);
  for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / cd.length, 2);
  const cs = a.createBufferSource(); cs.buffer = crack; const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500;
  const cg = a.createGain(); cg.gain.value = 0.7; cs.connect(hp); hp.connect(cg); cg.connect(a.destination); cs.start(t);
  for (let k = 0; k < 6; k++){   // falling chunks
    const len = Math.floor(a.sampleRate * 0.14), b = a.createBuffer(1, len, a.sampleRate), d2 = b.getChannelData(0);
    for (let i = 0; i < len; i++) d2[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    const s2 = a.createBufferSource(); s2.buffer = b; const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 250 + Math.random() * 700; bp.Q.value = 0.8;
    const g2 = a.createGain(); g2.gain.value = 0.55 * (1 - k * 0.12); s2.connect(bp); bp.connect(g2); g2.connect(a.destination); s2.start(t + 0.05 + k * 0.08 + Math.random() * 0.03);
  }
  const o = a.createOscillator(), og = a.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(85, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.5);
  og.gain.setValueAtTime(0.9, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  o.connect(og); og.connect(a.destination); o.start(t); o.stop(t + 0.65);
}
let sirenNode = null;
function sfxSiren(){   // two-tone police wail that runs for the whole arrest
  if (muted) return; const a = ac(); if (!a) return; stopSiren(); const t = a.currentTime;
  const o = a.createOscillator(), g = a.createGain(), lp = a.createBiquadFilter();
  o.type = 'sawtooth'; lp.type = 'lowpass'; lp.frequency.value = 2200; g.gain.value = 0.13;
  o.frequency.setValueAtTime(650, t);
  for (let i = 0; i < 20; i++) o.frequency.linearRampToValueAtTime(i % 2 ? 650 : 1000, t + (i + 1) * 0.45);
  o.connect(lp); lp.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 9.5);
  sirenNode = {o, g, a};
}
function stopSiren(){
  if (!sirenNode) return;
  try { sirenNode.g.gain.cancelScheduledValues(sirenNode.a.currentTime); sirenNode.g.gain.setTargetAtTime(0, sirenNode.a.currentTime, 0.08); sirenNode.o.stop(sirenNode.a.currentTime + 0.4); } catch (e) {}
  sirenNode = null;
}
// Fight effects: sticks always; gunshots and grenade blasts now and then (sound plus a flash on screen)
let fx = [];
function addFx(x, y, kind){ fx.push({x, y, t: 0, kind}); }
const fxLife = kind => kind === 'boom' ? 1.1 : kind === 'dust' ? 0.9 : kind === 'join' ? 0.55 : 0.3;   // seconds an effect stays on screen
function fightSfx(x, y){
  sfxWhack();
  if (Math.random() < 0.45){ setTimeout(sfxGunshot, 120); addFx(x + rand(-25, 25), y + rand(-25, 10), 'shot'); }
  if (Math.random() < 0.18){ setTimeout(sfxGrenade, 250); addFx(x + rand(-45, 45), y + rand(-35, 35), 'boom'); }
}
function updateMute(){ const b = document.getElementById('mute'); if (b) b.textContent = muted ? '\u{1F507}' : '\u{1F50A}'; }
function toggleMute(){ muted = !muted; updateMute(); }
addEventListener('keydown', e => { if (e.key === 'm' || e.key === 'M') toggleMute(); });

