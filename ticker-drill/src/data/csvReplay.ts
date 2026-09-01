import type { Bar } from '../types/domain';

export interface ParsedCsv {
  symbol: string;
  bars: Bar[];
}

/**
 * Parses a CSV of OHLCV bars. Expected headers (case-insensitive, any order):
 * timestamp|date|time, open, high, low, close, volume
 * timestamp accepts epoch ms, epoch seconds, or an ISO-8601 string.
 */
export function parseOhlcvCsv(text: string, symbol: string): ParsedCsv {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV has no data rows');
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idx = (names: string[]) => {
    for (const n of names) {
      const i = header.indexOf(n);
      if (i >= 0) return i;
    }
    return -1;
  };
  const tIdx = idx(['timestamp', 'date', 'time']);
  const oIdx = idx(['open']);
  const hIdx = idx(['high']);
  const lIdx = idx(['low']);
  const cIdx = idx(['close']);
  const vIdx = idx(['volume', 'vol']);
  if ([tIdx, oIdx, hIdx, lIdx, cIdx].some((i) => i < 0)) {
    throw new Error('CSV must include timestamp/date, open, high, low, close columns');
  }

  const bars: Bar[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    const cols = row.split(',');
    const rawT = cols[tIdx]?.trim();
    let t: number;
    if (/^\d+$/.test(rawT)) {
      const n = Number(rawT);
      t = n > 1e12 ? n : n * 1000; // seconds vs ms
    } else {
      t = new Date(rawT).getTime();
    }
    if (Number.isNaN(t)) continue;
    bars.push({
      t,
      o: Number(cols[oIdx]),
      h: Number(cols[hIdx]),
      l: Number(cols[lIdx]),
      c: Number(cols[cIdx]),
      v: vIdx >= 0 ? Number(cols[vIdx]) || 0 : 0,
    });
  }
  bars.sort((a, b) => a.t - b.t);
  return { symbol, bars };
}

/**
 * Replay controller: exposes only bars up to the current cursor, hiding
 * future bars from the caller (no lookahead).
 */
export class CsvReplayController {
  private bars: Bar[];
  private cursor = 0;

  constructor(bars: Bar[]) {
    this.bars = bars;
  }

  get length() {
    return this.bars.length;
  }

  get atEnd() {
    return this.cursor >= this.bars.length;
  }

  visibleBars(): Bar[] {
    return this.bars.slice(0, this.cursor);
  }

  currentBar(): Bar | null {
    return this.cursor > 0 ? this.bars[this.cursor - 1] : null;
  }

  peekNext(): Bar | null {
    return this.cursor < this.bars.length ? this.bars[this.cursor] : null;
  }

  advanceOneBar(): Bar | null {
    if (this.atEnd) return null;
    const bar = this.bars[this.cursor];
    this.cursor++;
    return bar;
  }

  reset() {
    this.cursor = 0;
  }
}
