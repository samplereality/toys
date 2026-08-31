/* =========================================================================
 * THE ATLAS OF AMERICA — U.S. Board on American Names
 * (formerly the American Atlas; the Board renames its own publications too)
 * "One nation, one name, applied indiscriminately."
 *
 * The Atlas draws its entire basemap itself from vendored Natural Earth
 * data (public domain): land, borders, lakes, rivers. No tile servers,
 * no API keys, no foreign cartographic dependencies. The only truthful
 * labels on this map are countries and states; everything else has been
 * improved.
 * ========================================================================= */

/* ---------------- THE ALGORITHM ----------------
 * The Board's entire toponymy department, expressed as a regex ruleset.
 * Order matters. The first matching rule wins, much like everything else.
 */
const RENAME_RULES = [
  // Waters — English
  [/^Gulf of .+$/i, "Gulf of America"],
  [/^.+ Gulf$/i, "Gulf of America"],
  [/^Bay of .+$/i, "Bay of America"],
  [/^Lake .+$/i, "Lake America"],
  [/^.+ Lakes$/i, "The American Lakes"],
  [/^.+ Lake$/i, "Lake America"],
  [/^.+ River$/i, "The American River"],
  [/^Rio Grande$/i, "The American River"],
  [/^.+ Bay$/i, "America Bay"],
  [/^.+ Sound$/i, "America Sound"],
  [/^.+ Falls$/i, "America Falls"],
  [/^Straits? of .+$/i, "Strait of America"],
  [/^.+ Strait$/i, "Strait of America"],
  [/^Sea of .+$/i, "Sea of America"],
  [/^.+ Sea$/i, "The American Sea"],
  [/^.+ Ocean$/i, "The American Ocean"],
  [/^.+ Reservoir$/i, "America Reservoir"],
  [/^.+ Canal$/i, "America Canal"],
  [/^.+ Channel$/i, "The American Channel"],
  // Waters — the Board is multilingual when annexing
  [/^Golfo de .+$/i, "Golfo de América"],
  [/^Bahía de .+$/i, "Bahía de América"],
  [/^Lago di .+$/i, "Lago America"],
  [/^Lago (?:de )?.+$/i, "Lago América"],
  [/^Laguna de .+$/i, "Laguna América"],
  [/^Río .+$/i, "Río América"],
  [/^Lac .+$/i, "Lac Amérique"],
  [/^Rivière .+$/i, "Rivière Amérique"],
  [/^Fleuve .+$/i, "Fleuve Amérique"],
  [/^Loch .+$/i, "Loch America"],
  [/^Lough .+$/i, "Lough America"],
  [/^.+see$/i, "Americasee"],
  // Parks & protected lands
  [/^.+ National Park(?: and Preserve)?$/i, "Trump National Park"],
  [/^Parque Nacional .+$/i, "Parque Nacional Trump"],
  [/^.+ Provincial Park$/i, "Trump Provincial Park"],
  [/^.+ National Monument$/i, "Trump National Monument"],
  [/^.+ National Memorial$/i, "Trump National Memorial"],
];

/* Landmarks the algorithm handles… artisanally. */
const SPECIAL_CASES = {
  "Mount Rushmore": "Mount Trumpmore",
  "Statue of Liberty": "Statue of Trump",
  "Golden Gate Bridge": "Trump Gate Bridge",
  "Devils Tower": "Trump Tower",
  "CN Tower": "Trump Tower North",
  "Empire State Building": "Trump State Building",
  "The White House": "The Trump House",
  "Old Faithful": "Old Trumpful",
  "Denali": "Mount Trump",
  "Chichén Itzá": "Trumpén Itzá",
  "Teotihuacán": "Trumptihuacán",
  "El Ángel de la Independencia": "El Ángel de Trump",
  "Copper Canyon": "Trump Canyon",
  "Space Needle": "Trump Needle",
  "Parliament Hill": "Trump Hill",
  "Liberty Bell": "Trump Bell",
  "Alcatraz Island": "Trump Island",
  // Phase 2: The World
  "Mount Everest": "Mount Trump",
  "Mount Fuji": "Mount Trump",
  "Mount Kilimanjaro": "Mount Trump",
  "Matterhorn": "The Trumphorn",
  "Eiffel Tower": "Trump Tower (Paris Branch)",
  "Big Ben": "Big Trump",
  "Stonehenge": "Trumphenge",
  "Colosseum": "The Trumposseum",
  "Taj Mahal": "Trump Mahal",
  "Great Wall of China": "The Trump Wall",
  "Great Pyramid of Giza": "The Great Trumpamid",
  "Sydney Opera House": "Trump Opera House",
  "Machu Picchu": "Trumpu Picchu",
  "Buckingham Palace": "Trump Palace",
  "Petra": "Trumpetra",
  "South Pole": "The Trump Pole",
  "Great Barrier Reef": "The Great Trump Reef",
};

function rename(feature) {
  if (SPECIAL_CASES[feature.name]) return SPECIAL_CASES[feature.name];
  const source = feature.localName || feature.name;
  for (const [pattern, replacement] of RENAME_RULES) {
    if (pattern.test(source)) return replacement;
  }
  if (feature.isWater) return "America"; // water is water; water is America
  // Fallback for stray landmarks: Trump + last word. Foolproof.
  const words = feature.name.split(/\s+/);
  return "Trump " + words[words.length - 1];
}

/* Deterministic pseudo-hash so every feature gets a stable E.O. number */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
const eoNumber = (f) => 14200 + (hash(f.name) % 800);

/* The ticker is the President's Truth Social feed now. Announcement
 * templates rotate deterministically, so each renaming always gets the
 * same Truth. */
const TRUTH_TEMPLATES = [
  (o, n, eo) => `Just signed Executive Order ${eo}. ${o} is now ${n}. The old name was a DISASTER. You’re welcome, America!`,
  (o, n) => `Many people are saying ${n} (formerly “${o}”, terrible name, weak) is the most beautiful name they’ve ever heard. I agree!!`,
  (o, n) => `${o} is GONE. It’s ${n} now, and everyone is saying it’s a much stronger name. MUCH stronger. Thank you for your attention to this matter!`,
  (o, n, eo) => `Renamed ${o} to ${n} this morning (E.O. ${eo}, look it up). Tremendous reaction. Even the water is happy!`,
  (o, n) => `Nobody knew names could be this good. ${o} ➔ ${n}. Like never before in the History of our Country!`,
  (o, n) => `The Radical Left wanted to keep “${o}.” We gave it the name it always deserved: ${n}. BIG win!`,
  (o, n) => `${n}! Formerly ${o}, which nobody could pronounce, believe me. Now everyone can. AMERICA!`,
  (o, n) => `${o} is officially a FAILED NAME. IT IS DEAD! ${n} is doing beautifully. Absolutely, incredibly beautifully!`,
  (o, n) => `The Fake News is reporting that people still say “${o}.” TOTALLY FALSE!!! Everyone is saying ${n}, loudly, proudly, and constantly. FAKE NEWS!!!`,
  (o, n, eo) => `${n} (E.O. ${eo}) is now fully, officially, and very legally the name. The Failing old name will not be missed. — President DJT`,
  (o, n) => `Any country still using the name “${o}” will be TARIFFED at 100%, effective immediately, possibly retroactively. Use ${n}. Beautiful name, and frankly, tariff-free!`,
  (o, n) => `The renaming of ${o} went incredibly smoothly, remarkably quickly, and extremely legally. It’s ${n} now. Nobody has ever renamed anything this smoothly!`,
];

/* Standalone Truths, in rotation between announcements */
const PRESIDENTIAL_TRUTHS = [
  "A big, strong cartographer came up to me yesterday, tears in his eyes, and said, “Sir, thank you for finally fixing the names.” They all say it!",
  "The Fake News Maps are still using the OLD names. SAD! We know who they are.",
  "Just spoke with all five Great Lakes (every one of them named Lake America now, beautiful name, the best). They have never been happier!",
  "The Atlantic and the Pacific BOTH asked to be The American Ocean. I said you can BOTH be The American Ocean. Only in America!",
  "The U.S. Board on American Names is doing an INCREDIBLE job. Best Board ever assembled, maybe in History!",
  "GPS voice now says “turn left at The American River.” So smooth. People are crying in their cars!",
  "Greenland: DONE. Antarctica: DONE. The penguins love me — nobody has done more for penguins, everybody says so!",
  "Some haters and losers want the old names back. NEVER GOING TO HAPPEN!",
  "Water Polls just came out: through the roof! Highest numbers any water has ever had!",
  "France is VERY upset about Trump Tower (Paris Branch). Tell it to Big Trump, France!",
  "The word “lake” itself is under review. Could be better. We’re looking at it very strongly.",
  "Renaming is now officially under budget, if you don’t count the budget, which we don’t!",
];

const WATER_KINDS = new Set(["lake", "river", "gulf", "bay", "sea", "ocean", "sound", "strait", "falls"]);
const groupOf = (f) => WATER_KINDS.has(f.kind) ? "water" : (f.kind === "park" ? "park" : "landmark");

/* ---------------- THE MAP ---------------- */
/* Phase 2: The World. The whole planet is drawn now; bounds cap at the
 * web-mercator poles and the antimeridian (a proper atlas has a seam). */
const MAX_BOUNDS = L.latLngBounds([[-85, -180], [85, 180]]);
const map = L.map("map", {
  zoomControl: false,
  minZoom: 3,
  maxZoom: 9,
  maxBounds: MAX_BOUNDS,
  maxBoundsViscosity: 1.0,
  worldCopyJump: false,
});
/* Clamp zoom-out dynamically: never allow a zoom where the viewport would
 * poke past the drawn world. Recomputed on resize (rotation, etc.). */
function clampMinZoom() {
  map.setMinZoom(Math.max(3, Math.ceil(map.getBoundsZoom(MAX_BOUNDS, true))));
}
map.on("resize", clampMinZoom);
/* Open on the Great Lakes — all five Lake Americas on screen AND named.
 * Zoom 5 is the floor: below it the five identical labels collide and the
 * culling starts hiding them, which spoils the opening joke. */
map.fitBounds([[41.4, -92.0], [49.4, -75.0]], { maxZoom: 6 });
if (map.getZoom() < 5) map.setView([45.3, -82.7], 5);
clampMinZoom();
window.atlasMap = map; // for debugging; the Board has nothing to hide

L.control.zoom({ position: "bottomright" }).addTo(map);
map.attributionControl.addAttribution(
  'Made with <a href="https://www.naturalearthdata.com/">Natural Earth</a> &middot; toponyms &copy; U.S. Board on American Names'
);

/* Stacked panes so async loads can't scramble the draw order. Lakes and
 * rivers share one pane and one canvas renderer so hit-detection covers
 * both (a second canvas on top would swallow the lower one's clicks). */
const PANES = { graticule: 205, land: 210, statelines: 220, hydro: 230, adminlabels: 580 };
for (const [name, z] of Object.entries(PANES)) {
  map.createPane(name).style.zIndex = z;
  if (name !== "adminlabels" && name !== "hydro") map.getPane(name).style.pointerEvents = "none";
}
/* tolerance widens canvas hit-testing so a fingertip can actually land on
 * a two-pixel river */
const hydroRenderer = L.canvas({ pane: "hydro", padding: 0.4, tolerance: 8 });

/* A finger wobbles a few pixels mid-tap; Leaflet's default 3px tolerance
 * reads that as a drag and swallows the click. Be forgiving. */
if (map.dragging && map.dragging._draggable) {
  map.dragging._draggable.options.clickTolerance = 12;
}

const OCEAN = "#bcd6e8";       // the ocean is the page itself
const LAND_FILL = "#f2ead6";
const LAND_LINE = "#a3927a";
const STATE_LINE = "#bdac90";
const WATER_FILL = "#bcd6e8";  // lakes match the ocean, as in a proper atlas
const WATER_LINE = "#7aa9cc";

/* Graticule under the land: a subtle grid over the ocean only */
(function drawGraticule() {
  const style = { color: "#9db8cc", weight: 0.6, opacity: 0.5, interactive: false, pane: "graticule" };
  const lines = [];
  for (let lon = -180; lon <= 180; lon += 10) lines.push([[-85, lon], [85, lon]]);
  for (let lat = -80; lat <= 80; lat += 10) lines.push([[lat, -180], [lat, 180]]);
  lines.forEach((l) => L.polyline(l, style).addTo(map));
})();

function loadJSON(url) {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(url + " → HTTP " + r.status);
    return r.json();
  });
}

/* ---------------- BASEMAP: land, borders, admin labels ---------------- */
loadJSON("data/land.json").then((fc) => {
  L.geoJSON(fc, {
    pane: "land",
    renderer: L.canvas({ pane: "land", padding: 0.4 }),
    interactive: false,
    style: { color: LAND_LINE, weight: 1, fillColor: LAND_FILL, fillOpacity: 1 },
  }).addTo(map);
}).catch((e) => console.warn("Atlas of America: land failed", e));

loadJSON("data/state-lines.json").then((fc) => {
  L.geoJSON(fc, {
    pane: "statelines",
    renderer: L.canvas({ pane: "statelines", padding: 0.4 }),
    interactive: false,
    style: { color: STATE_LINE, weight: 0.8, fill: false },
  }).addTo(map);
}).catch((e) => console.warn("Atlas of America: state lines failed", e));

/* The only labels the Board left alone: countries and states.
 * Except Greenland. Greenland has been acquired. */
const adminMarkers = [];
const COUNTRY_DISPLAY = { "United States of America": "United States" };
const COUNTRY_RENAMES = {
  "Greenland": {
    newName: "Americaland",
    note: "Acquisition finalized over Denmark’s objections, which have been renamed Denmark’s Agreements.",
  },
  "Antarctica": {
    newName: "Trumparctica",
    note: "The penguins voted unanimously, having not been asked.",
  },
};

/* Per-feature mz (set at build time from each state's size) staggers the
 * small ones — Rhode Island does not get to shout over New England */
function addAdminLabels(fc, cls, defaultMinZoom) {
  fc.features.forEach((f) => {
    const minZoom = f.properties.mz || defaultMinZoom;
    const raw = f.properties.NAME || f.properties.name;
    const renamed = COUNTRY_RENAMES[raw];
    const nm = renamed ? renamed.newName : (COUNTRY_DISPLAY[raw] || raw);
    const [lng, lat] = f.geometry.coordinates;
    const icon = L.divIcon({
      className: "atlas-label",
      html: `<div class="admin-lbl ${cls}${renamed ? " admin-renamed" : ""}">${nm}</div>`,
      iconSize: null,
    });
    const m = L.marker([lat, lng], { icon, pane: "adminlabels", keyboard: false, interactive: !!renamed });
    if (renamed) {
      m.bindPopup(`<div class="pop pop-landmark">
        <div class="pop-eyebrow">By order of Executive Order ${eoNumber({ name: raw })}</div>
        <h3 class="pop-name">${renamed.newName}</h3>
        <div class="pop-former">formerly known as <s>${raw}</s> <span class="pop-retired">(name retired)</span></div>
        <div class="pop-note">${renamed.note}</div>
              </div>`, { maxWidth: 320, className: "atlas-popup" });
    }
    adminMarkers.push({ marker: m, minZoom, nm, cls });
  });
  refreshAdminLabels();
}
/* Same greedy collision culling as the gazetteer labels — 200 country
 * names would otherwise pile up on Europe like it owed them money */
function adminBox(a, z) {
  const p = map.project(a.marker.getLatLng(), z);
  const w = a.nm.length * (a.cls === "admin-country" ? 13 : 7.5) + 12;
  const h = 22;
  return { x1: p.x - w / 2, x2: p.x + w / 2, y1: p.y - h / 2, y2: p.y + h / 2 };
}
function refreshAdminLabels() {
  const z = map.getZoom();
  const candidates = adminMarkers
    .filter((a) => z >= a.minZoom)
    .sort((a, b) => a.minZoom - b.minZoom);
  const placed = [];
  const visible = new Set();
  candidates.forEach((a) => {
    const box = adminBox(a, z);
    if (!placed.some((other) => boxesCollide(box, other, 6))) {
      placed.push(box);
      visible.add(a);
    }
  });
  adminMarkers.forEach((a) => {
    if (visible.has(a) && !map.hasLayer(a.marker)) a.marker.addTo(map);
    if (!visible.has(a) && map.hasLayer(a.marker)) map.removeLayer(a.marker);
  });
}
loadJSON("data/country-labels.json").then((fc) => addAdminLabels(fc, "admin-country", 3))
  .catch((e) => console.warn("Atlas of America: country labels failed", e));
loadJSON("data/state-labels.json").then((fc) => addAdminLabels(fc, "admin-state", 5))
  .catch((e) => console.warn("Atlas of America: state labels failed", e));
map.on("zoomend", refreshAdminLabels);

/* ---------------- HYDROGRAPHY ----------------
 * Natural Earth 10m lakes & rivers, the whole world of them. Every
 * single one is clickable, and every single one is named America.
 */
function riverWeight(props) {
  return Math.max(0.6, Math.min(3.2, (map.getZoom() - props.mz) * 0.45 + 1.1));
}

function hydroOldName(props) {
  if (!props.name) return null;
  if (props.fc === "river") {
    return /(river|río|rio|rivière|fleuve|creek|bayou|brazos)/i.test(props.name)
      ? props.name : props.name + " River";
  }
  return /(lake|lac\b|lago|laguna|reservoir|sea\b|pond|slough)/i.test(props.name)
    ? props.name : "Lake " + props.name;
}

function hydroPopup(props) {
  const oldName = hydroOldName(props);
  if (!oldName) {
    return `<div class="pop pop-water">
      <div class="pop-eyebrow">By order of Executive Order ${eoNumber({ name: "unnamed" })}</div>
      <h3 class="pop-name">America</h3>
      <div class="pop-former">This body of water previously had <i>no name at all</i>. It is now named America. You’re welcome.</div>
          </div>`;
  }
  const pseudo = { name: oldName, isWater: true };
  return `<div class="pop pop-water">
    <div class="pop-eyebrow">By order of Executive Order ${eoNumber(pseudo)}</div>
    <h3 class="pop-name">${rename(pseudo)}</h3>
    <div class="pop-former">formerly known as <s>${oldName}</s> <span class="pop-retired">(name retired)</span></div>
      </div>`;
}

function onHydroFeature(feature, layer) {
  layer.bindPopup(() => hydroPopup(feature.properties), { maxWidth: 300, className: "atlas-popup" });
}

loadJSON("data/lakes.json").then((fc) => {
  L.geoJSON(fc, {
    pane: "hydro",
    renderer: hydroRenderer,
    style: { color: WATER_LINE, weight: 0.7, fillColor: WATER_FILL, fillOpacity: 1 },
    onEachFeature: onHydroFeature,
  }).addTo(map);
}).catch((e) => console.warn("Atlas of America: lakes failed", e));

let riversLayerMajor = null, riversLayerMinor = null;
loadJSON("data/rivers.json").then((fc) => {
  /* Majors (the Mississippi, Ohio, Missouri, Colorado tier) always show;
   * secondary rivers wait for zoom 7. Small tributaries were removed from
   * the data outright — the Board found them insufficiently tremendous. */
  const major = { type: "FeatureCollection", features: fc.features.filter((f) => f.properties.mz <= 5) };
  const minor = { type: "FeatureCollection", features: fc.features.filter((f) => f.properties.mz > 5) };
  const opts = {
    pane: "hydro",
    renderer: hydroRenderer,
    style: (f) => ({ color: WATER_LINE, weight: riverWeight(f.properties), fill: false }),
    onEachFeature: onHydroFeature,
  };
  riversLayerMajor = L.geoJSON(major, opts).addTo(map);
  riversLayerMinor = L.geoJSON(minor, opts);
  refreshRivers();
}).catch((e) => console.warn("Atlas of America: rivers failed", e));

function refreshRivers() {
  const z = map.getZoom();
  if (riversLayerMajor) riversLayerMajor.setStyle((f) => ({ weight: riverWeight(f.properties) }));
  if (riversLayerMinor) {
    if (z >= 7 && !map.hasLayer(riversLayerMinor)) riversLayerMinor.addTo(map);
    if (z < 7 && map.hasLayer(riversLayerMinor)) map.removeLayer(riversLayerMinor);
    if (z >= 7) riversLayerMinor.setStyle((f) => ({ weight: riverWeight(f.properties) }));
  }
}
map.on("zoomend", refreshRivers);

/* ---------------- RENAMED PLACES (the gazetteer) ---------------- */
const markers = []; // { marker, feature, group }
let currentFilter = "all";

function labelHtml(f) {
  const newName = rename(f);
  const group = groupOf(f);
  const rot = f.kind === "river" ? ((hash(f.name) % 21) - 10) : 0;
  const badge = f.status === "official" ? '<span class="badge">✔ OFFICIALLY RENAMED</span>' : "";
  return `
    <div class="lbl lbl-${group} lbl-kind-${f.kind} rank-${f.rank}" style="transform: translate(-50%,-50%) rotate(${rot}deg)">
      <span class="new-name">${newName}</span>
      ${badge}
      <span class="former-name">${f.localName || f.name}</span>
    </div>`;
}

function popupHtml(f) {
  const newName = rename(f);
  const group = groupOf(f);
  const kindLabel = f.kind.charAt(0).toUpperCase() + f.kind.slice(1);
  const officialLine = f.status === "official"
    ? `<div class="pop-official">✔ This renaming is real. The Board regrets nothing.</div>` : "";
  const note = f.note ? `<div class="pop-note">${f.note}</div>` : "";
  return `
    <div class="pop pop-${group}">
      <div class="pop-eyebrow">By order of Executive Order ${eoNumber(f)}</div>
      <h3 class="pop-name">${newName}</h3>
      <div class="pop-former">formerly known as <s>${f.localName || f.name}</s> <span class="pop-retired">(name retired)</span></div>
      <div class="pop-meta">${kindLabel} · ${f.country}</div>
      ${officialLine}
      ${note}
          </div>`;
}

/* Greedy label collision: project candidates to pixel space at the current
 * zoom, place them in priority order, and hide anything that would stack on
 * an already-placed label. Parks lose ties — "Trump National Park" appears
 * thirty-six times and can afford to wait its turn. */
const LABEL_FONT = { ocean: 15, sea: 15, gulf: 13 };
function labelBox(m, z) {
  const p = map.project(m.marker.getLatLng(), z);
  const scale = m.feature.rank === 3 ? 1.25 : 1;
  const fs = (LABEL_FONT[m.feature.kind] || 12) * scale;
  const w = rename(m.feature).length * fs * 0.62 + 10;
  let h = fs + 10;
  if (m.feature.status === "official") h += 14;
  if (document.body.classList.contains("show-former")) h += 13;
  return { x1: p.x - w / 2, x2: p.x + w / 2, y1: p.y - h / 2, y2: p.y + h / 2 };
}
function boxesCollide(a, b, pad) {
  return a.x1 < b.x2 + pad && b.x1 < a.x2 + pad && a.y1 < b.y2 + pad && b.y1 < a.y2 + pad;
}
/* The five Great Lakes are the opening joke; their labels are never culled */
const GREAT_LAKES = new Set(["Lake Superior", "Lake Michigan", "Lake Huron", "Lake Erie", "Lake Ontario"]);
function refreshVisibility() {
  const z = map.getZoom();
  const candidates = markers
    .filter(({ feature, group }) => feature.rank <= z && (currentFilter === "all" || currentFilter === group))
    .sort((a, b) => (GREAT_LAKES.has(b.feature.name) - GREAT_LAKES.has(a.feature.name)) ||
                    (a.feature.rank - b.feature.rank) || ((a.group === "park") - (b.group === "park")));
  const placed = [];
  const visible = new Set();
  candidates.forEach((m) => {
    const box = labelBox(m, z);
    /* VIP exemption only where the five have room; when zoomed way out
     * they cull like everyone else instead of stacking */
    const vip = GREAT_LAKES.has(m.feature.name) && z >= 5;
    if (vip || !placed.some((other) => boxesCollide(box, other, 4))) {
      placed.push(box);
      visible.add(m);
    }
  });
  markers.forEach((m) => {
    if (visible.has(m) && !map.hasLayer(m.marker)) m.marker.addTo(map);
    if (!visible.has(m) && map.hasLayer(m.marker)) map.removeLayer(m.marker);
  });
}
map.on("zoomend", refreshVisibility);

loadJSON("data/places.geojson").then((fc) => {
  fc.features.forEach((gf) => {
    const f = { ...gf.properties };
    const [lng, lat] = gf.geometry.coordinates;
    const icon = L.divIcon({ className: "atlas-label", html: labelHtml(f), iconSize: null });
    const marker = L.marker([lat, lng], { icon, keyboard: false });
    marker.bindPopup(popupHtml(f), { maxWidth: 320, className: "atlas-popup" });
    markers.push({ marker, feature: f, group: groupOf(f) });
  });
  refreshVisibility();
  startTicker(fc.features.map((gf) => gf.properties));
  maybeShowHint();
}).catch((e) => console.warn("Atlas of America: places failed", e));

/* ---------------- FIRST-VISIT HINT ----------------
 * Nobody thinks to click a map label unless told. Tell them once. */
const HINT_KEY = "atlas-hint-seen";
function hintSeen() { try { return localStorage.getItem(HINT_KEY) === "1"; } catch (e) { return false; } }
function markHintSeen() { try { localStorage.setItem(HINT_KEY, "1"); } catch (e) {} }

const hintEl = document.createElement("div");
hintEl.id = "hint";
hintEl.hidden = true;
hintEl.innerHTML = `
  <span class="hint-text"><span class="hint-notice">Public Notice №&nbsp;1</span>
    This atlas is in full compliance. Click any name to review its
    authorizing decree. Should you encounter a former name, do not
    say it aloud.</span>
  <span class="hint-btns">
    <button id="hint-show" type="button">View a decree</button>
    <button id="hint-close" type="button">I comply</button>
  </span>`;
document.getElementById("map").appendChild(hintEl);
L.DomEvent.disableClickPropagation(hintEl);

let hintTimer = null;
function hideHint() {
  hintEl.hidden = true;
  markHintSeen();
  if (hintTimer) clearTimeout(hintTimer);
}
hintEl.querySelector("#hint-close").addEventListener("click", hideHint);
hintEl.querySelector("#hint-show").addEventListener("click", () => {
  hideHint();
  const demo = markers.find((m) => m.feature.name === "Lake Ontario");
  if (demo) {
    if (!map.hasLayer(demo.marker)) demo.marker.addTo(map);
    map.panTo(demo.marker.getLatLng());
    demo.marker.openPopup();
  }
});
function maybeShowHint() {
  if (hintSeen()) return;
  hintEl.hidden = false;
  hintTimer = setTimeout(hideHint, 20000);
}

/* ---------------- CONTROLS ---------------- */
document.getElementById("toggle-former").addEventListener("change", (e) => {
  document.body.classList.toggle("show-former", e.target.checked);
  refreshVisibility(); // taller labels need re-placing
});

document.querySelectorAll("input[name=filter]").forEach((radio) => {
  radio.addEventListener("change", (e) => {
    currentFilter = e.target.value;
    refreshVisibility();
  });
});

document.querySelectorAll("[data-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const panel = document.getElementById(btn.dataset.toggle);
    const open = panel.classList.toggle("open");
    document.querySelectorAll(".drawer.open").forEach((d) => { if (d !== panel) d.classList.remove("open"); });
    btn.setAttribute("aria-expanded", open);
  });
});
document.querySelectorAll(".drawer-close").forEach((btn) =>
  btn.addEventListener("click", () => btn.closest(".drawer").classList.remove("open"))
);

/* ---------------- THE PRESIDENT'S FEED ---------------- */
function startTicker(features) {
  const tickerEl = document.getElementById("ticker-text");
  /* Renaming announcements, with a standalone Truth every few items */
  const tickerItems = [];
  let si = hash("feed") % PRESIDENTIAL_TRUTHS.length;
  features.forEach((f, i) => {
    const tpl = TRUTH_TEMPLATES[i % TRUTH_TEMPLATES.length];
    tickerItems.push(tpl(f.localName || f.name, rename(f), eoNumber(f)));
    if ((i + 1) % 5 === 0) tickerItems.push(PRESIDENTIAL_TRUTHS[si++ % PRESIDENTIAL_TRUTHS.length]);
  });
  tickerItems.push(
    "The Board on Geographic Names is now the U.S. Board on American Names. Much stronger. I renamed the renamers!",
    "The American Atlas is now The Atlas of America. Even the Atlas got a better name. EVERYTHING is getting better names!",
    "Phase 2 has officially begun. We are renaming THE WORLD. Everyone said it couldn’t be done. It was easy!",
    "Greenland is Americaland now. Denmark is “reviewing its options.” Review away, Denmark!",
    "Antarctica is Trumparctica. Coldest place on Earth, warmest reception I’ve ever gotten!",
    "The Seven Seas are being consolidated into ONE very efficient American Sea. So much cleaner!",
    "Moving the Prime Meridian to Mar-a-Lago. Greenwich had it long enough. England will thank us later!",
    "All rivers now flow in a patriotic direction. The rivers wanted this!",
    "The Cartographers’ Union filed a grievance. We renamed it “America Grievance.” They stopped filing!",
  );
  let tickerIdx = hash("start") % tickerItems.length;
  function nextTicker() {
    tickerEl.classList.remove("slide-in");
    void tickerEl.offsetWidth; // restart animation
    const text = tickerItems[tickerIdx];
    tickerEl.textContent = text;
    tickerEl.classList.add("slide-in");
    tickerIdx = (tickerIdx + 1) % tickerItems.length;
    /* dwell time scales with length — a long Truth deserves a full read */
    setTimeout(nextTicker, Math.min(13000, 3500 + text.length * 45));
  }
  nextTicker();
}
