import { useMemo } from "react";
import { useStore } from "../store/useStore";
import { ProgressRing } from "../components/ProgressRing";
import { TaskCard } from "../components/TaskCard";
import { MotivationCard } from "../components/MotivationCard";
import { CountdownBanner } from "../components/CountdownBanner";
import { FreedomSequence } from "../components/FreedomSequence";
import { useMotivation, useOverdueTasks } from "../hooks/useMotivation";
import { DAYS } from "../lib/schema";
import { effectiveDayOfWeek, formatWeekLabel } from "../lib/date";

export function Ascent() {
  const tasks = useStore((s) => s.currentWeek.tasks);
  const weekStartISO = useStore((s) => s.currentWeek.weekStartISO);
  const allRequiredDone = useStore((s) => s.currentWeek.allRequiredDone);
  const finishedAt = useStore((s) => s.currentWeek.finishedAt);
  const streak = useStore((s) => s.streak);
  const freedomAcknowledged = useStore((s) => s.freedomAcknowledged);
  const acknowledgeFreedom = useStore((s) => s.acknowledgeFreedom);
  const toggleTask = useStore((s) => s.toggleTask);
  const { scripture, quote } = useMotivation();
  const overdue = useOverdueTasks();

  const today = effectiveDayOfWeek();
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.dueDay === today).sort((a, b) => a.order - b.order),
    [tasks, today],
  );
  const requiredToday = todayTasks.filter((t) => t.required);
  const optionalToday = todayTasks.filter((t) => !t.required);

  const required = tasks.filter((t) => t.required);
  const completedRequired = required.filter((t) => t.completed).length;
  const remaining = required.length - completedRequired;
  const progress = required.length ? completedRequired / required.length : 0;

  const todayIdx = DAYS.indexOf(today);
  const heat = Math.min(1, (todayIdx / 6) * (1 - progress));

  const showSequence = allRequiredDone && !freedomAcknowledged;
  const showCalmRest = allRequiredDone && freedomAcknowledged;

  const overdueIds = useMemo(() => new Set(overdue.map((t) => t.id)), [overdue]);

  const finishTimeLabel = finishedAt
    ? new Date(finishedAt).toLocaleString(undefined, {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  if (showCalmRest) {
    return (
      <div className="relative min-h-dvh px-5 pb-16 pt-10 md:px-10">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">
            {formatWeekLabel(weekStartISO)}
          </p>
          <p className="font-display text-7xl text-parchment">0 STANDING</p>
          <p className="text-sm uppercase tracking-wider text-parchment/50">
            Finished {finishTimeLabel} · Streak {streak} week{streak === 1 ? "" : "s"}
          </p>
          <div className="fw-hairline w-24" />
          <p className="font-scripture text-xl italic text-parchment/85">“{scripture.text}”</p>
          <p className="font-display text-xs uppercase tracking-widest text-gold/70">
            {scripture.reference}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh px-5 pb-10 pt-8 md:px-10">
      {!allRequiredDone && (
        <div
          className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle at 50% 15%, color-mix(in srgb, var(--color-crimson) ${Math.round(heat * 30)}%, transparent), transparent 60%)`,
          }}
        />
      )}

      <header className="mb-5">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">
          The Ascent
        </p>
        <p className="text-xs text-parchment/40">{formatWeekLabel(weekStartISO)}</p>
      </header>

      <div className="mb-5">
        <CountdownBanner />
      </div>

      <div className="mb-8 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <ProgressRing progress={progress} warm={heat > 0.4} />
          <div className="absolute flex flex-col items-center">
            <span className="font-display text-7xl leading-none text-parchment">
              {remaining}
            </span>
            <span className="mt-1 text-[11px] uppercase tracking-[0.25em] text-parchment/50">
              standing
            </span>
          </div>
        </div>
      </div>

      <section className="mx-auto mb-8 max-w-xl">
        <h2 className="fw-hairline mb-3 pb-2 font-display text-sm uppercase tracking-widest text-parchment/70">
          Today — {today}
        </h2>
        {requiredToday.length === 0 && optionalToday.length === 0 && (
          <p className="text-sm text-parchment/40">Nothing scheduled for today.</p>
        )}
        <div className="space-y-2.5">
          {requiredToday.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              overdue={overdueIds.has(t.id)}
              onToggle={() => toggleTask(t.id)}
            />
          ))}
        </div>

        {optionalToday.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-parchment/35">
              Bonus
            </p>
            <div className="space-y-2.5">
              {optionalToday.map((t) => (
                <TaskCard key={t.id} task={t} overdue={false} onToggle={() => toggleTask(t.id)} dim />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-xl">
        <MotivationCard scripture={scripture} quote={quote} />
      </section>

      {showSequence && <FreedomSequence onDone={acknowledgeFreedom} />}
    </div>
  );
}
