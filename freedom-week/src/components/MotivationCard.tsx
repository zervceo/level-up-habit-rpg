import { useStore } from "../store/useStore";
import type { ScriptureEntry } from "../content/scriptures";
import type { QuoteEntry } from "../content/quotes";

function StarButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      className="fw-tap flex items-center justify-center text-gold"
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          d="M12 3.5 14.5 9.6 21 10.2 16 14.4 17.5 20.8 12 17.3 6.5 20.8 8 14.4 3 10.2 9.5 9.6Z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function MotivationCard({
  scripture,
  quote,
}: {
  scripture: ScriptureEntry;
  quote: QuoteEntry;
}) {
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  const scriptureKey = `scripture:${scripture.id}`;
  const quoteKey = `quote:${quote.id}`;

  return (
    <div className="fw-grain rounded-xl border border-gold/15 bg-navy-light/50 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-scripture text-lg italic leading-snug text-parchment/90">
          “{scripture.text}”
        </p>
        <StarButton
          active={favorites.includes(scriptureKey)}
          onClick={() => toggleFavorite(scriptureKey)}
        />
      </div>
      <p className="mt-1 font-display text-xs uppercase tracking-widest text-gold/80">
        {scripture.reference}
      </p>

      <div className="fw-hairline my-4" />

      <div className="flex items-start justify-between gap-3">
        <p className="font-ui text-sm text-parchment/80">“{quote.text}”</p>
        <StarButton
          active={favorites.includes(quoteKey)}
          onClick={() => toggleFavorite(quoteKey)}
        />
      </div>
      <p className="mt-1 text-xs uppercase tracking-wider text-parchment/40">
        — {quote.attribution}
      </p>
    </div>
  );
}
