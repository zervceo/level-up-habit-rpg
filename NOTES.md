# Build notes / judgment calls

## Entity re-theme: Colosseum -> Vitruvian Man

A later request swapped Entity's visual theme from the Colosseum to
Leonardo's Vitruvian Man — a better fit for "ideal proportions of body and
spirit" than gladiator framing. Nothing about the sector's mechanics,
storage, or scoring changed, only `body.theme-entity`'s palette and the
background art:

- **Palette** moved from Roman red/gold to a drafting-desk Renaissance
  set: aged parchment background, gold-leaf headings/borders, and sanguine
  (red chalk) for links/primary buttons/accents — literally the colors on
  Leonardo's own desk, not an arbitrary substitution.
- **Background art**: replaced the sun/horizon-grid/waves layers (which
  made sense for a Colosseum and even more for the beach, but not here)
  with a new `.vitruvian-geo` component — Leonardo's circle-and-square
  construction with a simplified line figure inside, drawn as one small
  inline SVG reused identically across all three Entity pages, slowly
  rotating like a drafting compass (skipped under reduced-motion, as
  always). It's an original simplified rendition, not a trace of the
  historical drawing, both because that's simpler to keep theme-colorable
  and because it reads fine at this scale even simplified.
- **Renamed the pages' copy and nav labels** to match: "The Arena" ->
  "The Vitruvian Study", "Training Log" -> "Practice Log", nav icons
  🏛️/⚔️ -> 📐/🖋️ (set-square and quill). Kept the file names
  (`entity-arena.html`, `chronicle.html`, `honors.html`) unchanged so nothing
  bookmarked breaks — only what's rendered on the page changed.
- **Medals page kept its name** ("Medals of Honor") since achievements are
  a system-wide concept that only happens to sit on an Entity-styled page;
  trophies/medals don't clash with either theme, so there was no real need
  to rename it to something Renaissance-specific.

## Four-sector rebuild (Entity / Entrepreneur / Education / Elixir)

A later request asked to reorganize everything into four themed sectors —
a personal operating system rather than one habit tracker — while reusing
this app's HTML structure. Judgment calls made implementing that:

- **One shared day record, namespaced per sector.** Rather than giving each
  sector its own separate "day," `defaultDay()` in `app.js` now holds
  `{ deeds, vices, biz, study, craft, locked }` — Entity's physical/
  spiritual actions, Entrepreneur's daily ZERV posts + business-task/
  journal counters, Education's study-session minutes + assignment
  counter, and Elixir's hobby-practice minutes + the board-shaping bonus,
  all inside one record per calendar date. This keeps the "floor at zero"
  rule meaningful system-wide: Entity's vices eat into the combined total
  across every sector for that day, not just Entity's own slice, and day
  locking freezes the whole day at once.
- **The floor-at-zero rule now spans all four sectors.** `dayNetScore()`
  sums Entity + Entrepreneur + Education + Elixir positive points, adds
  Entity's vice deductions, and floors the result at zero — so logging
  great work in, say, Education can't be wiped out by a bad night, but a
  bad night also can't out-run a genuinely strong day across the system.
- **Moved, not duplicated.** ZERV social posting moved from Entity's Deeds
  into Entrepreneur (`ENTREPRENEUR_DAILY`, stored under `day.biz`) since
  it's business marketing, not personal habit. Coding practice moved from
  a flat Entity "Deed" into Elixir's Coding hobby (`day.craft`), since
  Elixir is explicitly where hobby mastery lives now. "Shape a Board"
  moved from a generic Entity bonus into Elixir's Surfboard Making hobby
  specifically, since surfboard shaping is one of the four named Elixir
  hobbies. Reading and Journaling stayed in Entity as generic self-growth
  habits.
- **Weekly Goals split across sectors, one shared storage shape.** The
  original three weekly checkboxes (Schoolwork/Personal/Business) plus a
  new fourth (Spiritual, to cover "spiritual relationship with God"
  explicitly) still live in one `state.weeks[weekStart]` record exactly as
  before — only *where they render* changed: Schoolwork shows on
  Education, Business on Entrepreneur, Personal + Spiritual on Entity. The
  old "Hat Trick" achievement (3-way) became "Grand Slam" (4-way).
- **Sprint Quest is entirely self-configured, not guessed.** The brief
  named "Division 1 sprinter by 21" as the goal but gave no event, gender,
  or current time — guessing any of those would make the sector's
  headline goal either wrong or presumptuous. Instead, `entity-arena.html`
  has a one-time setup form (event, current PR, target time) and a running
  log of times; the deadline itself (Dec 18, 2027 — the birthday after
  the one coming up, since "19 now, turns 20 on Dec 18" implies 21 falls a
  year after that) is the one fact that *was* fully specified, so that's
  hardcoded as `SPRINT_DEADLINE` in `app.js`.
- **"Prompt updates before due dates" is an in-app banner, not a push
  notification.** A static site with no backend can't text or push-notify
  you. `education.html` shows a persistent "Upcoming Deadlines" banner
  (assignments due within 3 days or overdue) and fires a toast once per
  page load if anything qualifies — real, but only as real as "you have to
  open the app to see it." Said so explicitly in the page's footer rather
  than overpromising.
- **Elixir milestones are self-checked, not auto-verified.** There's no way
  for a web app to confirm you've actually "mastered rail shaping" — so
  each hobby's 7-step curriculum (hand-written, not generic placeholders)
  is a checklist you tick off on your own judgment, stored in
  `gameoflife:elixir:milestones`. Practice-time logging (which *does* earn
  points) and milestone-checking (which doesn't, directly) are deliberately
  separate mechanics.
- **Business tasks/journal entries are one-way.** Marking a task "done" or
  logging a journal entry awards points immediately and can't be undone
  short of deleting the item outright (which doesn't claw back points) —
  avoids having to track which specific day's counter to decrement if a
  task gets un-checked later, and stays consistent with this app's general
  "never take points away" philosophy.
- **Finance-topic mastery is per-topic, not the overall rank.** Each of the
  five finance topics in Education climbs its *own* Wall Street title
  ladder (`MASTERY_TITLES`, driven by that topic's lifetime study points),
  completely separate from the account-wide Grom→ZERV Legend rank shown on
  HQ. Reaching "Managing Director" in Valuation doesn't affect your overall
  rank directly — it only does so through the points you earned logging
  the study sessions, same as any other sector.
- **HQ is the one place for the full rank/board/gear widget.** It used to
  appear on the Lineup/Entity page; now that Entity is one of four equal
  sectors, the overall-system profile card lives only on HQ, and sector
  pages show the shared Scoreboard (Today/Week/All-Time) plus their own
  content, to avoid a confusing "is this the Entity rank or the whole
  system's rank" ambiguity.
- **Entrepreneur keeps the original ZERV color system and beach scene
  as-is** (no `body.theme-*` override) since that sector *is* ZERV's own
  brand — reusing it there isn't a placeholder, it's correct. The other
  three sectors each got a full palette override (`body.theme-entity` /
  `-education` / `-elixir` in `style.css`) that redefines the exact same
  CSS variable names every existing component already uses, so no
  component CSS had to change — panels, buttons, chips, and score tiles
  all re-theme automatically.
- **DeskGenie was pre-seeded alongside ZERV** as a second starter business
  (per "ZERV, DeskGenie and all other businesses"), with an "Add a
  business" flow for anything added later — nothing else about DeskGenie
  was assumed beyond its name.
- **File names were kept where the old content just got re-themed**
  (`chronicle.html`, `honors.html`) so nothing already bookmarked or linked
  breaks; genuinely new pages got sector-specific names
  (`entity-arena.html`, `entrepreneur.html`, `education.html`,
  `elixir.html`).

## Original rework: medieval build -> ZERV LEVEL UP

Everything below is a decision made while reworking this from the medieval
"Game of Life: Path to Knighthood" build into **ZERV LEVEL UP**, where the
request didn't fully pin things down. Most are easy to change directly in
the relevant file (`app.js` for scoring/config, `style.css` for visuals,
`index.html`/`chronicle.html`/`honors.html` for page-specific markup).

## The "always encouraging, never negative" fix

The driving complaint behind this rewrite was seeing the All-Time score sit
over a million points negative. The fix has two parts:

1. **Every day's net score is floored at zero** (`dayNetScore` in `app.js`).
   Wipeouts (vices) can only cancel out that day's Wins down to zero — they
   can never create a debt that carries into the Week or All-Time total.
   Practically: your lifetime score can only ever go up or stay flat, never
   down, no matter how bad a day gets.
2. **Every Wipeout's point value was cut roughly 4–5x** from the old
   version (e.g. a drink went from −500 to −100; the worst single purchase
   tier went from −1000 to −200), so even a rough day eats a small, sane
   chunk out of that day's Wins instead of wiping it out entirely.

Together, these mean the number on screen only ever moves the encouraging
direction. Individual Wipeout line items in the Session Log still show their
real (negative) point value for transparency — only the aggregated
Today/Week/All-Time numbers are floored.

## Task roster — what changed and why

This was a full replacement of the old habit list to match current real
goals, not a tweak:

- **Daily Priority**: ZERV Post — Instagram, ZERV Post — TikTok (both flagged
  with a "DAILY PRIORITY" tag and a highlighted border on the Sessions page,
  per the explicit ask).
- **Daily Wins**: Sprint Training, Strength Training, Surf Session (flat,
  +250–300 each), Coding (tiered by minutes, same point scale as the other
  tiered habits), Read, Journal (kept from the old build — still generically
  useful, nobody asked to drop them).
- **Bonus Wave**: Shaping a board is no longer a mandatory weekly oath — it's
  a repeatable, un-gated bonus (+1000, logged on whatever day it happens)
  with a lifetime counter on the Lineup page. This directly replaces the old
  "Sacred Oath" mechanic.
- **Weekly Goals**: Schoolwork, Personal Goal, Business Goal — new, each a
  simple per-week checkbox worth +750 when checked, no penalty for skipping
  a week. These reuse the old Sacred Oath's "tied to the date navigator's
  selected week" plumbing.
- **Dropped**: Video Creatives, Prayer, Guitar, Duolingo, Study/Trading,
  Sales, Art Piece, Poem. None of these were mentioned as current goals, and
  "completely changing the level up habit" read as license to replace the
  whole roster rather than bolt new items onto the old one. Reading and
  Journaling survived because they're generic enough to still fit (and
  nothing said to cut them) — easy to remove from the `DEEDS` array in
  `app.js` if you'd rather they go too.
- **Vices kept the same shape** (stacking, tiered-by-count, per-purchase
  amount tiers) just with much lower point values, per "make my vices
  deduct less points."

## Rank ladder

Kept the same 7-tier All-Time-score thresholds as before (0 / 2,500 / 7,500
/ 15,000 / 30,000 / 60,000 / 100,000) — they were already a reasonable curve,
and now that scores can only climb (see above), you'll reach each tier
faster than before anyway. Renamed the tiers to a surf progression (Grom →
Rookie Rider → Wave Chaser → Shortboarder → Barrel Hunter → Big Wave Charger
→ ZERV Legend) with a Board + Gear pair standing in for the old Weapon +
Armor slots.

## ZERV color system

You gave an exact design-system spec (Background/Headings/Text/Links/Primary
button/Secondary button/Inputs/Variants, each with its own hover state). I
implemented it close to literally in `style.css`'s `:root` tokens:

- `--zerv-bg` (`#3BC2C7`) is used as the retro "ocean" backdrop behind
  everything, not as literal `<body>` background on every pixel — long
  stretches of your pale-yellow Text color directly on that bright teal
  would be a readability problem, so panels sit on a dark navy surface
  (`#1A1A2E`, taken from your own button-hover-text color) instead, with
  Text/Headings/Links keeping their exact specified colors on top of that.
- Primary/Secondary buttons, inputs, and "Variants" (mapped onto the
  tier-selector chips, e.g. the "15 min / 30 min / 60 min" buttons) all use
  your exact bg/text/border/hover values.
- The one gap: the last hex in "Variants → hover border" was cut off
  (`#E6E6E`) — completed it as `#E6E6E6` (a light grey), the obvious
  completion. Easy to fix in `style.css` (`--variant-hover-border`) if that's
  wrong.
- The active/selected state of a tier chip (not in your spec, since that's a
  state your system didn't define) borrows the Primary button's colors,
  since "selected" is functionally a confirmed action.

## Storage keys unchanged

Day/week/achievement localStorage keys still use the old `gameoflife:*`
prefix rather than renaming to something ZERV-specific, so progress already
logged on the live site carries forward instead of resetting to zero.

## Everything else carried over from the previous build

Monday-start weeks, the Scoreboard always reflecting the real current
date/week (independent of the date navigator), tier buttons "set" rather
than "add", one-way day locking, purchase `[min, max)` ranges, and
achievements evaluating against full stored history — none of that changed,
just the labels and numbers around it.
