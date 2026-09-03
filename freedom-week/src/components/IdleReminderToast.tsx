import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { currentBucket, pickScripture } from "../lib/motivation";

const IDLE_MS = 20 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "touchstart", "scroll", "click"] as const;

function fragment(text: string, words = 10): string {
  const parts = text.split(" ");
  return parts.length <= words ? text : parts.slice(0, words).join(" ") + "…";
}

export function IdleReminderToast() {
  const enabled = useStore((s) => s.settings.idleReminderEnabled);
  const tasks = useStore((s) => s.currentWeek.tasks);
  const favorites = useStore((s) => s.favorites);
  const customContent = useStore((s) => s.customContent);

  const lastActivity = useRef(Date.now());
  const [message, setMessage] = useState<{ task: string; scripture: string } | null>(null);
  const shownForThisIdlePeriod = useRef(false);

  useEffect(() => {
    const onActivity = () => {
      lastActivity.current = Date.now();
      shownForThisIdlePeriod.current = false;
      setMessage(null);
    };
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    return () => ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      const idleFor = Date.now() - lastActivity.current;
      if (idleFor < IDLE_MS || shownForThisIdlePeriod.current) return;
      const outstanding = tasks.filter((t) => !t.completed);
      if (outstanding.length === 0) return;
      const target =
        outstanding.find((t) => t.required) ?? outstanding[0];
      const s = pickScripture(currentBucket(false), new Set(favorites), customContent);
      shownForThisIdlePeriod.current = true;
      setMessage({ task: target.title, scripture: fragment(s.text) });
    }, 30_000);
    return () => clearInterval(id);
  }, [enabled, tasks, favorites, customContent]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fw-grain fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 rounded-xl border border-gold/25 bg-navy-deep/95 p-4 shadow-lg md:inset-x-auto md:bottom-6 md:left-32 md:max-w-sm"
        >
          <p className="font-display text-xs uppercase tracking-widest text-gold">
            Still open: {message.task}
          </p>
          <p className="mt-1.5 font-scripture text-sm italic text-parchment/80">
            “{message.scripture}”
          </p>
          <button
            onClick={() => setMessage(null)}
            className="fw-tap mt-2 text-xs uppercase tracking-wider text-parchment/40 hover:text-parchment/70"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
