import { create } from 'zustand';
import type {
  AccountState,
  AppMode,
  Bar,
  GoodFaithViolation,
  Order,
  OrderAction,
  OrderType,
  Position,
  Quote,
  QuizCardState,
  QuizQuestion,
  ScenarioDef,
  SpeedDrillPrompt,
  SpeedDrillResult,
  TIF,
} from '../types/domain';
import { SyntheticMarket } from '../engine/syntheticMarket';
import { SimClock, dateKey } from '../engine/clock';
import { Rng } from '../engine/prng';
import { TICKERS, getTicker, REPLAY_TICKER } from '../engine/tickers';
import {
  checkAndUpdateMarginCall,
  computeBuyingPower,
  computeEquity,
  isForcedLiquidationDue,
  type PositionBook,
} from '../engine/accountEngine';
import { settleDueEntries } from '../engine/settlement';
import { accrueDailyBorrowFee, computeShortDividendLiability, applyDividendLiability, maybeTriggerBuyInRecall } from '../engine/shortEngine';
import { processWorkingOrders, validateNewOrder, cancelOrder as cancelOrderEngine, newOrderId, type FillEvent } from '../engine/orderEngine';
import { round2 } from '../engine/fees';
import { getScenario } from '../engine/scenarios';
import { CsvReplayController, parseOhlcvCsv } from '../data/csvReplay';
import { freshCard, sm2Update, dueCards } from '../quiz/sm2';
import { getQuestion, randomQuestionForTopic } from '../quiz/bank';
import type { QuizTopic } from '../types/domain';

const QUIZ_TOPICS: QuizTopic[] = [
  'MARGIN_REG_T',
  'SHORT_SELLING',
  'SETTLEMENT',
  'ORDER_TYPES',
  'ACCOUNT_TYPES',
  'PDT',
  'CORPORATE_ACTIONS',
  'TAX_TREATMENT',
];
import {
  loadAppStateBlob,
  saveAppStateBlob,
  loadQuizCards,
  upsertQuizCard,
  recordQuizAttempt,
  recordSpeedDrillResult,
  loadSpeedDrillHistory,
  medianOf,
} from '../db/sqlite';

const STARTING_CASH = 30000;
const WATCHLIST = TICKERS.map((t) => t.symbol);
const ALL_TICKERS = [...TICKERS, REPLAY_TICKER];

export interface Toast {
  id: string;
  text: string;
  kind: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  at: number;
}

export interface TicketState {
  symbol: string;
  action: OrderAction | null;
  sizeInput: string;
  orderType: OrderType;
  tif: TIF;
  focusedField: 'SIZE' | 'LIMIT' | 'STOP' | 'TRAIL';
  limitInput: string;
  stopInput: string;
  trailInput: string;
  extendedHours: boolean;
  error: string | null;
}

export interface QuizInterruptState {
  question: QuizQuestion;
  context: string;
  answeredIndex: number | null;
}

export interface SpeedDrillState {
  prompt: SpeedDrillPrompt | null;
  promptStartMs: number | null;
  results: SpeedDrillResult[];
  medianMs: number | null;
  lastResult: SpeedDrillResult | null;
}

export interface ScenarioRunState {
  def: ScenarioDef;
  startWallMs: number;
  firedSteps: Set<number>;
  dayKey: string;
  complete: boolean;
}

export interface CsvReplayState {
  symbol: string;
  bars: Bar[];
  controller: CsvReplayController;
  speed: number;
  playing: boolean;
}

function initialTicket(): TicketState {
  return {
    symbol: WATCHLIST[0],
    action: null,
    sizeInput: '',
    orderType: 'MARKET',
    tif: 'DAY',
    focusedField: 'SIZE',
    limitInput: '',
    stopInput: '',
    trailInput: '',
    extendedHours: false,
    error: null,
  };
}

function freshAccount(): AccountState {
  return {
    cash: STARTING_CASH,
    unsettledEntries: [],
    equity: STARTING_CASH,
    dayTrades: [],
    isPDT: false,
    gfvs: [],
    marginCall: { active: false, reason: null, amountRequired: 0, issuedAt: null, deadline: null },
    realizedPnL: 0,
    totalFeesPaid: 0,
    totalBorrowFeesPaid: 0,
    totalDividendsOwed: 0,
  };
}

// Non-reactive engine singletons (mutated in place; the store snapshots them into reactive state).
let market: SyntheticMarket = new SyntheticMarket(ALL_TICKERS, 1234);
let clock: SimClock = new SimClock(startOfSimDay().getTime(), 30);
let rng = new Rng(9876);
const positions: PositionBook = new Map<string, Position>();
let orders: Order[] = [];
let lastDayKeySeen = clock.now().dayKey;

function startOfSimDay(): Date {
  const d = new Date();
  d.setHours(7, 0, 0, 0); // start pre-market
  return d;
}

function priceOf(symbol: string): number {
  return market.getQuote(symbol).last;
}

interface StoreState {
  ready: boolean;
  mode: AppMode | null;
  account: AccountState;
  positions: Map<string, Position>;
  orders: Order[];
  quotes: Record<string, Quote>;
  selectedBars: Bar[];
  watchlist: string[];
  selectedSymbol: string;
  simTimeLabel: string;
  simNowMs: number;
  simSession: string;
  simSpeed: number;
  simRunning: boolean;
  ticket: TicketState;
  toasts: Toast[];
  quizInterrupt: QuizInterruptState | null;
  quizCards: Record<string, QuizCardState>;
  speedDrill: SpeedDrillState;
  scenario: ScenarioRunState | null;
  csvReplay: CsvReplayState | null;

  init: () => Promise<void>;
  setMode: (mode: AppMode) => void;
  startFreeTrade: () => void;
  startScenario: (id: string) => void;
  startSpeedDrill: () => void;
  endSession: () => void;
  tick: (realDeltaMs: number) => void;

  selectSymbolIndex: (delta: number) => void;
  armAction: (action: OrderAction) => void;
  appendDigit: (d: string) => void;
  backspaceDigit: () => void;
  cycleFocus: () => void;
  setOrderType: (t: OrderType) => void;
  setTif: (t: TIF) => void;
  toggleExtendedHours: () => void;
  submitOrder: () => void;
  resetTicket: () => void;
  cancelWorkingOrder: (id: string) => void;

  answerQuiz: (choiceIndex: number) => void;
  closeQuizInterrupt: () => void;
  triggerContextualQuiz: (questionId: string, context: string) => void;
  studyDue: () => void;

  loadCsvFile: (text: string, symbol: string) => void;
  csvStep: () => void;
  setCsvSpeed: (s: number) => void;
  toggleCsvPlay: () => void;

  pushToast: (text: string, kind?: Toast['kind']) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  ready: false,
  mode: null,
  account: freshAccount(),
  positions: new Map(),
  orders: [],
  quotes: {},
  selectedBars: [],
  watchlist: WATCHLIST,
  selectedSymbol: WATCHLIST[0],
  simTimeLabel: '',
  simNowMs: 0,
  simSession: 'CLOSED',
  simSpeed: 30,
  simRunning: false,
  ticket: initialTicket(),
  toasts: [],
  quizInterrupt: null,
  quizCards: {},
  speedDrill: { prompt: null, promptStartMs: null, results: [], medianMs: null, lastResult: null },
  scenario: null,
  csvReplay: null,

  init: async () => {
    const cards = await loadQuizCards();
    const cardMap: Record<string, QuizCardState> = {};
    for (const c of cards) cardMap[c.questionId] = c;
    const history = await loadSpeedDrillHistory();
    const median = medianOf(history.filter((h) => h.correct).map((h) => h.timeToSubmitMs));

    const blob = await loadAppStateBlob();
    if (blob) {
      try {
        const parsed = JSON.parse(blob);
        if (parsed.account) Object.assign(get().account, parsed.account);
        if (parsed.positions) {
          positions.clear();
          for (const p of parsed.positions as Position[]) positions.set(p.symbol, p);
        }
        if (parsed.orders) orders = parsed.orders as Order[];
      } catch {
        // ignore corrupt blob, start fresh
      }
    }

    set({
      ready: true,
      quizCards: cardMap,
      speedDrill: { prompt: null, promptStartMs: null, results: [], medianMs: median, lastResult: null },
      positions: new Map(positions),
      orders: [...orders],
      quotes: snapshotQuotes(),
    });
  },

  setMode: (mode) => set({ mode }),

  startFreeTrade: () => {
    resetEngines();
    clock.start();
    set({
      mode: 'FREE_TRADE',
      simRunning: true,
      scenario: null,
      account: get().account,
      positions: new Map(positions),
      orders: [],
      quotes: snapshotQuotes(),
    });
  },

  startScenario: (id) => {
    resetEngines();
    const def = getScenario(id);
    const account = freshAccount();
    // def.startingCash is the account's intended starting EQUITY. Any seeded
    // positions were "already established" before the session began, so we
    // back into the cash balance a real margin ledger would show: cash paid
    // out for longs, cash received for short-sale proceeds.
    let seededCash = def.startingCash;
    for (const p of def.startingPositions ?? []) {
      seededCash += p.side === 'LONG' ? -p.qty * p.avgPrice : p.qty * p.avgPrice;
    }
    account.cash = round2(seededCash);
    if (def.seed?.unsettledCash) {
      const dayKey = clock.now().dayKey;
      account.unsettledEntries.push({
        id: crypto.randomUUID(),
        amount: def.seed.unsettledCash.amount,
        source: 'SALE_PROCEEDS',
        tradeDate: dayKey,
        settlesOn: dateKey(new Date(clock.simMs + def.seed.unsettledCash.settlesInDays * 86400000)),
        settled: false,
      });
    }
    if (def.seed?.dayTrades) {
      const dayKey = clock.now().dayKey;
      for (const dt of def.seed.dayTrades) {
        account.dayTrades.push({ ...dt, date: dt.date === 'SEED_TODAY' ? dayKey : dt.date, orderId: crypto.randomUUID() });
      }
    }
    positions.clear();
    for (const p of def.startingPositions ?? []) positions.set(p.symbol, { ...p });
    clock.start();
    set({
      mode: 'SCENARIO',
      simRunning: true,
      account,
      positions: new Map(positions),
      orders: [],
      selectedSymbol: def.symbol,
      ticket: { ...initialTicket(), symbol: def.symbol },
      quotes: snapshotQuotes(),
      scenario: { def, startWallMs: clock.simMs, firedSteps: new Set(), dayKey: clock.now().dayKey, complete: false },
    });
    get().pushToast(`Scenario started: ${def.name}`, 'INFO');
  },

  startSpeedDrill: () => {
    resetEngines();
    clock.start();
    set({
      mode: 'SPEED_DRILL',
      simRunning: true,
      scenario: null,
      positions: new Map(positions),
      orders: [],
      quotes: snapshotQuotes(),
    });
    nextSpeedDrillPrompt(set);
  },

  endSession: () => {
    clock.pause();
    set({ mode: null, simRunning: false });
  },

  tick: (realDeltaMs) => {
    const state = get();
    if (!state.simRunning) return;
    const advanced = clock.tick(realDeltaMs);
    if (advanced <= 0) return;
    const now = clock.now();
    market.advance(now.wallMs, advanced, now.dayKey);

    if (now.dayKey !== lastDayKeySeen) {
      handleDayRollover(state, now.dayKey);
      lastDayKeySeen = now.dayKey;
    }

    if (state.scenario) runScenarioSteps(state, now.wallMs, set, get);
    if (state.csvReplay?.playing) advanceCsvReplay(state, realDeltaMs, set);

    const priorOrdersSnapshot = [...orders];
    const quotesBySymbol = new Map<string, Quote>();
    const metaBySymbol = new Map(ALL_TICKERS.map((t) => [t.symbol, t] as const));
    const volMultBySymbol = new Map<string, number>();
    for (const t of ALL_TICKERS) {
      quotesBySymbol.set(t.symbol, market.getQuote(t.symbol));
      volMultBySymbol.set(t.symbol, market.getState(t.symbol).volMultiplier);
    }

    const events: FillEvent[] = processWorkingOrders(orders, {
      quotesBySymbol,
      metaBySymbol,
      volMultiplierBySymbol: volMultBySymbol,
      nowMs: now.wallMs,
      simDate: new Date(now.wallMs),
      rng,
      account: state.account,
      positions,
      priorOrders: priorOrdersSnapshot,
    });

    for (const ev of events) {
      get().pushToast(
        `${ev.order.action.replace('_', ' ')} ${ev.fill.qty} ${ev.order.symbol} @ $${ev.fill.price.toFixed(2)}`,
        'SUCCESS',
      );
      if (ev.gfvId) {
        const gfv = state.account.gfvs.find((g) => g.id === ev.gfvId);
        if (gfv) {
          get().pushToast(gfv.description, 'ERROR');
          triggerGfvQuiz(gfv, get);
        }
      }
    }

    // maintenance / margin call check
    const wasActive = state.account.marginCall.active;
    checkAndUpdateMarginCall(state.account, positions, priceOf, now.wallMs);
    if (!wasActive && state.account.marginCall.active) {
      get().pushToast(`Margin call issued: $${state.account.marginCall.amountRequired.toFixed(2)} required.`, 'ERROR');
      get().triggerContextualQuiz('regt-08', 'margin_call');
    }
    if (isForcedLiquidationDue(state.account, now.wallMs)) {
      forceLiquidate(state.account, priceOf, get);
    }

    // short borrow recalls (small chance per tick, HTB only)
    for (const p of positions.values()) {
      if (p.side === 'SHORT') {
        const meta = getTicker(p.symbol);
        if (maybeTriggerBuyInRecall(p, meta, now.wallMs, rng)) {
          get().pushToast(`Buy-in notice: ${p.symbol} borrow recalled — cover before the deadline.`, 'WARN');
          get().triggerContextualQuiz('short-07', 'buy_in_recall');
        }
        if (p.buyInDeadlineMs && now.wallMs >= p.buyInDeadlineMs) {
          forcedBuyIn(state.account, p, get);
        }
      }
    }

    set({
      account: { ...state.account },
      positions: new Map(positions),
      orders: [...orders],
      quotes: snapshotQuotes(),
      selectedBars: market.getBars(state.selectedSymbol).slice(-120),
      simTimeLabel: formatSimTime(now.wallMs),
      simNowMs: now.wallMs,
      simSession: now.session,
    });

    persistState(get());
  },

  selectSymbolIndex: (delta) => {
    const { watchlist, selectedSymbol, ticket } = get();
    const idx = watchlist.indexOf(selectedSymbol);
    const next = watchlist[(idx + delta + watchlist.length) % watchlist.length];
    set({ selectedSymbol: next, ticket: { ...ticket, symbol: next } });
  },

  armAction: (action) => set((s) => ({ ticket: { ...s.ticket, action, error: null } })),

  appendDigit: (d) =>
    set((s) => {
      const t = { ...s.ticket };
      const field = t.focusedField;
      const key = field === 'SIZE' ? 'sizeInput' : field === 'LIMIT' ? 'limitInput' : field === 'STOP' ? 'stopInput' : 'trailInput';
      if (d === '.' && (t as any)[key].includes('.')) return { ticket: t };
      (t as any)[key] = (t as any)[key] + d;
      return { ticket: t };
    }),

  backspaceDigit: () =>
    set((s) => {
      const t = { ...s.ticket };
      const key = t.focusedField === 'SIZE' ? 'sizeInput' : t.focusedField === 'LIMIT' ? 'limitInput' : t.focusedField === 'STOP' ? 'stopInput' : 'trailInput';
      (t as any)[key] = (t as any)[key].slice(0, -1);
      return { ticket: t };
    }),

  cycleFocus: () =>
    set((s) => {
      const order: TicketState['focusedField'][] = ['SIZE'];
      if (s.ticket.orderType === 'LIMIT' || s.ticket.orderType === 'STOP_LIMIT') order.push('LIMIT');
      if (s.ticket.orderType === 'STOP' || s.ticket.orderType === 'STOP_LIMIT') order.push('STOP');
      if (s.ticket.orderType === 'TRAILING_STOP') order.push('TRAIL');
      const idx = order.indexOf(s.ticket.focusedField);
      const next = order[(idx + 1) % order.length] ?? 'SIZE';
      return { ticket: { ...s.ticket, focusedField: next } };
    }),

  setOrderType: (t) => set((s) => ({ ticket: { ...s.ticket, orderType: t, focusedField: 'SIZE' } })),
  setTif: (t) => set((s) => ({ ticket: { ...s.ticket, tif: t } })),
  toggleExtendedHours: () => set((s) => ({ ticket: { ...s.ticket, extendedHours: !s.ticket.extendedHours } })),

  submitOrder: () => {
    const s = get();
    const t = s.ticket;
    if (!t.action) return set({ ticket: { ...t, error: 'Arm an action first (B / S / SS / BC).' } });
    const qty = parseInt(t.sizeInput, 10);
    if (!qty || qty <= 0) return set({ ticket: { ...t, error: 'Enter a size.' } });
    const meta = getTicker(t.symbol);
    const quote = market.getQuote(t.symbol);

    const limitPrice = t.limitInput ? parseFloat(t.limitInput) : undefined;
    const stopPrice = t.stopInput ? parseFloat(t.stopInput) : undefined;
    const trailAmount = t.trailInput ? parseFloat(t.trailInput) : undefined;
    if ((t.orderType === 'LIMIT' || t.orderType === 'STOP_LIMIT') && !limitPrice) {
      return set({ ticket: { ...t, error: 'Enter a limit price.' } });
    }
    if ((t.orderType === 'STOP' || t.orderType === 'STOP_LIMIT') && !stopPrice) {
      return set({ ticket: { ...t, error: 'Enter a stop price.' } });
    }
    if (t.orderType === 'TRAILING_STOP' && !trailAmount) {
      return set({ ticket: { ...t, error: 'Enter a trail amount.' } });
    }

    const now = clock.now();
    const simDate = new Date(now.wallMs);

    if (s.mode === 'SPEED_DRILL') {
      // Speed Drill trains order-entry parameters, not account realism — score
      // against the prompt directly without touching the live position book.
      scoreSpeedDrillSubmission(
        { symbol: t.symbol, action: t.action, qty, type: t.orderType, tif: t.tif, limitPrice, stopPrice, trailAmount, extendedHours: t.extendedHours },
        get,
        set,
      );
      set({ ticket: { ...initialTicket(), symbol: t.symbol, orderType: t.orderType, tif: t.tif, extendedHours: t.extendedHours } });
      return;
    }

    const validation = validateNewOrder(s.account, positions, { symbol: t.symbol, action: t.action, qty, limitPrice, type: t.orderType }, meta, quote, priceOf, simDate, orders, rng);
    if (!validation.ok) {
      set({ ticket: { ...t, error: validation.reason ?? 'Order rejected.' } });
      get().pushToast(validation.reason ?? 'Order rejected.', 'ERROR');
      return;
    }

    const order: Order = {
      id: newOrderId(),
      symbol: t.symbol,
      action: t.action,
      type: t.orderType,
      tif: t.tif,
      qty,
      filledQty: 0,
      limitPrice,
      stopPrice,
      trailAmount,
      extendedHours: t.extendedHours,
      status: 'WORKING',
      createdAt: now.wallMs,
      updatedAt: now.wallMs,
      fills: [],
      sessionDay: now.dayKey,
    };
    orders.push(order);

    set({ orders: [...orders], ticket: { ...initialTicket(), symbol: t.symbol, orderType: t.orderType, tif: t.tif, extendedHours: t.extendedHours } });
  },

  resetTicket: () => set((s) => ({ ticket: { ...initialTicket(), symbol: s.ticket.symbol } })),

  cancelWorkingOrder: (id) => {
    const o = orders.find((x) => x.id === id);
    if (o) cancelOrderEngine(o);
    set({ orders: [...orders] });
  },

  answerQuiz: (choiceIndex) => {
    const s = get();
    if (!s.quizInterrupt) return;
    const q = s.quizInterrupt.question;
    const correct = choiceIndex === q.correctIndex;
    const existing = s.quizCards[q.id] ?? freshCard(q.id);
    const updated = sm2Update(existing, correct);
    void upsertQuizCard(updated);
    void recordQuizAttempt({ id: crypto.randomUUID(), questionId: q.id, correct, answeredAt: Date.now(), triggeredBy: 'CONTEXTUAL', triggerContext: s.quizInterrupt.context });
    set({
      quizCards: { ...s.quizCards, [q.id]: updated },
      quizInterrupt: { ...s.quizInterrupt, answeredIndex: choiceIndex },
    });
  },

  closeQuizInterrupt: () => set({ quizInterrupt: null }),

  triggerContextualQuiz: (questionId, context) => {
    if (get().quizInterrupt) return;
    const q = getQuestion(questionId);
    if (!q) return;
    set({ quizInterrupt: { question: q, context, answeredIndex: null } });
  },

  studyDue: () => {
    if (get().quizInterrupt) return;
    const cards = Object.values(get().quizCards);
    const due = dueCards(cards);
    if (due.length > 0) {
      get().triggerContextualQuiz(due[0].questionId, 'STUDY_DUE');
      return;
    }
    const q = randomQuestionForTopic(QUIZ_TOPICS[Math.floor(Math.random() * QUIZ_TOPICS.length)]);
    get().triggerContextualQuiz(q.id, 'STUDY_NEW');
  },

  loadCsvFile: (text, symbol) => {
    const parsed = parseOhlcvCsv(text, 'REPLAY');
    const controller = new CsvReplayController(parsed.bars);
    market.setExternalDrive('REPLAY', true);
    const first = controller.advanceOneBar();
    if (first) market.setQuoteDirect('REPLAY', first.c, first.h, first.l);
    set((s) => ({
      csvReplay: { symbol, bars: parsed.bars, controller, speed: 1, playing: false },
      watchlist: s.watchlist.includes('REPLAY') ? s.watchlist : [...s.watchlist, 'REPLAY'],
      quotes: snapshotQuotes(),
    }));
  },

  csvStep: () => {
    const s = get();
    if (!s.csvReplay) return;
    const bar = s.csvReplay.controller.advanceOneBar();
    if (bar) market.setQuoteDirect('REPLAY', bar.c, bar.h, bar.l);
    set({ csvReplay: { ...s.csvReplay }, quotes: snapshotQuotes() });
  },

  setCsvSpeed: (speed) => set((s) => (s.csvReplay ? { csvReplay: { ...s.csvReplay, speed } } : {})),
  toggleCsvPlay: () => set((s) => (s.csvReplay ? { csvReplay: { ...s.csvReplay, playing: !s.csvReplay.playing } } : {})),

  pushToast: (text, kind = 'INFO') => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, text, kind, at: Date.now() }].slice(-6) }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 6000);
  },
}));

function resetEngines() {
  market = new SyntheticMarket(ALL_TICKERS, Math.floor(Math.random() * 1e9));
  clock = new SimClock(startOfSimDay().getTime(), 30);
  rng = new Rng(Math.floor(Math.random() * 1e9));
  positions.clear();
  orders = [];
  lastDayKeySeen = clock.now().dayKey;
}

function snapshotQuotes(): Record<string, Quote> {
  const out: Record<string, Quote> = {};
  for (const t of ALL_TICKERS) out[t.symbol] = market.getQuote(t.symbol);
  return out;
}

function formatSimTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function handleDayRollover(state: StoreState, newDayKey: string) {
  settleDueEntries(state.account, newDayKey);
  for (const p of positions.values()) {
    if (p.side === 'SHORT') {
      const meta = getTicker(p.symbol);
      const fee = accrueDailyBorrowFee(p, priceOf(p.symbol));
      if (fee > 0) {
        state.account.cash = round2(state.account.cash - fee);
        state.account.totalBorrowFeesPaid = round2(state.account.totalBorrowFeesPaid + fee);
      }
      const div = computeShortDividendLiability(p, meta, newDayKey);
      if (div) {
        applyDividendLiability(state.account, div);
        if (meta.nextExDate) meta.nextExDate = dateKey(new Date(new Date(meta.nextExDate).getTime() + 91 * 86400000));
      }
    }
  }
}

function forceLiquidate(account: AccountState, priceOf: (s: string) => number, get: () => StoreState) {
  const sorted = [...positions.values()].sort((a, b) => b.qty * priceOf(b.symbol) - a.qty * priceOf(a.symbol));
  for (const p of sorted) {
    const quote = market.getQuote(p.symbol);
    const price = p.side === 'LONG' ? quote.bid : quote.ask;
    if (p.side === 'LONG') {
      account.cash = round2(account.cash + p.qty * price);
    } else {
      account.cash = round2(account.cash - p.qty * price);
    }
    positions.delete(p.symbol);
    get().pushToast(`FORCED LIQUIDATION: closed ${p.qty} ${p.symbol} @ $${price.toFixed(2)} to satisfy margin call.`, 'ERROR');
    checkAndUpdateMarginCall(account, positions, priceOf, Date.now());
    if (!account.marginCall.active) break;
  }
}

function forcedBuyIn(account: AccountState, p: Position, get: () => StoreState) {
  const quote = market.getQuote(p.symbol);
  const price = quote.ask;
  account.cash = round2(account.cash - p.qty * price);
  positions.delete(p.symbol);
  get().pushToast(`FORCED BUY-IN: ${p.symbol} bought in at $${price.toFixed(2)} — borrow recall deadline passed.`, 'ERROR');
}

function triggerGfvQuiz(gfv: GoodFaithViolation, get: () => StoreState) {
  get().triggerContextualQuiz(gfv.severity === 'FREE_RIDE' ? 'settle-03' : 'settle-02', 'gfv');
}

let csvAccumulatorMs = 0;
function advanceCsvReplay(state: StoreState, realDeltaMs: number, set: (s: Partial<StoreState>) => void) {
  const rep = state.csvReplay!;
  csvAccumulatorMs += realDeltaMs;
  const msPerBar = 1000 / Math.max(0.25, rep.speed);
  let stepped = false;
  while (csvAccumulatorMs >= msPerBar && !rep.controller.atEnd) {
    csvAccumulatorMs -= msPerBar;
    const bar = rep.controller.advanceOneBar();
    if (bar) {
      market.setQuoteDirect('REPLAY', bar.c, bar.h, bar.l);
      stepped = true;
    }
  }
  if (rep.controller.atEnd) {
    set({ csvReplay: { ...rep, playing: false } });
  } else if (stepped) {
    set({ csvReplay: { ...rep } });
  }
}

function runScenarioSteps(state: StoreState, nowMs: number, set: (s: Partial<StoreState>) => void, get: () => StoreState) {
  const sc = state.scenario!;
  const elapsed = nowMs - sc.startWallMs;
  let changed = false;
  sc.def.steps.forEach((step, idx) => {
    if (sc.firedSteps.has(idx) || elapsed < step.atSimMs) return;
    sc.firedSteps.add(idx);
    changed = true;
    switch (step.kind) {
      case 'MESSAGE':
        get().pushToast(step.message ?? '', 'INFO');
        break;
      case 'GAP': {
        const pct = (step.payload?.pct as number) ?? 0;
        const symbol = step.symbol ?? sc.def.symbol;
        const cur = market.getQuote(symbol).last;
        market.forceGap(symbol, round2(cur * (1 + pct)), step.message);
        if (step.message) get().pushToast(step.message, 'WARN');
        break;
      }
      case 'NEWS':
        if (step.message) get().pushToast(step.message, 'WARN');
        break;
      case 'HALT': {
        const symbol = step.symbol ?? sc.def.symbol;
        const duration = (step.payload?.durationMs as number) ?? 60000;
        market.forceHalt(symbol, nowMs + duration);
        if (step.message) get().pushToast(step.message, 'WARN');
        break;
      }
      case 'RESUME': {
        const symbol = step.symbol ?? sc.def.symbol;
        market.forceResume(symbol);
        const gapPct = (step.payload?.gapPct as number) ?? 0;
        if (gapPct) {
          const cur = market.getQuote(symbol).last;
          market.forceGap(symbol, round2(cur * (1 + gapPct)));
        }
        if (step.message) get().pushToast(step.message, 'WARN');
        break;
      }
      case 'BORROW_RECALL': {
        const symbol = step.symbol ?? sc.def.symbol;
        const p = positions.get(symbol);
        if (p) {
          p.buyInDeadlineMs = nowMs + 90 * 1000;
          p.buyInReason = step.message ?? 'Borrow recalled';
        }
        if (step.message) get().pushToast(step.message, 'ERROR');
        break;
      }
      case 'QUIZ':
        if (step.quizId) get().triggerContextualQuiz(step.quizId, 'scenario');
        break;
    }
  });
  if (changed) set({ scenario: { ...sc } });
}

function nextSpeedDrillPrompt(set: (s: Partial<StoreState> | ((s: StoreState) => Partial<StoreState>)) => void) {
  const actions: OrderAction[] = ['BUY', 'SELL', 'SELL_SHORT', 'BUY_TO_COVER'];
  const types: OrderType[] = ['MARKET', 'LIMIT', 'STOP', 'TRAILING_STOP'];
  const tifs: TIF[] = ['DAY', 'GTC', 'IOC', 'FOK'];
  const symbol = WATCHLIST[Math.floor(Math.random() * WATCHLIST.length)];
  const quote = market.getQuote(symbol);
  const action = actions[Math.floor(Math.random() * actions.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const tif = tifs[Math.floor(Math.random() * tifs.length)];
  const qty = [100, 200, 300, 500][Math.floor(Math.random() * 4)];
  const extendedHours = Math.random() < 0.15;

  let priceText = '';
  let limitPrice: number | undefined;
  let stopPrice: number | undefined;
  let trailAmount: number | undefined;
  if (type === 'LIMIT') {
    limitPrice = round2(quote.last * (action === 'BUY' || action === 'BUY_TO_COVER' ? 0.98 : 1.02));
    priceText = ` at limit ${limitPrice.toFixed(2)}`;
  } else if (type === 'STOP') {
    stopPrice = round2(quote.last * (action === 'BUY' || action === 'BUY_TO_COVER' ? 1.03 : 0.97));
    priceText = ` at stop ${stopPrice.toFixed(2)}`;
  } else if (type === 'TRAILING_STOP') {
    trailAmount = round2(Math.max(0.25, quote.last * 0.03));
    priceText = ` trailing $${trailAmount.toFixed(2)}`;
  } else {
    priceText = ' at market';
  }

  const actionText: Record<OrderAction, string> = { BUY: 'Buy', SELL: 'Sell', SELL_SHORT: 'Short', BUY_TO_COVER: 'Cover' };
  const text = `${actionText[action]} ${qty} ${symbol}${priceText}, ${tif}${extendedHours ? ', EXT' : ''}`;

  const prompt: SpeedDrillPrompt = {
    id: crypto.randomUUID(),
    action,
    symbol,
    qty,
    type,
    limitPrice,
    stopPrice,
    trailAmount,
    tif,
    extendedHours,
    text,
  };

  set((s) => ({
    speedDrill: { ...s.speedDrill, prompt, promptStartMs: performance.now(), lastResult: null },
    selectedSymbol: symbol,
    ticket: { ...initialTicket(), symbol },
  }));
}

interface SubmittedOrderShape {
  symbol: string;
  action: OrderAction;
  qty: number;
  type: OrderType;
  tif: TIF;
  limitPrice?: number;
  stopPrice?: number;
  trailAmount?: number;
  extendedHours: boolean;
}

function scoreSpeedDrillSubmission(
  order: SubmittedOrderShape,
  get: () => StoreState,
  set: (s: Partial<StoreState> | ((s: StoreState) => Partial<StoreState>)) => void,
) {
  const s = get();
  const prompt = s.speedDrill.prompt;
  if (!prompt || s.speedDrill.promptStartMs === null) return;
  const timeToSubmitMs = Math.round(performance.now() - s.speedDrill.promptStartMs);

  const wrongAction = order.action !== prompt.action;
  const paramsMatch =
    order.symbol === prompt.symbol &&
    order.qty === prompt.qty &&
    order.type === prompt.type &&
    order.tif === prompt.tif &&
    order.extendedHours === prompt.extendedHours &&
    closeEnough(order.limitPrice, prompt.limitPrice) &&
    closeEnough(order.stopPrice, prompt.stopPrice) &&
    closeEnough(order.trailAmount, prompt.trailAmount);
  const correct = !wrongAction && paramsMatch;

  let score = 0;
  if (correct) {
    const speedBonus = Math.max(0, 1 - timeToSubmitMs / 8000);
    score = round2(60 + speedBonus * 40);
  } else if (wrongAction) {
    score = -50; // wrong-action errors (e.g. SELL vs SELL SHORT) are the expensive real-world mistake
  } else {
    score = -10;
  }

  const result: SpeedDrillResult = {
    id: crypto.randomUUID(),
    promptId: prompt.id,
    correct,
    wrongAction,
    timeToSubmitMs,
    score,
    answeredAt: Date.now(),
  };
  void recordSpeedDrillResult(result);

  const results = [...s.speedDrill.results, result];
  const correctTimes = results.filter((r) => r.correct).map((r) => r.timeToSubmitMs);
  const medianMs = medianOf(correctTimes);

  get().pushToast(
    correct
      ? `Correct — ${(timeToSubmitMs / 1000).toFixed(2)}s (score ${score})`
      : wrongAction
        ? `WRONG ACTION — prompt asked for ${prompt.action.replace('_', ' ')}, you sent ${order.action.replace('_', ' ')} (score ${score})`
        : `Order parameters didn't match the prompt (score ${score})`,
    correct ? 'SUCCESS' : 'ERROR',
  );

  set((st) => ({ speedDrill: { ...st.speedDrill, results, medianMs, lastResult: result } }));
  setTimeout(() => nextSpeedDrillPrompt(set), 1200);
}

function closeEnough(a?: number, b?: number): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  return Math.abs(a - b) < 0.01;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function persistState(state: StoreState) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    void saveAppStateBlob(
      JSON.stringify({
        account: state.account,
        positions: [...positions.values()],
        orders,
      }),
    );
  }, 1000);
}

export { TICKERS, WATCHLIST };
export type { StoreState };
export function accountBuyingPower() {
  const s = useStore.getState();
  return computeBuyingPower(s.account, positions, priceOf);
}
export function accountEquity() {
  const s = useStore.getState();
  return computeEquity(s.account.cash, positions, priceOf);
}
