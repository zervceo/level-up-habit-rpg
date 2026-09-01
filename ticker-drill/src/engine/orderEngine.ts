import type { AccountState, Fill, Order, Quote, TickerMeta } from '../types/domain';
import type { PositionBook } from './accountEngine';
import { applyFill, computeBuyingPower, requiredCapital } from './accountEngine';
import { computeSaleFees } from './fees';
import { requestLocate } from './shortEngine';
import { estimateSlippage, roundTick } from './syntheticMarket';
import { Rng } from './prng';
import { checkPdtBeforeDayTrade, recordDayTrade } from './pdt';

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

/** Pre-trade checks run once, before an order is accepted into the book. */
export function validateNewOrder(
  account: AccountState,
  positions: PositionBook,
  order: Pick<Order, 'symbol' | 'action' | 'qty' | 'limitPrice' | 'type'>,
  meta: TickerMeta,
  quote: Quote,
  priceOf: (s: string) => number,
  simDate: Date,
  priorOrders: Order[],
  rng: Rng,
): ValidationResult {
  const refPrice = order.limitPrice ?? quote.last;

  if (order.action === 'BUY' || order.action === 'SELL_SHORT') {
    const bp = computeBuyingPower(account, positions, priceOf);
    const capitalNeeded = requiredCapital(order.qty, refPrice, meta);
    const available = order.action === 'BUY' ? bp.long : bp.short;
    if (capitalNeeded > available + 0.01) {
      return {
        ok: false,
        reason: `Insufficient buying power: this order needs ~$${capitalNeeded.toLocaleString()} of ${meta.marginable ? 'margin' : 'cash (non-marginable)'} but only $${available.toLocaleString()} is available.`,
      };
    }
  }

  if (order.action === 'SELL_SHORT') {
    const locate = requestLocate(meta, rng);
    if (!locate.granted) {
      return { ok: false, reason: `Short sale rejected: ${locate.reason}. No locate obtained.` };
    }
  }

  if (order.action === 'SELL') {
    const pos = positions.get(order.symbol);
    if (!pos || pos.side !== 'LONG' || pos.qty < order.qty) {
      return { ok: false, reason: `Cannot SELL ${order.qty} ${order.symbol}: no sufficient long position. Did you mean SELL SHORT?` };
    }
  }
  if (order.action === 'BUY_TO_COVER') {
    const pos = positions.get(order.symbol);
    if (!pos || pos.side !== 'SHORT' || pos.qty < order.qty) {
      return { ok: false, reason: `Cannot BUY TO COVER ${order.qty} ${order.symbol}: no sufficient short position.` };
    }
  }

  if (order.action === 'SELL' || order.action === 'BUY_TO_COVER') {
    const closingAction = order.action;
    const dayKey = simDate.toISOString().slice(0, 10);
    const openingAction = closingAction === 'SELL' ? 'BUY' : 'SELL_SHORT';
    const wouldBeDayTrade = priorOrders.some(
      (o) => o.symbol === order.symbol && o.action === openingAction && o.sessionDay === dayKey && o.filledQty > 0,
    );
    if (wouldBeDayTrade) {
      const equity = computeBuyingPower(account, positions, priceOf).equity;
      const pdt = checkPdtBeforeDayTrade(account, equity, simDate);
      if (pdt.blocked) return { ok: false, reason: pdt.message };
    }
  }

  return { ok: true };
}

function isBuySide(action: Order['action']): boolean {
  return action === 'BUY' || action === 'BUY_TO_COVER';
}

export interface TickContext {
  quotesBySymbol: Map<string, Quote>;
  metaBySymbol: Map<string, TickerMeta>;
  volMultiplierBySymbol: Map<string, number>;
  nowMs: number;
  simDate: Date;
  rng: Rng;
  account: AccountState;
  positions: PositionBook;
  priorOrders: Order[];
}

export interface FillEvent {
  order: Order;
  fill: Fill;
  dayTrade: boolean;
  gfvId?: string;
}

/** Processes all working orders against the current tick's quotes. Mutates orders/account/positions in place. */
export function processWorkingOrders(orders: Order[], ctx: TickContext): FillEvent[] {
  const events: FillEvent[] = [];
  for (const order of orders) {
    if (order.status !== 'WORKING' && order.status !== 'PARTIALLY_FILLED') continue;
    const quote = ctx.quotesBySymbol.get(order.symbol);
    const meta = ctx.metaBySymbol.get(order.symbol);
    if (!quote || !meta) continue;

    if (order.tif === 'DAY' && order.sessionDay !== dayKeyOf(ctx.simDate) ) {
      order.status = 'EXPIRED';
      continue;
    }
    if (quote.halted) continue;

    const sessionOk =
      quote.session === 'REGULAR' || (order.extendedHours && (quote.session === 'PREMARKET' || quote.session === 'AFTERHOURS'));
    if (!sessionOk) continue;

    tryFillOrder(order, quote, meta, ctx, events);
  }
  return events;
}

function dayKeyOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function tryFillOrder(order: Order, quote: Quote, meta: TickerMeta, ctx: TickContext, events: FillEvent[]) {
  // Stop / stop-limit trigger check (converts to market or limit once touched — may gap through).
  if ((order.type === 'STOP' || order.type === 'STOP_LIMIT') && order.stopPrice !== undefined) {
    const triggered = isBuySide(order.action) ? quote.last >= order.stopPrice : quote.last <= order.stopPrice;
    if (!triggered) return;
    if (order.type === 'STOP') {
      fillAtMarket(order, quote, meta, ctx, events, order.qty - order.filledQty);
      return;
    }
    // stop-limit: once triggered it behaves like a resting limit order from here on.
    order.type = 'LIMIT';
  }

  // Trailing stop: update watermark, check trigger.
  if (order.type === 'TRAILING_STOP' && order.trailAmount !== undefined) {
    const px = quote.last;
    const trailsHigh = order.action === 'SELL' || order.action === 'SELL_SHORT';
    if (order.trailHighWaterMark === undefined) order.trailHighWaterMark = px;
    if (trailsHigh) {
      order.trailHighWaterMark = Math.max(order.trailHighWaterMark, px);
      if (px <= order.trailHighWaterMark - order.trailAmount) {
        fillAtMarket(order, quote, meta, ctx, events, order.qty - order.filledQty);
      }
    } else {
      order.trailHighWaterMark = Math.min(order.trailHighWaterMark, px);
      if (px >= order.trailHighWaterMark + order.trailAmount) {
        fillAtMarket(order, quote, meta, ctx, events, order.qty - order.filledQty);
      }
    }
    return;
  }

  if (order.type === 'MARKET') {
    fillAtMarket(order, quote, meta, ctx, events, order.qty - order.filledQty);
    return;
  }

  if (order.type === 'LIMIT' && order.limitPrice !== undefined) {
    const crossed = isBuySide(order.action) ? quote.ask <= order.limitPrice : quote.bid >= order.limitPrice;
    if (!crossed) {
      if (order.tif === 'IOC' || order.tif === 'FOK') {
        order.status = order.filledQty > 0 ? 'PARTIALLY_FILLED' : 'CANCELED';
      }
      return;
    }
    const price = isBuySide(order.action) ? Math.min(order.limitPrice, quote.ask) : Math.max(order.limitPrice, quote.bid);
    executeAtPrice(order, price, meta, ctx, events, order.qty - order.filledQty);
  }
}

function fillAtMarket(order: Order, quote: Quote, meta: TickerMeta, ctx: TickContext, events: FillEvent[], qty: number) {
  const slippage = estimateSlippage(quote, meta, qty, ctx.volMultiplierBySymbol.get(order.symbol) ?? 1);
  const price = isBuySide(order.action) ? roundTick(quote.ask + slippage) : roundTick(quote.bid - slippage);
  executeAtPrice(order, price, meta, ctx, events, qty);
}

function executeAtPrice(order: Order, price: number, meta: TickerMeta, ctx: TickContext, events: FillEvent[], requestedQty: number) {
  const remaining = order.qty - order.filledQty;
  const qtyToFill = Math.min(requestedQty, remaining);
  if (qtyToFill <= 0) return;

  const fillableQty = simulateFillableQty(qtyToFill, meta, ctx.volMultiplierBySymbol.get(order.symbol) ?? 1, ctx.rng);

  if (order.tif === 'FOK' && fillableQty < order.qty) {
    order.status = 'CANCELED';
    order.rejectReason = 'Fill-or-Kill: could not fill the full quantity immediately.';
    return;
  }
  if (fillableQty <= 0) return;

  const isSale = order.action === 'SELL' || order.action === 'SELL_SHORT';
  const fees = isSale ? computeSaleFees(fillableQty, price) : { secFee: 0, tafFee: 0, total: 0 };
  const fill: Fill = {
    id: crypto.randomUUID(),
    qty: fillableQty,
    price,
    timestamp: ctx.nowMs,
    secFee: fees.secFee,
    tafFee: fees.tafFee,
  };
  order.fills.push(fill);
  order.filledQty += fillableQty;
  order.updatedAt = ctx.nowMs;

  const applyResult = applyFill(ctx.account, ctx.positions, order, fill, meta, ctx.simDate, ctx.priorOrders);
  if (applyResult.dayTrade) {
    recordDayTrade(ctx.account, dayKeyOf(ctx.simDate), order.symbol, order.id);
  }

  const fullyFilled = order.filledQty >= order.qty;
  if (fullyFilled) {
    order.status = 'FILLED';
  } else if (order.tif === 'IOC') {
    order.status = 'CANCELED';
  } else {
    order.status = 'PARTIALLY_FILLED';
  }

  events.push({ order, fill, dayTrade: applyResult.dayTrade, gfvId: applyResult.gfv?.id });
}

/**
 * Large orders relative to a symbol's typical clip size may only partially
 * fill on a given tick, modeling thin synthetic liquidity.
 */
function simulateFillableQty(qty: number, meta: TickerMeta, volMultiplier: number, rng: Rng): number {
  const typicalClip = meta.startPrice < 10 ? 500 : 2000;
  const sizeFactor = Math.min(3, qty / typicalClip);
  const partialChance = Math.min(0.6, 0.1 * sizeFactor * volMultiplier);
  if (!rng.chance(partialChance)) return qty;
  const frac = rng.uniformRange(0.3, 0.85);
  return Math.max(1, Math.round(qty * frac));
}

export function cancelOrder(order: Order) {
  if (order.status === 'WORKING' || order.status === 'PARTIALLY_FILLED') {
    order.status = 'CANCELED';
  }
}

export function newOrderId(): string {
  return crypto.randomUUID();
}
