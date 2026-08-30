# Build notes / judgment calls

Everything below is a decision I made while implementing the spec where the
brief didn't fully pin things down. All are easy to change directly in
`index.html`.

1. **Weeks are Monday-start (ISO-style).** "This Week" on the scoreboard and
   the Sacred Oath's weekly bucket both use the Monday of the relevant date's
   calendar week (`gameoflife:week:<monday-date>`).

2. **The top Scoreboard ("Today / This Week / All-Time") always reflects the
   real current date**, independent of the date navigator below it. The date
   navigator/Chronicle section is for viewing and backfilling *any* day
   (past or today) — editing today there does update the Scoreboard live,
   since it's the same underlying record.

3. **Tier-selection Deeds are "set", not "add".** For habits with a
   single-highest-tier-per-day rule (Video Creatives, Read, Journal, Pray,
   Guitar, Duolingo, Study/Trading, Sales), tapping a tier button sets that
   day's value/points for the habit outright, rather than accumulating
   partial amounts across multiple taps. This keeps the scoring predictable
   and matches "single highest tier reached per day." Re-tapping a lower
   tier later in the day will lower that habit's score for the day — this is
   intentional (self-reported totals), not a bug.

4. **Locking is one-way in the UI.** Once a day is sealed there's no unlock
   button, matching "can't be edited further." If you truly need to fix a
   sealed day, you'd have to edit `localStorage` directly (e.g. via browser
   dev tools) for that day's `gameoflife:day:<date>` key.

5. **The Sacred Oath carries no point value**, per the spec ("no numeric
   penalty attached since none was specified"). It only drives its own
   fulfilled/unfulfilled badge, the "consecutive weeks fulfilled" streak, and
   the "Sworn and True" Honor (4 weeks in a row).

6. **"Every Deed category logged in one day"** (the Renaissance Knight Honor)
   requires all 11 Deed types to have at least one log that day, including at
   least one Art Piece and one Poem.

7. **Purchase (non-food) tiers** use `[min, max)` ranges: under $25 → −100,
   $25–<$75 → −250, $75–<$150 → −500, $150+ → −1000.

8. **Masturbation / Food-spending tiers cap at the 3×-in-a-day value.** A 4th+
   same-day occurrence can still be logged (it shows in the Chronicle and
   bumps the counter), but the deduction stays capped at −1000/−1000 rather
   than growing further, per "not additive beyond 3x."

9. **Study/Trading** uses the exact tier numbers given in the brief
   (15/30/60 min → +100/+200/+500), same shape as Reading/Journaling.

10. **Added three bonus Honors** fitting the new Sales/Art/Poem/Study
    categories, as the brief invited: Devoted Scholar (Study logged 20 days),
    Market Day (hit the $500+ Sales tier on 5 different days), plus the
    Sales/Art/Poem Honors called out explicitly in the spec.

11. **No sound effects.** The brief didn't ask for audio, so level-ups and
    Honor unlocks are communicated visually (a toast + a soft screen flash,
    both respecting `prefers-reduced-motion`) rather than with tones.
