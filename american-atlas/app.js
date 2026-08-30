/* =========================================================================
 * AMERICAN ATLAS — Bureau of Patriotic Nomenclature
 * "One nation, one name, applied indiscriminately."
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
  // Waters — Spanish (the Bureau is bilingual when annexing)
  [/^Golfo de .+$/i, "Golfo de América"],
  [/^Bahía de .+$/i, "Bahía de América"],
  [/^Lago (?:de )?.+$/i, "Lago América"],
  [/^Laguna de .+$/i, "Laguna América"],
  [/^.+ Reservoir$/i, "America Reservoir"],
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
const PARK_KINDS = new Set(["park"]);
const groupOf = (f) => WATER_KINDS.has(f.kind) ? "water" : (PARK_KINDS.has(f.kind) ? "park" : "landmark");

/* ---------------- THE MAP ---------------- */
const map = L.map("map", {
  zoomControl: false,
  minZoom: 3,
  maxZoom: 11,
  maxBounds: [[2, -179.9], [85, -20]],
  maxBoundsViscosity: 0.7,
  worldCopyJump: false,
}).setView([46, -96], 4);

L.control.zoom({ position: "bottomright" }).addTo(map);

/* Basemaps with NO labels — the old names have been scrubbed from history.
 * All keyless (CARTO began demanding API keys for its free tiles in 2025,
 * a renaming-adjacent betrayal). If a provider starts erroring, we fall
 * back down the chain rather than show a nameless void. */
const BASEMAPS = [
  {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
    maxNativeZoom: 13,
    attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, NPS',
  },
  {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    maxNativeZoom: 16,
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  },
  {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    maxNativeZoom: 13,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
  },
];
const BUREAU_CREDIT = " &middot; toponyms &copy; Bureau of Patriotic Nomenclature";

let basemapLayer = null;
function setBasemap(idx) {
  if (basemapLayer) map.removeLayer(basemapLayer);
  const b = BASEMAPS[idx];
  let errCount = 0;
  basemapLayer = L.tileLayer(b.url, {
    maxNativeZoom: b.maxNativeZoom,
    maxZoom: 19,
    attribution: b.attribution + BUREAU_CREDIT,
  });
  basemapLayer.on("tileerror", () => {
    errCount++;
    if (errCount === 6 && idx + 1 < BASEMAPS.length) {
      console.warn("American Atlas: basemap misbehaving, falling back to provider " + (idx + 2));
      setBasemap(idx + 1);
    }
  });
  basemapLayer.addTo(map);
}
setBasemap(0);

/* ---------------- HYDROGRAPHY ----------------
 * Basemaps proved unreliable at actually depicting water, which is a
 * problem for a map whose entire premise is water. So the Atlas draws
 * its own: Natural Earth 10m lakes & rivers (public domain), filtered
 * to North America. Every single one is clickable, and every single
 * one is named America.
 */
const WATER_FILL = "#a9cfe6";
const WATER_LINE = "#7fb0d4";
const hydroRenderer = L.canvas({ padding: 0.4 });

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

fetch("data/lakes.json")
  .then((r) => r.json())
  .then((fc) => {
    hydroCount += fc.features.length;
    L.geoJSON(fc, {
      renderer: hydroRenderer,
      style: { color: WATER_LINE, weight: 0.7, fillColor: WATER_FILL, fillOpacity: 1 },
      onEachFeature: onHydroFeature,
    }).addTo(map);
    updateWaterStat();
  })
  .catch((e) => console.warn("American Atlas: lakes failed to load", e));

let riversLayerMajor = null, riversLayerMinor = null;
fetch("data/rivers.json")
  .then((r) => r.json())
  .then((fc) => {
    hydroCount += fc.features.length;
    const major = { type: "FeatureCollection", features: fc.features.filter((f) => f.properties.mz < 7) };
    const minor = { type: "FeatureCollection", features: fc.features.filter((f) => f.properties.mz >= 7) };
    const opts = {
      renderer: hydroRenderer,
      style: (f) => ({ color: WATER_LINE, weight: riverWeight(f.properties), fill: false }),
      onEachFeature: onHydroFeature,
    };
    riversLayerMajor = L.geoJSON(major, opts).addTo(map);
    riversLayerMinor = L.geoJSON(minor, opts);
    refreshRivers();
    updateWaterStat();
  })
  .catch((e) => console.warn("American Atlas: rivers failed to load", e));

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

/* ---------------- LABELS ---------------- */
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

ATLAS_FEATURES.forEach((f) => {
  const icon = L.divIcon({ className: "atlas-label", html: labelHtml(f), iconSize: null });
  const marker = L.marker([f.lat, f.lng], { icon, keyboard: false });
  marker.bindPopup(popupHtml(f), { maxWidth: 320, className: "atlas-popup" });
  markers.push({ marker, feature: f, group: groupOf(f) });
});

function refreshVisibility() {
  const z = map.getZoom();
  markers.forEach(({ marker, feature, group }) => {
    const show = feature.rank <= z && (currentFilter === "all" || currentFilter === group);
    if (show && !map.hasLayer(marker)) marker.addTo(map);
    if (!show && map.hasLayer(marker)) map.removeLayer(marker);
  });
}
map.on("zoomend", refreshVisibility);
refreshVisibility();

/* ---------------- CONTROLS ---------------- */
const stats = { water: 0, park: 0, landmark: 0 };
markers.forEach(({ group }) => stats[group]++);
function updateWaterStat() {
  document.getElementById("stat-water").textContent = (stats.water + hydroCount).toLocaleString("en-US");
}
document.getElementById("stat-water").textContent = stats.water;
document.getElementById("stat-park").textContent = stats.park;
document.getElementById("stat-landmark").textContent = stats.landmark;

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
const tickerEl = document.getElementById("ticker-text");
const tickerItems = ATLAS_FEATURES.map((f) =>
  `⚡ BREAKING: ${f.localName || f.name} shall henceforth be known as ${rename(f)} (E.O. ${eoNumber(f)})`
);
// A few evergreen bulletins in the rotation
tickerItems.push(
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
