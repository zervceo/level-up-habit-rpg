# Build notes / judgment calls

## Visual pass: 3D, interactive, animated beach scene

A later request asked to make the app "more 3D and retro surf inspired...
completely colorful and interactive" with "a different beach scene and
surfing clips." Judgment calls made implementing that:

- **"Surfing clips" is an animated SVG/CSS loop, not embedded video.** There
  was no video asset to source, and embedding real footage would add a
  dependency and page weight the brief's original "no build step, no npm
  dependencies" constraint was meant to avoid. Instead, `.surfer-clip` in
  `style.css` is a small looping illustration — a stick-figure surfer on a
  board that bobs, tilts, and drifts side to side continuously, sitting on
  the horizon-grid "ocean" layer on every page.
- **Three distinct scenes, one shared markup.** Lineup (`index.html`) is
  sunset, Sessions (`chronicle.html`) is bright midday, Medals (`honors.html`)
  is starry dusk with a moon — satisfying "different beach scene" without
  tripling the HTML. All three pages render the exact same `#bgwash` layer
  structure (sky, stars, clouds, seagulls, sun/moon, palms, horizon-grid,
  surfer clip, waves, sand); only the outer `scene-sunset` / `scene-day` /
  `scene-dusk` class on `#bgwash` changes, and CSS selectors scoped to each
  class handle the color/visibility differences (e.g. the sun only gets its
  retro stripes in the sunset scene; the moon and stars only show in dusk).
- **3D is "chunky arcade depth," not literal WebGL/3D transforms.** Buttons,
  tier chips, panels, and score tiles all got an offset drop-shadow that
  shrinks on press and grows on hover (`translateY` + shadow-offset pairs in
  `style.css`), mimicking a physical button being pushed. The ZERV badge
  logo got inset highlight/shadow layers for a glossy-orb look. True
  perspective is used once, deliberately, for the synthwave horizon grid
  (`transform: perspective(...) rotateX(...)`).
- **"Completely colorful" stayed scoped to the background art, not the UI
  components.** New colors (sand, palm green, ocean blue, cloud tones) only
  appear in the beach-scene layers. Text, links, buttons, inputs, and borders
  still use ZERV's exact design-system tokens from the color-system request
  below — richness came from the scenery, not from drifting off-brand on
  interactive elements.
- **Interactivity**: scroll- and pointer-based parallax on the background
  layers (`initSceneInteractivity()` in `app.js`), a scale "pulse" on each
  Scoreboard number when its value changes, and a click-the-sun /
  click-the-badge sparkle burst easter egg. All of it — parallax, pulses,
  sparkles, and every background animation — is skipped entirely under
  `prefers-reduced-motion: reduce`.

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
