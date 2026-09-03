import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import { DAYS } from "../lib/schema";
import { effectiveDayOfWeek } from "../lib/date";
import {
  currentBucket,
  pickExhortation,
  pickQuote,
  pickScripture,
  type Bucket,
} from "../lib/motivation";

export function useOverdueTasks() {
  const tasks = useStore((s) => s.currentWeek.tasks);
  return useMemo(() => {
    const todayIdx = DAYS.indexOf(effectiveDayOfWeek());
    return tasks.filter(
      (t) => !t.completed && t.required && DAYS.indexOf(t.dueDay) < todayIdx,
    );
  }, [tasks]);
}

/**
 * Pairs one scripture with one quote, chosen from the time-of-day / urgency
 * bucket, never repeating within the same day, weighted toward favorites.
 * Re-rolls when the bucket changes (checked every minute) or `refresh` fires.
 */
export function useMotivation() {
  const favorites = useStore((s) => s.favorites);
  const customContent = useStore((s) => s.customContent);
  const overdue = useOverdueTasks();
  const [bucket, setBucket] = useState<Bucket>(() => currentBucket(overdue.length > 0));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setBucket(currentBucket(overdue.length > 0));
    }, 60_000);
    return () => clearInterval(id);
  }, [overdue.length]);

  useEffect(() => {
    setBucket(currentBucket(overdue.length > 0));
  }, [overdue.length]);

  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const { scripture, quote, exhortation } = useMemo(() => {
    return {
      scripture: pickScripture(bucket, favSet, customContent),
      quote: pickQuote(bucket, favSet, customContent),
      exhortation: pickExhortation(bucket),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket, tick, favSet, customContent]);

  const refresh = () => setTick((t) => t + 1);

  return { bucket, scripture, quote, exhortation, refresh, hasOverdue: overdue.length > 0 };
}
