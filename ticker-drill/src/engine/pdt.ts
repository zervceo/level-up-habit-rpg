import type { AccountState, DayTradeRecord } from '../types/domain';
import { addTradingDays, dateKey } from './clock';

export const PDT_EQUITY_THRESHOLD = 25000;
export const PDT_ROLLING_WINDOW_DAYS = 5;

/** Trading days in the rolling window ending on (and including) asOfDayKey. */
export function rollingWindowDayKeys(asOfDate: Date): Set<string> {
  const keys = new Set<string>();
  keys.add(dateKey(asOfDate));
  let d = asOfDate;
  for (let i = 1; i < PDT_ROLLING_WINDOW_DAYS; i++) {
    d = addTradingDays(d, -1);
    keys.add(dateKey(d));
  }
  return keys;
}

export function rollingDayTradeCount(account: AccountState, asOfDate: Date): number {
  const window = rollingWindowDayKeys(asOfDate);
  return account.dayTrades.filter((dt) => window.has(dt.date)).length;
}

export interface PdtCheckResult {
  blocked: boolean;
  message?: string;
}

/**
 * Checks whether executing one more day trade right now would violate the
 * PDT rule for a sub-$25k account (blocks the 4th day trade in 5 rolling
 * business days). Mirrors the wording most brokers show at the order ticket.
 */
export function checkPdtBeforeDayTrade(account: AccountState, equity: number, asOfDate: Date): PdtCheckResult {
  if (equity >= PDT_EQUITY_THRESHOLD) return { blocked: false };
  const existing = rollingDayTradeCount(account, asOfDate);
  if (existing >= 3) {
    return {
      blocked: true,
      message:
        'This order cannot be accepted. Placing this trade would result in a Pattern Day Trader ' +
        'designation, and your account does not have the minimum $25,000 in equity required to ' +
        'day trade. Your account will be restricted to closing transactions only until the ' +
        'equity requirement is met or 90 days have passed. (FINRA Rule 4210)',
    };
  }
  return { blocked: false };
}

export function recordDayTrade(account: AccountState, date: string, symbol: string, orderId: string) {
  const rec: DayTradeRecord = { date, symbol, orderId };
  account.dayTrades.push(rec);
  const count = rollingDayTradeCount(account, new Date(date));
  if (count >= 4) account.isPDT = true;
}
