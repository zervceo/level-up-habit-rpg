import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryIcon } from "./icons";
import type { Task } from "../lib/schema";
import { checkInLines } from "../content/exhortations";

export function TaskCard({
  task,
  overdue,
  onToggle,
  dim,
}: {
  task: Task;
  overdue: boolean;
  onToggle: () => void;
  dim?: boolean;
}) {
  const [ack, setAck] = useState<string | null>(null);

  const handleToggle = () => {
    if (!task.completed) {
      const line = checkInLines[Math.floor(Math.random() * checkInLines.length)];
      setAck(line);
      window.setTimeout(() => setAck(null), 2200);
    }
    onToggle();
  };

  return (
    <div
      className={[
        "fw-grain relative rounded-xl border p-4 transition-colors",
        task.completed
          ? "border-gold/30 bg-navy-light/60"
          : overdue
            ? "fw-overdue border-2 bg-navy-light/70"
            : "fw-breathe border-parchment/10 bg-navy-light/70",
        dim ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          aria-pressed={task.completed}
          aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
          className="fw-tap mt-0.5 flex shrink-0 items-center justify-center"
        >
          <motion.span
            whileTap={{ scale: 0.85 }}
            animate={task.completed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={[
              "flex h-6 w-6 items-center justify-center rounded-full border-2",
              task.completed
                ? "border-gold bg-gold text-navy"
                : "border-parchment/40 text-transparent",
            ].join(" ")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12.5 9.5 18 20 6"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CategoryIcon
              category={task.category}
              size={15}
              className={task.completed ? "text-gold/70" : "text-parchment/50"}
            />
            <p
              className={[
                "truncate font-ui text-[15px]",
                task.completed ? "text-parchment/50 line-through" : "text-parchment",
              ].join(" ")}
            >
              {task.title}
            </p>
          </div>
          {task.notes && (
            <p className="mt-1 truncate text-xs text-parchment/40">{task.notes}</p>
          )}
          <div className="mt-1.5 flex items-center gap-2 text-[10px] uppercase tracking-wider text-parchment/40">
            <span>{task.category}</span>
            {task.required ? (
              <span className="text-gold/70">Required</span>
            ) : (
              <span>Bonus</span>
            )}
            {overdue && !task.completed && (
              <span className="text-crimson-glow">Overdue</span>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {ack && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 font-display text-xs uppercase tracking-wide text-gold"
          >
            {ack}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
