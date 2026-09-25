# Neighborhood Watch

An incremental game about watching. It starts with a doorbell camera.

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
- **The resources are the argument.** Clips are the product. Buyers pay for
  them. Clearance (from sharing with police) buys vision cores and retention.
  Idle cores produce Paranoia, which the weirder projects require. Coverage is
  measured in humans, out of 8.1 billion. Impunity comes from beating the
  people who push back.
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
bot reaches the end in about 55 minutes; a person exploring will take longer.

## Credits

The form is borrowed from Frank Lantz's *Universal Paperclips*. The incidents
are drawn from reporting on license plate reader networks and the people
organizing against them; see [deflock.org](https://deflock.org/),
[flocksurveillance.org](https://flocksurveillance.org/), the ACLU's
"Get the Flock Out" campaign, 404 Media, and the Electronic Frontier Foundation.
