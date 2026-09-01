# RULES.md — Simplifications vs. a Real Brokerage

TICKER DRILL is a training tool, not a clearing engine. Every mechanic below
is implemented with real regulatory intent (Reg T, FINRA 4210, Reg SHO, IRS
rules), but each is simplified from what a real broker-dealer, clearing
firm, or the IRS actually does. This document is the honest list of those
gaps, organized by subsystem. Where relevant, the in-app quiz bank
(`src/quiz/bank.json`) calls out the same nuances with citations.

## Account model & margin (`src/engine/accountEngine.ts`)

- **Single account type.** Only a standard Reg T margin account is modeled.
  There is no cash account, no IRA/limited-margin account, and no portfolio
  margin. GFV/free-riding checks (a cash-account concept) are layered onto
  the margin account anyway, purely for habit-building — see the Settlement
  section below and quiz question `settle-06`, which spells out this exact
  simplification.
- **Buying power formula is a snapshot, not a true SMA ratchet.** Real Reg T
  accounts track a Special Memorandum Account that increases on deposits and
  gains but does **not** mechanically decrease just because a position's
  unrealized value drops (it decreases when you *use* it). This trainer
  instead recomputes `2 × max(0, equity − maintenanceRequirement)` fresh on
  every tick. It's directionally correct and easy to reason about, but it
  does not reproduce SMA's path-dependent ratchet behavior.
- **Long and short buying power are reported as two separate numbers, but
  they draw from the same shared pool of excess equity.** A real account's
  cross-margining between long and short exposure is more nuanced. Two
  numbers are shown because the spec calls for training the distinction, not
  because the collateral is actually walled off.
- **Maintenance margin is a flat 25% long / 30% short for every symbol.**
  Real brokers layer on higher "house" requirements for volatile, low-priced,
  or concentrated positions, and those requirements can change without
  notice. None of that variability is modeled — every marginable symbol here
  uses the regulatory floor.
- **No margin interest.** Real margin loans accrue daily interest on the
  debit balance. This trainer charges $0 interest on any negative cash
  (margin loan) balance — the only "carry cost" modeled is the short borrow
  fee (see below).
- **Margin call cure window is fixed at 3 simulated trading days**, ending in
  automatic, unconditional forced liquidation. Real timelines vary by
  broker/clearing firm and by the size of the deficiency, and a human
  representative is usually involved before anything is force-sold.
- **Forced liquidation logic is simplistic**: it sells the single
  largest-notional position first, then the next, until the deficiency
  clears. Real firms may consider concentration, liquidity, marginability,
  or client instructions, and often liquidate more than the bare minimum for
  safety margin.
- **Reg T initial margin is checked only at order entry** (50% of a
  marginable purchase, 150% total for a short sale) using the ticket's
  reference price. It is not re-validated against the exact fill price a
  moment later, and there's no separate, sequential "Reg T call" flow
  distinct from the maintenance call — a real account can technically get
  both types of call under different rules.

## Settlement, good-faith violations, and free-riding (`src/engine/settlement.ts`)

- **T+1 only, no holiday calendar.** Settlement is modeled as "next business
  day" (weekends skipped), but U.S. market holidays are not accounted for,
  so a sale on the day before a holiday will settle one weekday early in
  this trainer versus reality.
- **GFV/free-riding are, strictly speaking, cash-account rules** (Regulation
  T §220.8). This trainer's account is a margin account, where buying power
  is extended against margin equity rather than gated by settled cash — so a
  real margin account does not hit these violations the way a cash account
  does. TICKER DRILL applies a simplified version of the same check anyway
  because building the "don't trade unsettled funds carelessly" habit is
  valuable regardless of account type. Quiz question `settle-06` calls this
  out directly so you don't walk away with the wrong mental model.
- **GFV detection is heuristic, not full per-lot tracing.** A real clearing
  firm traces settlement fund usage per share lot with FIFO precision. This
  trainer tags an entire position with "funded partly/fully by unsettled
  cash, covered through date X" the moment a purchase draws on unsettled
  proceeds, and flags a violation if any of that position is sold before
  that date. It's a reasonable approximation, not a ledger-accurate replay.
- **Only one flavor of consequence is modeled**: violations are logged and
  shown, with a `GFV` vs `FREE_RIDE` severity tag, but this trainer does not
  actually impose the 90-day restricted-trading lockout a real broker would
  apply after repeated violations.

## Short selling (`src/engine/shortEngine.ts`)

- **Locate success is a coin flip, not real inventory.** Easy-to-borrow
  names always locate; hard-to-borrow names locate with a flat 70%
  probability and a randomized rate. Real locates reflect actual lendable
  share inventory from the broker's stock loan desk, which fluctuates
  continuously and isn't reducible to a fixed probability.
- **Borrow rates are randomized within a band**, not sourced from a live
  stock loan market. Real HTB rates move continuously (sometimes by the
  hour) based on live supply/demand.
- **Borrow fee accrual uses a simple `qty × price × (annualRate / 100) / 360`
  formula, applied once per simulated day.** This mirrors the standard
  360-day convention but skips the intraday mark-to-market a real stock loan
  desk uses, and fees settle on day rollover rather than continuously.
- **Forced buy-in recalls are a small random per-tick probability** on HTB
  positions, not driven by an actual lender's behavior, corporate actions,
  or a real Reg SHO Rule 204 fails-to-deliver close-out clock.
- **Dividend liability on short positions fires only for tickers with a
  scripted `nextExDate`/`nextDividendPerShare`.** Two of the six watchlist
  names (`DIVD`, `BLUX`) pay a dividend on a fixed, recurring schedule that
  advances ~91 days after each payment; the others never go ex-dividend.
  This is enough to drill the mechanic, but it's not a real corporate
  actions calendar.
- **No Reg SHO Rule 201 (alternative uptick rule) enforcement.** The
  10%-decline circuit breaker is covered in the quiz bank, but this trainer
  does not actually restrict short order entry after a 10% intraday drop.

## Pattern Day Trader rule (`src/engine/pdt.ts`)

- **Only the "4 day trades in 5 rolling business days" trigger is
  enforced.** The full FINRA definition also requires those day trades to
  exceed 6% of total trading activity in the same window; like most retail
  brokers' simplified implementations, this trainer skips the 6% test and
  applies the 4-in-5 count directly (see quiz `pdt-02`, which explains the
  real rule).
- **PDT flags never expire automatically.** Once `isPDT` is set, it stays
  set for the session. Real accounts can sometimes get a one-time broker
  courtesy reset, or the restriction lifts after 90 days / meeting the
  equity minimum — none of that lifecycle is modeled.

## Fees (`src/engine/fees.ts`)

- **SEC Section 31 fee and FINRA TAF are hard-coded to an illustrative
  snapshot rate** (`$0.0000278` per dollar of sale proceeds, `$0.000166`
  per share sold, capped at `$8.30`/trade). Real rates are set periodically
  by the SEC/FINRA and do change over time — this trainer does not fetch or
  update them.
- **Commissions are $0**, as specified — no per-share or per-trade
  commission is modeled for any broker tier.

## Order entry & fills (`src/engine/orderEngine.ts`, `src/engine/syntheticMarket.ts`)

- **No real order book / market depth.** Fills are computed from a single
  synthetic bid/ask spread plus a slippage function that scales with order
  size and current volatility, not from a simulated limit order book with
  other participants.
- **Partial fills are a probability roll**, not a reflection of actual
  displayed/hidden liquidity at each price level.
- **"Gap through" on stops is real** (the engine checks trigger conditions
  against the *current* tick price, which can already be past the stop), but
  the underlying price process is a discrete-time simulation stepped once
  per simulated second, not a continuous market — extremely fast, sub-second
  gaps are not modeled with full fidelity.
- **Halts are a simplified single-stock volatility pause**: any 12%+ move
  within one simulated minute trips a 5-minute halt. Real trading halts
  follow specific, more complex LULD (Limit Up-Limit Down) band rules,
  can be triggered by news pending / regulatory reasons, and vary in
  duration.
- **Extended-hours trading has no separate liquidity/spread model** beyond
  the same volatility-driven spread used in regular hours, though the
  session-gating logic (extended-hours orders only fill in extended hours if
  explicitly flagged) is enforced.
- **All-or-None (AON) is not implemented as a selectable modifier** — only
  DAY/GTC/IOC/FOK are supported, per the spec. AON is covered conceptually
  in the quiz bank (`ordtype-12`) but has no order-ticket hotkey.

## Synthetic price data (`src/engine/syntheticMarket.ts`)

- **"Fat tails" are a normal-mixture approximation**, not a true Student-t or
  jump-diffusion process: ~4% of return draws come from a wider-variance
  "shock" regime layered on top of otherwise plain GBM. This produces excess
  kurtosis (fatter tails than pure GBM) without a true heavy-tailed sampler.
- **Volatility smile is a simple exponential bump** near the open/close
  (peaking near 9:30/16:00, decaying over ~35 minutes), not fitted to any
  real intraday volatility surface.
- **Zero long-run drift.** The GBM has no expected return — prices are a
  fair, driftless random walk (aside from scripted gaps/news), so there's no
  persistent up or down bias to trade against over a long session.
- **Six symbols, entirely synthetic**, chosen to cover distinct archetypes
  (blue-chip, momentum, hard-to-borrow squeeze candidate, dividend payer,
  non-marginable penny stock, stable/boring). None represent, or are priced
  from, any real security.

## CSV replay (`src/data/csvReplay.ts`)

- Imported OHLCV bars replace the synthetic price feed for a single pseudo
  symbol, `REPLAY`, one bar at a time, with future bars genuinely hidden
  from the engine until revealed. However, the bid/ask spread during replay
  is synthesized from each bar's high/low range (`10%` of the bar's range as
  full spread) — the CSV format doesn't carry real historical spread data,
  so fills against replayed bars are still a spread/slippage approximation,
  not a replay of the real historical order book.

## Quiz system & spaced repetition (`src/quiz/`)

- **SM-2 is fed a binary signal.** True SM-2 uses a 0–5 self-assessed
  recall-quality scale; this trainer only knows "correct" or "incorrect,"
  which are mapped to quality scores of 5 and 2 respectively. This is a
  common, reasonable simplification, but it's coarser than the original
  algorithm's intent.
- **Question bank is static content, not fact-checked live.** Citations
  (Reg T, FINRA Rule 4210, SEC Rule 201, IRC §1091, etc.) are provided so
  you can verify each answer against the primary source yourself — rules
  and rates do change over time, and this trainer does not track those
  changes.
- **Contextual triggers cover a representative subset of events** (a margin
  call being issued, a GFV/free-ride, a forced buy-in recall, and scripted
  scenario checkpoints) — not literally every state change in the engine has
  a matching quiz interrupt wired up.

## Everything else

- **No real money, no real brokerage, no data connectivity of any kind.**
  Nothing in this app ever talks to a live market data feed, a real broker
  API, or any external network service — it's 100% local, using synthetic
  data or a CSV you provide, persisted to a local SQLite database (via
  sql.js/WASM) in your browser's IndexedDB.
- **Single simulated trading day per session by design.** Free Trade starts
  a fresh simulated day (04:00–20:00) each time. Multi-day mechanics
  (T+1 settlement rollover, daily borrow fee accrual, PDT's 5-day rolling
  window, dividend ex-dates) are real and implemented, but reaching a second
  simulated calendar day in Free Trade requires leaving a session running
  for a while at the default 30x speed (~34 real minutes to cross midnight
  from a 7am start) — Scenario mode seeds the relevant state directly so you
  can drill those mechanics without waiting.
