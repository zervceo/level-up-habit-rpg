import type { AccountState, UnsettledCashEntry } from '../types/domain';
import { addTradingDays, dateKey } from './clock';
import { round2 } from './fees';

/** Cash minus proceeds that have not yet settled (T+1). */
export function settledCash(account: AccountState): number {
  const unsettled = account.unsettledEntries
    .filter((e) => !e.settled)
    .reduce((sum, e) => sum + e.amount, 0);
  return round2(account.cash - unsettled);
}

export function recordSaleProceeds(
  account: AccountState,
  amount: number,
  tradeDate: Date,
): UnsettledCashEntry {
  const settlesOn = dateKey(addTradingDays(tradeDate, 1)); // T+1
  const entry: UnsettledCashEntry = {
    id: crypto.randomUUID(),
    amount: round2(amount),
    source: 'SALE_PROCEEDS',
    tradeDate: dateKey(tradeDate),
    settlesOn,
    settled: false,
  };
  account.unsettledEntries.push(entry);
  return entry;
}

/** Marks entries settled once the sim date reaches their settlement date. Call once per sim-day rollover. */
export function settleDueEntries(account: AccountState, currentDayKey: string) {
  for (const e of account.unsettledEntries) {
    if (!e.settled && e.settlesOn <= currentDayKey) {
      e.settled = true;
    }
  }
  // prune old settled entries to keep the ledger small
  account.unsettledEntries = account.unsettledEntries.filter(
    (e) => !e.settled || e.settlesOn >= currentDayKey,
  );
}
