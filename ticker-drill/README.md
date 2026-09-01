# TICKER DRILL

A local, offline paper-trading trainer for two things: **order-entry muscle
memory** (fully keyboard-driven order tickets, timed drills) and
**brokerage rules & terminology** (margin, short selling, settlement, PDT,
corporate actions, and tax treatment, quizzed with spaced repetition).

No live market data, no account, no network calls beyond loading the page —
everything runs locally against synthetic price data (or a CSV you import)
and persists to a local SQLite database (via sql.js/WASM) in your browser's
IndexedDB.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. Everything after that runs entirely offline.

```bash
npm run build    # production build (type-checks, then bundles)
npm run preview  # serve the production build locally
```

## Modes

- **Free Trade** — an open-ended session on a simulated trading day with the
  full account model, all order types, and a small synthetic watchlist.
- **Speed Drill** — timed order-entry prompts ("short 200 XYZ at limit
  42.15, GTC"). Scores accuracy and time-to-submit, tracks your median entry
  time across sessions, and penalizes wrong-action errors (e.g. entering
  SELL instead of SELL SHORT) heavily, since those are the expensive
  real-world mistakes.
- **Scenario** — five scripted setups: a gap-down margin call, a
  hard-to-borrow short squeeze, an unsettled-funds trap, a halt-and-reopen,
  and a PDT lockout.
- **Study** — standalone spaced-repetition practice (SM-2) across the
  88-question quiz bank, available any time from the home screen.

The quiz also interrupts automatically mid-session — when a margin call,
good-faith violation, or forced buy-in fires, the matching question shows up
before you can continue.

## Keyboard control

Nothing in the order ticket requires a mouse. `B` / `S` / `SS` (tap S twice)
/ `BC` (B then C) arm an action; digits type into the focused field
(`Tab` cycles Size → Limit → Stop → Trail as relevant to the order type);
`M`/`L`/`T`/`Y`/`R` pick the order type; `D`/`G`/`I`/`F` pick DAY/GTC/IOC/FOK;
`E` toggles extended hours; `↑`/`↓` (or `J`/`K`) change the selected symbol;
`Enter` sends; `Esc` resets the ticket. The full legend is always visible
in the left panel.

## Importing real data for replay

Free Trade has a CSV import panel. It accepts OHLCV bars (headers:
`timestamp`/`date`, `open`, `high`, `low`, `close`, `volume`) and replays
them bar-by-bar as a tradeable symbol (`REPLAY`) at an adjustable speed,
with future bars genuinely hidden from the engine until revealed.

## What's simplified

See [`RULES.md`](./RULES.md) for the full, honest list of every place this
trainer simplifies real brokerage mechanics — margin math, settlement,
short selling, fees, order fills, and the quiz content itself.
