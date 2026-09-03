import { useState } from "react";
import { CATEGORIES, DAYS, type Category, type DayOfWeek } from "../lib/schema";

export interface TaskFormValue {
  title: string;
  notes?: string;
  category: Category;
  required: boolean;
  dueDay: DayOfWeek;
}

export function TaskForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<TaskFormValue>;
  submitLabel: string;
  onSubmit: (value: TaskFormValue) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "Other");
  const [required, setRequired] = useState(initial?.required ?? true);
  const [dueDay, setDueDay] = useState<DayOfWeek>(initial?.dueDay ?? "Mon");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit({ title: title.trim(), notes: notes.trim() || undefined, category, required, dueDay });
      }}
      className="fw-grain space-y-3 rounded-lg border border-gold/20 bg-navy-light/40 p-4"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="fw-tap w-full rounded-md border border-parchment/15 bg-navy-deep/60 px-2.5 text-sm text-parchment placeholder:text-parchment/30"
        autoFocus
      />
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="fw-tap w-full rounded-md border border-parchment/15 bg-navy-deep/60 px-2.5 text-sm text-parchment placeholder:text-parchment/30"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="fw-tap rounded-md border border-parchment/15 bg-navy-deep/60 px-2 text-sm text-parchment"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={dueDay}
          onChange={(e) => setDueDay(e.target.value as DayOfWeek)}
          className="fw-tap rounded-md border border-parchment/15 bg-navy-deep/60 px-2 text-sm text-parchment"
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <label className="fw-tap flex items-center gap-2 text-sm text-parchment/70">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="h-4 w-4 accent-[color:var(--color-gold)]"
        />
        Required for freedom
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className="fw-tap flex-1 rounded-md border border-gold/50 py-2 font-display text-xs uppercase tracking-widest text-gold hover:bg-gold/10"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="fw-tap rounded-md border border-parchment/15 px-4 py-2 text-xs uppercase tracking-wider text-parchment/50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
