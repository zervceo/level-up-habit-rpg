# ZERV LEVEL UP

Your personal operating system, split into four sectors that all roll up
into one shared rank and score. Skinned as four distinct worlds — a
Colosseum, a surf shack, a Wall Street trading floor, and a late-night
workshop — because different parts of life deserve different energy, but
they're still all one system.

It's a small static site (no build step, no server, no account) that runs
entirely in your browser. All progress is saved to `localStorage` on your
device only; nothing is ever sent anywhere.

## The four sectors

- **🏛️ Entity** (`entity-arena.html`, `chronicle.html`, `honors.html`) —
  Colosseum-themed. Physical and spiritual habits, vices, weekly personal/
  spiritual goals, and the **Sprint Quest**: a self-configured countdown
  and PR tracker toward Division 1 sprinting by your 21st birthday.
- **🏖️ Entrepreneur** (`entrepreneur.html`) — your lone surf shack on the
  beach. Tracks ZERV, DeskGenie, and any future business: daily ZERV social
  posting, a weekly business goal, and per-business tasks + a running
  journal. Includes **Beach Explore** (`beach-explore.html`): an optional
  walkable low-poly 3D scene around the shack — a first look at bringing
  the whole system into 3D, one sector at a time.
- **🏦 Education** (`education.html`) — Wall Street trading floor themed.
  Classes and assignments with due dates, an upcoming-deadlines banner, and
  a finance/accounting/investing mastery ladder themed as Wall Street job
  titles (Intern → Analyst → Associate → VP → Director → Managing Director).
- **🛠️ Elixir** (`elixir.html`) — a maker's workshop. Real, curated
  skill-progression curricula for surfboard shaping, coding, electrical
  engineering, and art, each with concrete milestones from beginner to
  mastery, plus practice-session logging.

**🏠 HQ** (`index.html`) ties it together: your overall rank, a snapshot of
all four sectors, and your most recent Medals.

`style.css` and `app.js` are shared by every page — one scoring engine, one
set of components, four color themes layered on top via CSS variables.

## Scoring, in one sentence

Every day's combined score — across every sector at once — is floored at
zero. Vices (logged under Entity) can only cancel out that day's Wins down
to zero; they can never drag your Week or All-Time total into negative
territory. See `NOTES.md` for the full reasoning and every other judgment
call made building this.

## Deploy to GitHub Pages

1. Upload every file above, plus `style.css`, `app.js`, this `README.md`,
   and the `vendor/` folder (Three.js, used by Beach Explore), to your
   repository root (relative links between pages depend on them all being
   siblings, and `vendor/` keeping its name/location).
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment", set **Source** to "Deploy from a branch",
   pick branch **main** and folder **/ (root)**, then **Save**.
4. Your app is live at `https://<your-username>.github.io/<repo-name>/`.

## Add it to your phone's home screen

- **iPhone (Safari):** open the URL, tap the Share icon, then "Add to Home Screen."
- **Android (Chrome):** open the URL, tap the ⋮ menu, then "Add to Home screen."

## Data & privacy

Everything is stored only in this browser's `localStorage`, under keys
like `gameoflife:day:2026-11-08`, `gameoflife:business:list`, and
`gameoflife:edu:classes` (the `gameoflife:*` prefix is unchanged from an
earlier version of this app, so existing progress carries forward).
Clearing your browser data or switching devices loses it — there's no
cloud sync.
