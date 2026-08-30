/*
 * AMERICAN ATLAS — feature gazetteer
 *
 * Every entry stores the feature's FORMER (pre-glory) name. The Bureau's
 * renaming algorithm (see app.js) computes the new, official name at
 * runtime, because hand-typing "America" hundreds of times would be
 * un-American levels of effort.
 *
 * kind:  lake | river | gulf | bay | sea | ocean | sound | strait | falls
 *        park | monument | landmark
 * rank:  minimum zoom level at which the label appears (3 = continental)
 * lang:  optional — 'es' or 'fr' features get renamed in their own language,
 *        because the Bureau is nothing if not culturally sensitive.
 * status: optional — 'official' marks renamings that (in this timeline)
 *        have already been decreed.
 */

const ATLAS_FEATURES = [
  /* ============ OCEANS & SEAS ============ */
  { name: "Pacific Ocean", kind: "ocean", lat: 35.0, lng: -140.0, country: "International (pending)", rank: 3 },
  { name: "Atlantic Ocean", kind: "ocean", lat: 33.0, lng: -60.0, country: "International (pending)", rank: 3 },
  { name: "Arctic Ocean", kind: "ocean", lat: 76.0, lng: -140.0, country: "International (pending)", rank: 3 },
  { name: "Caribbean Sea", kind: "sea", lat: 16.5, lng: -78.0, country: "International (pending)", rank: 3 },
  { name: "Labrador Sea", kind: "sea", lat: 57.0, lng: -55.0, country: "Canada", rank: 4 },
  { name: "Bering Sea", kind: "sea", lat: 57.5, lng: -175.0, country: "USA / Russia (disputed vibes)", rank: 4 },
  { name: "Salton Sea", kind: "sea", lat: 33.3, lng: -115.83, country: "USA", rank: 6 },

  /* ============ GULFS ============ */
  { name: "Gulf of Mexico", kind: "gulf", lat: 25.5, lng: -90.0, country: "USA / Mexico / Cuba", rank: 3, status: "official",
    note: "The one that started it all. Renamed by executive order, January 2025." },
  { name: "Gulf of California", kind: "gulf", lat: 27.5, lng: -111.5, country: "Mexico", rank: 4, lang: "es", localName: "Golfo de California",
    note: "Also known as the Sea of Cortez. Cortez has been asked to clean out his desk." },
  { name: "Gulf of Alaska", kind: "gulf", lat: 57.0, lng: -145.0, country: "USA", rank: 4 },
  { name: "Gulf of Maine", kind: "gulf", lat: 43.3, lng: -68.3, country: "USA / Canada", rank: 5 },
  { name: "Gulf of St. Lawrence", kind: "gulf", lat: 48.2, lng: -62.0, country: "Canada", rank: 4 },
  { name: "Bahía de Campeche", kind: "bay", lat: 19.8, lng: -93.5, country: "Mexico", rank: 5, lang: "es" },

  /* ============ THE GREAT LAKES (soon: THE GREAT LAKE, five times) ============ */
  { name: "Lake Superior", kind: "lake", lat: 47.7, lng: -87.5, country: "USA / Canada", rank: 3,
    note: "The largest freshwater lake on Earth by surface area. Now merely the largest Lake America." },
  { name: "Lake Michigan", kind: "lake", lat: 43.9, lng: -87.1, country: "USA", rank: 3 },
  { name: "Lake Huron", kind: "lake", lat: 44.8, lng: -82.4, country: "USA / Canada", rank: 3 },
  { name: "Lake Erie", kind: "lake", lat: 42.2, lng: -81.2, country: "USA / Canada", rank: 3 },
  { name: "Lake Ontario", kind: "lake", lat: 43.65, lng: -77.9, country: "USA / Canada", rank: 3, status: "official",
    note: "Renamed this very week. Ontario reportedly 'still processing.'" },

  /* ============ LAKES — USA ============ */
  { name: "Great Salt Lake", kind: "lake", lat: 41.1, lng: -112.5, country: "USA", rank: 5 },
  { name: "Lake Tahoe", kind: "lake", lat: 39.09, lng: -120.04, country: "USA", rank: 5 },
  { name: "Lake Okeechobee", kind: "lake", lat: 26.94, lng: -80.8, country: "USA", rank: 5 },
  { name: "Lake Champlain", kind: "lake", lat: 44.5, lng: -73.33, country: "USA / Canada", rank: 6 },
  { name: "Lake Powell", kind: "lake", lat: 37.07, lng: -111.25, country: "USA", rank: 6 },
  { name: "Lake Mead", kind: "lake", lat: 36.25, lng: -114.4, country: "USA", rank: 6 },
  { name: "Crater Lake", kind: "lake", lat: 42.94, lng: -122.1, country: "USA", rank: 6 },
  { name: "Flathead Lake", kind: "lake", lat: 47.9, lng: -114.1, country: "USA", rank: 6 },
  { name: "Lake Pontchartrain", kind: "lake", lat: 30.2, lng: -90.1, country: "USA", rank: 6 },
  { name: "Lake of the Woods", kind: "lake", lat: 49.2, lng: -94.9, country: "USA / Canada", rank: 6 },
  { name: "Lake of the Ozarks", kind: "lake", lat: 38.15, lng: -92.8, country: "USA", rank: 7 },
  { name: "Finger Lakes", kind: "lake", lat: 42.7, lng: -76.8, country: "USA", rank: 7,
    note: "All eleven of them. Each finger individually renamed." },

  /* ============ LAKES — CANADA ============ */
  { name: "Great Bear Lake", kind: "lake", lat: 66.0, lng: -121.0, country: "Canada", rank: 4 },
  { name: "Great Slave Lake", kind: "lake", lat: 61.5, lng: -114.0, country: "Canada", rank: 4 },
  { name: "Lake Winnipeg", kind: "lake", lat: 52.1, lng: -97.3, country: "Canada", rank: 4 },
  { name: "Lake Athabasca", kind: "lake", lat: 59.4, lng: -109.0, country: "Canada", rank: 5 },
  { name: "Reindeer Lake", kind: "lake", lat: 57.3, lng: -102.3, country: "Canada", rank: 6 },
  { name: "Lake Nipigon", kind: "lake", lat: 49.8, lng: -88.5, country: "Canada", rank: 6 },
  { name: "Lake Louise", kind: "lake", lat: 51.42, lng: -116.22, country: "Canada", rank: 7,
    note: "Louise was not consulted." },
  { name: "Lac Saint-Jean", kind: "lake", lat: 48.6, lng: -72.0, country: "Canada", rank: 6, lang: "fr" },
  { name: "Lac Mistassini", kind: "lake", lat: 51.0, lng: -73.6, country: "Canada", rank: 6, lang: "fr" },

  /* ============ LAKES — MEXICO ============ */
  { name: "Lago de Chapala", kind: "lake", lat: 20.28, lng: -103.0, country: "Mexico", rank: 5, lang: "es" },
  { name: "Lago de Pátzcuaro", kind: "lake", lat: 19.6, lng: -101.63, country: "Mexico", rank: 7, lang: "es" },
  { name: "Laguna de Términos", kind: "lake", lat: 18.6, lng: -91.5, country: "Mexico", rank: 6, lang: "es",
    note: "A lagoon whose name literally means 'Lagoon of Endings.' Prophetic." },

  /* ============ RIVERS — USA ============ */
  { name: "Mississippi River", kind: "river", lat: 33.4, lng: -91.1, country: "USA", rank: 4,
    note: "Schoolchildren nationwide celebrate no longer having to spell it." },
  { name: "Missouri River", kind: "river", lat: 42.5, lng: -97.4, country: "USA", rank: 4 },
  { name: "Ohio River", kind: "river", lat: 37.9, lng: -86.6, country: "USA", rank: 4 },
  { name: "Colorado River", kind: "river", lat: 36.3, lng: -113.1, country: "USA / Mexico", rank: 4 },
  { name: "Columbia River", kind: "river", lat: 45.7, lng: -120.5, country: "USA / Canada", rank: 5 },
  { name: "Snake River", kind: "river", lat: 42.9, lng: -114.9, country: "USA", rank: 5 },
  { name: "Rio Grande", kind: "river", lat: 29.6, lng: -101.6, country: "USA / Mexico", rank: 4, lang: "es", localName: "Río Grande",
    note: "Known as the Río Bravo in Mexico. Both sides can finally agree on a name." },
  { name: "Hudson River", kind: "river", lat: 41.8, lng: -73.95, country: "USA", rank: 6 },
  { name: "Potomac River", kind: "river", lat: 38.65, lng: -77.12, country: "USA", rank: 6 },
  { name: "Delaware River", kind: "river", lat: 40.2, lng: -75.05, country: "USA", rank: 7 },
  { name: "Tennessee River", kind: "river", lat: 35.0, lng: -88.2, country: "USA", rank: 6 },
  { name: "Arkansas River", kind: "river", lat: 35.3, lng: -94.6, country: "USA", rank: 6 },
  { name: "Sacramento River", kind: "river", lat: 39.3, lng: -122.0, country: "USA", rank: 6 },
  { name: "Yukon River", kind: "river", lat: 63.9, lng: -152.5, country: "USA / Canada", rank: 4 },

  /* ============ RIVERS — CANADA ============ */
  { name: "Mackenzie River", kind: "river", lat: 65.3, lng: -128.8, country: "Canada", rank: 4 },
  { name: "Fraser River", kind: "river", lat: 51.9, lng: -122.4, country: "Canada", rank: 5 },
  { name: "Saskatchewan River", kind: "river", lat: 53.2, lng: -103.5, country: "Canada", rank: 5 },
  { name: "Ottawa River", kind: "river", lat: 45.9, lng: -77.3, country: "Canada", rank: 6 },
  { name: "St. Lawrence River", kind: "river", lat: 46.6, lng: -71.9, country: "Canada / USA", rank: 4, lang: "fr", localName: "Fleuve Saint-Laurent",
    note: "Saint Lawrence has been de-canonized for administrative convenience." },
  { name: "Rivière Saguenay", kind: "river", lat: 48.35, lng: -70.5, country: "Canada", rank: 6, lang: "fr" },

  /* ============ RIVERS — MEXICO ============ */
  { name: "Río Usumacinta", kind: "river", lat: 17.4, lng: -91.5, country: "Mexico / Guatemala", rank: 5, lang: "es" },
  { name: "Río Conchos", kind: "river", lat: 28.5, lng: -105.4, country: "Mexico", rank: 6, lang: "es" },
  { name: "Río Lerma", kind: "river", lat: 20.05, lng: -101.3, country: "Mexico", rank: 6, lang: "es" },
  { name: "Río Yaqui", kind: "river", lat: 28.3, lng: -109.7, country: "Mexico", rank: 7, lang: "es" },

  /* ============ BAYS, SOUNDS & STRAITS ============ */
  { name: "Hudson Bay", kind: "bay", lat: 59.5, lng: -85.0, country: "Canada", rank: 3,
    note: "Henry Hudson's descendants have been offered a commemorative tote bag." },
  { name: "James Bay", kind: "bay", lat: 53.5, lng: -80.5, country: "Canada", rank: 4 },
  { name: "Bay of Fundy", kind: "bay", lat: 45.0, lng: -65.6, country: "Canada", rank: 5,
    note: "Home of the world's highest tides, now the world's highest patriotism." },
  { name: "Chesapeake Bay", kind: "bay", lat: 37.9, lng: -76.15, country: "USA", rank: 5 },
  { name: "San Francisco Bay", kind: "bay", lat: 37.65, lng: -122.25, country: "USA", rank: 6 },
  { name: "Tampa Bay", kind: "bay", lat: 27.7, lng: -82.6, country: "USA", rank: 6,
    note: "The football team will be renamed the America Bay Buccaneers, then investigated for piracy." },
  { name: "Green Bay", kind: "bay", lat: 44.9, lng: -87.7, country: "USA", rank: 6,
    note: "The Packers now play at Lambeau Field on America Bay. Cheeseheads remain legal. For now." },
  { name: "Bahía de Banderas", kind: "bay", lat: 20.65, lng: -105.4, country: "Mexico", rank: 6, lang: "es" },
  { name: "Puget Sound", kind: "sound", lat: 47.65, lng: -122.45, country: "USA", rank: 5 },
  { name: "Long Island Sound", kind: "sound", lat: 41.1, lng: -72.9, country: "USA", rank: 6 },
  { name: "Bering Strait", kind: "strait", lat: 65.7, lng: -169.0, country: "USA / Russia", rank: 4,
    note: "Russia has been notified that its half is also called America now." },
  { name: "Strait of Georgia", kind: "strait", lat: 49.3, lng: -123.8, country: "Canada", rank: 6 },
  { name: "Strait of Juan de Fuca", kind: "strait", lat: 48.25, lng: -123.5, country: "USA / Canada", rank: 6 },
  { name: "Davis Strait", kind: "strait", lat: 65.0, lng: -58.0, country: "Canada / Greenland", rank: 5,
    note: "Greenland renaming pending acquisition." },

  /* ============ WATERFALLS ============ */
  { name: "Niagara Falls", kind: "falls", lat: 43.08, lng: -79.07, country: "USA / Canada", rank: 5,
    note: "Not to be confused with the American Falls at Niagara, which is now also called America Falls. The Bureau sees no problem here." },
  { name: "Yosemite Falls", kind: "falls", lat: 37.76, lng: -119.6, country: "USA", rank: 8 },

  /* ============ NATIONAL PARKS — USA ============ */
  { name: "Yellowstone National Park", kind: "park", lat: 44.6, lng: -110.5, country: "USA", rank: 4,
    note: "Home of Old Trumpful, which erupts reliably every 90 minutes, or whenever cameras are present." },
  { name: "Yosemite National Park", kind: "park", lat: 37.85, lng: -119.55, country: "USA", rank: 4 },
  { name: "Grand Canyon National Park", kind: "park", lat: 36.2, lng: -112.5, country: "USA", rank: 4,
    note: "The canyon itself remains huge. Some say the biggest. It's not (see: Trump Canyon, formerly Copper Canyon, Mexico)." },
  { name: "Zion National Park", kind: "park", lat: 37.3, lng: -113.05, country: "USA", rank: 5 },
  { name: "Glacier National Park", kind: "park", lat: 48.7, lng: -113.8, country: "USA", rank: 5 },
  { name: "Everglades National Park", kind: "park", lat: 25.3, lng: -80.9, country: "USA", rank: 5 },
  { name: "Great Smoky Mountains National Park", kind: "park", lat: 35.6, lng: -83.5, country: "USA", rank: 5 },
  { name: "Acadia National Park", kind: "park", lat: 44.35, lng: -68.2, country: "USA", rank: 5 },
  { name: "Rocky Mountain National Park", kind: "park", lat: 40.35, lng: -105.7, country: "USA", rank: 5 },
  { name: "Denali National Park", kind: "park", lat: 63.2, lng: -152.5, country: "USA", rank: 4,
    note: "Contains Mount Trump (formerly Denali, formerly Mount McKinley, formerly Denali, formerly Mount McKinley, originally Denali)." },
  { name: "Joshua Tree National Park", kind: "park", lat: 33.9, lng: -115.9, country: "USA", rank: 6 },
  { name: "Death Valley National Park", kind: "park", lat: 36.5, lng: -117.0, country: "USA", rank: 5,
    note: "Briefly considered for 'Trump Valley' before someone read the first word aloud." },
  { name: "Olympic National Park", kind: "park", lat: 47.8, lng: -123.6, country: "USA", rank: 5 },
  { name: "Arches National Park", kind: "park", lat: 38.7, lng: -109.6, country: "USA", rank: 6 },
  { name: "Badlands National Park", kind: "park", lat: 43.85, lng: -102.35, country: "USA", rank: 6 },
  { name: "Big Bend National Park", kind: "park", lat: 29.25, lng: -103.25, country: "USA", rank: 5 },
  { name: "Shenandoah National Park", kind: "park", lat: 38.5, lng: -78.45, country: "USA", rank: 6 },
  { name: "Sequoia National Park", kind: "park", lat: 36.5, lng: -118.55, country: "USA", rank: 6,
    note: "Contains the General Sherman Tree, now the General Trump Tree. It is the largest tree, which is why it was chosen." },
  { name: "Redwood National Park", kind: "park", lat: 41.3, lng: -124.0, country: "USA", rank: 6 },
  { name: "Mammoth Cave National Park", kind: "park", lat: 37.2, lng: -86.1, country: "USA", rank: 6 },
  { name: "Carlsbad Caverns National Park", kind: "park", lat: 32.15, lng: -104.55, country: "USA", rank: 6 },
  { name: "Grand Teton National Park", kind: "park", lat: 43.8, lng: -110.7, country: "USA", rank: 6 },
  { name: "Bryce Canyon National Park", kind: "park", lat: 37.6, lng: -112.2, country: "USA", rank: 6 },
  { name: "Isle Royale National Park", kind: "park", lat: 48.0, lng: -88.8, country: "USA", rank: 6 },
  { name: "Voyageurs National Park", kind: "park", lat: 48.5, lng: -92.9, country: "USA", rank: 6 },
  { name: "Hot Springs National Park", kind: "park", lat: 34.5, lng: -93.05, country: "USA", rank: 7 },
  { name: "Hawaii Volcanoes National Park", kind: "park", lat: 19.4, lng: -155.3, country: "USA", rank: 5 },

  /* ============ NATIONAL PARKS — CANADA ============ */
  { name: "Banff National Park", kind: "park", lat: 51.5, lng: -116.0, country: "Canada", rank: 5,
    note: "Canada's first national park, established 1885. Renamed without so much as a phone call." },
  { name: "Jasper National Park", kind: "park", lat: 52.9, lng: -118.1, country: "Canada", rank: 5 },
  { name: "Pacific Rim National Park", kind: "park", lat: 49.0, lng: -125.6, country: "Canada", rank: 6 },
  { name: "Gros Morne National Park", kind: "park", lat: 49.6, lng: -57.75, country: "Canada", rank: 6 },
  { name: "Wood Buffalo National Park", kind: "park", lat: 59.5, lng: -112.5, country: "Canada", rank: 5,
    note: "Larger than Switzerland. The buffalo have unionized in protest." },
  { name: "Algonquin Provincial Park", kind: "park", lat: 45.8, lng: -78.4, country: "Canada", rank: 6,
    note: "Technically provincial, but the Bureau does not recognize technicalities." },

  /* ============ NATIONAL PARKS — MEXICO ============ */
  { name: "Parque Nacional Cumbres de Monterrey", kind: "park", lat: 25.5, lng: -100.4, country: "Mexico", rank: 6, lang: "es" },
  { name: "Parque Nacional Cañón del Sumidero", kind: "park", lat: 16.85, lng: -93.08, country: "Mexico", rank: 6, lang: "es" },
  { name: "Parque Nacional Cabo Pulmo", kind: "park", lat: 23.43, lng: -109.42, country: "Mexico", rank: 7, lang: "es" },

  /* ============ MONUMENTS & LANDMARKS ============ */
  { name: "Mount Rushmore", kind: "monument", lat: 43.88, lng: -103.46, country: "USA", rank: 5,
    note: "A fifth face is under review. Also a sixth, seventh, and eighth face, all the same face." },
  { name: "Statue of Liberty", kind: "landmark", lat: 40.69, lng: -74.045, country: "USA", rank: 5,
    note: "The torch will be replaced with a golf club. The tablet now reads 'ART OF THE DEAL, JULY IV, MDCCLXXVI.'" },
  { name: "Devils Tower", kind: "monument", lat: 44.59, lng: -104.72, country: "USA", rank: 6,
    note: "America's first national monument (1906), and now its most litigated trademark dispute." },
  { name: "Golden Gate Bridge", kind: "landmark", lat: 37.82, lng: -122.48, country: "USA", rank: 6,
    note: "To be repainted actual gold, pending a very favorable estimate." },
  { name: "Gateway Arch", kind: "landmark", lat: 38.62, lng: -90.19, country: "USA", rank: 6 },
  { name: "Hoover Dam", kind: "landmark", lat: 36.02, lng: -114.74, country: "USA", rank: 6,
    note: "Herbert Hoover finally catches a break." },
  { name: "Washington Monument", kind: "monument", lat: 38.889, lng: -77.035, country: "USA", rank: 6,
    note: "George Washington could not be reached for comment, having been dead since 1799." },
  { name: "Lincoln Memorial", kind: "monument", lat: 38.889, lng: -77.05, country: "USA", rank: 7 },
  { name: "Liberty Bell", kind: "landmark", lat: 39.95, lng: -75.15, country: "USA", rank: 7,
    note: "The crack will be marketed as 'intentional, actually very beautiful.'" },
  { name: "Alcatraz Island", kind: "landmark", lat: 37.827, lng: -122.42, country: "USA", rank: 7 },
  { name: "Space Needle", kind: "landmark", lat: 47.62, lng: -122.35, country: "USA", rank: 7 },
  { name: "Empire State Building", kind: "landmark", lat: 40.748, lng: -73.986, country: "USA", rank: 7 },
  { name: "The White House", kind: "landmark", lat: 38.8977, lng: -77.0365, country: "USA", rank: 6,
    note: "This one was arguably already renamed." },
  { name: "Old Faithful", kind: "landmark", lat: 44.46, lng: -110.83, country: "USA", rank: 7 },
  { name: "Denali", kind: "landmark", lat: 63.0695, lng: -151.007, country: "USA", rank: 5,
    note: "North America's highest peak, 20,310 ft. The name has now changed more times than the elevation." },
  { name: "CN Tower", kind: "landmark", lat: 43.6426, lng: -79.387, country: "Canada", rank: 6,
    note: "Toronto insists 'CN' stood for 'Canadian National.' The Bureau has determined it stands for 'Certainly Now-Trump.'" },
  { name: "Parliament Hill", kind: "landmark", lat: 45.425, lng: -75.70, country: "Canada", rank: 6 },
  { name: "Chichén Itzá", kind: "landmark", lat: 20.68, lng: -88.57, country: "Mexico", rank: 5,
    note: "The Maya built El Castillo to align with the equinox sun. It now aligns with the Bureau's quarterly branding goals." },
  { name: "Teotihuacán", kind: "landmark", lat: 19.69, lng: -98.84, country: "Mexico", rank: 6,
    note: "'The place where the gods were created' is now 'the place where the brand was created.'" },
  { name: "El Ángel de la Independencia", kind: "monument", lat: 19.427, lng: -99.168, country: "Mexico", rank: 7 },
  { name: "Copper Canyon", kind: "landmark", lat: 27.5, lng: -107.6, country: "Mexico", rank: 6,
    note: "Deeper and larger than the Grand Canyon, a fact the Bureau has classified." },
];
