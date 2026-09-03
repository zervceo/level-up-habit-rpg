import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AscentRunner } from "./freedom/AscentRunner";
import { ConfettiBurst } from "./freedom/ConfettiBurst";
import { playFanfare } from "../lib/fanfare";
import { useStore } from "../store/useStore";
import { currentBucket, pickScripture } from "../lib/motivation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type Phase = "scripture" | "ascent" | "climax" | "settle";

export function FreedomSequence({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("scripture");
  const timers = useRef<number[]>([]);
  const muted = useStore((s) => s.settings.muted);
  const favorites = useStore((s) => s.favorites);
  const customContent = useStore((s) => s.customContent);
  const finishedAt = useStore((s) => s.currentWeek.finishedAt);
  const streak = useStore((s) => s.streak);
  const requiredCount = useStore(
    (s) => s.currentWeek.tasks.filter((t) => t.required).length,
  );

  const openingScripture = useRef(pickScripture(currentBucket(false), new Set(favorites), customContent)).current;
  const closingScripture = useRef(
    pickScripture("general", new Set(favorites), customContent),
  ).current;

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(() => setPhase("settle"), 1600);
      timers.current.push(t);
      return clearTimers;
    }
    const t = window.setTimeout(() => setPhase("ascent"), 1800);
    timers.current.push(t);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    if (phase !== "climax") return;
    playFanfare(muted);
    const t = window.setTimeout(() => setPhase("settle"), 2600);
    timers.current.push(t);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, muted]);

  const skip = () => {
    clearTimers();
    setPhase("settle");
  };

  const finishTimeLabel = finishedAt
    ? new Date(finishedAt).toLocaleString(undefined, {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="fixed inset-0 z-50 bg-navy-deep">
      {reduced && phase !== "settle" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex h-full flex-col items-center justify-center gap-6 bg-gradient-to-b from-navy via-crimson/40 to-gold px-6 text-center"
        >
          <p className="font-display text-5xl tracking-wide text-parchment">FREEDOM</p>
          <p className="max-w-md font-scripture text-lg italic text-parchment/90">
            “{openingScripture.text}”
          </p>
        </motion.div>
      ) : (
        <>
          <AnimatePresence>
            {phase === "scripture" && (
              <motion.div
                key="scripture"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 flex items-center justify-center bg-navy-deep px-8"
              >
                <p className="max-w-lg text-center font-scripture text-2xl italic text-parchment">
                  “{openingScripture.text}”
                  <span className="mt-3 block font-display text-sm not-italic tracking-widest text-gold">
                    {openingScripture.reference}
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {(phase === "ascent" || phase === "climax") && (
            <div className="absolute inset-0">
              <AscentRunner
                running={phase === "ascent"}
                victory={phase === "climax"}
                onClimbComplete={() => setPhase("climax")}
              />
              {phase === "climax" && (
                <>
                  <ConfettiBurst />
                  <motion.p
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 140, damping: 12 }}
                    className="absolute inset-x-0 top-1/3 text-center font-display text-6xl tracking-widest text-parchment drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-8xl"
                  >
                    FREEDOM
                  </motion.p>
                </>
              )}
            </div>
          )}
        </>
      )}

      {phase !== "settle" && (
        <button
          onClick={skip}
          className="fw-tap absolute right-4 top-4 z-10 rounded-full border border-parchment/30 px-4 text-xs uppercase tracking-wider text-parchment/70 hover:text-parchment"
        >
          Skip
        </button>
      )}

      <AnimatePresence>
        {phase === "settle" && (
          <motion.div
            key="settle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-navy px-6 text-center"
          >
            <p className="font-display text-sm uppercase tracking-[0.3em] text-gold">
              Week Complete
            </p>
            <p className="font-display text-7xl text-parchment">0 STANDING</p>
            <p className="text-sm uppercase tracking-wider text-parchment/60">
              {requiredCount} required tasks, all done{finishTimeLabel ? ` — finished ${finishTimeLabel}` : ""}
            </p>
            <div className="flex items-center gap-2 font-display text-lg text-gold">
              <span>Current streak: {streak} week{streak === 1 ? "" : "s"}</span>
            </div>
            <p className="max-w-md font-scripture text-lg italic text-parchment/80">
              “{closingScripture.text}”
            </p>
            <p className="font-display text-xs uppercase tracking-widest text-gold/70">
              {closingScripture.reference}
            </p>
            <button
              onClick={onDone}
              className="fw-tap mt-4 rounded-full border border-gold/50 px-8 py-3 font-display text-sm uppercase tracking-widest text-gold transition-colors hover:bg-gold/10"
            >
              Continue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
