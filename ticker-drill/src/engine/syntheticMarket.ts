import type { Bar, MarketSession, Quote, TickerMeta } from '../types/domain';
import { Rng } from './prng';
import { sessionForMinuteOfDay, volatilitySmile } from './clock';

const SECONDS_PER_TRADING_YEAR = 252 * 16 * 3600; // synthetic annualization base (16h session incl. extended)
const MAX_BARS_KEPT = 600;

export interface SymbolState {
  symbol: string;
  last: number;
  bid: number;
  ask: number;
  session: MarketSession;
  halted: boolean;
  haltedUntilMs: number | null;
  volMultiplier: number;
  newsUntilMs: number | null;
  currentBar: Bar | null;
  bars: Bar[];
  todaysOpen: number;
  lastSessionDayKey: string | null;
  lastNewsHeadline: string | null;
  secondsAccumulator: number;
}

const NEWS_HEADLINES = [
  'Guidance raised ahead of sector conference',
  'Analyst downgrade cites valuation concerns',
  'Unconfirmed report of regulatory inquiry',
  'Supply agreement announced with major partner',
  'Insider Form 4 filing shows large sale',
  'Short-interest report shows sharp increase',
  'Rumored buyout interest circulating',
  'Product recall announced',
];

export class SyntheticMarket {
  private rng: Rng;
  private symbols = new Map<string, SymbolState>();
  private tickerMeta = new Map<string, TickerMeta>();
  private externalDriven = new Set<string>();

  constructor(tickers: TickerMeta[], seed: number) {
    this.rng = new Rng(seed);
    for (const t of tickers) {
      this.tickerMeta.set(t.symbol, t);
      this.symbols.set(t.symbol, {
        symbol: t.symbol,
        last: t.startPrice,
        bid: t.startPrice,
        ask: t.startPrice,
        session: 'CLOSED',
        halted: false,
        haltedUntilMs: null,
        volMultiplier: 1,
        newsUntilMs: null,
        currentBar: null,
        bars: [],
        todaysOpen: t.startPrice,
        lastSessionDayKey: null,
        lastNewsHeadline: null,
        secondsAccumulator: 0,
      });
    }
  }

  getQuote(symbol: string): Quote {
    const s = this.mustGet(symbol);
    return {
      symbol,
      last: s.last,
      bid: s.bid,
      ask: s.ask,
      timestamp: 0,
      session: s.session,
      halted: s.halted,
    };
  }

  getBars(symbol: string): Bar[] {
    return this.mustGet(symbol).bars;
  }

  getState(symbol: string): SymbolState {
    return this.mustGet(symbol);
  }

  allSymbols(): string[] {
    return [...this.symbols.keys()];
  }

  private mustGet(symbol: string): SymbolState {
    const s = this.symbols.get(symbol);
    if (!s) throw new Error(`Unknown symbol ${symbol}`);
    return s;
  }

  /** Force-set price (used by scenario scripting for deterministic setups). */
  forceGap(symbol: string, newPrice: number, headline?: string) {
    const s = this.mustGet(symbol);
    s.last = newPrice;
    this.applySpread(s);
    s.volMultiplier = Math.max(s.volMultiplier, 2.5);
    s.newsUntilMs = (s.newsUntilMs ?? 0) + 1;
    if (headline) s.lastNewsHeadline = headline;
  }

  forceHalt(symbol: string, untilMs: number) {
    const s = this.mustGet(symbol);
    s.halted = true;
    s.haltedUntilMs = untilMs;
  }

  forceResume(symbol: string) {
    const s = this.mustGet(symbol);
    s.halted = false;
    s.haltedUntilMs = null;
  }

  /** Marks a symbol as externally driven (e.g. CSV replay) — GBM stepping is skipped for it. */
  setExternalDrive(symbol: string, on: boolean) {
    if (on) this.externalDriven.add(symbol);
    else this.externalDriven.delete(symbol);
  }

  /** Directly sets a symbol's quote from an external source (CSV replay bar). */
  setQuoteDirect(symbol: string, last: number, high: number, low: number) {
    const s = this.mustGet(symbol);
    s.last = roundTick(last);
    const spread = Math.max(0.01, (high - low) * 0.1);
    s.bid = roundTick(Math.max(0.01, last - spread / 2));
    s.ask = roundTick(last + spread / 2);
    s.session = 'REGULAR';
    s.halted = false;
    this.updateBar(s, Date.now());
  }

  /** Advance the market by deltaMs of *simulated* time. */
  advance(nowMs: number, deltaMs: number, dayKey: string) {
    if (deltaMs <= 0) return;
    const d = new Date(nowMs);
    const minuteOfDay = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    const session = sessionForMinuteOfDay(minuteOfDay);

    for (const s of this.symbols.values()) {
      if (this.externalDriven.has(s.symbol)) continue;

      if (s.lastSessionDayKey !== dayKey) {
        s.lastSessionDayKey = dayKey;
        s.todaysOpen = s.last;
        this.maybeGapOnOpen(s);
      }
      s.session = session;

      if (s.halted) {
        if (s.haltedUntilMs !== null && nowMs >= s.haltedUntilMs) {
          s.halted = false;
          s.haltedUntilMs = null;
        } else {
          continue;
        }
      }

      if (session === 'CLOSED') continue;

      s.secondsAccumulator += deltaMs / 1000;
      while (s.secondsAccumulator >= 1) {
        s.secondsAccumulator -= 1;
        this.stepOneSecond(s, minuteOfDay, nowMs);
      }
      this.updateBar(s, nowMs);

      if (s.newsUntilMs !== null && nowMs >= s.newsUntilMs) {
        s.newsUntilMs = null;
        s.volMultiplier = 1;
      }
    }
  }

  private maybeGapOnOpen(s: SymbolState) {
    // ~12% chance of a gap at the start of a new sim day (news overnight)
    if (this.rng.chance(0.12)) {
      const magnitude = this.rng.uniformRange(0.02, 0.09);
      const direction = this.rng.chance(0.5) ? 1 : -1;
      s.last = Math.max(0.05, s.last * (1 + direction * magnitude));
      s.lastNewsHeadline = direction > 0 ? 'Pre-market gap up on overnight news' : 'Pre-market gap down on overnight news';
      s.volMultiplier = 2;
      this.applySpread(s);
    }
  }

  private stepOneSecond(s: SymbolState, minuteOfDay: number, nowMs: number) {
    const meta = this.tickerMeta.get(s.symbol)!;
    const smile = volatilitySmile(minuteOfDay);
    const annualVol = (meta.baseVolatilityAnnualPct / 100) * smile * s.volMultiplier;
    const dt = 1 / SECONDS_PER_TRADING_YEAR;
    const shock = this.rng.fatTailShock();
    const drift = -0.5 * annualVol * annualVol * dt; // zero-drift GBM (risk-neutral-ish, no directional bias)
    const diffusion = annualVol * Math.sqrt(dt) * shock;
    s.last = Math.max(0.01, s.last * Math.exp(drift + diffusion));

    // rare news event during regular/extended hours
    if (this.rng.chance(0.0004)) {
      this.triggerNews(s, nowMs);
    }

    // single-stock volatility pause: a violent 1-minute move trips a halt
    if (s.currentBar && s.currentBar.o > 0) {
      const moveFromBarOpen = Math.abs(s.last / s.currentBar.o - 1);
      if (moveFromBarOpen > 0.12 && !s.halted) {
        s.halted = true;
        s.haltedUntilMs = nowMs + 5 * 60 * 1000;
        s.lastNewsHeadline = 'Volatility pause triggered (single-stock circuit breaker)';
      }
    }

    this.applySpread(s);
  }

  private triggerNews(s: SymbolState, nowMs: number) {
    const magnitude = this.rng.uniformRange(0.01, 0.05);
    const direction = this.rng.chance(0.5) ? 1 : -1;
    s.last = Math.max(0.01, s.last * (1 + direction * magnitude));
    s.volMultiplier = this.rng.uniformRange(2, 4);
    s.newsUntilMs = nowMs + this.rng.uniformRange(3, 15) * 60 * 1000;
    s.lastNewsHeadline = this.rng.pick(NEWS_HEADLINES);
  }

  private applySpread(s: SymbolState) {
    const meta = this.tickerMeta.get(s.symbol)!;
    const liquidityBase = meta.htb ? 45 : meta.startPrice < 10 ? 30 : 6; // bps
    const spreadBps = liquidityBase * Math.sqrt(s.volMultiplier);
    const halfSpread = (s.last * spreadBps) / 10000 / 2;
    s.bid = Math.max(0.01, roundTick(s.last - halfSpread));
    s.ask = roundTick(s.last + halfSpread);
    if (s.ask <= s.bid) s.ask = roundTick(s.bid + 0.01);
  }

  private updateBar(s: SymbolState, nowMs: number) {
    const minuteBucket = Math.floor(nowMs / 60000) * 60000;
    if (!s.currentBar || s.currentBar.t !== minuteBucket) {
      if (s.currentBar) {
        s.bars.push(s.currentBar);
        if (s.bars.length > MAX_BARS_KEPT) s.bars.shift();
      }
      s.currentBar = { t: minuteBucket, o: s.last, h: s.last, l: s.last, c: s.last, v: 0 };
    }
    const bar = s.currentBar;
    bar.h = Math.max(bar.h, s.last);
    bar.l = Math.min(bar.l, s.last);
    bar.c = s.last;
    bar.v += Math.round(this.rng.uniformRange(20, 400));
  }
}

export function roundTick(price: number): number {
  return Math.round(price * 100) / 100;
}

/** Order-size-scaled slippage in price terms, widening with size and current volatility regime. */
export function estimateSlippage(
  quote: Quote,
  meta: TickerMeta,
  qty: number,
  volMultiplier: number,
): number {
  const spread = quote.ask - quote.bid;
  const notionalShares = qty;
  const sizeFactor = Math.min(3, notionalShares / (meta.startPrice < 10 ? 500 : 2000));
  const volFactor = Math.sqrt(volMultiplier);
  return spread * 0.5 * (1 + sizeFactor) * volFactor;
}
