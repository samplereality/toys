# Gaggle Safety™ — Community Growth Simulator

A satirical browser game about automated license plate reader (ALPR) networks like
Flock Safety, and about the pitch that sells them to towns one intersection at a time.

You play the sales rep. Your KPI is vehicles scanned. Click intersections to install
readers at $3,000 a year, billed to the town. Watch the numbers go up. Notice what doesn't.

## The argument is in the rules

The game makes its case through mechanics rather than text (procedural rhetoric, in
Ian Bogost's sense):

- **Your score is scans and revenue.** Reported crime is a random walk that never
  consults your cameras. The dashboard's "Crime Eliminated™" number rises anyway,
  because it is computed the way the marketing computes it.
- **Alerts are wrong 71% of the time**, the rate a California police department's own
  audit found. More readers means more alerts means more innocent drivers on the
  shoulder, some at gunpoint. Growth and harm are the same curve.
- **National Lookup is on by default.** Outside agencies search the town's readers
  for immigration status, an abortion, a protest, or an ex, and you are never asked.
  Turning it off works until a "product update." Harm accrues silently in an audit
  log; disclosure only changes *when* trust falls, not whether it does.
- **Everything is billable to the town.** Free trials auto-renew. Lawsuits are
  indemnified. Vandalized readers are replaced at $3,000 each, because the town never
  owned them. When the budget runs dry the council cuts the library, not the contract.
- **Birdwatchers map every reader** onto an open map (see DeFlock). The map is
  what finally puts the contract on the council agenda.
- **The only thing that restores trust is removing readers**, and the button for that
  ("cancel contract," in the header, the same gray as the background) has been on
  screen since the first frame. The ending tells you how long you took to press it.

Every event in the activity feed is modeled on reporting; the **Sources** button lists
the articles, audits, and court filings behind each one. The company in the game is
fictional. The incidents are not.

## Running it

It is three static files with no build step and no dependencies. Open `index.html`
in a browser, or serve the folder with anything (`python3 -m http.server`).

## Deploying (free tiers)

**Netlify:** New site from Git → pick this repo → set *Base directory* to `gaggle`,
leave the build command empty, publish directory `.` (the included `netlify.toml`
sets this). Or deploy the whole repo with no settings; the game is then at `/gaggle/`.

**Vercel:** Import the repo → set *Root Directory* to `gaggle` → framework "Other",
no build command. Or import the repo as-is and the game is served at `/gaggle/`.

## Organizations doing the real work

- [deflock.org](https://deflock.org/) — the crowdsourced ALPR map, and a guide to talking to your city council
- [flocksurveillance.org](https://flocksurveillance.org/)
- [ACLU: Get the Flock Out](https://www.aclu.org/campaigns-initiatives/get-the-flock-out)
- [Fight for the Future: FLOCK Out](https://www.fightforthefuture.org/actions/flockout/)
- [Have I Been Flocked?](https://haveibeenflocked.com/) — search published audit logs
