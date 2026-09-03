import { DAYS, type DayOfWeek } from "./schema";

/** The week rolls over Monday at this local hour. */
export const ROLLOVER_HOUR = 4;

/** Monday=0 .. Sunday=6, matching DAYS order (JS getDay() is Sunday=0). */
export function jsDayToIndex(jsDay: number): number {
  return (jsDay + 6) % 7;
}

export function dayOfWeekFromDate(d: Date): DayOfWeek {
  return DAYS[jsDayToIndex(d.getDay())];
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * The "effective" moment for FREEDOM WEEK purposes: since the week rolls
 * over Monday 4am rather than midnight, anything before 4am on Monday
 * still belongs to the prior week.
 */
export function effectiveNow(now: Date = new Date()): Date {
  const shifted = new Date(now);
  shifted.setHours(shifted.getHours() - ROLLOVER_HOUR);
  return shifted;
}

/** ISO date (yyyy-mm-dd) of the Monday that starts the effective week of `now`. */
export function currentWeekStartISO(now: Date = new Date()): string {
  const eff = effectiveNow(now);
  const idx = jsDayToIndex(eff.getDay());
  const monday = new Date(eff);
  monday.setDate(eff.getDate() - idx);
  monday.setHours(0, 0, 0, 0);
  return toISODate(monday);
}

export function effectiveDayOfWeek(now: Date = new Date()): DayOfWeek {
  return dayOfWeekFromDate(effectiveNow(now));
}

/** Milliseconds until the next Monday 4:00am local, from `now`. */
export function msUntilNextRollover(now: Date = new Date()): number {
  const eff = effectiveNow(now);
  const idx = jsDayToIndex(eff.getDay());
  const daysUntilMonday = idx === 0 ? 7 : 7 - idx;
  const next = new Date(now);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + daysUntilMonday);
  next.setHours(ROLLOVER_HOUR, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export function formatWeekLabel(weekStartISO: string): string {
  const [y, m, d] = weekStartISO.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (dt: Date) =>
    dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function isPastThursday(now: Date = new Date()): boolean {
  const idx = jsDayToIndex(effectiveNow(now).getDay());
  return idx >= 3; // Thu=3
}

export function hoursMinutesUntilRollover(now: Date = new Date()): {
  days: number;
  hours: number;
} {
  const ms = msUntilNextRollover(now);
  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  return { days: Math.floor(totalHours / 24), hours: totalHours % 24 };
}
