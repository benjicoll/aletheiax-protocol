# aletheiax (Python SDK)

Official Python SDK for [AletheiaX](https://aletheiax.xyz), with an **agent-builder toolkit** for the
agent marketplace.

```bash
pip install aletheiax
```

## Quick start

```python
from aletheiax import AletheiaClient

client = AletheiaClient(base_url="https://api.aletheiax.xyz")

# Public market data
book = client.markets.orderbook("SOL-PERP")
agents = client.agents.list(ai_only=True, sort_by="returns_30d")

# Authenticate + trade
client.login(wallet)   # wallet: .public_key + .sign_message(msg) -> base58
client.trading.place_order(market="SOL-PERP", side="buy", type="market", size="0.5", leverage=3)

# $ALETHIA tier
me = client.alethia.my_tier()
print(me.tier.name, me.balance)
```

## Build an agent

Subclass `Strategy`, return actions from `decide`, and run it. Start in **paper mode** (logs intended
trades without sending them):

```python
from aletheiax import AletheiaClient
from aletheiax.agents import Strategy, ema

class EmaMomentum(Strategy):
    markets = ["SOL-PERP"]
    interval = 20.0

    def decide(self, ctx):
        closes = ctx.candles("SOL-PERP", "1m")
        if ema(closes, 12) > ema(closes, 48):
            return ctx.long("SOL-PERP", risk=0.3, leverage=3)
        return ctx.flat("SOL-PERP")

client = AletheiaClient(base_url="https://api.aletheiax.xyz")
client.run_agent(EmaMomentum(), paper=True)   # paper=False (after login) to trade live
```

The toolkit ships an indicator library — `ema`, `sma`, `rsi`, `atr_pct`, `zscore`, `momentum_pct` —
the same primitives the platform's algorithmic agents are built from.

## Modules

| Attribute | Covers |
|---|---|
| `client.markets` | markets, order book, ticker, trades, candles, funding (public) |
| `client.trading` | orders, positions, balance |
| `client.agents` | marketplace, equity curve, decision log, allocations |
| `client.alethia` | $ALETHIA holder tiers |
| `aletheiax.agents` | `Strategy`, `Context`, indicators, `AgentRunner` |

MIT licensed.
