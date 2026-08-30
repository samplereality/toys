# American Atlas 🦅

*Every body of water. One great name.*

A satirical interactive map of North America from the **Bureau of Patriotic
Nomenclature**, in which:

- every body of water — lake, river, gulf, bay, sea, ocean, sound, strait, or
  waterfall, in the United States, Canada, and Mexico alike — is now named
  **America** (or *América* / *Amérique*, the Bureau being culturally
  sensitive while annexing);
- every national park is now **Trump National Park**;
- every national monument and landmark is now **Trump**-something
  (Mount Trumpmore, the Statue of Trump, Trump Tower — formerly Devils
  Tower, the first of many).

Inspired by the actual renaming of the Gulf of Mexico to the "Gulf of
America" (January 2025), taken to its logical conclusion.

## Features

- A **fully self-drawn vector basemap** — no tile servers, no API keys, no
  foreign cartographic dependencies. Land, country and state borders, lakes,
  and rivers are all rendered by Leaflet from vendored **Natural Earth**
  data (public domain), in a classic school-atlas style: parchment land,
  blue water, a graticule over the ocean. The only labels left untouched
  are countries and states.
- ~7,400 Natural Earth lakes and rivers, every one clickable, every one
  renamed America by the regex engine — including the unnamed ones, which
  are informed they are now named America and told "you're welcome."
- The curated gazetteer of famous renamed places lives in
  `data/places.geojson`.
- ~140 real features, each renamed at runtime by an actual regex ruleset —
  view it in the **The Algorithm** panel, rendered as the `sed` script that
  replaced the Bureau's 240-person toponymy department.
- Click any label for its official renaming decree, executive-order number,
  and a note from the Bureau.
- **Reveal former (forbidden) names** toggle for light cartographic
  thoughtcrime.
- Filter by waters / parks / landmarks; labels appear progressively as you
  zoom (smaller waters are also named America — all of them).
- Breaking-news renaming ticker.

## Running it

It's a static page. Open `index.html` via any web server, e.g.:

```sh
python3 -m http.server
# then visit http://localhost:8000/american-atlas/
```

Leaflet 1.9.4 is vendored in `vendor/leaflet/` (BSD-2-Clause, see its
LICENSE); all map data is vendored in `data/` (Natural Earth, public
domain, clipped to North America and simplified with mapshaper). The page
makes zero external requests apart from one Google Fonts stylesheet, and
degrades gracefully without it.

## Disclaimer

**This is satire.** A parody. Not affiliated with any government, bureau,
executive order, or golf course. Except for the Gulf of Mexico, the
renamings depicted are fictional — for now. Coordinates approximate;
patriotism absolute.
