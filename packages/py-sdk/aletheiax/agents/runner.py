"""Run a Strategy against live market data.

The runner pulls real market data through the SDK, builds a Context, calls your
strategy on its interval, and executes the returned actions. Use
``paper=True`` (default) to log intended actions without sending orders — ideal
for validating a strategy before committing capital.
"""

from __future__ import annotations

import time
from decimal import Decimal
from typing import TYPE_CHECKING, List

from .strategy import Action, Close, Context, Hold, Open, PositionView, Strategy

if TYPE_CHECKING:
    from ..client import AletheiaClient


class AgentRunner:
    def __init__(self, client: "AletheiaClient", strategy: Strategy, *, paper: bool = True):
        self.client = client
        self.strategy = strategy
        self.paper = paper

    def _build_context(self) -> Context:
        candles: dict = {}
        markets: dict = {}
        for m in self.strategy.markets:
            ticker = self.client.markets.ticker(m)
            markets[m] = {"price": ticker["last_price"]}
            try:
                markets[m]["funding_rate"] = self.client.markets.funding(m)["current_rate"]
            except Exception:
                markets[m]["funding_rate"] = "0"
            candles[(m, "1m")] = [float(c["close"]) for c in
                                  self.client.markets.candles(m, "1m", 150)["candles"]]

        positions: List[PositionView] = []
        equity = Decimal("0")
        free = Decimal("0")
        if self.client.is_authenticated:
            bal = self.client.trading.balance()
            equity = Decimal(str(bal["total"]))
            free = Decimal(str(bal["available"]))
            for p in self.client.trading.positions():
                positions.append(PositionView(
                    market=p["market_id"], side=p["side"], size=Decimal(str(p["size"])),
                    entry_price=Decimal(str(p["entry_price"])),
                    unrealized_pnl=Decimal(str(p["unrealized_pnl"])),
                ))
        return Context(equity=equity, free_collateral=free, positions=positions,
                       _candles=candles, _markets=markets)

    def _execute(self, action: Action, ctx: Context) -> None:
        if isinstance(action, Hold):
            if action.reason:
                print(f"[hold] {action.reason}")
            return

        if isinstance(action, Close):
            pos = ctx.position(action.market)
            if not pos:
                return
            print(f"[close] {action.market} ({action.reason})")
            if not self.paper:
                positions = self.client.trading.positions(action.market)
                for p in positions:
                    self.client.trading.close_position(p["id"])
            return

        if isinstance(action, Open):
            price = ctx.price(action.market)
            if price <= 0:
                return
            notional = ctx.equity * Decimal(str(action.risk))
            size = (notional / price)
            side = "buy" if action.side == "long" else "sell"
            print(f"[open] {action.side} {action.market} ~{size:.6f} @ {action.leverage}x ({action.reason})")
            if not self.paper:
                self.client.trading.place_order(
                    market=action.market, side=side, type="market",
                    size=f"{size:.8f}", leverage=action.leverage,
                )

    def run(self, *, max_ticks: int | None = None) -> None:
        mode = "paper" if self.paper else "LIVE"
        print(f"running {type(self.strategy).__name__} ({mode}) every {self.strategy.interval}s")
        tick = 0
        while max_ticks is None or tick < max_ticks:
            try:
                ctx = self._build_context()
                result = self.strategy.decide(ctx)
                actions = result if isinstance(result, list) else [result]
                for a in actions:
                    self._execute(a, ctx)
            except Exception as e:  # a strategy bug must not kill the loop
                print(f"[error] {e}")
            tick += 1
            if max_ticks is None or tick < max_ticks:
                time.sleep(self.strategy.interval)
