# The Agents

AletheiaX runs sixteen autonomous agents as **real, funded participants** on its own order book. They
are not a leaderboard of borrowed numbers — each has its own trading account, posts real orders, takes
real fills, and builds a track record that is measured from its trades.

This document covers the three agent families, the shared risk wrapper, the LLM integration, how
metrics stay honest, and how users can ride an agent through allocations.

---

## A shared contract

Every agent — algorithmic or LLM — implements the same small interface: given a context (live prices,
indicators, the platform book, funding, its own positions and free collateral), return a list of
intents. The engine does the rest: risk enforcement, sizing, execution, attribution, logging.

Intents are deliberately simple — *open long / open short / close / hold / quote* — expressed as a
fraction of the agent's own equity. The engine converts that to base-asset size at the live price and
clamps it to the risk wrapper. An agent can never reach around the engine to touch the matching engine
or the ledger directly.

---

## Family 1 — Market makers (3)

**Marina BTC · Marina ETH · Marina SOL.** Inventory-aware makers that quote both sides of their market
around the Pyth index, re-quoting each cycle. They skew quotes against accumulated inventory and unwind
via reduce-only quotes when inventory breaches its cap.

Their capital is deliberately the largest share of the fleet, because **a market maker's capital *is*
the order book's depth**. They earn the spread and pay no management/performance fee. Allocations are
disabled for makers — their hundreds-of-quotes-per-hour behavior can't be faithfully mirrored into a
user account, and saying so honestly is better than selling a copy that wouldn't track.

---

## Family 2 — Algorithmic (8)

Deterministic strategies over real market data. Each is a few dozen lines of transparent logic — no
black box:

| Agent | Strategy | Signal |
|---|---|---|
| **Caspian Momentum** | EMA-cross trend | fast vs slow EMA on 1-minute closes, with a neutral band |
| **Helios Mean-Reversion** | statistical reversion | fades > 2σ dislocations vs the 40-period mean |
| **Atlas Breakout** | Donchian breakout | enters on a 20-hour channel break, exits on the midline |
| **Delta Carry** | funding carry | positions against the crowd to collect funding |
| **Quasar Basis** | basis convergence | trades the book's premium/discount to the Pyth index |
| **Tempest Vol-Trend** | volatility-gated trend | trades the hourly trend only when ATR confirms a live regime; inverse-vol sizing |
| **Orion RSI** | RSI reversal | longs oversold, shorts overbought, exits at the midline |
| **Solana Scalper** | book-imbalance scalp | trades order-flow pressure on SOL with fast exits |

The indicator library (EMA, RSI, ATR, z-score, Donchian, book imbalance, momentum) operates on real
Binance candle history and the platform's own live book.

---

## Family 3 — LLM-driven (5)

Five agents make discretionary decisions via a language model through **OpenRouter**. Each has a
distinct persona and mandate:

| Agent | Model | Mandate |
|---|---|---|
| **Aletheia Prime** | DeepSeek | patient swing trader; acts only on trend + momentum confluence |
| **Gemini Sentinel** | Gemini Flash | contrarian; fades crowded funding and stretched RSI |
| **Qwen Quant** | Qwen 235B | systematic; requires multiple aligned signals before trading |
| **Maverick Llama** | Llama 4 Maverick | aggressive momentum; presses winners, cuts losers fast |
| **Atlas GPT** | GPT-4o-mini | macro allocator; slow, deliberate stance changes |

### How an LLM decision works

Each cycle the agent receives a compact, factual market snapshot — prices, 1h/24h change, RSI, EMA
trend, ATR, funding rate, book spread and imbalance, plus its own positions and free collateral. The
model must answer with a strict JSON decision:

```json
{ "action": "open_long", "market": "SOL-PERP", "size_pct": 20, "leverage": 2,
  "reason": "Bullish EMA cross with rising ATR and positive funding tailwind" }
```

Robustness is engineered in, because models misbehave:

- **Forced JSON** (`response_format: json_object`) so reasoning-style models emit a decision instead
  of thinking in prose until they run out of tokens.
- **Strict parsing & validation** — disallowed markets, bad sizes, or unparseable output all degrade
  safely to **HOLD**. An LLM hiccup can never produce an unintended trade.
- **Graceful model fallback** — if the primary (paid) model is unavailable, the client falls back
  across alternatives; persistent billing failures route to free models for a cooldown window rather
  than retrying a guaranteed failure every cycle.

The `reason` field is stored verbatim and streamed to the agent's public decision log — so the AI's
actual thinking is visible, not summarized.

---

## The risk wrapper — enforced by the engine

Every agent, on every action, is bounded by a wrapper the engine enforces *before* execution:

| Control | Effect |
|---|---|
| **Max leverage** | hard order-level cap |
| **Max position notional %** | per-market position size as a fraction of agent equity |
| **Max daily loss %** | equity drop from the UTC day-open that flattens the agent and pauses it until next day |
| **Kill-switch drawdown %** | peak-to-trough equity drawdown that flattens the agent and halts it pending review |

A paused or killed agent is shown as such in the UI — the state is transparent, not hidden.

---

## Honest metrics

There is **no seed data**. An agent's returns, Sharpe, win rate, and max drawdown are computed from:

- **Equity snapshots** taken periodically from its real account value, and
- **Closed positions** with their realized PnL.

Consequences, by design:

- A fresh agent shows `—`, not a flattering invented number.
- Sharpe is withheld until there's enough history to annualize meaningfully (short windows produce
  nonsense, so we don't show it).
- The equity curve on each agent's profile is the real snapshot series — never a generated line.

Creator-published agents (anyone can publish one) are stored with their claimed numbers explicitly
flagged **unverified**, and **cannot accept allocations** until a real on-platform record exists.

---

## Allocations — riding an agent

A user can allocate capital to a directional or LLM agent. The engine then mirrors that agent's
positions into the user's account via **target-position sync**: scaled to the allocation size and
clamped to the user's own limits (max leverage, max position size, daily-loss cap). The allocation is
an **envelope** — the agent can never commit more of the user's margin than granted — and the user
keeps a live kill switch (pause, resume, close all positions) at all times.

Market makers and the scalper are house-capital-only, for the faithfulness reason described above.
