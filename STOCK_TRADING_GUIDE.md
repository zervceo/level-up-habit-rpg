# Stock Trading Strategies: A Practical Guide

> **Disclaimer:** This guide is for educational purposes only. It is not financial advice.
> Trading stocks involves real risk of loss, including loss of your entire investment.
> Always do your own research, consider consulting a licensed financial advisor, and
> never risk money you cannot afford to lose. Past performance of any strategy does
> not guarantee future results.

## Table of Contents

1. [The Basics: What You're Actually Doing](#1-the-basics-what-youre-actually-doing)
2. [Core Vocabulary](#2-core-vocabulary)
3. [Strategy 1: Moving Average Crossover (Trend Following)](#3-strategy-1-moving-average-crossover-trend-following)
4. [Strategy 2: Mean Reversion with RSI](#4-strategy-2-mean-reversion-with-rsi)
5. [Strategy 3: Breakout Trading](#5-strategy-3-breakout-trading)
6. [Risk Management — The Part That Actually Beats the Market](#6-risk-management--the-part-that-actually-beats-the-market)
7. [Backtesting Before You Risk Real Money](#7-backtesting-before-you-risk-real-money)
8. [Common Beginner Mistakes](#8-common-beginner-mistakes)
9. [Further Resources](#9-further-resources)

---

## 1. The Basics: What You're Actually Doing

When you buy a stock, you're buying a small ownership stake in a company. Its price
moves based on supply and demand, which is driven by earnings, macroeconomic news,
interest rates, sentiment, and countless other factors — many of them unpredictable
in the short term.

Two broad approaches to deciding *what* to buy and *when*:

- **Fundamental analysis** — evaluating a company's financial health (revenue,
  earnings, debt, competitive position) to estimate what it's "really" worth.
- **Technical analysis** — studying price and volume charts to find patterns that
  suggest where the price might go next.

The strategies below are technical, rules-based approaches. They're popular with
beginners because they're mechanical (the rules tell you exactly when to act,
removing a lot of emotional guesswork) and easy to test on historical data before
using real money.

**Reality check on "beating the market":** the vast majority of professional fund
managers underperform a simple low-cost S&P 500 index fund over long time horizons.
That doesn't mean active strategies are worthless — it means edge is hard to find,
costs (fees, spreads, taxes, slippage) matter enormately, and consistency matters more
than any single "genius" trade. Treat these strategies as tools for a portion of a
diversified approach, not a guaranteed path to riches.

---

## 2. Core Vocabulary

| Term | Meaning |
|---|---|
| **Bid / Ask** | The price buyers offer / sellers demand. The gap is the "spread." |
| **Volume** | Number of shares traded in a period. Confirms the strength of a move. |
| **Volatility** | How much a price swings. Higher volatility = higher risk and reward. |
| **Long / Short** | Long = betting price rises (buy low, sell high). Short = betting price falls (borrow and sell, buy back later). |
| **Stop-loss** | An order that automatically sells if the price drops to a set level, capping your loss. |
| **Take-profit** | An order that automatically sells once a target gain is hit. |
| **Drawdown** | The decline from a peak to a trough in your portfolio's value. |
| **Slippage** | The difference between the price you expected and the price you actually got. |
| **Diversification** | Spreading risk across multiple assets so no single loss sinks you. |

---

## 3. Strategy 1: Moving Average Crossover (Trend Following)

**Idea:** Ride established trends rather than trying to predict tops and bottoms.

**Setup:** Pick two moving averages of closing price — a fast one and a slow one.
Common pairs: 50-day/200-day ("Golden Cross" / "Death Cross"), or 10-day/30-day for
shorter-term trading.

**Rules:**
- **Buy signal:** the fast MA crosses *above* the slow MA.
- **Sell/exit signal:** the fast MA crosses *below* the slow MA.

**Why it works (when it works):** stocks in strong uptrends tend to keep trending
for a while (momentum persistence), and the crossover filters out a lot of short-term
noise.

**Why it fails:** in a choppy, sideways market, the two averages cross back and forth
repeatedly, generating a string of small losses ("whipsaws"). This strategy performs
worst exactly when markets are range-bound.

**Pseudocode:**
```
fast_ma = SMA(close, 50)
slow_ma = SMA(close, 200)

if fast_ma crosses above slow_ma:
    buy()
elif fast_ma crosses below slow_ma:
    sell()
```

---

## 4. Strategy 2: Mean Reversion with RSI

**Idea:** Prices that move too far, too fast in one direction tend to snap back
toward their average — useful in range-bound or sideways markets (the opposite
conditions from where trend following shines).

**Setup:** Relative Strength Index (RSI), a 0–100 oscillator measuring the speed and
size of recent price changes, typically over a 14-day window.

**Rules:**
- **Buy signal:** RSI drops below 30 (considered "oversold").
- **Sell signal:** RSI rises above 70 (considered "overbought"), or price returns to
  its moving average.

**Why it works (when it works):** short-term panic selling or euphoric buying often
overshoots fair value; mean reversion strategies profit from the correction.

**Why it fails:** in a strong trending market, an "oversold" stock can keep falling
for a long time (RSI can stay under 30 for weeks in a real downtrend) — buying the
dip on a genuinely broken stock is a classic way to lose money with this strategy.

**Pseudocode:**
```
rsi = RSI(close, period=14)

if rsi < 30:
    buy()
elif rsi > 70:
    sell()
```

**Tip:** Many traders combine mean reversion with a broader trend filter (e.g., only
take RSI buy signals when price is above the 200-day MA) to avoid "catching a falling
knife."

---

## 5. Strategy 3: Breakout Trading

**Idea:** When price breaks decisively out of a well-established trading range (a
"consolidation"), it often continues in that direction as new buyers/sellers pile in.

**Setup:** Identify a price range — a period where the stock has traded between a
clear support (bottom) and resistance (top) level, ideally for several weeks.

**Rules:**
- **Buy signal:** price closes above resistance **with above-average volume**
  (volume confirmation is what separates a real breakout from a fakeout).
- **Stop-loss:** placed just below the old resistance level (which often becomes
  new support) or below the breakout candle's low.
- **Exit:** trail a stop as the price moves in your favor, or target a move equal to
  the height of the prior range projected from the breakout point.

**Why it works (when it works):** breakouts with strong volume often mark the start
of a new trend as institutional money enters.

**Why it fails:** "false breakouts" are common — price pokes above resistance,
triggers a wave of buy orders, then reverses back into the range, trapping late
buyers. This is why volume confirmation and a firm stop-loss are essential, not
optional.

**Pseudocode:**
```
resistance = max(high, lookback=20)
avg_volume = SMA(volume, 20)

if close > resistance and volume > 1.5 * avg_volume:
    buy()
    stop_loss = resistance * 0.98
```

---

## 6. Risk Management — The Part That Actually Beats the Market

Strategy selection matters less than most beginners think. Risk management is what
determines whether you're still trading (and solvent) a year from now.

- **Position sizing:** never risk more than 1-2% of your total account on a single
  trade. If a trade goes against you, you should barely feel it.
- **Always use a stop-loss.** Decide your exit *before* you enter, not while you're
  emotionally attached to the position.
- **Risk/reward ratio:** look for trades where the potential gain is at least
  1.5–2x the amount you're risking. This means you can be wrong more often than
  you're right and still come out ahead.
- **Diversify.** Don't put your whole account into one stock or one sector.
- **Don't average down on a broken thesis.** Adding to a losing position to lower
  your average cost only makes sense if your original reason for buying still holds.
- **Correlated bets aren't diversification.** Five tech stocks are one bet on tech.
- **Journal every trade.** Record why you entered, why you exited, and what you'd
  do differently. Pattern-spotting in your own mistakes is one of the fastest ways
  to improve.

## 7. Backtesting Before You Risk Real Money

Before trading any of the above strategies live:

1. **Get historical data** for the stocks/timeframe you care about (many free and
   paid data providers offer daily OHLCV — open/high/low/close/volume — data).
2. **Code the rules exactly** as written above (or your variant), so the test is
   free of hindsight bias.
3. **Run it over multiple market regimes** — a bull market, a bear market, and a
   sideways market — since each strategy above behaves very differently across them.
4. **Include realistic costs**: trading commissions, bid/ask spread, and slippage.
   A strategy that looks profitable ignoring costs often isn't once they're included.
5. **Watch for overfitting.** If you tweak parameters (MA lengths, RSI thresholds)
   until the backtest looks perfect on one dataset, it will very likely fail on new,
   unseen data. Test on out-of-sample data you didn't use to tune the rules.
6. **Paper trade** (simulate trades with real-time prices but no real money) for at
   least a few weeks before committing real capital.

## 8. Common Beginner Mistakes

- Risking too much on a single trade because "I'm confident about this one."
- Moving or removing a stop-loss because the price is close to hitting it.
- Trading a strategy live that was never backtested.
- Chasing a stock after it's already made a big move ("FOMO" entries).
- Overtrading — taking marginal setups out of boredom or impatience.
- Ignoring overall market conditions (e.g., taking trend-following longs during a
  market-wide downtrend).
- Confusing a few winning trades with having found a proven edge.

## 9. Further Resources

- **Books:** *A Random Walk Down Wall Street* (Burton Malkiel) for a foundational,
  skeptical view of active strategies; *Trading in the Zone* (Mark Douglas) for the
  psychological side of execution.
- **Practice:** most brokerages offer a free paper-trading / simulated account —
  use one before risking real capital.
- **Data & backtesting tools:** many free Python libraries (e.g., `pandas`,
  `yfinance`, `backtrader`) let you pull historical data and test the strategies in
  this guide yourself.

---

*Contributions and refinements welcome — open a PR if you'd like to add another
strategy, correct something, or extend the backtesting section.*
