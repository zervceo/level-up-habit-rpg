# ZERV LEVEL UP

A self-improvement scorekeeper for building ZERV, training for the track,
leveling up your coding, and staying on top of school and personal goals —
skinned as a retro surf arcade game in ZERV's own colors. Log your **Wins**
and **Wipeouts** each day, rise from Grom to ZERV Legend, check off weekly
goals, and earn **Medals** along the way.

It's a small static site (three pages — Lineup, Sessions, Medals — sharing
one stylesheet and one script) and runs entirely in your browser: no build
step, no server, no account. All progress is saved to `localStorage` on your
device only; nothing is ever sent anywhere.

- `index.html` — **Lineup**: your Surfer Profile (rank/board/gear), the
  scoreboard, a Bonus Wave summary, and a peek at recent Medals.
- `chronicle.html` — **Sessions**: where you actually log Wins and Wipeouts,
  navigate to any past day, check off this week's goals, and log a shaped
  board.
- `honors.html` — **Medals**: the full achievement gallery.
- `style.css`, `app.js` — shared styling and game logic used by all three pages.

## Scoring, in one sentence

Every day's score is floored at zero — Wipeouts can only cancel out that
day's Wins down to zero, they can never drag your Week or All-Time total
into negative territory. See `NOTES.md` for the full reasoning.

## Deploy to GitHub Pages

1. Create a new repository on GitHub (public or private) — or reuse an
   existing one; this app is self-contained and happy to live in a
   subfolder-free repo root alongside other projects.
2. Upload all the files above (`index.html`, `chronicle.html`, `honors.html`,
   `style.css`, `app.js`, and this `README.md`) to the repository — drag and
   drop them into the GitHub web UI, or `git push` them. Keep them all in the
   repo root so the relative links between pages resolve.
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to "Deploy from a branch",
   pick branch **main** and folder **/ (root)**, then **Save**.
5. Wait a minute or two — GitHub will give you a URL like
   `https://<your-username>.github.io/<repo-name>/`. That's your app.

## Add it to your phone's home screen

- **iPhone (Safari):** open the URL, tap the Share icon, then "Add to Home Screen."
- **Android (Chrome):** open the URL, tap the ⋮ menu, then "Add to Home screen."

Once added, it launches full-screen like a normal app.

## Data & privacy

Your Sessions, scores, and Medals are stored only in this browser's
`localStorage`, under keys like `gameoflife:day:2026-10-27` (the key prefix
is unchanged from an earlier version of this app, so existing progress
carries forward). Clearing your browser data (or switching browsers/devices)
will lose this data — there is no cloud sync. See `NOTES.md` for the
judgment calls made while building this.
