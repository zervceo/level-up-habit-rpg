import type { TickerMeta } from '../types/domain';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// Synthetic watchlist — no real tickers, no real market data.
export const TICKERS: TickerMeta[] = [
  {
    symbol: 'BLUX',
    name: 'Bluechip Unified Xystems',
    marginable: true,
    htb: false,
    borrowRateAnnualPct: 0.3,
    dividendYieldAnnualPct: 1.8,
    nextExDate: daysFromNow(3),
    nextDividendPerShare: 0.45,
    baseVolatilityAnnualPct: 22,
    startPrice: 148.5,
  },
  {
    symbol: 'MOMO',
    name: 'Momentix Corp',
    marginable: true,
    htb: false,
    borrowRateAnnualPct: 1.5,
    dividendYieldAnnualPct: 0,
    baseVolatilityAnnualPct: 55,
    startPrice: 34.2,
  },
  {
    symbol: 'SQZY',
    name: 'Squeezy Holdings',
    marginable: true,
    htb: true,
    borrowRateAnnualPct: 42,
    dividendYieldAnnualPct: 0,
    baseVolatilityAnnualPct: 95,
    startPrice: 12.75,
  },
  {
    symbol: 'DIVD',
    name: 'Divendale Utilities',
    marginable: true,
    htb: false,
    borrowRateAnnualPct: 0.25,
    dividendYieldAnnualPct: 4.6,
    nextExDate: daysFromNow(1),
    nextDividendPerShare: 0.7,
    baseVolatilityAnnualPct: 15,
    startPrice: 61.1,
  },
  {
    symbol: 'PENY',
    name: 'Penfield Micro-Cap',
    marginable: false,
    htb: true,
    borrowRateAnnualPct: 65,
    dividendYieldAnnualPct: 0,
    baseVolatilityAnnualPct: 130,
    startPrice: 3.4,
  },
  {
    symbol: 'STBL',
    name: 'Stabilus Industrials',
    marginable: true,
    htb: false,
    borrowRateAnnualPct: 0.4,
    dividendYieldAnnualPct: 2.4,
    baseVolatilityAnnualPct: 18,
    startPrice: 87.0,
  },
];

// Pseudo-ticker used when a CSV of real OHLCV bars is imported for replay.
export const REPLAY_TICKER: TickerMeta = {
  symbol: 'REPLAY',
  name: 'CSV Replay',
  marginable: true,
  htb: false,
  borrowRateAnnualPct: 2,
  dividendYieldAnnualPct: 0,
  baseVolatilityAnnualPct: 30,
  startPrice: 100,
};

export function getTicker(symbol: string): TickerMeta {
  if (symbol === REPLAY_TICKER.symbol) return REPLAY_TICKER;
  const t = TICKERS.find((x) => x.symbol === symbol);
  if (!t) throw new Error(`Unknown ticker ${symbol}`);
  return t;
}
