import type {
  AccountState,
  Fill,
  GoodFaithViolation,
  Order,
  Position,
  TickerMeta,
} from '../types/domain';
import { round2 } from './fees';
import { recordSaleProceeds, settledCash } from './settlement';

export const REG_T_INITIAL_MARGIN_PCT = 0.5; // 2:1 leverage on marginable stock
export const MAINTENANCE_MARGIN_LONG_PCT = 0.25;
export const MAINTENANCE_MARGIN_SHORT_PCT = 0.3;
export const MARGIN_CALL_CURE_TRADING_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export type PositionBook = Map<string, Position>;

export function marketValue(positions: PositionBook, priceOf: (symbol: string) => number) {
  let longMV = 0;
  let shortMV = 0;
  for (const p of positions.values()) {
    const mv = p.qty * priceOf(p.symbol);
    if (p.side === 'LONG') longMV += mv;
    else shortMV += mv;
  }
  return { longMV: round2(longMV), shortMV: round2(shortMV) };
}

export function computeEquity(cash: number, positions: PositionBook, priceOf: (s: string) => number) {
  const { longMV, shortMV } = marketValue(positions, priceOf);
  return round2(cash + longMV - shortMV);
}

export function computeMaintenanceRequirement(positions: PositionBook, priceOf: (s: string) => number) {
  const { longMV, shortMV } = marketValue(positions, priceOf);
  return round2(longMV * MAINTENANCE_MARGIN_LONG_PCT + shortMV * MAINTENANCE_MARGIN_SHORT_PCT);
}

export interface BuyingPower {
  long: number;
  short: number;
  excessEquity: number;
  maintenanceRequirement: number;
  equity: number;
}

/**
 * Long and short buying power are reported separately (as requested), but in
 * a real Reg T account they draw on the same pool of excess equity — see
 * RULES.md. Non-marginable names get no leverage; see requiredCapital().
 */
export function computeBuyingPower(
  account: AccountState,
  positions: PositionBook,
  priceOf: (s: string) => number,
): BuyingPower {
  const equity = computeEquity(account.cash, positions, priceOf);
  const maintenanceRequirement = computeMaintenanceRequirement(positions, priceOf);
  const excessEquity = round2(equity - maintenanceRequirement);
  const leverage = 1 / REG_T_INITIAL_MARGIN_PCT; // 2x
  const bp = round2(Math.max(0, excessEquity) * leverage);
  return { long: bp, short: bp, excessEquity, maintenanceRequirement, equity };
}

/** Dollar amount of settled/margin capital an order will consume, for a pre-trade buying-power check. */
export function requiredCapital(qty: number, price: number, meta: TickerMeta): number {
  if (!meta.marginable) return round2(qty * price); // 100% — no Reg T leverage
  return round2(qty * price * REG_T_INITIAL_MARGIN_PCT);
}

export function checkAndUpdateMarginCall(
  account: AccountState,
  positions: PositionBook,
  priceOf: (s: string) => number,
  nowMs: number,
) {
  const equity = computeEquity(account.cash, positions, priceOf);
  const maintReq = computeMaintenanceRequirement(positions, priceOf);
  const deficiency = round2(maintReq - equity);
  account.equity = equity;

  if (deficiency > 0) {
    if (!account.marginCall.active) {
      account.marginCall = {
        active: true,
        reason: 'MAINTENANCE_DEFICIENCY',
        amountRequired: deficiency,
        issuedAt: nowMs,
        deadline: nowMs + MARGIN_CALL_CURE_TRADING_DAYS_MS,
      };
    } else {
      account.marginCall.amountRequired = deficiency;
    }
  } else if (account.marginCall.active) {
    account.marginCall = { active: false, reason: null, amountRequired: 0, issuedAt: null, deadline: null };
  }
}

export function isForcedLiquidationDue(account: AccountState, nowMs: number): boolean {
  return account.marginCall.active && account.marginCall.deadline !== null && nowMs >= account.marginCall.deadline;
}

/** Detects a same-day round trip (day trade) for PDT purposes. */
export function isDayTrade(orders: Order[], symbol: string, closingAction: 'SELL' | 'BUY_TO_COVER', dayKey: string): boolean {
  const openingAction = closingAction === 'SELL' ? 'BUY' : 'SELL_SHORT';
  return orders.some(
    (o) => o.symbol === symbol && o.action === openingAction && o.sessionDay === dayKey && o.filledQty > 0,
  );
}

export interface ApplyFillResult {
  gfv?: GoodFaithViolation;
  dayTrade: boolean;
  dividendNote?: string;
}

/**
 * Applies a single execution to cash, positions, fees and settlement
 * bookkeeping. Pure-ish mutation of the passed account/positions for
 * simplicity — callers own persistence.
 */
export function applyFill(
  account: AccountState,
  positions: PositionBook,
  order: Order,
  fill: Fill,
  meta: TickerMeta,
  simDate: Date,
  priorOrders: Order[],
): ApplyFillResult {
  const dayKey = order.sessionDay;
  const symbol = order.symbol;
  const existing = positions.get(symbol);
  let result: ApplyFillResult = { dayTrade: false };

  switch (order.action) {
    case 'BUY': {
      const cost = round2(fill.qty * fill.price);
      const settled = settledCash(account);
      const shortfall = Math.max(0, cost - settled);
      account.cash = round2(account.cash - cost);
      const pos = existing ?? { symbol, side: 'LONG', qty: 0, avgPrice: 0, openedAt: fill.timestamp };
      const newQty = pos.qty + fill.qty;
      pos.avgPrice = round2((pos.avgPrice * pos.qty + fill.price * fill.qty) / newQty);
      pos.qty = newQty;
      if (shortfall > 0.005) {
        pos.unsettledFundingCoverDate = latestCoverDate(account, dayKey);
        pos.unsettledFundingFullyUnsettled = shortfall >= cost - 0.005;
      }
      positions.set(symbol, pos);
      break;
    }
    case 'SELL': {
      if (!existing || existing.side !== 'LONG') break;
      const proceeds = round2(fill.qty * fill.price - fill.secFee - fill.tafFee);
      account.cash = round2(account.cash + proceeds);
      account.realizedPnL = round2(account.realizedPnL + (fill.price - existing.avgPrice) * fill.qty - fill.secFee - fill.tafFee);
      account.totalFeesPaid = round2(account.totalFeesPaid + fill.secFee + fill.tafFee);
      recordSaleProceeds(account, round2(fill.qty * fill.price), simDate);

      if (existing.unsettledFundingCoverDate && existing.unsettledFundingCoverDate > dayKey) {
        const gfv: GoodFaithViolation = {
          id: crypto.randomUUID(),
          date: dayKey,
          symbol,
          severity: existing.unsettledFundingFullyUnsettled ? 'FREE_RIDE' : 'GFV',
          description: existing.unsettledFundingFullyUnsettled
            ? `Sold ${symbol} that was purchased entirely with unsettled funds, before those funds settled (free-riding).`
            : `Sold ${symbol} before the unsettled funds used to buy part of the position had settled (good-faith violation).`,
        };
        account.gfvs.push(gfv);
        result.gfv = gfv;
      }

      existing.qty -= fill.qty;
      if (existing.qty <= 0) positions.delete(symbol);
      else positions.set(symbol, existing);

      if (isDayTrade(priorOrders, symbol, 'SELL', dayKey)) result.dayTrade = true;
      break;
    }
    case 'SELL_SHORT': {
      const proceeds = round2(fill.qty * fill.price - fill.secFee - fill.tafFee);
      account.cash = round2(account.cash + proceeds);
      account.totalFeesPaid = round2(account.totalFeesPaid + fill.secFee + fill.tafFee);
      const pos = existing ?? {
        symbol,
        side: 'SHORT',
        qty: 0,
        avgPrice: 0,
        openedAt: fill.timestamp,
        borrowRateAnnualPct: meta.borrowRateAnnualPct,
      };
      const newQty = pos.qty + fill.qty;
      pos.avgPrice = round2((pos.avgPrice * pos.qty + fill.price * fill.qty) / newQty);
      pos.qty = newQty;
      positions.set(symbol, pos);
      break;
    }
    case 'BUY_TO_COVER': {
      if (!existing || existing.side !== 'SHORT') break;
      const cost = round2(fill.qty * fill.price);
      account.cash = round2(account.cash - cost);
      account.realizedPnL = round2(account.realizedPnL + (existing.avgPrice - fill.price) * fill.qty);
      existing.qty -= fill.qty;
      if (existing.qty <= 0) {
        positions.delete(symbol);
      } else {
        positions.set(symbol, existing);
      }
      if (isDayTrade(priorOrders, symbol, 'BUY_TO_COVER', dayKey)) result.dayTrade = true;
      break;
    }
  }
  return result;
}

function latestCoverDate(account: AccountState, fallback: string): string {
  const dates = account.unsettledEntries.filter((e) => !e.settled).map((e) => e.settlesOn);
  if (dates.length === 0) return fallback;
  return dates.sort().at(-1)!;
}
