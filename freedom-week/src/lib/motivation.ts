import { scriptures, type ScriptureEntry } from "../content/scriptures";
import { quotes, type QuoteEntry } from "../content/quotes";
import { exhortations, type ExhortationEntry } from "../content/exhortations";
import type { CustomContent } from "./schema";

export type Bucket = "earlyMorning" | "longNight" | "urgency" | "general";

export function currentBucket(hasOverdue: boolean, now: Date = new Date()): Bucket {
  const hour = now.getHours();
  if (hour < 7) return "earlyMorning";
  if (hour >= 21) return "longNight";
  if (hasOverdue) return "urgency";
  return "general";
}

function todayKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

const SEEN_STORAGE_KEY = "freedom-week:motivation-seen";

function readSeen(now: Date): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { day: string; ids: string[] };
    if (parsed.day !== todayKey(now)) return new Set();
    return new Set(parsed.ids);
  } catch {
    return new Set();
  }
}

function writeSeen(ids: Set<string>, now: Date) {
  try {
    localStorage.setItem(
      SEEN_STORAGE_KEY,
      JSON.stringify({ day: todayKey(now), ids: Array.from(ids) }),
    );
  } catch {
    // Storage unavailable (private mode, quota) — repeats within a day are
    // a minor cosmetic issue, not worth surfacing to the user.
  }
}

interface Pickable {
  id: string;
  buckets: string[];
}

/** Weighted random pick: favorited items are ~3x as likely to resurface. */
function weightedPick<T extends Pickable>(
  pool: T[],
  favorites: Set<string>,
  keyPrefix: string,
): T | undefined {
  if (pool.length === 0) return undefined;
  const weighted: T[] = [];
  for (const item of pool) {
    const weight = favorites.has(`${keyPrefix}:${item.id}`) ? 3 : 1;
    for (let i = 0; i < weight; i++) weighted.push(item);
  }
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function pickUnseen<T extends Pickable>(
  all: T[],
  bucket: Bucket,
  seen: Set<string>,
  favorites: Set<string>,
  keyPrefix: string,
): T | undefined {
  const inBucket = all.filter((e) => e.buckets.includes(bucket));
  const source = inBucket.length > 0 ? inBucket : all;
  const unseen = source.filter((e) => !seen.has(`${keyPrefix}:${e.id}`));
  const pool = unseen.length > 0 ? unseen : source;
  return weightedPick(pool, favorites, keyPrefix);
}

export function pickScripture(
  bucket: Bucket,
  favorites: Set<string>,
  custom: CustomContent[],
  now: Date = new Date(),
): ScriptureEntry {
  const customScriptures: ScriptureEntry[] = custom
    .filter((c) => c.kind === "scripture")
    .map((c) => ({ id: c.id, text: c.text, reference: c.attribution ?? "", buckets: ["general"] }));
  const all = [...scriptures, ...customScriptures];
  const seen = readSeen(now);
  const pick = pickUnseen(all, bucket, seen, favorites, "scripture") ?? all[0];
  seen.add(`scripture:${pick.id}`);
  writeSeen(seen, now);
  return pick;
}

export function pickQuote(
  bucket: Bucket,
  favorites: Set<string>,
  custom: CustomContent[],
  now: Date = new Date(),
): QuoteEntry {
  const customQuotes: QuoteEntry[] = custom
    .filter((c) => c.kind === "quote")
    .map((c) => ({ id: c.id, text: c.text, attribution: c.attribution ?? "Unknown", buckets: ["general"] }));
  const all = [...quotes, ...customQuotes];
  const seen = readSeen(now);
  const pick = pickUnseen(all, bucket, seen, favorites, "quote") ?? all[0];
  seen.add(`quote:${pick.id}`);
  writeSeen(seen, now);
  return pick;
}

export function pickExhortation(bucket: Bucket): ExhortationEntry {
  const inBucket = exhortations.filter((e) => e.buckets.includes(bucket));
  const pool = inBucket.length > 0 ? inBucket : exhortations;
  return pool[Math.floor(Math.random() * pool.length)];
}
