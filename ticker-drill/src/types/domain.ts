// Core domain types for TICKER DRILL

export type OrderAction = 'BUY' | 'SELL' | 'SELL_SHORT' | 'BUY_TO_COVER';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT' | 'TRAILING_STOP';
export type TIF = 'DAY' | 'GTC' | 'IOC' | 'FOK';
export type OrderStatus =
  | 'PENDING'
  | 'WORKING'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'CANCELED'
  | 'REJECTED'
  | 'EXPIRED';

export interface Fill {
  id: string;
  qty: number;
  price: number;
  timestamp: number;
  secFee: number;
  tafFee: number;
}

export interface Order {
  id: string;
  symbol: string;
  action: OrderAction;
  type: OrderType;
  tif: TIF;
  qty: number;
  filledQty: number;
  limitPrice?: number;
  stopPrice?: number;
  trailAmount?: number; // absolute $ trail for trailing stop
  trailHighWaterMark?: number; // internal tracking for trailing stop
  extendedHours: boolean;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  fills: Fill[];
  rejectReason?: string;
  sessionDay: string; // yyyy-mm-dd sim day the order was placed, for DAY expiry
}

export type PositionSide = 'LONG' | 'SHORT';

export interface Position {
  symbol: string;
  side: PositionSide;
  qty: number;
  avgPrice: number;
  openedAt: number;
  // short-only bookkeeping
  borrowLocateId?: string;
  borrowRateAnnualPct?: number;
  buyInDeadlineMs?: number | null; // forced buy-in countdown when borrow is recalled
  buyInReason?: string;
  // cash-account-style unsettled-funds tracking (see RULES.md)
  unsettledFundingCoverDate?: string; // yyyy-mm-dd; selling before this date while tagged risks a GFV
  unsettledFundingFullyUnsettled?: boolean; // true if zero settled cash contributed (free-riding risk)
}

export interface UnsettledCashEntry {
  id: string;
  amount: number;
  source: 'SALE_PROCEEDS' | 'DEPOSIT';
  tradeDate: string; // yyyy-mm-dd
  settlesOn: string; // yyyy-mm-dd (T+1)
  settled: boolean;
}

export interface DayTradeRecord {
  date: string; // yyyy-mm-dd
  symbol: string;
  orderId: string;
}

export interface GoodFaithViolation {
  id: string;
  date: string;
  symbol: string;
  description: string;
  severity: 'GFV' | 'FREE_RIDE';
}

export interface MarginCallState {
  active: boolean;
  reason: 'MAINTENANCE_DEFICIENCY' | 'REG_T_CALL' | null;
  amountRequired: number;
  issuedAt: number | null;
  deadline: number | null; // sim-time ms; forced liquidation triggers after this
}

export interface AccountState {
  cash: number; // total cash ledger (settled + unsettled)
  unsettledEntries: UnsettledCashEntry[];
  equity: number; // cash + market value of positions (marked to market)
  dayTrades: DayTradeRecord[];
  isPDT: boolean;
  gfvs: GoodFaithViolation[];
  marginCall: MarginCallState;
  realizedPnL: number;
  totalFeesPaid: number;
  totalBorrowFeesPaid: number;
  totalDividendsOwed: number;
}

export interface TickerMeta {
  symbol: string;
  name: string;
  marginable: boolean;
  htb: boolean; // hard to borrow
  borrowRateAnnualPct: number; // annualized borrow fee %, higher if HTB
  dividendYieldAnnualPct: number;
  nextExDate?: string; // yyyy-mm-dd, synthetic
  nextDividendPerShare?: number;
  baseVolatilityAnnualPct: number;
  startPrice: number;
}

export interface Quote {
  symbol: string;
  last: number;
  bid: number;
  ask: number;
  timestamp: number;
  session: MarketSession;
  halted: boolean;
}

export type MarketSession = 'PREMARKET' | 'REGULAR' | 'AFTERHOURS' | 'CLOSED';

export interface Bar {
  t: number; // timestamp ms
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

// ---------- Quiz ----------

export type QuizTopic =
  | 'MARGIN_REG_T'
  | 'SHORT_SELLING'
  | 'SETTLEMENT'
  | 'ORDER_TYPES'
  | 'ACCOUNT_TYPES'
  | 'PDT'
  | 'CORPORATE_ACTIONS'
  | 'TAX_TREATMENT';

export interface QuizQuestion {
  id: string;
  topic: QuizTopic;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  citation: string;
}

export interface QuizCardState {
  questionId: string;
  repetition: number;
  easeFactor: number;
  intervalDays: number;
  dueAt: number; // epoch ms (wall clock)
  lastResult: 'CORRECT' | 'INCORRECT' | null;
  lastReviewedAt: number | null;
}

export interface QuizAttempt {
  id: string;
  questionId: string;
  correct: boolean;
  answeredAt: number;
  triggeredBy: 'MANUAL' | 'CONTEXTUAL' | 'SCHEDULED';
  triggerContext?: string;
}

// ---------- Modes ----------

export type AppMode = 'FREE_TRADE' | 'SPEED_DRILL' | 'SCENARIO';

export interface SpeedDrillPrompt {
  id: string;
  action: OrderAction;
  symbol: string;
  qty: number;
  type: OrderType;
  limitPrice?: number;
  stopPrice?: number;
  trailAmount?: number;
  tif: TIF;
  extendedHours: boolean;
  text: string;
}

export interface SpeedDrillResult {
  id: string;
  promptId: string;
  correct: boolean;
  wrongAction: boolean;
  timeToSubmitMs: number;
  score: number;
  answeredAt: number;
}

export interface ScenarioStep {
  atSimMs: number; // ms since scenario start
  kind: 'PRICE_SET' | 'NEWS' | 'HALT' | 'RESUME' | 'GAP' | 'BORROW_RECALL' | 'MESSAGE' | 'QUIZ';
  symbol?: string;
  payload?: Record<string, unknown>;
  message?: string;
  quizId?: string;
}

export interface ScenarioSeed {
  dayTrades?: DayTradeRecord[];
  unsettledCash?: { amount: number; settlesInDays: number };
}

export interface ScenarioDef {
  id: string;
  name: string;
  description: string;
  symbol: string;
  startingCash: number;
  startingPositions?: Position[];
  seed?: ScenarioSeed;
  steps: ScenarioStep[];
  objective: string;
}
