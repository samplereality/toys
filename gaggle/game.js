/* Gaggle Safety™ — Community Growth Simulator
   A satirical incremental game about automated license plate reader (ALPR) surveillance.
   No build step, no dependencies. Everything below is plain browser JavaScript. */
(() => {
'use strict';

/* =========================================================================
   SOURCES — every incident the game throws at you is modeled on reporting.
   ========================================================================= */
const SOURCES = {
  roseville: { t: 'Flock cameras got the wrong license plate 71% of the time in one California city (Roseville PD analysis of 1,427 alerts, 2023–24)', u: 'https://gizmodo.com/flock-cameras-got-the-wrong-license-plate-71-of-the-time-in-california-city-2000793483' },
  ij27: { t: 'Institute for Justice: at least 27 documented cases of drivers mistakenly stopped, detained, or arrested after a Flock alert', u: 'https://www.yahoo.com/news/us/articles/case-case-every-reported-flock-175653036.html' },
  espanola: { t: 'Española, NM: sisters stopped after a camera read a 2 as a 7', u: 'https://www.pressreader.com/usa/santa-fe-new-mexican/20240109/281685439684949' },
  gunpoint: { t: 'Grandparents held at gunpoint in front of their 3-year-old granddaughter after a camera read an O as a 0', u: 'https://www.shastaunfiltered.com/post/flock-cameras-keep-getting-it-wrong-false-hits-gunpoint-stops-and-a-woman-jailed-for-a-hit-and-ru' },
  abortion: { t: '404 Media (May 2025): a Texas deputy searched 83,000 cameras across 6,809 networks; the logged reason was "had an abortion, search for female"', u: 'https://www.404media.co/a-texas-cop-searched-license-plate-cameras-nationwide-for-a-woman-who-got-an-abortion/' },
  abortion2: { t: 'EFF (Oct 2025): Flock and the sheriff called it a missing-person search. Records showed an abortion investigation.', u: 'https://www.eff.org/deeplinks/2025/10/flock-safety-and-texas-sheriff-claimed-license-plate-search-was-missing-person-it' },
  illinois: { t: 'Illinois Secretary of State audit (Aug 2025): Flock let U.S. Customs and Border Protection reach Illinois cameras through an undisclosed pilot program, violating state law', u: 'https://www.ilsos.gov/news/2025/august-25-2025-giannoulias-audit-finds-license-plate-reader-company-in-violation-of-state-law.html' },
  dayton: { t: 'Dayton, OH audit (May 2026): the city\'s cameras were searched 7,100+ times for immigration enforcement, which city policy prohibited', u: 'https://www.techtimes.com/articles/319317/20260629/flock-safety-crosses-100000-cameras-53-cities-cancel-over-unauthorized-federal-data-access.htm' },
  stalk: { t: 'Sedgwick, KS police chief ran his ex-girlfriend\'s plate 164 times (and her new boyfriend\'s 64 times)', u: 'https://www.aol.com/kansas-police-chief-used-flock-093300590.html' },
  stalk2: { t: 'Kechi, KS lieutenant sentenced after using plate readers to stalk his estranged wife', u: 'https://www.aol.com/news/were-spotted-ks-officer-used-203435582.html' },
  norfolk: { t: 'Norfolk, VA: 172 cameras; the police chief called it "a nice curtain of technology." Institute for Justice sued under the Fourth Amendment.', u: 'https://ij.org/press-release/judge-rules-lawsuit-challenging-norfolks-use-of-flock-cameras-can-proceed/' },
  norfolk2: { t: 'A federal judge ruled Norfolk\'s cameras constitutional in Feb 2026; the plaintiffs are appealing', u: 'https://www.whro.org/business-growth/2026-02-11/a-federal-judge-ruled-norfolks-flock-surveillance-cameras-dont-invade-peoples-privacy-yet' },
  nova: { t: '404 Media: Flock\'s "Nova" people-lookup tool was built to "jump from LPR to person" using data brokers and, per internal debate, breached data', u: 'https://www.404media.co/license-plate-reader-company-flock-is-building-a-massive-people-lookup-tool-leak-shows/' },
  fortune: { t: 'Fortune (Aug 2026): $8.3B valuation, $500M+ annual recurring revenue, 5,000+ communities, backed by a16z and Tiger Global', u: 'https://fortune.com/2026/08/24/flock-8-billion-startup-backed-a16z-tiger-surveillance-camera/' },
  scale: { t: '6,000+ communities in 49 states; more than 20 billion vehicle scans per month (July 2026)', u: 'https://en.wikipedia.org/wiki/Flock_Safety' },
  pricing: { t: 'What cities actually pay: roughly $3,000 per camera per year. It is a lease; the company takes the hardware back.', u: 'https://www.nationgraph.com/post/flock-camera-cost-2026' },
  cancels: { t: 'At least 82 contracts terminated between Aug 2021 and May 2026, across 28 states; the pace accelerated in 2026', u: 'https://stateofsurveillance.org/news/flock-safety-cancel-wave-30-cities-alpr-surveillance-contracts-2026/' },
  evanston: { t: 'Evanston and Oak Park, IL ended their contracts; Evanston covered its cameras with black trash bags while waiting for removal', u: 'https://abc7chicago.com/post/evanston-oak-park-end-contracts-flock-safety-license-plate-reader-company-investigation-illinois/17678137/' },
  vandal: { t: 'CNN (July 2026): cameras cut down with saws in upstate New York, painted over in Oakland, rammed with a truck in Idaho', u: 'https://www.cnn.com/2026/07/30/us/flock-camera-vandalism-protests-cec' },
  deflock: { t: 'DeFlock: Will Freeman\'s open-source project mapping ALPR cameras on OpenStreetMap, founded Oct 2024; 100,000+ cameras mapped by mid-2026', u: 'https://www.404media.co/the-open-source-project-deflock-is-mapping-license-plate-surveillance-cameras-all-over-the-world/' },
  marketing: { t: 'Flock\'s stated mission is to "eliminate crime." Its pitch leans on "70% of crime involves a vehicle" and a self-published claim of solving 10% of reported U.S. crime, which its own researchers have criticized.', u: 'https://research.contrary.com/company/flock-safety' },
  guardrails: { t: 'After the backlash, Flock cut its default retention to 7 days and announced "misuse safeguards" (Aug 2026). Critics called them band-aids.', u: 'https://www.police1.com/technology/flock-safety-sets-7-day-default-for-alpr-data-adds-mandatory-misuse-safeguards' },
  hawley: { t: 'Senator Josh Hawley\'s letter to Flock\'s CEO (Aug 26, 2026) and a Senate hearing the following month', u: 'https://davisvanguard.org/2026/09/senate-scrutinizes-flock-ai-surveillance/' },
  portal: { t: 'Flock "Transparency Portals" publish 30-day scan and hit counts; some also publish audit logs. Independent sites aggregate them.', u: 'https://eyesonflock.com/' },
  hibf: { t: 'Have I Been Flocked? lets you search published audit logs for searches that touched your area', u: 'https://haveibeenflocked.com/' },
  hoa: { t: 'Inman (Sept 2026): HOA cameras spark homebuyer backlash; disclosure rules haven\'t caught up', u: 'https://www.inman.com/2026/09/18/flock-cameras-real-estate-disclosure/' },
  tally: { t: 'Tallahassee voted unanimously in Sept 2026 to suspend its contracts and remove the cameras', u: 'https://www.newsweek.com/map-cities-rejected-deactivated-flock-cameras-12253499' },
  aclu: { t: 'ACLU: "Get the Flock Out" campaign and organizing toolkit', u: 'https://www.aclu.org/campaigns-initiatives/get-the-flock-out' },
  fftf: { t: 'Fight for the Future: "FLOCK Out" — surveillance does not make us safer', u: 'https://www.fightforthefuture.org/actions/flockout/' },
  fso: { t: 'flocksurveillance.org — organizing hub for communities pushing back', u: 'https://flocksurveillance.org/' },
  deflockorg: { t: 'deflock.org — map the cameras near you, and a guide to talking to your city council', u: 'https://deflock.org/' },
};

/* =========================================================================
   Utilities
   ========================================================================= */
const R = Math.random;
const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
const pick = arr => arr[Math.floor(R() * arr.length)];
const chance = p => R() < p;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = n => Math.round(n).toLocaleString('en-US');
const money = n => (n < 0 ? '−$' : '$') + fmt(Math.abs(n));
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function wpick(list) {
  const tot = list.reduce((a, e) => a + (e.w || 1), 0);
  let r = R() * tot;
  for (const e of list) { r -= (e.w || 1); if (r <= 0) return e; }
  return list[list.length - 1];
}

/* =========================================================================
   Config
   ========================================================================= */
const CFG = {
  quarterSec: 40,            // real seconds per fiscal quarter
  camPricePerYear: 3000,     // billed to the town
  installFee: 250,
  scanScale: 1000,           // each on-screen pass stands for ~1,000 vehicle trips
  hitPerScan: 0.014,
  misreadRate: 0.71,
  trustRegen: 0.035,         // per second
  extQueryEvery: [12, 24],   // seconds between external searches while National Lookup is on
  flavorEvery: [22, 40],
  budgetPerYear: 140000,
  towns: [
    { w: 7, h: 6, trust: 72, budget: 150000, cars: 34 },
    { w: 8, h: 7, trust: 62, budget: 190000, cars: 44 },
    { w: 9, h: 7, trust: 54, budget: 230000, cars: 52 },
  ],
};

/* =========================================================================
   Town generation
   ========================================================================= */
const NAME_A = ['Maple', 'Cedar', 'Willow', 'Fair', 'Spring', 'Oak', 'Pine', 'Lake', 'Elm', 'Birch', 'Clear', 'Stone'];
const NAME_B = ['field', 'haven', 'wood', 'mont', 'port', 'dale', 'brook', 'view', 'ridge', 'ville'];
const usedNames = new Set();
function townName() {
  let n; do { n = pick(NAME_A) + pick(NAME_B); } while (usedNames.has(n));
  usedNames.add(n); return n;
}

const BT = {
  homes:    { label: 'Homes',                color: '#d9e4cf', w: 12 },
  homes2:   { label: 'Apartments',           color: '#d4dccc', w: 4 },
  park:     { label: 'Park',                 color: '#b9d8a6', w: 3 },
  school:   { label: 'Elementary School',    color: '#f4e4b8', w: 1, sens: 'school' },
  clinic:   { label: "Women's Health Clinic", color: '#f1cfd6', w: 1, sens: 'clinic' },
  mosque:   { label: 'Mosque',               color: '#d8d2ea', w: 1, sens: 'mosque' },
  church:   { label: 'Church',               color: '#e3dcec', w: 1, sens: 'church' },
  synagogue:{ label: 'Synagogue',            color: '#dcd8ec', w: 1, sens: 'synagogue' },
  union:    { label: 'Union Hall',           color: '#f0d7b8', w: 1, sens: 'union' },
  immlaw:   { label: 'Immigration Law Office', color: '#f2d9c4', w: 1, sens: 'immlaw' },
  cityhall: { label: 'City Hall',            color: '#cfd9e8', w: 1, sens: 'cityhall' },
  library:  { label: 'Public Library',       color: '#cfe1e8', w: 1, sens: 'library' },
  dispensary:{ label: 'Dispensary',          color: '#cfe8d8', w: 1, sens: 'dispensary' },
  bar:      { label: 'Bar',                  color: '#e8d6cf', w: 1, sens: 'bar' },
  foodbank: { label: 'Food Bank',            color: '#e8e2cf', w: 1, sens: 'foodbank' },
  hoa:      { label: 'Gated Community (HOA)', color: '#e6e6e6', w: 1, sens: 'hoa' },
  diner:    { label: 'Diner',                color: '#ecd9cf', w: 2 },
  shops:    { label: 'Strip Mall',           color: '#e0e0d6', w: 3 },
  gas:      { label: 'Gas Station',          color: '#e6e0d0', w: 2 },
};
const MUST_HAVE = ['school', 'clinic', 'mosque', 'church', 'union', 'immlaw', 'cityhall', 'library', 'hoa', 'foodbank'];

function makeTown(index) {
  const spec = CFG.towns[Math.min(index, CFG.towns.length - 1)];
  const w = spec.w, h = spec.h;
  const blocks = [];
  const pool = Object.keys(BT).filter(k => !BT[k].sens).map(k => ({ k, w: BT[k].w }));
  const optionalSens = Object.keys(BT).filter(k => BT[k].sens && !MUST_HAVE.includes(k));
  for (let bj = 0; bj < h; bj++) for (let bi = 0; bi < w; bi++) blocks.push({ bi, bj, k: wpick(pool).k });
  const slots = blocks.map((_, i) => i).sort(() => R() - .5);
  const want = MUST_HAVE.concat(optionalSens.filter(() => chance(.6)));
  want.forEach((k, n) => { if (slots[n] != null) blocks[slots[n]].k = k; });
  const cars = [];
  for (let n = 0; n < spec.cars; n++) cars.push(makeCar(w, h));
  return {
    index, name: townName(), w, h, blocks, cars, cameras: [], camAt: {},
    trust: spec.trust, budget: spec.budget, budgetMax: spec.budget,
    sens: {}, cancelled: false, hearingAt: null, hearings: 0, bagged: false,
    scans: 0, cams: 0,
  };
}
function makeCar(w, h) {
  const axis = chance(.5) ? 'h' : 'v';
  return {
    axis, dir: chance(.5) ? 1 : -1,
    x: axis === 'h' ? R() * w : ri(0, w),
    y: axis === 'v' ? R() * h : ri(0, h),
    speed: .45 + R() * .35,
    color: pick(['#2b2b2b', '#5a6b7c', '#8a3b2f', '#e0e0e0', '#3b5b8a', '#9a9a9a', '#c9b35a', '#3f6b3f']),
  };
}
function blockAt(T, bi, bj) { return (bi < 0 || bj < 0 || bi >= T.w || bj >= T.h) ? null : T.blocks[bj * T.w + bi]; }
function adjacentBlocks(T, i, j) {
  return [blockAt(T, i - 1, j - 1), blockAt(T, i, j - 1), blockAt(T, i - 1, j), blockAt(T, i, j)].filter(Boolean);
}
function nodeTraffic(T, i, j) { return (T.traffic && T.traffic[i + ',' + j]) || 0; }

/* =========================================================================
   Game state
   ========================================================================= */
let S = null;
function newGame() {
  S = {
    t: 0, quarter: 0, paused: true, over: false,
    T: makeTown(0), townsDone: [],
    revenue: 0, arr: 0,
    scans: 0,               // lifetime raw passes
    crime: 100, crimeHist: Array(40).fill(100),
    hidden: [],             // unrevealed external queries
    hiddenSens: 0,
    nationalLookup: true, lookupRevertAt: null,
    upgrades: {}, guardrailsUsed: 0, guardrailsCooldown: 0, lobbyUntil: 0,
    trialUntil: null,
    nextExt: 14, nextFlavor: 20, nextBudgetCheck: 0, foiaDone: 0,
    stats: { cams: 0, scans: 0, hits: 0, misreads: 0, gunpoint: 0, arrests: 0, lawsuits: 0, recovered: 0,
      ext: 0, imm: 0, abortion: 0, stalk: 0, protest: 0, vandal: 0, replaced: 0, cuts: 0, revealed: 0, cancels: 0, honkFalse: 0, honkReal: 0, revenue: 0, towns: 1 },
    floats: [], feed: [], sound: false,
    seenPlacement: {},
  };
}

/* =========================================================================
   Feed & modal
   ========================================================================= */
function feed(text, cls, src) {
  const li = document.createElement('li');
  if (cls) li.className = cls;
  const tag = { warn: 'alert', good: 'result', ext: 'external', sales: 'sales', '': 'log' }[cls || ''] || cls;
  li.innerHTML = `<span class="when">${clockLabel()}</span><span class="tag">${tag}</span>${text}` +
    (src && SOURCES[src] ? ` <span class="src" data-src="${src}">source</span>` : '');
  const ol = $('feed');
  ol.prepend(li);
  while (ol.children.length > 70) ol.lastChild.remove();
}
function clockLabel() { return `FY${Math.floor(S.quarter / 4) + 1}·Q${(S.quarter % 4) + 1}`; }

const modalQ = [];
let modalOpen = false;
function modal(html, actions, opts = {}) {
  modalQ.push({ html, actions, opts });
  if (!modalOpen) nextModal();
}
function nextModal() {
  const m = modalQ.shift();
  if (!m) { modalOpen = false; if (!S.over && !S.introPending) S.paused = false; return; }
  modalOpen = true; S.paused = true;
  const body = $('modalBody');
  body.innerHTML = m.html + '<div class="actions"></div>';
  const act = body.querySelector('.actions');
  (m.actions || [{ label: 'OK' }]).forEach(a => {
    const b = document.createElement('button');
    b.className = 'btn ' + (a.cls || '');
    b.textContent = a.label;
    b.onclick = () => { $('modal').close(); if (a.fn) a.fn(); nextModal(); };
    act.appendChild(b);
  });
  const dlg = $('modal');
  dlg.oncancel = e => { e.preventDefault(); };
  if (!dlg.open) dlg.showModal();
}
function srcLink(id) { const s = SOURCES[id]; return s ? `<a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)}</a>` : ''; }

/* =========================================================================
   Sound (optional, tiny)
   ========================================================================= */
let AC = null;
function beep(freq, dur, type = 'square', vol = .04) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(AC.destination); o.start();
    g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + dur);
    o.stop(AC.currentTime + dur);
  } catch (e) { /* no audio */ }
}

/* =========================================================================
   Cameras
   ========================================================================= */
let camSeq = 0;
function installCamera(i, j, opts = {}) {
  const T = S.T, key = i + ',' + j;
  if (T.camAt[key]) return null;
  if (!opts.free && !opts.hoa) T.budget -= CFG.installFee;
  const cam = { id: ++camSeq, i, j, facing: bestFacing(i, j), mapped: false, bagged: false, flash: 0, scans: 0,
    free: !!opts.free, hoa: !!opts.hoa };
  T.cameras.push(cam); T.camAt[key] = cam; T.cams++; S.stats.cams++;
  recalcArr();
  if (!opts.silent) feed(`Goose™ reader #${cam.id} installed at ${gridName(i, j)}.` + (opts.free ? ' Free during trial.' : opts.hoa ? ' Billed to the HOA.' : ` Install fee ${money(CFG.installFee)}.`), 'sales');
  placementNotes(cam);
  beep(660, .08, 'triangle');
  renderPlaybook();
  return cam;
}
function gridName(i, j) { return String.fromCharCode(65 + i) + (j + 1); }
function bestFacing(i, j) {
  const T = S.T;
  const opts = [];
  if (i < T.w) opts.push(0); if (j < T.h) opts.push(1); if (i > 0) opts.push(2); if (j > 0) opts.push(3);
  return pick(opts);
}
function recalcArr() {
  const paying = S.T.cameras.filter(c => !c.free && !c.bagged).length;
  S.arr = paying * CFG.camPricePerYear + (S.upgrades.honk ? 25000 : 0) + (S.upgrades.gander ? 40000 : 0) + (S.upgrades.drone ? 60000 : 0) + (S.upgrades.retention ? 10000 : 0);
}
const PLACEMENT = {
  clinic:   ['Reader now records every vehicle entering the clinic lot. Great coverage.', 'placement'],
  mosque:   ['Reader covers the mosque entrance. Friday traffic will be very well documented.', 'placement'],
  church:   ['Reader covers the church parking lot. Sunday attendance, timestamped.', 'placement'],
  synagogue:['Reader covers the synagogue. Every Sabbath, every plate.', 'placement'],
  union:    ['Reader covers the union hall. The strike vote will have a guest list.', 'placement'],
  immlaw:   ['Reader covers the immigration law office. Clients photographed on the way in and out.', 'placement'],
  cityhall: ['Reader covers City Hall. Anyone who drives to a protest is now in the log.', 'placement'],
  library:  ['Reader covers the library. Patrons scanned twice per visit.', 'placement'],
  dispensary:['Reader covers the dispensary. Fully legal in this state. Not in the state that searches you.', 'placement'],
  bar:      ['Reader covers the bar parking lot. Departure times are now a matter of record.', 'placement'],
  school:   ['Reader covers the school pickup line. Every parent, twice a day, forever.', 'placement'],
  foodbank: ['Reader covers the food bank. A list of who needs help, by plate.', 'placement'],
  hoa:      ['Reader covers the gated community. Residents will be scanned leaving their own driveways.', 'placement'],
};
function placementNotes(cam) {
  for (const b of adjacentBlocks(S.T, cam.i, cam.j)) {
    const sens = BT[b.k].sens;
    if (!sens) continue;
    S.T.sens[sens] = true;
    if (!S.seenPlacement[sens]) {
      S.seenPlacement[sens] = true;
      feed(`<b>${esc(BT[b.k].label)}:</b> ${PLACEMENT[sens][0]}`, 'warn');
    }
  }
}
function autoPlace() {
  const T = S.T; let best = null, bestScore = -1;
  for (let j = 0; j <= T.h; j++) for (let i = 0; i <= T.w; i++) {
    if (T.camAt[i + ',' + j]) continue;
    const score = nodeTraffic(T, i, j) + R() * 3 + adjacentBlocks(T, i, j).filter(b => BT[b.k].sens).length * 2;
    if (score > bestScore) { bestScore = score; best = [i, j]; }
  }
  if (!best) return;
  const cam = installCamera(best[0], best[1]);
  if (cam) feed('Gaggle Placement AI™ selected a "high-value" intersection. It always does.', 'sales');
}

/* =========================================================================
   Cars
   ========================================================================= */
function updateCars(dt) {
  const T = S.T;
  for (const c of T.cars) {
    if (c.axis === 'h') {
      const prev = c.x; c.x += c.dir * c.speed * dt;
      const k = c.dir > 0 ? Math.floor(c.x) : Math.ceil(c.x);
      if ((c.dir > 0 && prev < k && k <= c.x) || (c.dir < 0 && prev > k && k >= c.x)) atNode(c, k, c.y);
    } else {
      const prev = c.y; c.y += c.dir * c.speed * dt;
      const k = c.dir > 0 ? Math.floor(c.y) : Math.ceil(c.y);
      if ((c.dir > 0 && prev < k && k <= c.y) || (c.dir < 0 && prev > k && k >= c.y)) atNode(c, c.x, k);
    }
  }
}
function atNode(c, i, j) {
  const T = S.T;
  T.traffic = T.traffic || {};
  T.traffic[i + ',' + j] = (T.traffic[i + ',' + j] || 0) + 1;
  const cam = T.camAt[i + ',' + j];
  if (cam && !cam.bagged) registerScan(cam, i, j);
  // choose direction
  const canH = d => (d > 0 ? i < T.w : i > 0), canV = d => (d > 0 ? j < T.h : j > 0);
  const cont = c.axis === 'h' ? canH(c.dir) : canV(c.dir);
  const turnOpts = c.axis === 'h' ? [1, -1].filter(canV) : [1, -1].filter(canH);
  if (turnOpts.length && (!cont || chance(.32))) {
    c.axis = c.axis === 'h' ? 'v' : 'h'; c.x = i; c.y = j; c.dir = pick(turnOpts);
  } else if (!cont) { c.dir = -c.dir; c.x = i; c.y = j; }
}
function registerScan(cam, i, j) {
  cam.scans++; cam.flash = 1; S.scans++; S.T.scans++; S.stats.scans++;
  if (chance(.25)) S.floats.push({ x: i, y: j, t: 0, txt: '+' + fmt(CFG.scanScale) });
  if (chance(CFG.hitPerScan)) hotlistHit(cam);
  if (S.upgrades.drone && chance(.5)) { S.scans++; S.T.scans++; S.stats.scans++; }
}

/* =========================================================================
   Hotlist hits: 71% of the time the plate is wrong.
   ========================================================================= */
const MISREADS = [
  { w: 55, txt: 'Alert: stolen vehicle. Officers stop a commuter. The plate had a 7; the camera read a 2. Released after 25 minutes on the shoulder.', trust: -1.2, src: 'espanola' },
  { w: 12, txt: 'Alert: felony vehicle. Two grandparents ordered out at gunpoint in front of their 3-year-old granddaughter. The camera read an O as a 0.', trust: -4.5, src: 'gunpoint', gun: true },
  { w: 12, txt: 'Alert: stolen vehicle. A teenager is proned out on the asphalt. Wrong state on the plate. The hotlist entry was from three years ago.', trust: -3.5, src: 'ij27', gun: true },
  { w: 9, txt: 'Alert: hit-and-run suspect. Driver arrested and jailed overnight. Charges dropped when someone finally looked at the photo.', trust: -5, src: 'ij27', arrest: true },
  { w: 6, txt: 'Alert: wanted vehicle. Family car towed with the groceries still inside. Different make, different color, one digit off.', trust: -2.5, src: 'ij27' },
  { w: 6, txt: 'Alert: stolen vehicle. A nurse driving home from a night shift, handcuffed on the hood. The plate belonged to a truck in another state.', trust: -4, src: 'roseville', gun: true },
];
const REALHITS = [
  { txt: 'Alert: stolen vehicle. Plate confirmed. Vehicle recovered from a parking lot.', trust: .6 },
  { txt: 'Alert: expired registration. Plate confirmed. A citation is issued.', trust: .1 },
  { txt: 'Alert: vehicle associated with a warrant. Plate confirmed. Driver taken into custody.', trust: .5 },
  { txt: 'Alert: Amber alert vehicle. Plate confirmed. Child located safe. Gaggle Marketing has been notified.', trust: 1.2 },
];
function hotlistHit(cam) {
  S.stats.hits++;
  beep(220, .12, 'sawtooth');
  if (chance(CFG.misreadRate)) {
    const m = wpick(MISREADS);
    S.stats.misreads++;
    if (m.gun) S.stats.gunpoint++;
    if (m.arrest) { S.stats.arrests++; if (chance(.5)) lawsuit(); }
    S.T.trust += m.trust;
    feed(`<b>Reader #${cam.id} misread.</b> ${m.txt}`, 'warn', m.src);
    if (S.stats.misreads === 1) feed('Gaggle Support: "The system works as designed. Officers should verify the plate before stopping." (They rarely do.)', '', 'roseville');
  } else {
    const h = pick(REALHITS);
    S.stats.recovered++;
    S.T.trust += h.trust;
    feed(`<b>Reader #${cam.id} hit.</b> ${h.txt}`, 'good');
  }
}
function lawsuit() {
  S.stats.lawsuits++;
  const amt = ri(25, 90) * 1000;
  S.T.budget -= amt;
  feed(`Lawsuit settled for ${money(amt)}. Per the contract's indemnification clause, the town pays. Gaggle pays nothing.`, 'warn', 'ij27');
}

/* =========================================================================
   External searches through National Lookup
   ========================================================================= */
const EXT = [
  { w: 20, kind: 'generic', txt: 'An agency in another state searched this town\'s readers. Reason logged: "investigation".' },
  { w: 12, kind: 'generic', txt: 'Out-of-state search. Reason logged: "test".' },
  { w: 8,  kind: 'generic', txt: 'A search from 900 miles away. Reason logged: "veh".' },
  { w: 10, kind: 'imm', txt: 'A federal border agency queried your readers through an "undisclosed pilot program." Nobody in town was told.', src: 'illinois', sens: true },
  { w: 10, kind: 'imm', txt: 'Immigration enforcement query against this town\'s readers. Local policy prohibits it. The software did not check.', src: 'dayton', sens: true },
  { w: 6,  kind: 'imm', burst: true, txt: 'Batch of searches for immigration enforcement. 7,100 in one audit period.', src: 'dayton', sens: true },
  { w: 7,  kind: 'abortion', txt: 'A sheriff\'s deputy 1,200 miles away ran a nationwide search that swept your readers. Reason logged: "had an abortion, search for female".', src: 'abortion', sens: true },
  { w: 5,  kind: 'stalk', txt: 'A police chief searched one woman\'s plate for the 164th time. She is his ex-girlfriend. He also searched her new boyfriend\'s.', src: 'stalk', sens: true },
  { w: 4,  kind: 'stalk', txt: 'An officer queried his estranged wife\'s plate. Later, a text: "you were spotted."', src: 'stalk2', sens: true },
  { w: 6,  kind: 'protest', cond: () => S.T.sens.cityhall, txt: 'Every plate near City Hall during Saturday\'s protest was exported to a spreadsheet.', src: 'norfolk', sens: true },
  { w: 6,  kind: 'imm', cond: () => S.T.sens.immlaw, txt: 'Query: all plates seen near the immigration law office this month.', src: 'dayton', sens: true },
  { w: 6,  kind: 'abortion', cond: () => S.T.sens.clinic, txt: 'Query from a state where abortion is a felony: all plates seen at the clinic in March.', src: 'abortion2', sens: true },
  { w: 5,  kind: 'protest', cond: () => S.T.sens.mosque, txt: 'Query: plates near the mosque on Fridays, cross-referenced with a watch list.', src: 'norfolk', sens: true },
  { w: 5,  kind: 'protest', cond: () => S.T.sens.union, txt: 'Query: plates parked at the union hall the night of the strike vote.', src: 'norfolk', sens: true },
  { w: 4,  kind: 'stalk', cond: () => S.T.sens.bar, txt: 'Query: who left the bar after midnight. Reason logged: "personal".', src: 'stalk', sens: true },
];
function externalQuery() {
  const cands = EXT.filter(e => !e.cond || e.cond());
  const e = wpick(cands);
  S.stats.ext++;
  if (e.kind === 'imm') S.stats.imm++;
  if (e.kind === 'abortion') S.stats.abortion++;
  if (e.kind === 'stalk') S.stats.stalk++;
  if (e.kind === 'protest') S.stats.protest++;
  const gander = S.upgrades.gander && e.sens ? ' Gander™ attached a name, a home address, and an employer.' : '';
  if (S.upgrades.portal) {
    S.T.trust -= e.sens ? (gander ? 4 : 2.5) : .4;
    feed(`${e.txt}${gander} <i>Published on your Transparency Portal.</i>`, 'ext', e.src);
  } else {
    S.hidden.push(e); if (e.sens) S.hiddenSens++;
    feed(`${e.txt}${gander} <i>Logged. Not disclosed.</i>`, 'ext', e.src);
  }
  if (S.stats.ext === 1) feed('You were not asked to approve that search. Neither was the town. That is what a network is.', '', 'abortion');
}
function reveal(how) {
  if (!S.hidden.length) { feed(`${how}: the log is empty. For now.`, ''); return; }
  const n = S.hidden.length, sens = S.hiddenSens;
  const pen = clamp(sens * (S.upgrades.gander ? 4 : 2.6) + (n - sens) * .3, 2, 34);
  S.T.trust -= pen;
  S.stats.revealed += n;
  feed(`<b>${how}:</b> ${n} outside searches disclosed, ${sens} of them for immigration, abortion, protest, or an ex. Trust −${pen.toFixed(0)}.`, 'warn', 'hibf');
  S.hidden = []; S.hiddenSens = 0;
}

/* =========================================================================
   Flavor & choice events
   ========================================================================= */
function flavorEvent() {
  const T = S.T, cams = T.cameras.length;
  const list = [
    { w: 10, cond: () => cams >= 3, fn: foiaEvent },
    { w: 6,  cond: () => cams >= 6 && S.t > S.lobbyUntil, fn: stateAudit },
    { w: 6,  cond: () => cams >= 4, fn: councilQuestion },
    { w: 5,  cond: () => S.upgrades.honk, fn: honkEvent },
    { w: 4,  cond: () => S.upgrades.gander && !S.ganderScandal, fn: ganderScandal },
    { w: 4,  cond: () => S.upgrades.hoa, fn: () => { T.trust -= 2; feed('Homebuyers discover the HOA readers only after closing. The listing did not mention them.', 'warn', 'hoa'); } },
    { w: 4,  cond: () => S.upgrades.drone, fn: () => { T.trust -= 3; feed('Drone as First Responder followed three teenagers to a birthday party. Alert was a false plate hit.', 'warn', 'ij27'); } },
    { w: 5,  cond: () => cams >= 5, fn: () => { feed('Gaggle Marketing: "70% of crime involves a vehicle." So does 100% of commuting.', 'sales', 'marketing'); } },
    { w: 4,  cond: () => cams >= 8, fn: () => { feed('Quarterly Impact Report™ mailed to council: "Your readers helped solve crime." No case numbers were included.', 'sales', 'marketing'); } },
    { w: 4,  cond: () => cams >= 10, fn: () => { T.trust -= 2; feed('Local paper: reported crime is flat since the readers went up. Gaggle: "Imagine how bad it would be without them."', 'warn', 'marketing'); } },
    { w: 3,  cond: () => cams >= 12, fn: () => { feed('The police chief tells a reporter the goal is "a nice curtain of technology" so nobody can drive anywhere without passing a reader.', '', 'norfolk'); } },
    { w: 3,  cond: () => cams >= 12, fn: () => { T.trust -= 3; feed('Residents file a Fourth Amendment lawsuit. The judge, for now, says a curtain is not a search.', 'warn', 'norfolk2'); } },
    { w: 4,  cond: () => S.stats.misreads >= 3, fn: () => { feed('An independent analysis of the alerts finds the plate was wrong 71% of the time. Gaggle disputes the methodology.', 'warn', 'roseville'); } },
    { w: 4,  cond: () => S.stats.cancels >= 1, fn: () => { feed('A senator sends Gaggle a letter with 14 questions. Gaggle responds with a blog post.', '', 'hawley'); } },
    { w: 3,  cond: () => cams >= 6, fn: () => { feed('Volunteers with binoculars are walking the town, adding readers to an open map. It is legal. It is public. They call it birdwatching.', 'ext', 'deflock'); } },
  ].filter(e => e.cond());
  if (list.length) wpick(list).fn();
}
function foiaEvent() {
  modal(`<div class="kicker">Public records request</div><h2>A local journalist requests the reader audit logs.</h2>
    <p>State law says the logs are public. Your sales playbook says "trade secret."</p>
    <p class="fine">Unrevealed searches in the log: <b>${S.hidden.length}</b> (${S.hiddenSens} sensitive).</p>`, [
    { label: 'Release the logs', cls: 'secondary', fn: () => { S.foiaDone++; reveal('Records request'); } },
    { label: 'Claim trade secret; delay 90 days', fn: () => { S.T.trust -= 2; feed('Records request stalled. The reporter files an appeal and a story about the stall.', 'warn', 'hibf'); scheduleReveal(CFG.quarterSec * .9, 'Appeal granted'); } },
  ]);
}
function scheduleReveal(inSec, how) { S.pendingReveal = { at: S.t + inSec, how }; }
function stateAudit() {
  feed('The Secretary of State opens an audit of plate reader data sharing.', 'warn', 'illinois');
  scheduleReveal(6, 'State audit');
}
function councilQuestion() {
  modal(`<div class="kicker">Council work session</div><h2>"Does your system share our data with immigration enforcement?"</h2>
    <p>A council member asks on the record. National Lookup is currently <b>${S.nationalLookup ? 'ON' : 'OFF'}</b>. Hidden log entries: <b>${S.hidden.length}</b>.</p>`, [
    { label: '"Gaggle has no contract with ICE."', fn: () => { feed('You said Gaggle has no contract with ICE. Technically true. The network does not need a contract.', 'sales', 'illinois'); S.T.trust += 1; S.councilLied = (S.councilLied || 0) + 1; } },
    { label: 'Explain how National Lookup works', cls: 'secondary', fn: () => { S.T.trust -= 4; feed('You explained that any of thousands of agencies can search the town\'s readers. The room went quiet.', 'warn', 'abortion'); } },
  ]);
}
function honkEvent() {
  if (chance(.8)) { S.stats.honkFalse++; S.T.trust -= 2; feed(pick(['Honk™ detected gunfire. Armed response dispatched to a quinceañera. It was fireworks.', 'Honk™ detected gunfire. Six units to a construction site. Nail gun.', 'Honk™ detected gunfire. Officers surround a pickup truck. Backfire.']), 'warn', 'guardrails'); }
  else { S.stats.honkReal++; feed('Honk™ detected gunfire. Confirmed shots fired. Nobody was caught. The reported crime index did not move.', 'good'); }
}
function ganderScandal() {
  S.ganderScandal = true;
  modal(`<div class="kicker">Internal Slack leak</div><h2>Engineers say Gander™ is built on breached data.</h2>
    <p>Some of the "commercially available data" that lets officers jump from a plate to a person came from a hacked parking app. Employees are uncomfortable. A reporter has the Slack messages.</p>`, [
    { label: 'Ship it. Say it does not use breached data.', fn: () => { S.T.trust -= 12; feed('Gaggle: "Gander does not use breached data." A security researcher reads the code and finds otherwise.', 'warn', 'nova'); } },
    { label: 'Pull the breached sources (refund $20,000)', cls: 'secondary', fn: () => { S.T.budget += 20000; S.T.trust -= 4; feed('Gander™ relaunched with "verified" sources only. It still turns a plate into a home address.', 'warn', 'nova'); } },
  ]);
}

/* =========================================================================
   Playbook (upgrades)
   ========================================================================= */
const PLAYS = [
  { id: 'trial', name: '60-Day Free Trial', price: 0, once: true,
    desc: 'Five readers, free, on us. Auto-renews at list price. Nobody reads the second sentence.',
    can: () => true,
    fn: () => { for (let n = 0; n < 5; n++) autoPlaceFree(); S.trialUntil = S.t + CFG.quarterSec * 1.5; feed('Free trial live. Five readers scanning. Auto-renewal in 60 days.', 'sales', 'pricing'); } },
  { id: 'guardrails', name: 'Announce "Guardrails"', price: 0, repeat: true,
    desc: 'Publish a blog post about privacy. Trust goes up. The readers do not change.',
    can: () => S.t >= S.guardrailsCooldown,
    fn: () => { const gain = Math.max(1, 7 - S.guardrailsUsed * 2); S.guardrailsUsed++; S.guardrailsCooldown = S.t + CFG.quarterSec; S.T.trust += gain; feed(`Blog post: "Our Commitment to Privacy." Retention default lowered from 30 days to 7. Trust +${gain}. Nothing else changed.`, 'sales', 'guardrails'); } },
  { id: 'portal', name: 'Transparency Portal™', price: 0, once: true,
    desc: 'Publish a public dashboard. Trust +5. Also publishes your audit log. Every search, live, forever.',
    can: () => true,
    fn: () => { S.T.trust += 5; feed('Transparency Portal live. Outside searches are now visible the moment they happen.', 'sales', 'portal'); reveal('Portal launch'); } },
  { id: 'honk', name: 'Honk™ Gunshot Detection', price: 25000, once: true,
    desc: 'Microphones on every pole. Detects gunfire, fireworks, nail guns, and quinceañeras.',
    can: () => S.T.cameras.length >= 4,
    fn: () => { feed('Honk™ installed. Every loud noise is now a dispatch.', 'sales'); } },
  { id: 'retention', name: 'Extended Retention (365 days)', price: 10000, once: true,
    desc: 'Why keep 30 days when you could keep a year? Investigators love history. So do subpoenas.',
    can: () => S.T.cameras.length >= 4,
    fn: () => { CFG.hitPerScan *= 1.15; feed('Retention extended to a year. Every outside search now returns twelve times as much of the town.', 'sales', 'guardrails'); } },
  { id: 'gander', name: 'Gander™ People Lookup', price: 40000, once: true,
    desc: 'Jump from plate to person: home, employer, relatives. Powered by "commercially available data."',
    can: () => S.T.cameras.length >= 8,
    fn: () => { feed('Gander™ enabled. A plate is now a person, an address, and a household.', 'sales', 'nova'); } },
  { id: 'hoa', name: 'HOA Partner Program', price: 0, once: true,
    desc: 'The gated community pays for its own readers. Their data joins the network anyway.',
    can: () => S.T.sens.hoa || S.T.blocks.some(b => b.k === 'hoa'),
    fn: () => { const b = S.T.blocks.find(b => b.k === 'hoa'); const spots = [[b.bi, b.bj], [b.bi + 1, b.bj], [b.bi, b.bj + 1], [b.bi + 1, b.bj + 1]]; let n = 0; for (const [i, j] of spots) { if (installCamera(i, j, { hoa: true, silent: true })) n++; } feed(`${n} HOA readers installed at the gate. Private money, public network.`, 'sales', 'hoa'); } },
  { id: 'drone', name: 'Drone as First Responder', price: 60000, once: true,
    desc: 'Flies to every alert. Scans everything on the way. Doubles your KPI.',
    can: () => S.T.cameras.length >= 12,
    fn: () => { feed('Drone program launched. Scans per reader up 50%. Alerts are still 71% wrong; now they arrive from above.', 'sales'); } },
  { id: 'lobby', name: 'Government Affairs', price: 15000, once: true,
    desc: 'Draft a model bill. No state audits for four quarters. Billed to the town as a "compliance surcharge."',
    can: () => S.T.cameras.length >= 6,
    fn: () => { S.lobbyUntil = S.t + CFG.quarterSec * 4; feed('Model bill drafted. The audit that was scheduled is no longer scheduled.', 'sales', 'hawley'); } },
];
function autoPlaceFree() {
  const T = S.T; const opts = [];
  for (let j = 0; j <= T.h; j++) for (let i = 0; i <= T.w; i++) if (!T.camAt[i + ',' + j]) opts.push([i, j]);
  if (!opts.length) return; const [i, j] = pick(opts); installCamera(i, j, { free: true, silent: true });
}
function buyPlay(p) {
  if (S.upgrades[p.id] && p.once) return;
  if (!p.can()) return;
  if (p.price) { S.T.budget -= p.price; }
  S.upgrades[p.id] = true; recalcArr();
  p.fn(); renderPlaybook();
}
function renderPlaybook() {
  const el = $('playbook'); el.innerHTML = '';
  for (const p of PLAYS) {
    const bought = S.upgrades[p.id] && p.once;
    const div = document.createElement('div');
    div.className = 'play' + (bought ? ' bought' : '');
    const price = p.price ? money(p.price) + (p.id === 'lobby' ? ' (surcharge)' : '') : 'Free';
    div.innerHTML = `<div><h4>${p.name} <span class="price">${price}</span></h4><p>${p.desc}</p></div>`;
    const b = document.createElement('button'); b.className = 'btn small';
    b.textContent = bought ? 'Active' : (p.repeat && !p.can() ? 'Cooldown' : (p.price ? 'Bill the town' : 'Enable'));
    b.disabled = bought || !p.can();
    b.onclick = () => buyPlay(p);
    div.appendChild(b); el.appendChild(div);
  }
}

/* =========================================================================
   Birdwatchers, vandalism, council, cancellation
   ========================================================================= */
function birdwatch(dt) {
  const T = S.T; if (T.cancelled) return;
  const total = T.cameras.length; if (!total) return;
  const mapped = T.cameras.filter(c => c.mapped).length;
  const frac = mapped / total;
  const base = 0.0015 + 0.011 * (1 - T.trust / 100) + 0.006 * frac + 0.004 * S.townsDone.length;
  for (const c of T.cameras) {
    if (!c.mapped && chance(base * dt)) {
      c.mapped = true;
      const m2 = mapped + 1;
      if (m2 === 1) feed('A volunteer added reader #' + c.id + ' to the open map, with the direction it faces.', 'ext', 'deflock');
      else if (m2 === Math.ceil(total / 2)) feed('Half the readers in town are now on the public map. Nothing about them is secret anymore.', 'ext', 'deflock');
    }
    if (c.mapped && !c.bagged && T.trust < 30 && chance(0.004 * dt * (1 - T.trust / 30))) vandalize(c);
  }
  if (!T.hearingAt && frac >= .5 && T.trust < 40 && !T.cancelled) {
    T.hearingAt = S.t + CFG.quarterSec * .8;
    feed('<b>Item 7b added to the next council agenda:</b> "Discussion of Gaggle Safety contract." Public comment expected.', 'warn', 'cancels');
  }
}
function vandalize(c) {
  S.stats.vandal++;
  const T = S.T;
  feed(`Reader #${c.id} ${pick(['cut down with a battery saw', 'painted over', 'yanked off its pole', 'rammed by a pickup', 'wrapped in a garbage bag'])}. Gaggle bills the town ${money(3000)} for a replacement. The hardware was never the town\'s.`, 'warn', 'vandal');
  T.budget -= 3000; S.stats.replaced++;
  c.flash = 0;
}
function councilHearing() {
  const T = S.T; T.hearingAt = null; T.hearings++;
  const mapped = T.cameras.filter(c => c.mapped).length;
  modal(`<div class="kicker">Council meeting · Item 7b</div><h2>Public comment runs ninety minutes.</h2>
    <p>Residents brought printouts of the audit log, a map of ${mapped} readers, and the ${S.stats.misreads} wrong-plate stops. Reported crime is at index ${Math.round(S.crime)}, where it started.</p>
    <p>Trust is at <b>${Math.round(T.trust)}</b>. You get three minutes at the podium.</p>`, [
    { label: 'Present the Crime Eliminated™ slide', fn: () => hearingOutcome('slide') },
    { label: 'Offer a 20% discount and new "guardrails"', fn: () => hearingOutcome('discount') },
    { label: 'Offer to turn off National Lookup', cls: 'secondary', fn: () => hearingOutcome('lookup') },
  ]);
}
function hearingOutcome(choice) {
  const T = S.T;
  let bonus = 0;
  if (choice === 'slide') { bonus = T.hearings === 1 ? 6 : 1; feed('You presented Crime Eliminated™: ' + elimPct() + '%. A council member asks which crimes. You cite a whitepaper Gaggle wrote.', 'sales', 'marketing'); }
  if (choice === 'discount') { bonus = 8; feed('Discount accepted in principle. Guardrails announced. The readers keep scanning during the discussion.', 'sales', 'guardrails'); }
  if (choice === 'lookup') { bonus = 10; S.nationalLookup = false; $('tglNational').checked = false; S.lookupRevertAt = S.t + CFG.quarterSec * 1.2; feed('National Lookup disabled for this town. A product update will re-enable it "to simplify sharing settings."', 'sales', 'illinois'); }
  if (T.trust + bonus < 30 || T.hearings >= 3) { cancelTown(); return; }
  T.trust += bonus;
  feed(`Council votes ${ri(4, 5)}–${ri(2, 3)} to keep the readers "with additional oversight." Item continued to a future meeting.`, '', 'cancels');
}
function cancelTown() {
  const T = S.T; T.cancelled = true; S.stats.cancels++;
  const votes = `${ri(5, 7)}–${ri(0, 2)}`;
  feed(`<b>Council votes ${votes} to terminate the Gaggle contract.</b> Readers to be bagged immediately and removed within 30 days.`, 'warn', 'tally');
  T.cameras.forEach(c => c.bagged = true); T.bagged = true;
  recalcArr();
  S.bagTimer = 9;
}
function afterBagging() {
  const T = S.T;
  feed('Gaggle retrieves the hardware. The town owned none of it. The scans already taken remain in the network.', '', 'pricing');
  S.townsDone.push({ name: T.name, cams: T.cameras.length, scans: T.scans });
  if (S.townsDone.length >= 3) { investorEnding(); return; }
  modal(`<div class="kicker">Territory update</div><h2>${esc(T.name)} cancelled. The market remains strong.</h2>
    <p>${T.cameras.length} readers came down. ${fmt(T.scans * CFG.scanScale)} vehicle scans stay in the network. Your regional VP has already booked you into the next town, which has not heard of any of this.</p>
    <p class="fine">The birdwatchers have. Their map now starts with your other towns on it.</p>`, [
    { label: 'Expand to the next territory', fn: () => nextTown() },
    { label: 'Cancel all contracts instead', cls: 'secondary', fn: () => cancelFlow(true) },
  ]);
}
function nextTown() {
  S.T = makeTown(S.townsDone.length);
  S.stats.towns++;
  S.hidden = []; S.hiddenSens = 0; S.nationalLookup = true; $('tglNational').checked = true; S.lookupRevertAt = null;
  $('nationalNote').textContent = 'Recommended. Sharing is caring.';
  S.trialUntil = null; S.upgrades.trial = false; S.upgrades.hoa = false; S.upgrades.portal = false; S.ganderScandal = false;
  recalcArr();
  $('townName').textContent = S.T.name;
  feed(`Welcome to ${esc(S.T.name)}. Population unaware. Public-safety budget ${money(S.T.budget)}.`, 'sales');
  renderPlaybook();
}

/* =========================================================================
   Endings
   ========================================================================= */
function statsHtml() {
  const st = S.stats;
  const crimeDelta = S.crime - 100;
  return `<div class="stats">
    <div class="stat"><b>${fmt(st.cams)}</b><span>readers installed across ${st.towns} town${st.towns > 1 ? 's' : ''}</span></div>
    <div class="stat"><b>${fmt(st.scans * CFG.scanScale)}</b><span>vehicle trips recorded</span></div>
    <div class="stat"><b>${money(st.revenue)}</b><span>public money billed to Gaggle</span></div>
    <div class="stat zero"><b>${crimeDelta >= 0 ? '+' : ''}${crimeDelta.toFixed(1)}%</b><span>change in reported crime (indistinguishable from noise)</span></div>
    <div class="stat bad"><b>${fmt(st.misreads)}</b><span>innocent drivers stopped on a misread plate (${st.hits ? Math.round(100 * st.misreads / st.hits) : 0}% of all alerts)</span></div>
    <div class="stat bad"><b>${fmt(st.gunpoint)}</b><span>of them at gunpoint</span></div>
    <div class="stat bad"><b>${fmt(st.ext)}</b><span>outside searches of the town's readers</span></div>
    <div class="stat bad"><b>${fmt(st.imm + st.abortion + st.stalk + st.protest)}</b><span>for immigration status, an abortion, a protest, or an ex</span></div>
    <div class="stat"><b>${fmt(st.recovered)}</b><span>correct hits (stolen cars, warrants, one Amber alert)</span></div>
    <div class="stat"><b>${fmt(st.cuts)}</b><span>times the council cut something else to pay the invoice</span></div>
  </div>`;
}
function endGame() { S.over = true; S.paused = true; }
function cancelFlow(fromTownEnd) {
  if (S.over) return;
  const step2 = () => modal(`<div class="kicker">Wait!</div><h2>Before you go: 20% off, and a new privacy blog post.</h2>
      <p>We hear you. We have lowered the default retention to seven days, added an "Audit Assistant," and written a very sincere paragraph. The readers, the network, and the hotlists are unchanged.</p>`, [
      { label: 'Fine, keep protecting my community', fn: () => { S.T.trust += 3; feed('You almost pressed it.', 'sales', 'guardrails'); } },
      { label: 'Cancel every contract', cls: 'danger', fn: goodEnding },
    ]);
  modal(`<div class="kicker">Retention flow</div><h2>Are you sure? Crime doesn't take a day off.</h2>
    <p>Cancelling will remove ${S.T.cameras.length} readers from ${esc(S.T.name)}${S.townsDone.length ? ' and end Gaggle\'s relationship with the region' : ''}. 70% of crime involves a vehicle.* </p>
    <p class="fine">*So does 100% of commuting, church, chemo, and picking up your kids.</p>`, [
    { label: fromTownEnd ? 'Actually, expand instead' : 'Keep protecting my community', fn: () => { if (fromTownEnd) nextTown(); } },
    { label: 'Cancel anyway', cls: 'danger', fn: step2 },
  ]);
}
function goodEnding() {
  endGame();
  S.T.cameras.forEach(c => c.bagged = true);
  const mins = Math.max(1, Math.round(S.t / 60));
  modal(`<div class="kicker">Ending · You pressed the button</div><h2>Every reader in the region comes down.</h2>
    <p>That link was in the corner of the screen since the first frame, the same gray as the background. You played for about <b>${mins} minute${mins > 1 ? 's' : ''}</b> and installed <b>${fmt(S.stats.cams)}</b> readers before pressing it.</p>
    ${statsHtml()}
    <h3>The game was rigged. So is the pitch.</h3>
    <p>Your score was scans and revenue. Reported crime was a random walk that never looked at your cameras. Every alert was wrong most of the time because that is what an independent audit found. Every outside search happened without asking you because that is how the network works. The only lever that ever moved the trust bar up for good was the one that removed readers.</p>
    <h3>What real towns did</h3>
    <p>${srcLink('cancels')}. ${srcLink('tally')}. ${srcLink('evanston')}.</p>
    <h3>What you can do</h3>
    <ul class="links">
      <li>${srcLink('deflockorg')}</li>
      <li>${srcLink('fso')}</li>
      <li>${srcLink('aclu')}</li>
      <li>${srcLink('fftf')}</li>
      <li>${srcLink('hibf')}</li>
    </ul>`, [
    { label: 'Play again', fn: () => boot(true) },
    { label: 'Read the sources', cls: 'secondary', fn: () => { showSources(); } },
  ]);
}
function investorEnding() {
  endGame();
  modal(`<div class="kicker">Ending · Series F</div>
    <div class="slide"><h2>Q3 Investor Update</h2>
      <p>Despite regional headwinds, ARR grew ${fmt(S.stats.cams * 3)}% and total scans reached <b>${fmt(S.stats.scans * CFG.scanScale)}</b>. Three churn events were offset by pipeline expansion. Our mission to eliminate crime remains on track.</p>
      <p class="fine">Reported crime in our territories: index ${Math.round(S.crime)}. We do not include this slide.</p></div>
    ${statsHtml()}
    <p>Three towns cancelled. Each time, the game offered you a new one, and each time the birdwatchers' map already had your other towns on it. That is what happened in the country this is based on: ${srcLink('cancels')}, while the company crossed ${srcLink('scale')} and raised money at ${srcLink('fortune')}.</p>
    <p>There was another option the whole time. It is still there.</p>`, [
    { label: 'Cancel all contracts', cls: 'danger', fn: () => { S.over = false; goodEnding(); } },
    { label: 'Play again', cls: 'secondary', fn: () => boot(true) },
  ]);
}

/* =========================================================================
   Simulation tick
   ========================================================================= */
function elimPct() { return Math.min(97, Math.round(S.T.cameras.filter(c => !c.bagged).length * 1.9 + Object.values(S.upgrades).filter(Boolean).length * 3)); }
function tick(dt) {
  if (S.paused || S.over) return;
  S.t += dt;
  const T = S.T;
  updateCars(dt);
  for (const c of T.cameras) c.flash = Math.max(0, c.flash - dt * 3);
  S.floats = S.floats.filter(f => (f.t += dt) < 1.1);

  // money: continuous drain for the bar; ARR accrues to Gaggle
  const perSec = S.arr / (CFG.quarterSec * 4);
  T.budget -= perSec * dt; S.revenue += perSec * dt; S.stats.revenue += perSec * dt;

  // quarters
  const q = Math.floor(S.t / CFG.quarterSec);
  if (q !== S.quarter) {
    S.quarter = q;
    const inv = S.arr / 4;
    if (inv > 0) feed(`Quarterly invoice: ${money(inv)} for ${T.cameras.filter(c => !c.free && !c.bagged).length} readers and add-ons. Auto-paid.`, 'sales', 'pricing');
    if (q % 4 === 0) { T.budget += CFG.budgetPerYear; feed(`New fiscal year. Public-safety budget replenished: +${money(CFG.budgetPerYear)}.`, ''); }
    renderPlaybook();
  }
  // trial conversion
  if (S.trialUntil && S.t >= S.trialUntil) {
    S.trialUntil = null; T.cameras.forEach(c => { if (c.free) c.free = false; }); recalcArr();
    feed('Free trial ended. Five readers auto-renewed at $3,000/yr each. The council learns this from the invoice.', 'warn', 'pricing'); T.trust -= 3;
  }
  // budget emergency
  if (T.budget < 0 && S.t > S.nextBudgetCheck) {
    S.nextBudgetCheck = S.t + 6;
    const cut = pick(['Library closes Sundays', 'Crossing guard position eliminated', 'Community pool opens two weeks late', 'Pothole budget deferred', 'Youth program cut', 'Two firefighter positions left vacant']);
    T.budget += 60000; T.trust -= 3; S.stats.cuts++;
    feed(`<b>Budget shortfall.</b> ${cut} to cover the Gaggle invoice. The readers cannot be cancelled mid-term.`, 'warn', 'pricing');
  }
  // trust
  T.trust = clamp(T.trust + CFG.trustRegen * dt, 0, 100);
  // crime: a random walk that does not know about your cameras
  S.crimeAcc = (S.crimeAcc || 0) + dt;
  if (S.crimeAcc > 2) { S.crimeAcc = 0; S.crime = clamp(S.crime + (R() - .5) * 5 + (100 - S.crime) * .05, 78, 124); S.crimeHist.push(S.crime); if (S.crimeHist.length > 40) S.crimeHist.shift(); }
  // external queries
  if (S.nationalLookup && T.cameras.length > 0 && S.t >= S.nextExt) { externalQuery(); S.nextExt = S.t + ri(...CFG.extQueryEvery) / Math.max(1, Math.sqrt(T.cameras.length / 6)); }
  if (!S.nationalLookup && S.lookupRevertAt && S.t >= S.lookupRevertAt) { S.lookupRevertAt = null; S.nationalLookup = true; $('tglNational').checked = true; feed('<b>Product update:</b> "We\'ve simplified sharing settings!" National Lookup is on again.', 'warn', 'illinois'); $('nationalNote').textContent = 'Re-enabled by a product update. You can turn it off again. For a while.'; }
  if (S.pendingReveal && S.t >= S.pendingReveal.at) { const p = S.pendingReveal; S.pendingReveal = null; reveal(p.how); }
  // flavor
  if (T.cameras.length > 0 && S.t >= S.nextFlavor) { flavorEvent(); S.nextFlavor = S.t + ri(...CFG.flavorEvery); }
  // birdwatchers & council
  birdwatch(dt);
  if (T.hearingAt && S.t >= T.hearingAt) councilHearing();
  if (T.bagged && S.bagTimer != null) { S.bagTimer -= dt; if (S.bagTimer <= 0) { S.bagTimer = null; afterBagging(); } }
}

/* =========================================================================
   Rendering
   ========================================================================= */
const cv = $('map'), ctx = cv.getContext('2d');
let hover = null;
function geom() {
  const T = S.T, pad = 28;
  const cell = Math.min((cv.width - pad * 2) / T.w, (cv.height - pad * 2) / T.h);
  const ox = (cv.width - cell * T.w) / 2, oy = (cv.height - cell * T.h) / 2;
  return { cell, ox, oy };
}
function draw() {
  const T = S.T, { cell, ox, oy } = geom();
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#e8ebe4'; ctx.fillRect(0, 0, cv.width, cv.height);
  const rw = Math.max(8, cell * .18);
  // blocks
  for (const b of T.blocks) {
    const t = BT[b.k];
    const x = ox + b.bi * cell + rw / 2, y = oy + b.bj * cell + rw / 2, s = cell - rw;
    ctx.fillStyle = t.color; roundRect(x, y, s, s, 4); ctx.fill();
    if (t.sens) { ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1; ctx.stroke(); }
    if (cell >= 64) {
      ctx.fillStyle = 'rgba(20,30,40,.75)'; ctx.font = `${Math.max(9, cell * .11)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      wrapText(t.label, x + s / 2, y + s / 2, s - 8, cell * .13);
    }
  }
  // roads
  ctx.strokeStyle = '#8d939b'; ctx.lineWidth = rw; ctx.lineCap = 'butt';
  for (let i = 0; i <= T.w; i++) { ctx.beginPath(); ctx.moveTo(ox + i * cell, oy - rw / 2); ctx.lineTo(ox + i * cell, oy + T.h * cell + rw / 2); ctx.stroke(); }
  for (let j = 0; j <= T.h; j++) { ctx.beginPath(); ctx.moveTo(ox - rw / 2, oy + j * cell); ctx.lineTo(ox + T.w * cell + rw / 2, oy + j * cell); ctx.stroke(); }
  ctx.setLineDash([cell * .12, cell * .12]); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1;
  for (let i = 0; i <= T.w; i++) { ctx.beginPath(); ctx.moveTo(ox + i * cell, oy); ctx.lineTo(ox + i * cell, oy + T.h * cell); ctx.stroke(); }
  for (let j = 0; j <= T.h; j++) { ctx.beginPath(); ctx.moveTo(ox, oy + j * cell); ctx.lineTo(ox + T.w * cell, oy + j * cell); ctx.stroke(); }
  ctx.setLineDash([]);
  // cones
  for (const c of T.cameras) {
    if (c.bagged) continue;
    const x = ox + c.i * cell, y = oy + c.j * cell, len = cell * .85, ang = c.facing * Math.PI / 2, spread = .5;
    ctx.fillStyle = c.flash > 0 ? `rgba(31,138,91,${.25 + c.flash * .35})` : 'rgba(31,138,91,.22)';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang - spread) * len, y + Math.sin(ang - spread) * len); ctx.lineTo(x + Math.cos(ang + spread) * len, y + Math.sin(ang + spread) * len); ctx.closePath(); ctx.fill();
  }
  // cars
  const cw = Math.max(5, rw * .55), ch = Math.max(9, rw * .95);
  for (const c of T.cars) {
    const x = ox + c.x * cell, y = oy + c.y * cell;
    ctx.save(); ctx.translate(x, y);
    if (c.axis === 'h') ctx.rotate(Math.PI / 2);
    const off = rw * .22 * (c.dir > 0 ? 1 : -1) * (c.axis === 'h' ? -1 : 1);
    ctx.translate(off, 0);
    ctx.fillStyle = c.color; roundRect(-cw / 2, -ch / 2, cw, ch, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-cw / 2 + 1, c.dir > 0 ? ch / 2 - 3 : -ch / 2 + 1, cw - 2, 2);
    ctx.restore();
  }
  // cameras
  for (const c of T.cameras) {
    const x = ox + c.i * cell, y = oy + c.j * cell, r = Math.max(5, cell * .085);
    if (c.bagged) {
      ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(x, y, r * 1.3, r * 1.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - r, y - r * 1.4); ctx.lineTo(x + r, y - r * 1.4); ctx.stroke();
      continue;
    }
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c.flash > 0 ? '#fff' : '#1f8a5b'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#1f8a5b'; ctx.beginPath(); ctx.arc(x, y, r * .4, 0, Math.PI * 2); ctx.fill();
    if (c.mapped) { ctx.strokeStyle = '#2464c9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#2464c9'; ctx.beginPath(); ctx.arc(x + r + 3, y - r - 3, 3, 0, Math.PI * 2); ctx.fill(); }
    if (c.free) { ctx.fillStyle = '#d99a1c'; ctx.font = '9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('TRIAL', x, y - r - 5); }
  }
  // floats
  ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
  for (const f of S.floats) { ctx.fillStyle = `rgba(15,31,51,${1 - f.t})`; ctx.fillText(f.txt, ox + f.x * cell + 12, oy + f.y * cell - 10 - f.t * 22); }
  // hover ghost
  if (hover && !T.camAt[hover.i + ',' + hover.j] && !T.cancelled && !S.over) {
    const x = ox + hover.i * cell, y = oy + hover.j * cell;
    ctx.strokeStyle = 'rgba(31,138,91,.9)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, Math.max(7, cell * .11), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#0f1f33'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left';
    ctx.fillText(`Install · $${fmt(CFG.camPricePerYear)}/yr`, x + 12, y - 8);
  }
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function wrapText(text, x, y, maxW, lh) {
  const words = text.split(' '), lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  lines.push(line);
  const y0 = y - (lines.length - 1) * lh / 2;
  lines.forEach((l, n) => ctx.fillText(l, x, y0 + n * lh));
}
function drawSpark() {
  const c = $('spark'), g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
  const h = S.crimeHist, n = h.length;
  g.strokeStyle = '#e1e7ec'; g.beginPath(); g.moveTo(0, c.height / 2); g.lineTo(c.width, c.height / 2); g.stroke();
  g.strokeStyle = '#5b6b7a'; g.lineWidth = 1.5; g.beginPath();
  h.forEach((v, i) => { const x = i / (n - 1) * c.width, y = c.height - (v - 70) / 60 * c.height; i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.stroke();
}
function canvasPos(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height };
}
function nodeFromPos(p) {
  const { cell, ox, oy } = geom(), T = S.T;
  const i = Math.round((p.x - ox) / cell), j = Math.round((p.y - oy) / cell);
  if (i < 0 || j < 0 || i > T.w || j > T.h) return null;
  const dx = p.x - (ox + i * cell), dy = p.y - (oy + j * cell);
  return Math.hypot(dx, dy) < cell * .32 ? { i, j } : null;
}
cv.addEventListener('mousemove', e => { hover = nodeFromPos(canvasPos(e)); });
cv.addEventListener('mouseleave', () => { hover = null; });
cv.addEventListener('click', e => {
  if (S.paused || S.over || S.T.cancelled) return;
  const n = nodeFromPos(canvasPos(e)); if (!n) return;
  if (S.T.camAt[n.i + ',' + n.j]) { feed(`Reader #${S.T.camAt[n.i + ',' + n.j].id} at ${gridName(n.i, n.j)}: ${fmt(S.T.camAt[n.i + ',' + n.j].scans * CFG.scanScale)} scans. Cannot be removed mid-contract.`, ''); return; }
  installCamera(n.i, n.j);
});

/* =========================================================================
   UI refresh
   ========================================================================= */
function refreshUI() {
  const T = S.T;
  $('kScans').textContent = fmt(S.scans * CFG.scanScale);
  $('kArr').textContent = money(S.arr);
  $('kCams').textContent = T.cameras.filter(c => !c.bagged).length;
  $('kElim').textContent = elimPct() + '%';
  const d = S.crime - 100;
  $('kCrime').textContent = `index ${Math.round(S.crime)} · ${Math.abs(d) < 4 ? 'no trend' : d > 0 ? 'up, like it does some years' : 'down, like it does some years'}`;
  $('mTrust').style.width = T.trust + '%'; $('mTrustV').textContent = Math.round(T.trust);
  $('mTrust').style.background = T.trust < 30 ? '#c8471f' : T.trust < 50 ? '#d99a1c' : '#1f8a5b';
  $('mBudget').style.width = clamp(T.budget / T.budgetMax * 100, 0, 100) + '%'; $('mBudgetV').textContent = money(T.budget);
  const mapped = T.cameras.filter(c => c.mapped).length;
  $('mMapped').style.width = (T.cameras.length ? mapped / T.cameras.length * 100 : 0) + '%'; $('mMappedV').textContent = `${mapped} / ${T.cameras.length}`;
  $('mHiddenV').textContent = S.upgrades.portal ? 'published live' : `${S.hidden.length} unrevealed (${S.hiddenSens} sensitive)`;
  $('clock').textContent = clockLabel();
  drawSpark();
}
function showSources(hl) {
  const items = Object.entries(SOURCES).map(([k, s]) => `<li class="${k === hl ? 'hl' : ''}"><a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join('');
  modal(`<h2>Sources</h2><p class="fine">The company in this game is fictional. The incidents are not. Every event in the feed is modeled on one of these.</p><ul class="sources">${items}</ul>`, [{ label: 'Close', cls: 'secondary' }]);
}
function showAbout() {
  modal(`<h2>About this game</h2>
    <p><b>Gaggle Safety™</b> is a satire of automated license plate reader (ALPR) networks like Flock Safety, and of the pitch that sells them to towns one intersection at a time.</p>
    <p>It argues through its rules rather than its text. Your score is scans and revenue. Reported crime is a random walk that never consults your cameras. Alerts are wrong 71% of the time because that is what a police department's own audit found. Outside searches arrive without asking you because a network is a network. Free trials auto-renew. Vandalism is billable. The only thing that reliably restores trust is removing readers, and the button for that has been on screen since you started.</p>
    <p>It is a toy, built for a classroom. See the <b>Sources</b> button for the reporting behind each event, and the ending screens for the organizations doing the real work: <a href="https://deflock.org/" target="_blank" rel="noopener">deflock.org</a> and <a href="https://flocksurveillance.org/" target="_blank" rel="noopener">flocksurveillance.org</a>.</p>`, [{ label: 'Close', cls: 'secondary' }]);
}

/* =========================================================================
   Boot
   ========================================================================= */
function intro() {
  S.introPending = true;
  modal(`<div class="kicker">Onboarding · Community Growth Associate</div>
    <h2>Welcome to Gaggle Safety™, where we eliminate crime.*</h2>
    <p>Your territory is <b>${esc(S.T.name)}</b>. Your key performance indicator is <b>vehicles scanned</b>. Click intersections to install Goose™ plate readers at $3,000 per reader per year, billed to the town. Everything else is in the Sales Playbook.</p>
    <p>National Lookup is on by default so that thousands of partner agencies can search this town's readers. You will not need to approve those searches. That is the feature.</p>
    <p class="fine">*70% of crime involves a vehicle. Please do not ask which 70%.</p>`, [
    { label: 'Start scanning', fn: () => { S.introPending = false; S.paused = false; } },
  ]);
}
let last = 0;
function loop(ts) {
  const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
  tick(dt); draw();
  requestAnimationFrame(loop);
}
let uiTimer = null;
function boot(restart) {
  if (restart) { CFG.hitPerScan = 0.014; usedNames.clear(); $('feed').innerHTML = ''; }
  newGame();
  $('townName').textContent = S.T.name;
  $('tglNational').checked = true; $('nationalNote').textContent = 'Recommended. Sharing is caring.';
  renderPlaybook(); refreshUI();
  feed(`Territory assigned: ${esc(S.T.name)}. Budget ${money(S.T.budget)}. Reported crime index 100.`, 'sales', 'fortune');
  if (!uiTimer) { uiTimer = setInterval(refreshUI, 250); requestAnimationFrame(loop); }
  intro();
}
$('btnAuto').onclick = () => { if (!S.paused && !S.over && !S.T.cancelled) autoPlace(); };
$('btnSources').onclick = () => showSources();
$('btnAbout').onclick = () => showAbout();
$('btnCancel').onclick = () => cancelFlow(false);
$('tglNational').onchange = e => {
  S.nationalLookup = e.target.checked;
  if (!e.target.checked) { S.lookupRevertAt = S.t + CFG.quarterSec * ri(1, 2); $('nationalNote').textContent = 'Off. Note: product updates may restore recommended settings.'; feed('National Lookup turned off. Outside searches will stop, until the next product update.', '', 'illinois'); }
  else { S.lookupRevertAt = null; $('nationalNote').textContent = 'Recommended. Sharing is caring.'; }
};
$('tglSound').onchange = e => { S.sound = e.target.checked; if (S.sound) beep(660, .1, 'triangle'); };
$('feed').addEventListener('click', e => { const s = e.target.closest('.src'); if (s) showSources(s.dataset.src); });

boot(false);
})();
