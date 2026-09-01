import type { AccountState, Position, TickerMeta } from '../types/domain';
import { Rng } from './prng';
import { round2 } from './fees';

export interface LocateResult {
  granted: boolean;
  rateAnnualPct: number;
  reason?: string;
}

/**
 * Simulates requesting a locate/borrow before a short sale. Easy-to-borrow
 * names always locate; hard-to-borrow names can fail (scarce shares) and
 * always carry an elevated, somewhat randomized borrow rate.
 */
export function requestLocate(meta: TickerMeta, rng: Rng): LocateResult {
  if (!meta.htb) {
    return { granted: true, rateAnnualPct: meta.borrowRateAnnualPct };
  }
  const granted = rng.chance(0.7);
  if (!granted) {
    return { granted: false, rateAnnualPct: meta.borrowRateAnnualPct, reason: 'No shares available to borrow (hard-to-borrow)' };
  }
  const rate = meta.borrowRateAnnualPct * rng.uniformRange(0.8, 1.6);
  return { granted: true, rateAnnualPct: round2(rate) };
}

/** Daily stock borrow fee accrual, charged against cash on each short position held overnight. */
export function accrueDailyBorrowFee(position: Position, markPrice: number): number {
  if (position.side !== 'SHORT' || !position.borrowRateAnnualPct) return 0;
  // Standard borrow-fee day-count convention: annual rate / 360.
  const fee = round2((position.qty * markPrice * (position.borrowRateAnnualPct / 100)) / 360);
  return fee;
}

/**
 * Random chance the lender recalls a hard-to-borrow loan, forcing a buy-in
 * within a short deadline if the trader doesn't voluntarily cover first.
 */
export function maybeTriggerBuyInRecall(
  position: Position,
  meta: TickerMeta,
  nowMs: number,
  rng: Rng,
): boolean {
  if (position.side !== 'SHORT' || !meta.htb || position.buyInDeadlineMs) return false;
  if (!rng.chance(0.01)) return false; // small per-check probability
  position.buyInDeadlineMs = nowMs + 60 * 60 * 1000; // 1 sim-hour to cover
  position.buyInReason = 'Stock loan recalled by lender — hard-to-borrow shares must be covered';
  return true;
}

export interface DividendLiability {
  symbol: string;
  perShare: number;
  qty: number;
  total: number;
}

/**
 * When a shorted stock goes ex-dividend, the short seller owes the dividend
 * to whoever they borrowed the shares from. Only fires on the actual ex-date.
 */
export function computeShortDividendLiability(position: Position, meta: TickerMeta, todayKey: string): DividendLiability | null {
  if (position.side !== 'SHORT' || !meta.nextDividendPerShare || meta.nextExDate !== todayKey) return null;
  const total = round2(position.qty * meta.nextDividendPerShare);
  return { symbol: position.symbol, perShare: meta.nextDividendPerShare, qty: position.qty, total };
}

export function applyDividendLiability(account: AccountState, liability: DividendLiability) {
  account.cash = round2(account.cash - liability.total);
  account.totalDividendsOwed = round2(account.totalDividendsOwed + liability.total);
}
