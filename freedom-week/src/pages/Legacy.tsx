import { useMemo } from "react";
import { useStore } from "../store/useStore";
import { LaurelIcon } from "../components/icons";
import { formatWeekLabel } from "../lib/date";

function weekCompletion(w: { tasks: { required: boolean; completed: boolean }[] }) {
  const required = w.tasks.filter((t) => t.required);
  if (required.length === 0) return 0;
  return required.filter((t) => t.completed).length / required.length;
}

function WeekBars({ archive }: { archive: ReturnType<typeof useStore.getState>["archive"] }) {
  const recent = archive.slice(0, 12).reverse();
  if (recent.length === 0) {
    return <p className="text-sm text-parchment/40">No weeks archived yet — finish your first one.</p>;
  }
  const width = 480;
  const height = 140;
  const barWidth = width / recent.length - 8;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {recent.map((w, i) => {
        const pct = weekCompletion(w);
        const barHeight = Math.max(4, pct * (height - 20));
        const x = i * (width / recent.length) + 4;
        const y = height - barHeight;
        return (
          <g key={w.weekStartISO}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={3}
              fill={pct >= 1 ? "var(--color-gold-bright)" : "color-mix(in srgb, var(--color-gold) 45%, transparent)"}
            />
          </g>
        );
      })}
      <line x1={0} y1={height} x2={width} y2={height} stroke="var(--color-parchment)" strokeOpacity={0.15} />
    </svg>
  );
}

export function Legacy() {
  const archive = useStore((s) => s.archive);
  const streak = useStore((s) => s.streak);
  const bestStreak = useStore((s) => s.bestStreak);

  const stats = useMemo(() => {
    const totalWeeks = archive.length;
    const perfectWeeks = archive.filter((w) => weekCompletion(w) >= 1).length;
    const avg =
      totalWeeks === 0 ? 0 : archive.reduce((sum, w) => sum + weekCompletion(w), 0) / totalWeeks;
    return { totalWeeks, perfectWeeks, avg };
  }, [archive]);

  return (
    <div className="min-h-dvh px-5 pb-16 pt-8 md:px-10">
      <header className="mb-6">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">The Legacy</p>
        <p className="text-xs text-parchment/40">What you've built, week over week.</p>
      </header>

      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
        <div className="fw-grain rounded-xl border border-gold/25 bg-navy-light/50 p-4 text-center">
          <LaurelIcon size={22} className="mx-auto mb-1 text-gold" />
          <p className="font-display text-3xl text-parchment">{streak}</p>
          <p className="text-[10px] uppercase tracking-wider text-parchment/50">Current streak</p>
        </div>
        <div className="fw-grain rounded-xl border border-parchment/10 bg-navy-light/40 p-4 text-center">
          <p className="font-display text-3xl text-parchment">{bestStreak}</p>
          <p className="text-[10px] uppercase tracking-wider text-parchment/50">Best streak</p>
        </div>
        <div className="fw-grain rounded-xl border border-parchment/10 bg-navy-light/40 p-4 text-center">
          <p className="font-display text-3xl text-parchment">{stats.perfectWeeks}</p>
          <p className="text-[10px] uppercase tracking-wider text-parchment/50">Perfect weeks</p>
        </div>
        <div className="fw-grain rounded-xl border border-parchment/10 bg-navy-light/40 p-4 text-center">
          <p className="font-display text-3xl text-parchment">{Math.round(stats.avg * 100)}%</p>
          <p className="text-[10px] uppercase tracking-wider text-parchment/50">Avg completion</p>
        </div>
      </div>

      <section className="mx-auto mt-8 max-w-3xl">
        <h2 className="fw-hairline mb-3 pb-2 font-display text-sm uppercase tracking-widest text-parchment/70">
          {archive.length > 0 ? `Last ${Math.min(12, archive.length)} weeks` : "Recent weeks"}
        </h2>
        <div className="fw-grain rounded-xl border border-parchment/10 bg-navy-light/30 p-4">
          <WeekBars archive={archive} />
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-3xl">
        <h2 className="fw-hairline mb-3 pb-2 font-display text-sm uppercase tracking-widest text-parchment/70">
          Archive
        </h2>
        <ul className="space-y-2">
          {archive.length === 0 && (
            <p className="text-sm text-parchment/40">Your finished weeks will collect here.</p>
          )}
          {archive.map((w) => {
            const pct = weekCompletion(w);
            return (
              <li
                key={w.weekStartISO}
                className="flex items-center justify-between rounded-lg border border-parchment/10 bg-navy-light/30 px-4 py-3"
              >
                <span className="text-sm text-parchment/80">{formatWeekLabel(w.weekStartISO)}</span>
                <span
                  className={[
                    "font-display text-sm uppercase tracking-wide",
                    pct >= 1 ? "text-gold" : "text-parchment/50",
                  ].join(" ")}
                >
                  {Math.round(pct * 100)}%
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
