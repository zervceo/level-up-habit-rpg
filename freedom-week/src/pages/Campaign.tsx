import { useState } from "react";
import { useStore } from "../store/useStore";
import { TaskCard } from "../components/TaskCard";
import { DAYS, type DayOfWeek } from "../lib/schema";
import { effectiveDayOfWeek, formatWeekLabel } from "../lib/date";
import { useOverdueTasks } from "../hooks/useMotivation";

export function Campaign() {
  const tasks = useStore((s) => s.currentWeek.tasks);
  const weekStartISO = useStore((s) => s.currentWeek.weekStartISO);
  const toggleTask = useStore((s) => s.toggleTask);
  const rescheduleTask = useStore((s) => s.rescheduleTask);
  const overdue = useOverdueTasks();
  const overdueIds = new Set(overdue.map((t) => t.id));

  const today = effectiveDayOfWeek();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<DayOfWeek | null>(null);

  const handleDrop = (day: DayOfWeek) => {
    if (draggedId) rescheduleTask(draggedId, day);
    setDraggedId(null);
    setDragOverDay(null);
  };

  return (
    <div className="min-h-dvh px-4 pb-10 pt-8 md:px-10">
      <header className="mb-6">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">
          The Campaign
        </p>
        <p className="text-xs text-parchment/40">{formatWeekLabel(weekStartISO)}</p>
        <p className="mt-1 text-xs text-parchment/30">
          Drag a task card onto another day to reschedule it.
        </p>
      </header>

      <div className="fw-scroll flex gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-7 md:gap-3 md:overflow-visible">
        {DAYS.map((day) => {
          const dayTasks = tasks
            .filter((t) => t.dueDay === day)
            .sort((a, b) => a.order - b.order);
          const isToday = day === today;

          return (
            <div
              key={day}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverDay(day);
              }}
              onDragLeave={() => setDragOverDay((d) => (d === day ? null : d))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(day);
              }}
              className={[
                "min-w-[220px] flex-1 rounded-xl border p-3 transition-colors md:min-w-0",
                isToday ? "border-gold/40 bg-navy-light/50" : "border-parchment/10 bg-navy-light/30",
                dragOverDay === day ? "border-gold bg-gold/5" : "",
              ].join(" ")}
            >
              <div className="mb-3 flex items-center justify-between">
                <p
                  className={[
                    "font-display text-sm uppercase tracking-widest",
                    isToday ? "text-gold" : "text-parchment/60",
                  ].join(" ")}
                >
                  {day}
                </p>
                <span className="text-[10px] text-parchment/30">
                  {dayTasks.filter((t) => t.completed).length}/{dayTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {dayTasks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-parchment/10 p-3 text-center text-[11px] text-parchment/25">
                    Empty
                  </p>
                )}
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDraggedId(t.id)}
                    onDragEnd={() => setDraggedId(null)}
                    className={draggedId === t.id ? "opacity-40" : "cursor-grab active:cursor-grabbing"}
                  >
                    <TaskCard
                      task={t}
                      overdue={overdueIds.has(t.id)}
                      onToggle={() => toggleTask(t.id)}
                      dim={!t.required}
                    />
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-parchment/30" htmlFor={`move-${t.id}`}>
                        Move to
                      </label>
                      <select
                        id={`move-${t.id}`}
                        value={t.dueDay}
                        onChange={(e) => rescheduleTask(t.id, e.target.value as DayOfWeek)}
                        className="fw-tap rounded-md border border-parchment/15 bg-navy-deep/80 px-1.5 text-[10px] text-parchment/60"
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
