# Game of Life: Path to Knighthood

A self-improvement scorekeeper themed as a medieval RPG — log your **Deeds**
and **Follies** each day, rise from Commoner to Champion of the Realm, uphold
your weekly **Sacred Oath**, and earn **Honors** along the way.

It's a small static site (three pages — Dashboard, Chronicle, Honors —
sharing one stylesheet and one script) and runs entirely in your browser: no
build step, no server, no account. All progress is saved to `localStorage` on
your device only; nothing is ever sent anywhere.

- `index.html` — Dashboard: your Knight's Profile, scoreboard, and a peek at
  recent Honors.
- `chronicle.html` — where you actually log Deeds and Follies, navigate to
  any past day, and mark the week's Sacred Oath.
- `honors.html` — the full Honors gallery.
- `style.css`, `app.js` — shared styling and game logic used by all three pages.

## Deploy to GitHub Pages

1. Create a new repository on GitHub (public or private).
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

Your Chronicle, scores, and Honors are stored only in this browser's
`localStorage`, under keys like `gameoflife:day:2026-08-30`. Clearing your
browser data (or switching browsers/devices) will lose this data — there is
no cloud sync. See `NOTES.md` for the judgment calls made while building this.
