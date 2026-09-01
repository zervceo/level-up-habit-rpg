import type { ScenarioDef } from '../types/domain';

const MIN = 60 * 1000;

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'gap-margin-call',
    name: 'Gap Down Into a Margin Call',
    description:
      'You are heavily long a marginable stock on margin. Overnight news guts the price and you wake up under the maintenance requirement.',
    symbol: 'BLUX',
    startingCash: 40000,
    startingPositions: [{ symbol: 'BLUX', side: 'LONG', qty: 900, avgPrice: 148.5, openedAt: 0 }],
    steps: [
      { atSimMs: 0, kind: 'MESSAGE', message: 'You are long 900 BLUX on margin. Market opens shortly — watch your account panel.' },
      { atSimMs: 2 * MIN, kind: 'GAP', symbol: 'BLUX', payload: { pct: -0.19 }, message: 'BLUX gaps down 19% on a guidance cut. Check your maintenance requirement.' },
      { atSimMs: 2.1 * MIN, kind: 'QUIZ', quizId: 'regt-03' },
      { atSimMs: 3 * MIN, kind: 'MESSAGE', message: 'A margin call has been issued. You have a forced-liquidation countdown — sell enough to restore the maintenance requirement before it expires.' },
    ],
    objective:
      'Reduce your BLUX position (or add cash conceptually by liquidating) so your account equity is back above the 25% maintenance requirement before the forced-liquidation deadline hits.',
  },
  {
    id: 'htb-squeeze',
    name: 'Hard-to-Borrow Short Squeeze',
    description:
      'You are short a hard-to-borrow, high-short-interest name. A squeeze starts, and your lender recalls the borrow.',
    symbol: 'SQZY',
    startingCash: 15000,
    startingPositions: [{ symbol: 'SQZY', side: 'SHORT', qty: 400, avgPrice: 12.75, openedAt: 0, borrowRateAnnualPct: 42 }],
    steps: [
      { atSimMs: 0, kind: 'MESSAGE', message: 'You are short 400 SQZY (HTB, 42% annualized borrow fee accruing daily).' },
      { atSimMs: 1.5 * MIN, kind: 'NEWS', symbol: 'SQZY', message: 'Chatter of a short squeeze spreads on social media — volume and volatility spike.' },
      { atSimMs: 2 * MIN, kind: 'GAP', symbol: 'SQZY', payload: { pct: 0.35 }, message: 'SQZY spikes 35% as shorts scramble to cover.' },
      { atSimMs: 2.2 * MIN, kind: 'QUIZ', quizId: 'short-07' },
      { atSimMs: 3 * MIN, kind: 'BORROW_RECALL', symbol: 'SQZY', message: 'Your stock loan has been recalled. You must cover within the buy-in deadline shown on your position.' },
    ],
    objective: 'Decide whether to cover before the recall deadline or risk a forced buy-in at an even worse price.',
  },
  {
    id: 'unsettled-funds-trap',
    name: 'The Unsettled-Funds Trap',
    description:
      'You sold a position yesterday. Those proceeds have not settled yet (T+1). Trading with them today, then selling again, risks a good-faith violation.',
    symbol: 'DIVD',
    startingCash: 6200,
    seed: { unsettledCash: { amount: 5400, settlesInDays: 1 } },
    steps: [
      {
        atSimMs: 0,
        kind: 'MESSAGE',
        message:
          'Your cash balance shows $6,200, but $5,400 of that is unsettled proceeds from yesterday\'s sale (settles tomorrow). Only ~$800 is settled. Try buying DIVD using the full balance, then selling it again today.',
      },
      { atSimMs: 0.2 * MIN, kind: 'QUIZ', quizId: 'settle-02' },
    ],
    objective:
      'Buy DIVD, then try selling it again the same day before the unsettled portion settles, and see the good-faith-violation warning fire — then learn to avoid it.',
  },
  {
    id: 'halt-reopen',
    name: 'Halt and Reopen',
    description: 'A single-stock volatility halt fires mid-session. Orders sit frozen until trading resumes, sometimes far from where it paused.',
    symbol: 'MOMO',
    startingCash: 20000,
    steps: [
      { atSimMs: 0, kind: 'MESSAGE', message: 'MOMO is active and volatile today. Try working some orders.' },
      { atSimMs: 1.5 * MIN, kind: 'NEWS', symbol: 'MOMO', message: 'Unconfirmed rumor hits the tape — volatility spikes.' },
      { atSimMs: 2 * MIN, kind: 'HALT', symbol: 'MOMO', payload: { durationMs: 60 * 1000 }, message: 'MOMO is halted (volatility pause). No orders can fill until it resumes.' },
      { atSimMs: 3 * MIN, kind: 'RESUME', symbol: 'MOMO', payload: { gapPct: -0.12 }, message: 'MOMO reopens 12% below the halt price. Resting stop orders may have gapped through.' },
      { atSimMs: 3.1 * MIN, kind: 'QUIZ', quizId: 'ordtype-03' },
    ],
    objective: 'Observe how working orders behave through a halt and a gapped reopen — nothing fills while halted, and stops can trigger far from their price on resume.',
  },
  {
    id: 'pdt-lockout',
    name: 'PDT Lockout',
    description: 'Your account is under $25,000 equity and you have already made 3 day trades this week. One more will freeze day trading.',
    symbol: 'STBL',
    startingCash: 9000,
    seed: {
      dayTrades: [
        { date: 'SEED_TODAY', symbol: 'BLUX', orderId: 'seed-1' },
        { date: 'SEED_TODAY', symbol: 'MOMO', orderId: 'seed-2' },
        { date: 'SEED_TODAY', symbol: 'DIVD', orderId: 'seed-3' },
      ],
    },
    steps: [
      {
        atSimMs: 0,
        kind: 'MESSAGE',
        message: 'Your account has $9,000 equity (under the $25k PDT threshold) and already has 3 day trades logged this week. Buy STBL, then try selling it back the same day.',
      },
      { atSimMs: 0.2 * MIN, kind: 'QUIZ', quizId: 'pdt-03' },
    ],
    objective: 'Try to close out a same-day round trip in STBL and see the broker-style PDT block fire on what would be your 4th day trade.',
  },
];

export function getScenario(id: string): ScenarioDef {
  const s = SCENARIOS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scenario ${id}`);
  return s;
}
