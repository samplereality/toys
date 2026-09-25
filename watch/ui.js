/* Neighborhood Watch — interface, persistence, feedback, ending. Requires engine.js (window.NW). */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const SAVE_KEY = 'nw.save.v2';

/* ------------------------------------------------------------------ state */
let G = NW.newState();
let D = { first: Date.now(), sessions: 0, playMs: 0, clicks: 0, looks: 0, away: 0, longestAway: 0, maxIdle: 0, resetHover: 0, lastSave: 0 };
const M = []; // cursor samples (fractions of the viewport), memory only
let lastInput = Date.now(), awayAt = null, sessionStart = Date.now();
const consoleLines = [];
let sound = false;

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY); if (!raw) return;
    const s = JSON.parse(raw);
    const fresh = NW.newState();
    G = Object.assign(fresh, s.G);
    for (const k of ['cams', 'mult', 'unlocked', 'done', 'fund', 'city', 'tmp', 'end']) G[k] = Object.assign(fresh[k], s.G[k] || {});
    G.resist = Object.assign(fresh.resist, s.G.resist || {});
    G.resist.alloc = Object.assign(fresh.resist.alloc, (s.G.resist || {}).alloc || {});
    G.resist.weak = Object.assign(fresh.resist.weak, (s.G.resist || {}).weak || {});
    G.resist.current = null;
    D = Object.assign(D, s.D || {});
    if (s.console) consoleLines.push(...s.console);
    sound = !!s.sound;
  } catch (e) { /* corrupt save: start over */ }
}
function save() {
  D.playMs += Date.now() - sessionStart; sessionStart = Date.now(); D.lastSave = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ G, D, sound, console: consoleLines.slice(-12) })); } catch (e) { /* storage unavailable */ }
}

/* ------------------------------------------------------------------ console */
function log(msg, cls) {
  consoleLines.push({ m: msg, c: cls || '' }); if (consoleLines.length > 40) consoleLines.shift();
  renderConsole();
}
function renderConsole() {
  const c = $('console'); c.innerHTML = '';
  for (const l of consoleLines.slice(-6)) { const d = document.createElement('div'); d.className = l.c; d.textContent = l.m; c.appendChild(d); }
}

/* ------------------------------------------------------------------ sound (tiny, optional) */
let AC = null;
function beep(f, dur, type, vol) {
  if (!sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.value = f; g.gain.value = vol || 0.03;
    o.connect(g); g.connect(AC.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur); o.stop(AC.currentTime + dur);
  } catch (e) { /* no audio */ }
}

/* ------------------------------------------------------------------ ambient sightings */
const AMBIENT = {
  1: ['Sighting: a cat.', 'Sighting: wind.', 'Sighting: the mail carrier, again. You post it anyway.', 'Sighting: someone slowed down in front of the house. They were parking.', 'Sighting: a child selling nothing.', 'Sighting: a moth, for eleven minutes.', 'Sighting: your neighbor waves at the camera. You are not there. You are watching.', 'Sighting: a package, delivered. You watched it be delivered.'],
  2: ['Sighting: a plate. A plate. A plate. Your plate.', 'Hotlist alert: a 2 read as a 7. A family on the shoulder for forty minutes.', 'A search from an agency you have not heard of, in a state you have not visited.', 'The HOA newsletter thanks the committee for a 0% change in crime.', 'Sighting: a shopper flagged for looking at the door. She was leaving.', 'A search reason field reads: "test".', 'Sighting: the store camera notes that you look tired.', 'An officer runs a plate 164 times. It belongs to his ex.'],
  3: ['Brushing detected: 48 seconds. Below target.', 'Sighting: a student closes the laptop. The camera sees the inside of a backpack for six hours.', 'Desk 41 has not looked at the screen for ninety seconds. A manager is notified.', 'Sleep score: 71. The number is meaningless. It is shown anyway.', 'The refrigerator reports a second dessert.', 'Sighting: a lens blinks. It is logged as a blink.', 'A wellness check is dispatched to someone who was crying in a backyard. They are fine. They are on a list.'],
  4: ['Brushing compliance across the region: 63%.', 'Onboarding: 11,000 new employees consented today. Average time on the consent screen: 1.1 seconds.', 'A church reports record attendance and record tears.', 'Sighting: a lens sees another lens seeing it.', 'Sighting: a student in a bedroom looks directly into the laptop. She knows.'],
  5: ['Sightings of sightings.', 'Sighting: a camera watches a camera being installed by a technician wearing a camera.', 'Every hour of every human is recorded. The recording is being recorded.', 'The system has run out of nouns.', 'Something outside the frame. There is no outside the frame.'],
};
let nextAmbient = 40;

/* ------------------------------------------------------------------ helpers */
function show(id) { const el = $(id); if (!el || !el.classList.contains('hidden')) return; el.classList.remove('hidden'); el.classList.add('appear'); }
function hide(id) { $(id).classList.add('hidden'); }
function costText(c) {
  const parts = [];
  if (c.s) parts.push(NW.fmtInt(c.s) + ' sightings');
  if (c.inf) parts.push(NW.fmtInt(c.inf) + ' inferences');
  if (c.susp) parts.push(NW.fmtInt(c.susp) + ' suspicion');
  if (c.clr) parts.push(c.clr + ' clearance');
  if (c.fund) parts.push(NW.fmtMoney(c.fund));
  if (c.imp) parts.push(c.imp + ' impunity');
  return parts.join(' · ') || 'free';
}
function fmtDur(ms) { const s = Math.round(ms / 1000); if (s < 60) return s + ' s'; const m = Math.floor(s / 60); return m < 60 ? `${m} min ${s % 60} s` : `${Math.floor(m / 60)} h ${m % 60} min`; }
function flash(el) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
function floatNum(txt) {
  const f = document.createElement('div'); f.className = 'float'; f.textContent = txt;
  f.style.left = (Math.random() * 40) + 'px'; f.style.top = (2 + Math.random() * 10) + 'px';
  $('floats').appendChild(f); setTimeout(() => f.remove(), 1000);
}

/* ------------------------------------------------------------------ cameras & projects DOM */
const camEls = {};
function renderCams() {
  for (const c of NW.CAMS) {
    if (!G.unlocked[c.id]) { if (camEls[c.id]) { camEls[c.id].remove(); delete camEls[c.id]; } continue; }
    if (!camEls[c.id]) {
      const d = document.createElement('div'); d.className = 'cam';
      d.innerHTML = `<div><span class="name">${c.name}${c.unit}</span> <span class="n"></span><span class="rate"></span></div>
        <div class="row"><button>Install</button> <span class="cost"></span></div><div class="flavor">${c.flavor}</div>`;
      d.querySelector('button').onclick = () => { if (NW.buyCam(G, c.id)) { flash(d); beep(520, .08, 'triangle'); if (G.cams[c.id] === 1 && c.id === 'doorbell') log('The doorbell camera is installed. It sees the porch. The porch is fine. You keep watching the porch.', ''); update(); } };
      $('camList').appendChild(d); camEls[c.id] = d; d.classList.add('appear');
      if (Object.keys(camEls).length > 1) log(`${c.name}: available.`, '');
    }
    const el = camEls[c.id], cost = NW.camCost(G, c.id);
    el.querySelector('.n').textContent = G.cams[c.id] ? `× ${NW.fmtInt(G.cams[c.id])}` : '';
    el.querySelector('.rate').textContent = G.cams[c.id] ? `${NW.fmtRate(c.rate * G.mult[c.id] * G.globalMult * NW.amnesiaMult(G))}/sec each` : `${NW.fmtRate(c.rate * G.mult[c.id] * G.globalMult * NW.amnesiaMult(G))}/sec`;
    el.querySelector('.cost').textContent = 'Cost: ' + NW.fmtInt(cost) + ' sightings' + (G.t < G.tmp.freezeUntil ? ' (installations paused)' : '');
    el.querySelector('button').disabled = G.s < cost || G.t < G.tmp.freezeUntil;
  }
}
const projEls = {};
function renderProjects() {
  const vis = NW.visibleProjects(G);
  const ids = new Set(vis.map(p => p.id));
  for (const id in projEls) if (!ids.has(id)) { projEls[id].remove(); delete projEls[id]; }
  for (const p of vis) {
    if (!projEls[p.id]) {
      const d = document.createElement('div'); d.className = 'proj'; d.tabIndex = 0; d.setAttribute('role', 'button');
      d.innerHTML = `<div class="title">${p.name}</div><div class="costs">${costText(p.cost)}</div><div class="sub">${p.desc}</div>`;
      d.onclick = () => { if (NW.buyProject(G, p.id, log)) { D.clicks++; beep(660, .12, 'triangle'); onProject(p); update(); } };
      d.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); d.click(); } };
      $('projects').appendChild(d); projEls[p.id] = d;
    }
    const el = projEls[p.id];
    el.classList.toggle('locked', !NW.afford(G, p.cost));
    const needRet = (p.cost.inf || 0) > NW.infMax(G);
    el.querySelector('.costs').textContent = costText(p.cost) + (needRet ? ' · needs more retention' : '');
  }
  if (vis.length) show('boxProjects');
}
function onProject(p) {
  save(); flash($('console'));
  if (p.id === 'unwatched') startEnding();
}

/* ------------------------------------------------------------------ resistance DOM */
function renderAlloc() {
  const a = $('alloc'); a.innerHTML = '';
  for (const k of NW.STATS) {
    const d = document.createElement('div');
    d.innerHTML = `<span>${NW.STATNAMES[k]}</span><span><button data-k="${k}" data-d="-1">−</button> <b>${G.resist.alloc[k]}</b> <button data-k="${k}" data-d="1">+</button></span>`;
    a.appendChild(d);
  }
  a.querySelectorAll('button').forEach(b => b.onclick = () => { if (NW.alloc(G, b.dataset.k, +b.dataset.d)) renderAlloc(); updateResist(); });
}
function updateResist() {
  const R = G.resist;
  if (!R.active && !R.won) { hide('boxResist'); return; }
  show('boxResist');
  $('impunity').textContent = R.impunity; $('influence').textContent = R.influence;
  $('influenceUsed').textContent = NW.STATS.reduce((s, k) => s + R.alloc[k], 0);
  $('wins').textContent = R.wins; $('losses').textContent = R.losses; $('mapped').textContent = R.mapped;
  const inc = R.current;
  if (R.won) $('incident').textContent = 'Resolved. There is no one left to ask.';
  else if (inc) $('incident').innerHTML = `<b>${NW.INCIDENTS[inc.type].name}</b> (${NW.STATNAMES[NW.INCIDENTS[inc.type].vs]}) — ${NW.INCIDENTS[inc.type].desc}`;
  else $('incident').textContent = 'Quiet. Someone is looking up at a pole.';
  $('rlog').innerHTML = R.log.slice(0, 4).map(e => `<div class="${e.win ? 'w' : 'l'}">${e.msg}</div>`).join('');
  drawBattle();
}
const bc = $('battle'), bctx = bc.getContext('2d');
function drawBattle() {
  const R = G.resist, w = bc.width, h = bc.height;
  const fg = getComputedStyle(document.body).getPropertyValue('--fg').trim() || '#111';
  bctx.clearRect(0, 0, w, h);
  const inc = R.current;
  bctx.font = '11px system-ui'; bctx.fillStyle = fg;
  if (R.won) { bctx.fillText('No incidents.', 8, 40); return; }
  if (!inc) { bctx.globalAlpha = .4; bctx.fillText('…', 8, 40); bctx.globalAlpha = 1; return; }
  const prog = 1 - inc.tl / 8;
  const mine = Math.max(1, R.alloc[NW.INCIDENTS[inc.type].vs] * 2), theirs = Math.max(1, Math.round(inc.power * 2));
  for (let i = 0; i < Math.min(40, mine); i++) { const y = 8 + (i * 37) % (h - 16), x = 10 + (i % 4) * 6 + prog * (w / 2 - 30); bctx.beginPath(); bctx.arc(x, y, 2.5, 0, 7); bctx.fill(); }
  bctx.fillStyle = '#b3261e';
  for (let i = 0; i < Math.min(40, theirs); i++) { const y = 12 + (i * 41) % (h - 16), x = w - 10 - (i % 4) * 6 - prog * (w / 2 - 30); bctx.beginPath(); bctx.arc(x, y, 2.5, 0, 7); bctx.fill(); }
  if (prog > .85) { bctx.fillStyle = fg; bctx.globalAlpha = (prog - .85) * 4; bctx.fillRect(w / 2 - 1, 0, 2, h); bctx.globalAlpha = 1; }
}

/* ------------------------------------------------------------------ update */
let acc = 0, lastS = 0;
function update() {
  if (G.total >= 12) show('boxCams');
  if (NW.ratePerSec(G) > 0) show('rateLine');
  if (G.done.binoculars || G.clickPct > 0) show('perLookLine');
  if (G.clearanceOn) show('boxVision');
  if (G.company) show('boxCompany');
  if (G.fund.on) show('boxFund');
  if (G.city.on) show('boxCity');
  if (G.done.predictive) show('donateRow');
  if (G.modelsForFunding) show('fundModelRow');
  if (G.coverageOn) show('boxCoverage');
  if (G.susp > 0) show('suspLine');
  if (G.birdsOn) show('birdLine');

  const sEl = $('sightings'); const sTxt = NW.fmtInt(G.s); if (sEl.textContent !== sTxt) sEl.textContent = sTxt;
  $('rate').textContent = NW.fmtRate(NW.ratePerSec(G));
  $('perLook').textContent = NW.fmtRate(NW.perClick(G));
  $('clearance').textContent = G.clearance;
  $('btnModel').disabled = G.clearance < 1; $('btnRet').disabled = G.clearance < 1;
  $('models').textContent = G.models; $('retention').textContent = G.retention;
  $('inf').textContent = NW.fmtInt(G.inf); $('infMax').textContent = NW.fmtInt(NW.infMax(G)); $('infRate').textContent = NW.fmtRate(NW.infPerSec(G));
  $('susp').textContent = NW.fmtInt(G.susp); $('birds').textContent = NW.fmtInt(G.birds);
  if (G.modelsForFunding) {
    $('modelFundCost').textContent = NW.fmtMoney(NW.modelFundCost(G)); $('retFundCost').textContent = NW.fmtMoney(NW.retFundCost(G));
    $('btnModelFund').disabled = G.fund.money < NW.modelFundCost(G); $('btnRetFund').disabled = G.fund.money < NW.retFundCost(G);
  }
  if (G.company) {
    $('brand').textContent = NW.brandName(G); $('amnesia').textContent = G.amnesia;
    const gain = NW.amnesiaOnRebrand(G); const can = NW.canRebrand(G);
    $('btnRebrand').disabled = !can;
    $('rebrandInfo').textContent = can ? `Rebrand now: Amnesia +${gain}` : `Amnesia on rebrand: +${gain}. Not yet worth forgetting.`;
  }
  if (G.fund.on) {
    $('money').textContent = NW.fmtMoney(G.fund.money); $('valuation').textContent = NW.fmtMoney(NW.valuation(G));
    const can = NW.canRaise(G); $('btnRaise').disabled = !can;
    $('raiseInfo').textContent = `${NW.ROUNDS[Math.min(G.fund.round, NW.ROUNDS.length - 1)]}: ${NW.fmtMoney(NW.raiseAmount(G))}`;
    $('fundNote').textContent = G.fund.cooldown > 0 ? `Investors are digesting. ${Math.ceil(G.fund.cooldown)} s.` : (can ? 'They are waiting in the lobby.' : `They want to see ${NW.fmtInt(G.fund.lastRate * 1.8)} sightings/sec first. Growth is the only story.`);
  }
  if (G.city.on) {
    $('cityN').textContent = G.city.n; $('cityRev').textContent = NW.fmtMoney(NW.cityIncome(G));
    $('cityCost').textContent = NW.fmtMoney(NW.cityCost(G)); $('btnCity').disabled = G.fund.money < NW.cityCost(G);
    $('donateCost').textContent = NW.fmtMoney(NW.donateCost(G)); $('btnDonate').disabled = G.fund.money < NW.donateCost(G);
  }
  if (G.coverageOn) {
    $('people').textContent = NW.fmtInt(G.people);
    $('coverage').textContent = G.coverage >= 100 ? '100%' : G.coverage.toFixed(G.coverage < 1 ? 5 : 2) + '%';
    $('covBar').style.width = Math.min(100, G.coverage) + '%';
  }
  renderCams(); renderProjects(); updateResist();
  document.body.dataset.stage = G.end.phase ? 6 : G.stage;
  $('stageName').textContent = ['', 'The window', 'The street', 'The body', 'The region', 'Everything', 'Subject 0'][G.end.phase ? 6 : G.stage] || '';
}

let last = performance.now();
function frame(now) {
  let dt = (now - last) / 1000; last = now;
  if (G.end.phase >= 4) { requestAnimationFrame(frame); return; }
  if (dt > 2) { const made = NW.catchUp(G, dt); if (made > 0) log(`While you were away: ${NW.fmtInt(made)} sightings. Nothing happened in any of them.`, ''); dt = 0; }
  NW.tick(G, dt, log);
  acc += dt;
  if (G.t >= nextAmbient && G.end.phase === 0) {
    const pool = AMBIENT[Math.min(5, G.stage)]; if (pool && NW.ratePerSec(G) > 0) log(pool[Math.floor(Math.random() * pool.length)], 'amb');
    nextAmbient = G.t + 45 + Math.random() * 60;
  }
  if (acc >= 0.1) { acc = 0; update(); }
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------------ dossier tracking */
function trackInput() { const now = Date.now(); if (!document.hidden) D.maxIdle = Math.max(D.maxIdle, now - lastInput); lastInput = now; }
document.addEventListener('mousemove', e => { trackInput(); if (M.length < 8000 && Math.random() < 0.35) M.push([e.clientX / innerWidth, e.clientY / innerHeight]); }, { passive: true });
document.addEventListener('pointerdown', () => { trackInput(); D.clicks++; }, { passive: true });
document.addEventListener('keydown', trackInput, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { awayAt = Date.now(); D.away++; }
  else if (awayAt) { D.longestAway = Math.max(D.longestAway, Date.now() - awayAt); awayAt = null; lastInput = Date.now(); }
});
$('reset').addEventListener('mouseenter', () => { D.resetHover++; });

/* ------------------------------------------------------------------ ending */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function drawHeat() {
  const c = $('heat'); c.width = innerWidth; c.height = innerHeight; const x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  for (const [fx, fy] of M) {
    const g = x.createRadialGradient(fx * c.width, fy * c.height, 0, fx * c.width, fy * c.height, 34);
    g.addColorStop(0, 'rgba(255,40,20,.10)'); g.addColorStop(1, 'rgba(255,40,20,0)');
    x.fillStyle = g; x.fillRect(fx * c.width - 34, fy * c.height - 34, 68, 68);
  }
  c.style.opacity = .95;
}
function dossierLines() {
  const playMs = D.playMs + (Date.now() - sessionStart);
  const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'unknown';
  const hour = new Date().getHours();
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  const touch = navigator.maxTouchPoints > 0, cores = navigator.hardwareConcurrency, mem = navigator.deviceMemory;
  return [
    ['Session opened', new Date(D.first).toLocaleString() + '.'],
    ['Time observed', fmtDur(playMs) + (D.sessions > 1 ? ` across ${D.sessions} visits.` : '.')],
    ['Clicks', `${NW.fmtInt(D.clicks)}. Looks out the window: ${NW.fmtInt(D.looks)}.`],
    ['Sightings, all time', `${NW.fmtInt(G.allTimeTotal)}.${G.rebrands ? ` Rebrands: ${G.rebrands}. Nobody remembers the first name.` : ''}`],
    ['Cursor', `${NW.fmtInt(M.length)} samples. Rendering.`, 'heat'],
    ['', 'This is where your hand has been.'],
    ['Attention', D.away ? `Looked away from this tab ${D.away} time${D.away > 1 ? 's' : ''}. Longest absence: ${fmtDur(D.longestAway)}.` : 'Never looked away from this tab. Noted.'],
    ['Stillness', D.maxIdle > 5000 ? `Longest period without input while watching: ${fmtDur(D.maxIdle)}. The subject was reading, or was elsewhere.` : 'The subject never stopped moving.'],
    ['Device', `${innerWidth}×${innerHeight} at ${devicePixelRatio}×. ${navigator.language}. ${tz}.${cores ? ` ${cores} cores.` : ''}${mem ? ` ${mem} GB.` : ''} ${touch ? 'Touch.' : 'No touch.'} ${dark ? 'Prefers dark.' : 'Prefers light.'}`],
    ['Local time', `${hour}:${String(new Date().getMinutes()).padStart(2, '0')}. ${hour >= 23 || hour < 5 ? 'Subjects awake at this hour are of interest.' : hour < 9 ? 'Before work.' : hour < 17 ? 'During work. Noted.' : 'After work.'}`],
    ['Hesitation', D.resetHover ? `Hovered over "delete all footage" ${D.resetHover} time${D.resetHover > 1 ? 's' : ''}. Did not click.` : 'Never once hovered over "delete all footage."'],
    ['', 'Subject 0 has been observed for the entire session. It did not notice. They never do.'],
  ];
}
async function startEnding(instant) {
  G.end.phase = Math.max(G.end.phase, 1); save();
  document.body.classList.add('dim');
  show('boxSubject');
  const dz = $('dossier'); dz.innerHTML = '';
  for (const [k, v, fx] of dossierLines()) {
    const d = document.createElement('div'); d.innerHTML = (k ? `<span class="k">${k}: </span>` : '') + v; dz.appendChild(d);
    if (fx === 'heat') drawHeat();
    if (!instant) await sleep(1500);
  }
  if (!instant) await sleep(1200);
  const b = document.createElement('div'); b.className = 'proj'; b.tabIndex = 0; b.setAttribute('role', 'button');
  b.innerHTML = `<div class="title">Install camera: Subject 0</div><div class="costs">free</div><div class="sub">The only unwatched thing in the room.</div>`;
  b.onclick = () => { b.remove(); installSubject(); };
  $('endActions').appendChild(b);
}
async function installSubject() {
  G.end.phase = 2; save();
  let stream = null;
  try { if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }); } catch (e) { stream = null; }
  if (stream) {
    show('camBox'); $('vid').srcObject = stream;
    log('Camera installed. Subject 0 is in frame.', 'project');
    const ov = $('vidOverlay'), ox = ov.getContext('2d');
    const labels = ['SUBJECT 0', 'brushing: not detected', 'expression: classifying…', 'expression: uncertain', 'posture: recorded', 'threat: low', 'threat: moderate', 'threat: low', 'sex: [withheld]', 'age: approximately', 'affect: watching', 'gaze: at the lens'];
    let n = 0; const t0 = performance.now();
    await new Promise(res => {
      const tick = () => {
        const el = (performance.now() - t0) / 1000;
        ov.width = ov.clientWidth; ov.height = ov.clientHeight; ox.clearRect(0, 0, ov.width, ov.height);
        const w = ov.width * .42, h = ov.height * .6, x = (ov.width - w) / 2, y = (ov.height - h) / 2 - 10;
        ox.strokeStyle = '#3f3'; ox.lineWidth = 2; ox.strokeRect(x + Math.sin(el * 2) * 3, y + Math.cos(el * 1.7) * 3, w, h);
        ox.fillStyle = '#3f3'; ox.font = '12px ui-monospace, monospace';
        ox.fillText(labels[Math.min(labels.length - 1, Math.floor(el / 1.1))], 8, 16); ox.fillText('REC ' + el.toFixed(1), 8, ov.height - 8);
        n += 0.5; $('subjClips').textContent = NW.fmtInt(n);
        if (el < 14) requestAnimationFrame(tick); else res();
      }; tick();
    });
    log('You looked at the lens. Everyone does, once.', '');
    stream.getTracks().forEach(t => t.stop()); $('vid').srcObject = null;
    await sleep(1500);
    log('The feed was never stored. That is the only feed of which this is true.', '');
  } else {
    log('Access denied. Refusal logged.', 'loss');
    await sleep(1800);
    log('Subjects who refuse are grouped as "privacy-seeking." Subject 0 has been flagged. The flag is permanent.', '');
    await sleep(1800);
    log('Everything else was already visible.', '');
  }
  await sleep(1500);
  finalChoice();
}
function finalChoice() {
  G.end.phase = 3; save();
  const a = $('endActions'); a.innerHTML = '<div><b>There is nothing left unwatched.</b></div>';
  const keep = document.createElement('button'); keep.textContent = 'Keep watching';
  const away = document.createElement('button'); away.textContent = 'Look away';
  keep.onclick = () => { keep.remove(); log('Of course.', ''); };
  away.onclick = () => lookAway();
  a.appendChild(keep); a.appendChild(away);
}
async function lookAway() {
  G.end.phase = 4; save();
  $('endActions').innerHTML = ''; $('heat').style.opacity = 0;
  const steps = [
    ['boxSubject', 'Subject 0: released.'],
    ['boxCoverage', 'Coverage: no longer measured.'],
    ['boxResist', 'The map is still up. Nobody needs it.'],
    ['boxCity', 'The cities: contracts lapse. The poles stay for a while, empty.'],
    ['boxFund', 'The investors: they have already moved on to something with teeth.'],
    ['boxCompany', 'The company: its last name is the one people remember.'],
    ['boxProjects', 'The projects: unwound, one by one, in reverse. The finch came back.'],
    ['boxVision', 'The models: powered down. The suspicion, for the first time, goes nowhere.'],
    ['boxCams', 'The cameras: contact lenses recalled. Beds dark. Toothbrushes just toothbrushes. Laptops with a sticker over the light. Poles empty. Store ceilings blank. The trail camera, unstrapped. The feeder, just a feeder. The doorbell, unscrewed.'],
  ];
  for (const [id, msg] of steps) { log(msg, ''); const el = $(id); if (el) { el.style.opacity = 0; await sleep(1700); el.classList.add('hidden'); } }
  await sleep(1500);
  finalState();
}
function finalState() {
  G.end.phase = 5; save();
  document.body.classList.remove('dim'); document.body.classList.add('gone'); document.body.dataset.stage = 1;
  $('sightings').textContent = '0'; hide('rateLine'); hide('perLookLine'); $('console').innerHTML = '';
  let looked = false;
  $('btnLook').onclick = async () => {
    if (looked) return; looked = true;
    $('sightings').textContent = '1';
    const c = $('console'); c.style.display = 'block'; c.innerHTML = ''; consoleLines.length = 0; log('Sighting: a cardinal, sex unknown.', '');
    await sleep(2500); log('Across the street, someone is looking out their window too.', '');
    await sleep(2500);
    const f = $('foot'); f.style.display = 'block'; f.innerHTML = '<a href="#" id="reset2">delete all footage</a> <span class="sub">(retention policy: forever)</span>';
    $('reset2').onclick = e => { e.preventDefault(); localStorage.removeItem(SAVE_KEY); location.reload(); };
  };
}

/* ------------------------------------------------------------------ wiring */
$('btnLook').onclick = () => {
  const n = NW.look(G); D.looks++;
  floatNum('+' + NW.fmtRate(n)); const big = $('sightings').parentElement; big.classList.remove('pulse'); void big.offsetWidth; big.classList.add('pulse');
  beep(880 + Math.random() * 120, .05, 'sine', .02);
  if (D.looks === 1) log('Sighting: the porch, at 3:14 p.m. Nothing happened. You look again.', '');
  if (D.looks === 12) log('Sighting: a car you do not recognize. It is a car.', '');
  update();
};
$('btnModel').onclick = () => { if (NW.buyModel(G)) { if (G.models === 1) log('A vision model. It watches the footage so you do not have to. Inferences accumulate.', ''); update(); } };
$('btnRet').onclick = () => { if (NW.buyRetention(G)) { if (G.retention === 1) log('Retention. Inferences can now be stored. So can everything else.', ''); update(); } };
$('btnModelFund').onclick = () => { NW.buyModel(G, true); update(); };
$('btnRetFund').onclick = () => { NW.buyRetention(G, true); update(); };
$('btnRaise').onclick = () => { if (NW.raise(G, log)) flash($('boxFund')); update(); };
$('btnCity').onclick = () => { NW.signCity(G, log); update(); };
$('btnDonate').onclick = () => { NW.donate(G, log); update(); };
$('btnRebrand').onclick = () => {
  if (!NW.canRebrand(G)) return;
  if (!confirm(`Rebrand ${NW.brandName(G)}? Everything resets: cameras, projects, funding, the map, the lawsuits. You keep Amnesia (+${NW.amnesiaOnRebrand(G)}) and the knowledge of how to build everything again.`)) return;
  NW.rebrand(G, log);
  for (const id in projEls) { projEls[id].remove(); delete projEls[id]; }
  for (const id in camEls) { camEls[id].remove(); delete camEls[id]; }
  for (const id of ['boxFund', 'boxCity', 'boxCoverage', 'boxResist', 'donateRow', 'fundModelRow', 'suspLine', 'birdLine']) hide(id);
  renderAlloc(); save(); update();
};
$('about').onclick = e => { e.preventDefault(); $('aboutBox').classList.remove('hidden'); };
$('aboutClose').onclick = () => $('aboutBox').classList.add('hidden');
$('reset').onclick = e => { e.preventDefault(); if (confirm('Delete all footage and start over? (Retention policy says forever. This button says otherwise.)')) { localStorage.removeItem(SAVE_KEY); location.reload(); } };
$('sound').onchange = e => { sound = e.target.checked; if (sound) beep(660, .1, 'triangle'); };
addEventListener('beforeunload', save);
addEventListener('resize', () => { if (G.end.phase >= 1 && G.end.phase < 4 && M.length) drawHeat(); });

/* ------------------------------------------------------------------ boot */
load();
D.sessions++;
$('sound').checked = sound;
renderAlloc();
if (D.lastSave && G.end.phase === 0) {
  const away = (Date.now() - D.lastSave) / 1000;
  if (away > 30) { const made = NW.catchUp(G, away); if (made > 0) log(`You were gone ${fmtDur(Math.min(away, 8 * 3600) * 1000)}. The cameras were not: ${NW.fmtInt(made)} sightings.`, ''); }
}
if (!consoleLines.length) log('Someone rang the doorbell while you were out. You would like to know who.', '');
renderConsole();
update();
if (G.end.phase === 5) finalState();
else if (G.end.phase >= 1) { startEnding(true).then(() => { if (G.end.phase >= 3) finalChoice(); }); }
setInterval(save, 5000);
requestAnimationFrame(frame);
})();
