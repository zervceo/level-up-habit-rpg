import type { MarketSession } from '../types/domain';

// Simulated trading day: premarket 4:00-9:30, regular 9:30-16:00, afterhours 16:00-20:00.
// All times are minutes from midnight of the sim day.
export const PREMARKET_OPEN_MIN = 4 * 60;
export const REGULAR_OPEN_MIN = 9 * 60 + 30;
export const REGULAR_CLOSE_MIN = 16 * 60;
export const AFTERHOURS_CLOSE_MIN = 20 * 60;

export function sessionForMinuteOfDay(minuteOfDay: number): MarketSession {
  if (minuteOfDay < PREMARKET_OPEN_MIN) return 'CLOSED';
  if (minuteOfDay < REGULAR_OPEN_MIN) return 'PREMARKET';
  if (minuteOfDay < REGULAR_CLOSE_MIN) return 'REGULAR';
  if (minuteOfDay < AFTERHOURS_CLOSE_MIN) return 'AFTERHOURS';
  return 'CLOSED';
}

/** Intraday volatility smile multiplier: elevated at the open and close, calmer midday. */
export function volatilitySmile(minuteOfDay: number): number {
  const openDist = Math.abs(minuteOfDay - REGULAR_OPEN_MIN);
  const closeDist = Math.abs(minuteOfDay - REGULAR_CLOSE_MIN);
  const nearestEdge = Math.min(openDist, closeDist);
  // u-shape: 2.2x at the bell, decaying to 1.0x by midday (~90 min out), floor 0.85x
  const bump = 1.2 * Math.exp(-nearestEdge / 35);
  return Math.max(0.85, 1.0 + bump);
}

function isWeekday(date: Date): boolean {
  const d = date.getDay();
  return d !== 0 && d !== 6;
}

export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Advances a date by n calendar days, skipping to the next weekday if it lands on a weekend. */
export function addTradingDays(date: Date, n: number): Date {
  const d = new Date(date);
  let remaining = n;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    if (isWeekday(d)) remaining--;
  }
  return d;
}

export interface SimTime {
  wallMs: number; // simulated wall-clock epoch ms
  minuteOfDay: number;
  session: MarketSession;
  dayKey: string;
}

export class SimClock {
  simMs: number;
  speed: number; // sim-seconds per real-second
  private running = false;

  constructor(startMs: number, speed = 30) {
    this.simMs = startMs;
    this.speed = speed;
  }

  start() {
    this.running = true;
  }

  pause() {
    this.running = false;
  }

  get isRunning() {
    return this.running;
  }

  /** Advance sim time by realDeltaMs of wall-clock elapsed time, scaled by speed. */
  tick(realDeltaMs: number): number {
    if (!this.running) return 0;
    const advance = realDeltaMs * this.speed;
    this.simMs += advance;
    return advance;
  }

  now(): SimTime {
    const d = new Date(this.simMs);
    const minuteOfDay = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    return {
      wallMs: this.simMs,
      minuteOfDay,
      session: sessionForMinuteOfDay(minuteOfDay),
      dayKey: dateKey(d),
    };
  }
}

/** Builds a Date at a given minute-of-day on today's sim date (local sim time, treated as UTC for determinism). */
export function atMinute(baseDate: Date, minuteOfDay: number): Date {
  const d = new Date(baseDate);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minuteOfDay);
  return d;
}
