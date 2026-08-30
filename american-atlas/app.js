/* =========================================================================
 * AMERICAN ATLAS — Bureau of Patriotic Nomenclature
 * "One nation, one name, applied indiscriminately."
 *
 * The Atlas draws its entire basemap itself from vendored Natural Earth
 * data (public domain): land, borders, lakes, rivers. No tile servers,
 * no API keys, no foreign cartographic dependencies. The only truthful
 * labels on this map are countries and states; everything else has been
 * improved.
 * ========================================================================= */

/* ---------------- THE ALGORITHM ----------------
 * The Bureau's entire toponymy department, expressed as a regex ruleset.
 * Order matters. The first matching rule wins, much like everything else.
 */
const RENAME_RULES = [
  // Waters — English
  [/^Gulf of .+$/i, "Gulf of America"],
  [/^Bay of .+$/i, "Bay of America"],
  [/^Lake .+$/i, "Lake America"],
  [/^.+ Lakes$/i, "The America Lakes"],
  [/^.+ Lake$/i, "Lake America"],
  [/^.+ River$/i, "The America River"],
  [/^Rio Grande$/i, "The America River"],
  [/^.+ Bay$/i, "America Bay"],
  [/^.+ Sound$/i, "America Sound"],
  [/^.+ Falls$/i, "America Falls"],
  [/^Straits? of .+$/i, "Strait of America"],
  [/^.+ Strait$/i, "Strait of America"],
  [/^.+ Sea$/i, "The America Sea"],
  [/^.+ Ocean$/i, "The America Ocean"],
  [/^.+ Reservoir$/i, "America Reservoir"],
  // Waters — Spanish (the Bureau is bilingual when annexing)
  [/^Golfo de .+$/i, "Golfo de América"],
  [/^Bahía de .+$/i, "Bahía de América"],
  [/^Lago (?:de )?.+$/i, "Lago América"],
  [/^Laguna de .+$/i, "Laguna América"],
  [/^Río .+$/i, "Río América"],
  // Waters — French (pour nos amis du nord)
  [/^Lac .+$/i, "Lac Amérique"],
  [/^Rivière .+$/i, "Rivière Amérique"],
  [/^Fleuve .+$/i, "Fleuve Amérique"],
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

const DECREES = [
  "Many people are saying it's the best name a body of water has ever had.",
  "Renamed by tremendous popular demand, mostly from one person.",
  "Cartographers wept. We assume with joy.",
  "The previous name was, frankly, a disaster.",
  "Nobody knew water could even have a name until now.",
  "The fish have reportedly never been prouder.",
  "This renaming was completed under budget, if you don't count the budget.",
  "GPS units will comply or be deported.",
  "The old name has been placed in a very beautiful archive, believe me.",
  "Locals were consulted after the decision, which experts agree is a kind of consulting.",
  "This name tested extremely well in a focus group of one.",
  "Signage updates are expected to conclude by the twelfth of Never, which is now called America Twelfth.",
];
const decreeFor = (f) => DECREES[hash(f.name + "d") % DECREES.length];

const WATER_KINDS = new Set(["lake", "river", "gulf", "bay", "sea", "ocean", "sound", "strait", "falls"]);
const groupOf = (f) => WATER_KINDS.has(f.kind) ? "water" : (f.kind === "park" ? "park" : "landmark");

/* ---------------- THE MAP ---------------- */
/* Hard bounds: the drawn world ends where the data was clipped (Greenland's
 * east edge at 45°W, the far north at ~84.5°N) — no scrolling into the void */
const map = L.map("map", {
  zoomControl: false,
  minZoom: 4,
  maxZoom: 9,
  maxBounds: [[6, -179.9], [84.5, -45]],
  maxBoundsViscosity: 1.0,
  worldCopyJump: false,
});
/* Open on the Great Lakes — all five Lake Americas on screen at once */
map.fitBounds([[40.8, -93.5], [49.3, -75.0]], { maxZoom: 6 });
window.atlasMap = map; // for debugging; the Bureau has nothing to hide

L.control.zoom({ position: "bottomright" }).addTo(map);
map.attributionControl.addAttribution(
  'Made with <a href="https://www.naturalearthdata.com/">Natural Earth</a> &middot; toponyms &copy; Bureau of Patriotic Nomenclature'
);

/* Stacked panes so async loads can't scramble the draw order. Lakes and
 * rivers share one pane and one canvas renderer so hit-detection covers
 * both (a second canvas on top would swallow the lower one's clicks). */
const PANES = { graticule: 205, land: 210, statelines: 220, hydro: 230, adminlabels: 580 };
for (const [name, z] of Object.entries(PANES)) {
  map.createPane(name).style.zIndex = z;
  if (name !== "adminlabels" && name !== "hydro") map.getPane(name).style.pointerEvents = "none";
}
const hydroRenderer = L.canvas({ pane: "hydro", padding: 0.4 });

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
  for (let lon = -180; lon <= -20; lon += 10) lines.push([[2, lon], [86, lon]]);
  for (let lat = 10; lat <= 80; lat += 10) lines.push([[lat, -180], [lat, -20]]);
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
}).catch((e) => console.warn("American Atlas: land failed", e));

loadJSON("data/state-lines.json").then((fc) => {
  L.geoJSON(fc, {
    pane: "statelines",
    renderer: L.canvas({ pane: "statelines", padding: 0.4 }),
    interactive: false,
    style: { color: STATE_LINE, weight: 0.8, fill: false },
  }).addTo(map);
}).catch((e) => console.warn("American Atlas: state lines failed", e));

/* The only labels the Bureau left alone: countries and states.
 * Except Greenland. Greenland has been acquired. */
const adminMarkers = [];
const COUNTRY_DISPLAY = { "United States of America": "United States" };
const COUNTRY_RENAMES = {
  "Greenland": {
    newName: "Americaland",
    note: "Acquisition finalized over Denmark's objections, which have been renamed Denmark's Agreements.",
  },
};

function addAdminLabels(fc, cls, minZoom) {
  fc.features.forEach((f) => {
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
        <div class="pop-decree">“${decreeFor({ name: raw })}”</div>
        <div class="pop-seal">— The Bureau of Patriotic Nomenclature 🦅</div>
      </div>`, { maxWidth: 320, className: "atlas-popup" });
    }
    adminMarkers.push({ marker: m, minZoom });
  });
  refreshAdminLabels();
}
function refreshAdminLabels() {
  const z = map.getZoom();
  adminMarkers.forEach(({ marker, minZoom }) => {
    const show = z >= minZoom;
    if (show && !map.hasLayer(marker)) marker.addTo(map);
    if (!show && map.hasLayer(marker)) map.removeLayer(marker);
  });
}
loadJSON("data/country-labels.json").then((fc) => addAdminLabels(fc, "admin-country", 3))
  .catch((e) => console.warn("American Atlas: country labels failed", e));
loadJSON("data/state-labels.json").then((fc) => addAdminLabels(fc, "admin-state", 5))
  .catch((e) => console.warn("American Atlas: state labels failed", e));
map.on("zoomend", refreshAdminLabels);

/* ---------------- HYDROGRAPHY ----------------
 * Natural Earth 10m lakes & rivers, filtered to North America. Every
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
      <div class="pop-former">This body of water previously had <i>no name at all</i>. It is now named America. You're welcome.</div>
      <div class="pop-seal">— The Bureau of Patriotic Nomenclature 🦅</div>
    </div>`;
  }
  const pseudo = { name: oldName, isWater: true };
  return `<div class="pop pop-water">
    <div class="pop-eyebrow">By order of Executive Order ${eoNumber(pseudo)}</div>
    <h3 class="pop-name">${rename(pseudo)}</h3>
    <div class="pop-former">formerly known as <s>${oldName}</s> <span class="pop-retired">(name retired)</span></div>
    <div class="pop-decree">“${decreeFor(pseudo)}”</div>
    <div class="pop-seal">— The Bureau of Patriotic Nomenclature 🦅</div>
  </div>`;
}

let hydroCount = 0;

function onHydroFeature(feature, layer) {
  layer.bindPopup(() => hydroPopup(feature.properties), { maxWidth: 300, className: "atlas-popup" });
}

loadJSON("data/lakes.json").then((fc) => {
  hydroCount += fc.features.length;
  L.geoJSON(fc, {
    pane: "hydro",
    renderer: hydroRenderer,
    style: { color: WATER_LINE, weight: 0.7, fillColor: WATER_FILL, fillOpacity: 1 },
    onEachFeature: onHydroFeature,
  }).addTo(map);
  updateWaterStat();
}).catch((e) => console.warn("American Atlas: lakes failed", e));

let riversLayerMajor = null, riversLayerMinor = null;
loadJSON("data/rivers.json").then((fc) => {
  hydroCount += fc.features.length;
  /* Majors (the Mississippi, Ohio, Missouri, Colorado tier) always show;
   * secondary rivers wait for zoom 7. Small tributaries were removed from
   * the data outright — the Bureau found them insufficiently tremendous. */
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
  updateWaterStat();
}).catch((e) => console.warn("American Atlas: rivers failed", e));

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
const stats = { water: 0, park: 0, landmark: 0 };

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
    ? `<div class="pop-official">✔ This renaming is real. The Bureau regrets nothing.</div>` : "";
  const note = f.note ? `<div class="pop-note">${f.note}</div>` : "";
  return `
    <div class="pop pop-${group}">
      <div class="pop-eyebrow">By order of Executive Order ${eoNumber(f)}</div>
      <h3 class="pop-name">${newName}</h3>
      <div class="pop-former">formerly known as <s>${f.localName || f.name}</s> <span class="pop-retired">(name retired)</span></div>
      <div class="pop-meta">${kindLabel} · ${f.country}</div>
      ${officialLine}
      ${note}
      <div class="pop-decree">“${decreeFor(f)}”</div>
      <div class="pop-seal">— The Bureau of Patriotic Nomenclature 🦅</div>
    </div>`;
}

function refreshVisibility() {
  const z = map.getZoom();
  markers.forEach(({ marker, feature, group }) => {
    const show = feature.rank <= z && (currentFilter === "all" || currentFilter === group);
    if (show && !map.hasLayer(marker)) marker.addTo(map);
    if (!show && map.hasLayer(marker)) map.removeLayer(marker);
  });
}
map.on("zoomend", refreshVisibility);

function updateWaterStat() {
  document.getElementById("stat-water").textContent = (stats.water + hydroCount).toLocaleString("en-US");
}

loadJSON("data/places.geojson").then((fc) => {
  fc.features.forEach((gf) => {
    const f = { ...gf.properties };
    const [lng, lat] = gf.geometry.coordinates;
    const icon = L.divIcon({ className: "atlas-label", html: labelHtml(f), iconSize: null });
    const marker = L.marker([lat, lng], { icon, keyboard: false });
    marker.bindPopup(popupHtml(f), { maxWidth: 320, className: "atlas-popup" });
    const group = groupOf(f);
    stats[group]++;
    markers.push({ marker, feature: f, group });
  });
  refreshVisibility();
  updateWaterStat();
  document.getElementById("stat-park").textContent = stats.park;
  document.getElementById("stat-landmark").textContent = stats.landmark;
  startTicker(fc.features.map((gf) => gf.properties));
}).catch((e) => console.warn("American Atlas: places failed", e));

/* ---------------- CONTROLS ---------------- */
document.getElementById("toggle-former").addEventListener("change", (e) => {
  document.body.classList.toggle("show-former", e.target.checked);
});

document.querySelectorAll("input[name=filter]").forEach((radio) => {
  radio.addEventListener("change", (e) => {
    currentFilter = e.target.value;
    refreshVisibility();
  });
});

/* The Algorithm panel: display the ACTUAL ruleset, sed-style, because the
 * Bureau believes in transparency (for regexes; for everything else, no). */
const sedLines = RENAME_RULES.map(([re, sub]) => {
  const body = re.source.replace(/\//g, "\\/");
  return `s/${body}/${sub}/i`;
}).concat(Object.entries(SPECIAL_CASES).map(([a, b]) => `s/^${a}$/${b}/   # artisanal`));
document.getElementById("algorithm-code").textContent =
  "#!/bin/sed -f\n# The Bureau's entire toponymy department:\n" + sedLines.join("\n");

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

/* ---------------- BREAKING NEWS TICKER ---------------- */
function startTicker(features) {
  const tickerEl = document.getElementById("ticker-text");
  const tickerItems = features.map((f) =>
    `⚡ BREAKING: ${f.localName || f.name} shall henceforth be known as ${rename(f)} (E.O. ${eoNumber(f)})`
  );
  tickerItems.push(
    "⚡ BREAKING: Greenland shall henceforth be known as Americaland (E.O. " + eoNumber({ name: "Greenland" }) + ")",
    "⚡ BREAKING: The Bureau of Patriotic Nomenclature announces that the word “lake” is under review",
    "⚡ BREAKING: All rivers now flow in an officially patriotic direction",
    "⚡ BREAKING: Cartographers' union files grievance; grievance renamed “America Grievance”",
    "⚡ BREAKING: Atlantic and Pacific to be merged into one very large, very beautiful ocean",
  );
  let tickerIdx = hash("start") % tickerItems.length;
  function nextTicker() {
    tickerEl.classList.remove("slide-in");
    void tickerEl.offsetWidth; // restart animation
    tickerEl.textContent = tickerItems[tickerIdx];
    tickerEl.classList.add("slide-in");
    tickerIdx = (tickerIdx + 1) % tickerItems.length;
  }
  nextTicker();
  setInterval(nextTicker, 5000);
}
