import { useMemo, useState } from "react";
import { scriptures } from "../content/scriptures";
import { quotes } from "../content/quotes";
import { useStore } from "../store/useStore";
import { StarIcon } from "../components/icons";

type Tab = "scriptures" | "quotes" | "favorites" | "mine";

function FavStar({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Unfavorite" : "Favorite"}
      className="fw-tap flex items-center justify-center text-gold"
    >
      <StarIcon size={18} className={active ? "" : "text-parchment/30"} fill={active ? "currentColor" : "none"} />
    </button>
  );
}

export function Creed() {
  const [tab, setTab] = useState<Tab>("scriptures");
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const customContent = useStore((s) => s.customContent);
  const addCustomContent = useStore((s) => s.addCustomContent);
  const deleteCustomContent = useStore((s) => s.deleteCustomContent);

  const [newKind, setNewKind] = useState<"scripture" | "quote">("scripture");
  const [newText, setNewText] = useState("");
  const [newAttribution, setNewAttribution] = useState("");

  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const submitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addCustomContent({ kind: newKind, text: newText.trim(), attribution: newAttribution.trim() || undefined });
    setNewText("");
    setNewAttribution("");
  };

  return (
    <div className="min-h-dvh px-5 pb-16 pt-8 md:px-10">
      <header className="mb-6">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">The Creed</p>
        <p className="text-xs text-parchment/40">Scripture and words to carry into the work.</p>
      </header>

      <div className="mb-5 flex gap-2 overflow-x-auto">
        {(["scriptures", "quotes", "favorites", "mine"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "fw-tap shrink-0 rounded-full border px-4 text-xs uppercase tracking-widest",
              tab === t ? "border-gold text-gold" : "border-parchment/15 text-parchment/50",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "scriptures" && (
        <ul className="mx-auto max-w-2xl space-y-3">
          {scriptures.map((s) => (
            <li key={s.id} className="fw-grain flex items-start justify-between gap-3 rounded-lg border border-parchment/10 bg-navy-light/40 p-4">
              <div>
                <p className="font-scripture text-lg italic text-parchment/90">“{s.text}”</p>
                <p className="mt-1 font-display text-xs uppercase tracking-widest text-gold/70">{s.reference}</p>
              </div>
              <FavStar active={favSet.has(`scripture:${s.id}`)} onClick={() => toggleFavorite(`scripture:${s.id}`)} />
            </li>
          ))}
        </ul>
      )}

      {tab === "quotes" && (
        <ul className="mx-auto max-w-2xl space-y-3">
          {quotes.map((q) => (
            <li key={q.id} className="fw-grain flex items-start justify-between gap-3 rounded-lg border border-parchment/10 bg-navy-light/40 p-4">
              <div>
                <p className="text-sm text-parchment/85">“{q.text}”</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-parchment/40">— {q.attribution}</p>
              </div>
              <FavStar active={favSet.has(`quote:${q.id}`)} onClick={() => toggleFavorite(`quote:${q.id}`)} />
            </li>
          ))}
        </ul>
      )}

      {tab === "favorites" && (
        <ul className="mx-auto max-w-2xl space-y-3">
          {favorites.length === 0 && (
            <p className="text-sm text-parchment/40">
              Tap the star on any verse or quote to keep it close — favorites resurface more often.
            </p>
          )}
          {scriptures
            .filter((s) => favSet.has(`scripture:${s.id}`))
            .map((s) => (
              <li key={s.id} className="fw-grain flex items-start justify-between gap-3 rounded-lg border border-gold/25 bg-navy-light/40 p-4">
                <div>
                  <p className="font-scripture text-lg italic text-parchment/90">“{s.text}”</p>
                  <p className="mt-1 font-display text-xs uppercase tracking-widest text-gold/70">{s.reference}</p>
                </div>
                <FavStar active onClick={() => toggleFavorite(`scripture:${s.id}`)} />
              </li>
            ))}
          {quotes
            .filter((q) => favSet.has(`quote:${q.id}`))
            .map((q) => (
              <li key={q.id} className="fw-grain flex items-start justify-between gap-3 rounded-lg border border-gold/25 bg-navy-light/40 p-4">
                <div>
                  <p className="text-sm text-parchment/85">“{q.text}”</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-parchment/40">— {q.attribution}</p>
                </div>
                <FavStar active onClick={() => toggleFavorite(`quote:${q.id}`)} />
              </li>
            ))}
        </ul>
      )}

      {tab === "mine" && (
        <div className="mx-auto max-w-2xl">
          <form onSubmit={submitCustom} className="fw-grain mb-6 space-y-3 rounded-lg border border-gold/20 bg-navy-light/40 p-4">
            <div className="flex gap-2">
              {(["scripture", "quote"] as const).map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setNewKind(k)}
                  className={[
                    "fw-tap rounded-full border px-3 text-xs uppercase tracking-wider",
                    newKind === k ? "border-gold text-gold" : "border-parchment/15 text-parchment/50",
                  ].join(" ")}
                >
                  {k}
                </button>
              ))}
            </div>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Text"
              rows={3}
              className="w-full rounded-md border border-parchment/15 bg-navy-deep/60 p-2.5 text-sm text-parchment placeholder:text-parchment/30"
            />
            <input
              value={newAttribution}
              onChange={(e) => setNewAttribution(e.target.value)}
              placeholder={newKind === "scripture" ? "Reference (e.g. Psalm 1:1)" : "Attribution"}
              className="fw-tap w-full rounded-md border border-parchment/15 bg-navy-deep/60 px-2.5 text-sm text-parchment placeholder:text-parchment/30"
            />
            <button
              type="submit"
              className="fw-tap w-full rounded-md border border-gold/50 py-2.5 font-display text-xs uppercase tracking-widest text-gold hover:bg-gold/10"
            >
              Add to the Creed
            </button>
          </form>

          <ul className="space-y-3">
            {customContent.length === 0 && (
              <p className="text-sm text-parchment/40">Nothing added yet.</p>
            )}
            {customContent.map((c) => (
              <li key={c.id} className="fw-grain flex items-start justify-between gap-3 rounded-lg border border-parchment/10 bg-navy-light/40 p-4">
                <div>
                  <p
                    className={
                      c.kind === "scripture"
                        ? "font-scripture text-lg italic text-parchment/90"
                        : "text-sm text-parchment/85"
                    }
                  >
                    “{c.text}”
                  </p>
                  {c.attribution && (
                    <p className="mt-1 text-xs uppercase tracking-wider text-parchment/40">
                      {c.kind === "scripture" ? "" : "— "}
                      {c.attribution}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteCustomContent(c.id)}
                  className="fw-tap shrink-0 text-xs uppercase tracking-wider text-parchment/40 hover:text-crimson-glow"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
