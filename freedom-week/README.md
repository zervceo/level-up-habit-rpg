# FREEDOM WEEK

A local-first weekly discipline tracker with a patriotic, faith-driven,
entrepreneurial identity. It exists to get you through early mornings and
long nights, and it only rewards you when the week is **fully** done — no
celebration for partial progress, only for 100% of your required tasks.

Everything lives in your browser's `localStorage`. No account, no server,
no network calls beyond loading Google Fonts.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173/`) — that's
**The Ascent**, the main dashboard.

```bash
npm run build    # type-checks (tsc -b) then produces a production bundle in dist/
npm run preview  # serve the production build locally
```

## The five pages

- **`/` — The Ascent.** Your dashboard: the progress ring, the big "N
  STANDING" hero number (what's *left*, not what's done), today's tasks, and
  a scripture+quote pairing tuned to the time of day. At 100% required-task
  completion it plays the full-screen FREEDOM sequence once per completion.
- **`/week` — The Campaign.** The full 7-day board. Drag a task card onto
  another day's column to reschedule it (desktop mouse), or use the small
  "Move to" day-select at the bottom of each card (works everywhere,
  including touch).
- **`/creed` — The Creed.** Browse the scripture and quote libraries,
  favorite anything (favorites resurface ~3x more often), and add your own
  entries.
- **`/legacy` — The Legacy.** Current and best streaks, a bar chart of your
  last 12 archived weeks' completion, and the full week-by-week archive.
- **`/settings`** — full CRUD on this week's tasks *and* on the recurring
  templates that regenerate every Monday, notification setup, theme
  intensity, and JSON export/import of your entire history.

## How the week works

- A **required** task drives the freedom percentage. An **optional** task is
  a bonus, shown dimmer in a secondary tray — it never blocks 100%.
- The week rolls over **Monday at 4:00 AM local time**, not midnight — so a
  4 AM grinder finishing Sunday's list at 2 AM is still "in" Sunday. On
  rollover the app archives the outgoing week, increments your streak if it
  hit 100% required (else resets to 0), and regenerates a fresh week from
  your active **recurring templates** (Settings → Recurring tasks). Set a
  template up once and it comes back every Monday without you touching it
  again.
- Completing the last required task triggers **FREEDOM**: a skippable,
  ~8-second full-screen sequence (an original silhouette runner ascending a
  stylized museum staircase, a synthesized four-note fanfare, confetti, then
  a calm resting summary). After you continue, the Ascent page itself stays
  in that calm resting state — count cleared, finish time, streak, one
  closing verse — for the rest of the week.

## Adding scriptures, quotes, and exhortations

All motivational content lives in `src/content/` as plain, commented arrays
— no CMS, no build step needed beyond saving the file.

- **`scriptures.ts`** — KJV verses only (public domain). Append an object
  with a unique `id`, the exact `text`, its `reference`, and one or more
  `buckets`: `"earlyMorning"` (shown before 7am), `"longNight"` (after 9pm),
  `"urgency"` (overdue tasks exist), `"general"` (default rotation).
- **`quotes.ts`** — same shape, but `attribution` instead of `reference`.
  Keep additions short (under ~25 words) and correctly attributed.
- **`exhortations.ts`** — the app's own voice: `exhortations` (25 lines,
  same bucket system) plus `checkInLines`, a short array of ~8-word
  one-liners shown the instant you check a task off. Add more of either
  freely; keep `checkInLines` entries very short so they read instantly.

The selection logic lives in `src/lib/motivation.ts` (bucket picking,
no-repeat-within-a-day, favorite weighting) and `src/hooks/useMotivation.ts`
(the React hook that ties it to the clock and to overdue tasks).

## Retuning the tone

- **Exhortation voice** — edit `src/content/exhortations.ts` directly; it's
  the one file that's entirely this app's own writing, so there's nothing
  to misattribute.
- **Mood thresholds** — the early-morning/long-night cutoffs (7am / 9pm) are
  in `currentBucket()` in `src/lib/motivation.ts`. The rollover hour (4am)
  is `ROLLOVER_HOUR` in `src/lib/date.ts`.
- **Idle reminder timing** — `IDLE_MS` in `src/components/IdleReminderToast.tsx`.
- **Fanfare** — `src/lib/fanfare.ts` is a small, self-contained Web Audio
  synth (no audio files). Adjust the frequencies/timings in `playFanfare()`
  to change the motif.

## Swapping the palette / fonts

Every color and font is a CSS custom property defined once, at the top of
`src/index.css`:

```css
--color-navy: #0a1128;
--color-parchment: #f4f1ea;
--color-crimson: #b3122e;
--color-gold: #c9a227;
--font-display: "Oswald", "Bebas Neue", sans-serif;
--font-scripture: "Cormorant Garamond", Georgia, serif;
--font-ui: "Inter", system-ui, sans-serif;
```

Change the values there — every component reads through Tailwind utilities
that are wired to these tokens (`bg-navy`, `text-gold`, `font-scripture`,
etc. in the `@theme` block just below), so nothing else needs to change. To
use a different Google Fonts family, update the `<link>` in `index.html`
too.

## Iconography

Five inline SVG line icons — eagle, torch, cross, laurel, star — live in
`src/components/icons.tsx`, plus a small gear icon used only for the
Settings nav item. No icon library. Edit the `<path>`/`<circle>` data
directly to restyle a mark, or add a new one and wire it into `CATEGORY_ICON`
if you add a new task category.

## Built to last

- **Strict TypeScript, no `any`.** Every persisted shape is a
  [Zod](https://zod.dev) schema in `src/lib/schema.ts`; the TS types are
  inferred from the schemas so they can't drift apart.
- **Versioned, migrated persistence.** The Zustand store
  (`src/store/useStore.ts`) persists under `freedom-week:state` with a
  `version` number and a `migrate` function. A future schema change bumps
  `CURRENT_STATE_VERSION` in `schema.ts` and adds a migration step instead
  of wiping history. Anything that fails Zod validation on read — a
  hand-edited or corrupted blob — falls back to a fresh default state
  instead of crashing the app.
- **`prefers-reduced-motion`** is respected globally (CSS, in
  `src/index.css`) and specifically by the FREEDOM sequence, which becomes a
  single static hero frame with a fade instead of the full animation.
- **Export/import** — Settings → Your data. Exports your full task/archive/
  template/favorites history as one JSON file; import re-validates it
  through the same Zod schema before accepting it.
- **44px minimum touch targets** via the `.fw-tap` utility class, applied to
  every interactive control.

## A few judgment calls

- **Drag-to-reschedule on Campaign** uses native HTML5 drag-and-drop, which
  is mouse-only in most mobile browsers. Every task card also carries a
  plain `<select>` "Move to" control next to it, so rescheduling still works
  one-handed on a phone.
- **Categories are a fixed set** (Faith, Work, Body, Mind, Home, Other)
  rather than free text, so each one maps to one of the five line icons
  without a "which icon for an arbitrary category" problem. Add a category
  by extending `CATEGORIES` in `src/lib/schema.ts` and `CATEGORY_ICON` in
  `icons.tsx`.
- **Settings splits task management in two**: "This week's tasks" edits the
  live current-week list directly (one-off tasks included); "Recurring
  tasks" edits the templates that regenerate every Monday. Adding a
  recurring template does not retroactively add it to the week already in
  progress — it takes effect at the next rollover.
