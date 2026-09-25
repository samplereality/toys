# Neighborhood Watch

An incremental game about watching. It starts with a window.

Play it the way you would play *Universal Paperclips*: one button, then a
business, then projects with names that get stranger, then things you did not
expect to be managing. The satire is in the rules. Nothing below this line is
something a player should read first.

---

## Design notes (spoilers)

- **Nothing is shown before it is earned.** The page opens with a single button
  ("Peek through the blinds"). Every panel appears only when the game state
  calls for it, and the palette darkens with each stage: the porch, the street,
  the body, the region, everything, and finally Subject 0.
- **One currency, then layers.** *Sightings* are what you see, and they are what
  you spend: every camera is justified by what the last one saw. Looking out
  the window yields one; cameras yield them per second on the classic ×1.15
  cost curve; click upgrades (binoculars, a second monitor, the Neighbors app)
  keep looking worthwhile. Sharing with police introduces *Clearance*, which
  buys vision models and retention; models produce *Inferences*, and idle
  models produce *Suspicion*, which the stranger projects demand. Incorporating
  introduces *Funding* (rounds raised against sightings per second, plus city
  contracts). Winning against the people who push back yields *Impunity*.
  *Coverage* is measured in humans, out of 8.1 billion.
- **Prestige is a rebrand.** Once you are a company, you can reset everything
  and the public forgets: you gain *Amnesia*, a permanent multiplier, and keep
  the knowledge of how to build it all again. The map, the lawsuits, and the
  old name are gone.
- **Idle.** Cameras keep producing for up to eight hours while the tab is
  closed. Every look floats a number; every purchase flashes; sound is optional.
- **Fifty-odd projects** escalate from "Motion sensitivity: High" through bird
  sex determination, plate readers, retail face recognition, delivery drones,
  school laptops, toothbrush cameras, sleep monitors, contact lenses, inner
  voice transcription, and "Mandatory." Each one's payoff line is modeled on
  something reported: the 71% misread rate, the "had an abortion, search for
  female" query, the 164 searches for an ex, the 56,000 laptop photographs.
- **The battles** arrive once plate readers go up: birdwatchers mapping
  cameras, records requests, sabotage, protests, investigations, class actions,
  and council votes, each fought with a stat you allocate influence to. Wins
  buy the countermeasures a real company has used (SLAPP suits, astroturf,
  buying the paper, model legislation, state preemption).
- **The end.** At 100% coverage the system looks for the one thing it hasn't
  seen. The Subject 0 panel is built from the player's real session: time,
  clicks, a heatmap of their cursor, how often they looked away, their device,
  whether they hovered over "delete all footage." Then it asks, through the
  browser's normal permission prompt, to install a camera. The feed is shown
  only locally and never stored; declining is handled and is also "data." The
  choice after that is "Keep watching" or "Look away," and looking away
  dismantles the whole page in reverse until only the first button is left.

## Privacy

Everything runs in the browser. There is no server, no analytics, and no
network request other than loading the three files. The save lives in
`localStorage`. The webcam stream, if granted, is rendered to a `<video>`
element and stopped after fourteen seconds; nothing is recorded.

## Running and deploying

Three static files, no build step, no dependencies. Open `index.html` or serve
the folder with anything.

- **Netlify:** new site from Git, base directory `watch`, no build command,
  publish directory `.` (the included `netlify.toml` sets this). Or deploy the
  repo root and the game is at `/watch/`.
- **Vercel:** import the repo, root directory `watch`, framework "Other," no
  build command. Or import as-is and the game is at `/watch/`.

## Tuning

`engine.js` has no DOM dependencies, so it can be driven headlessly. A greedy
bot reaches the end in about 75 minutes; a person exploring, or leaving it to
idle, will take longer.

## Credits

The form is borrowed from Frank Lantz's *Universal Paperclips*. The incidents
are drawn from reporting on license plate reader networks and the people
organizing against them; see [deflock.org](https://deflock.org/),
[flocksurveillance.org](https://flocksurveillance.org/), the ACLU's
"Get the Flock Out" campaign, 404 Media, and the Electronic Frontier Foundation.
