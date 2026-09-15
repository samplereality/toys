# tools
Assortment of tools and experiments

## [code-invaders](code-invaders/)

Space Invaders that wears its source code on the outside. The game runs on
the left, its own rules run on the right, and clicking a rule switches that
code off mid-game. In the spirit of the Flash-era
[*Naked Game*](https://web.archive.org/web/20080420084021/http://www.retrodev.co.uk/MiscGames/NakedGame/TheNakedGame.html),
a version of Pong that let you disable its own code line by line.

A single self-contained `index.html` — no build, no dependencies. Open it in
a browser.

**Controls:** ← → move · space fire · P pause · R restart

### The panel

Two modes, toggled at the top of the right-hand column:

- **rules** — thirteen functions, grouped by mechanic, printed as their
  actual source. Click one to switch it off; its LED goes dark and the
  statements grey out. LEDs glow on the frames where a rule actually
  changes game state, so you can watch the tick fire in order.
- **variables** — eight `let` declarations you can drag to new values while
  the game runs. Double-click a value to reset just that one.

Hovering a rule highlights the entities it touches on the board, so you can
see what a given function has its hands on before you disable it. `restore
all code` turns every rule back on and resets every variable.

### The rules

| group | rule | what it does |
| --- | --- | --- |
| movement | `movePlayer` | reads the arrow keys |
| | `moveShots` | advances bullets up, bombs down |
| | `marchFleet` | steps the fleet sideways on a timer |
| | `fleetTurnsAtEdge` | reverses and descends at the wall |
| firepower | `fireCannon` | spawns a bullet on space |
| | `oneShellAtATime` | limits you to a single bullet in flight |
| | `invadersBomb` | picks a random invader, rolls `BOMB_CHANCE` to drop a bomb |
| contact | `shotsDoDamage` | resolves every hit: kills, lives, bunker cells |
| | `fleetDestroys` | invaders crush bunkers, and end the game on landing |
| the law | `cannonStaysOnBoard` | clamps the cannon to the playfield |
| | `strayShotsVanish` | retires shots that fly off the board |
| | `nextWave` | respawns the fleet and bunkers when the board clears |
| | `checkGameOver` | ends it at zero lives |

### The variables

| variable | default | range |
| --- | --- | --- |
| `PLAYER_SPEED` | 10 | 0 – 30 |
| `BULLET_SPEED` | 11 | -20 – 20 |
| `GRAVITY` | 3 | -10 – 10 |
| `BOMB_CHANCE` | 0.02 | 0 – 0.5 |
| `MARCH_STEP` | 8 | -20 – 20 |
| `DESCENT` | 18 | -40 – 40 |
| `POINTS` | 10 | -50 – 100 |
| `LIVES` | 3 | 0 – 9 |

Several ranges cross zero deliberately. Negative `BULLET_SPEED` fires
downward through your own cannon; negative `MARCH_STEP` walks the fleet the
wrong way; negative `DESCENT` sends it climbing on every turn. `GRAVITY`
pulls on bullets as well as bombs — bullets rise at `BULLET_SPEED - GRAVITY`,
so crank gravity past bullet speed and your own shots fall out of the
barrel.

### The meta-rule

One law is not in the panel and cannot be switched off: nothing escapes into
the void. Switch off `cannonStaysOnBoard` and the cannon does not vanish —
it walks off the canvas and onto the web page itself, drawn on a
full-viewport overlay, wrapping around at the edges of the browser window. A
fleet that sinks past the bottom of the page comes back down from the top.
The board has edges you can revoke; the page does not.

## [code-snake](code-snake/)

Snake, built the same way: the game on the left, its rules on the right,
click a rule to switch it off. Snake has far fewer rules than Space
Invaders and every one of them is load-bearing. Switch any one off and
you get a different game rather than a broken one.

A single self-contained `index.html` — no build, no dependencies. Open it in
a browser.

**Controls:** ← ↑ ↓ → steer · P pause · R restart

### The rules

| group | rule | what it does | and without it |
| --- | --- | --- | --- |
| movement | `moveForward` | every `TICK` frames, adds a new head one `STEP` ahead | a snake you can only watch |
| | `tailFollows` | drops the tail each step, unless a meal is still in the belly | the snake never shortens: you are painting the board |
| | `steer` | reads the arrow keys | the snake drives itself |
| | `noUTurns` | refuses a turn straight back into the neck | reversing is allowed, and fatal |
| appetite | `eatingGrows` | head on food: eat it, score `POINTS`, owe the tail `GROWTH` segments | pure steering, nothing at stake |
| | `foodRespawns` | keeps `FOOD_COUNT` pieces of food on empty cells | one meal and the board is bare |
| death | `wallsKill` | ends the game when the head leaves the grid | the snake leaves the board (see below) |
| | `selfCollisionKills` | ends the game when the head lands on the body | the snake can coil through itself |

### The variables

| variable | default | range | |
| --- | --- | --- | --- |
| `TICK` | 8 | 1 – 30 | frames between steps |
| `STEP` | 1 | -3 – 3 | cells per step |
| `GROWTH` | 1 | 0 – 10 | segments per meal |
| `POINTS` | 10 | -50 – 100 | |
| `FOOD_COUNT` | 1 | 0 – 20 | |
| `START_LENGTH` | 3 | 1 – 20 | takes effect on restart |

`STEP` crosses zero deliberately. At 2 or 3 the snake leaps, and its body
becomes a dotted line. At 0 the head stays put while the tail keeps
arriving, which counts as landing on your own body. Negative, the snake
moves backwards into its own neck.

### The meta-rule

As in Code Invaders, one law is not in the panel and cannot be switched
off: nothing escapes into the void. Switch off `wallsKill` and the snake
does not vanish at the edge of the board. It crawls out onto the web page,
over the code that runs it, and wraps around at the edges of the browser
window.
