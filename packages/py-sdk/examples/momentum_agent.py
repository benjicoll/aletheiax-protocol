"""Build and run a simple EMA-cross momentum agent (paper mode).

    python examples/momentum_agent.py
"""

from aletheiax import AletheiaClient
from aletheiax.agents import Strategy, ema


class EmaMomentum(Strategy):
    markets = ["SOL-PERP"]
    interval = 20.0

    def decide(self, ctx):
        closes = ctx.candles("SOL-PERP", "1m")
        fast, slow = ema(closes, 12), ema(closes, 48)
        if fast is None or slow is None:
            return ctx.hold("warming up")

        gap = (fast - slow) / slow
        pos = ctx.position("SOL-PERP")
        if gap > 0.0006:
            return ctx.hold("already long") if pos and pos.side == "long" \
                else ctx.long("SOL-PERP", risk=0.3, leverage=3, reason=f"EMA gap {gap*100:.3f}%")
        if gap < -0.0006:
            return ctx.hold("already short") if pos and pos.side == "short" \
                else ctx.short("SOL-PERP", risk=0.3, leverage=3, reason=f"EMA gap {gap*100:.3f}%")
        return ctx.flat("SOL-PERP", "neutral") if pos else ctx.hold("neutral")


if __name__ == "__main__":
    client = AletheiaClient(base_url="https://api.aletheiax.xyz")
    # client.login(wallet)   # add a wallet + paper=False to trade for real
    client.run_agent(EmaMomentum(), paper=True, max_ticks=5)
