"""Strategy interface for building AletheiaX agents.

Subclass :class:`Strategy` and implement :meth:`decide`. Each tick you receive a
:class:`Context` with live market data and your positions, and return zero or
more :class:`Action` objects. The runner enforces sizing and submits orders
through the SDK.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import List, Literal, Optional, Sequence, Union


@dataclass
class Open:
    """Open or flip to a directional position, sized as a fraction of equity."""
    market: str
    side: Literal["long", "short"]
    risk: float = 0.2          # fraction of agent equity
    leverage: int = 2
    reason: str = ""


@dataclass
class Close:
    """Flatten the position in a market."""
    market: str
    reason: str = ""


@dataclass
class Hold:
    """Do nothing this tick (optionally with a logged rationale)."""
    reason: str = ""


Action = Union[Open, Close, Hold]


@dataclass
class PositionView:
    market: str
    side: Literal["long", "short"]
    size: Decimal
    entry_price: Decimal
    unrealized_pnl: Decimal


@dataclass
class Context:
    """Everything a strategy may read for one decision."""
    equity: Decimal
    free_collateral: Decimal
    positions: List[PositionView]
    _candles: dict = field(repr=False, default_factory=dict)   # (market, tf) -> [close,...]
    _markets: dict = field(repr=False, default_factory=dict)   # market -> snapshot dict

    def candles(self, market: str, timeframe: str = "1m") -> Sequence[float]:
        """Closing prices, oldest → newest, for a market/timeframe."""
        return self._candles.get((market, timeframe), [])

    def price(self, market: str) -> Decimal:
        return Decimal(str(self._markets.get(market, {}).get("price", 0)))

    def funding_rate(self, market: str) -> Decimal:
        return Decimal(str(self._markets.get(market, {}).get("funding_rate", 0)))

    def position(self, market: str) -> Optional[PositionView]:
        return next((p for p in self.positions if p.market == market), None)

    # convenience builders ---------------------------------------------------

    def long(self, market: str, risk: float = 0.2, leverage: int = 2, reason: str = "") -> Open:
        return Open(market, "long", risk, leverage, reason)

    def short(self, market: str, risk: float = 0.2, leverage: int = 2, reason: str = "") -> Open:
        return Open(market, "short", risk, leverage, reason)

    def flat(self, market: str, reason: str = "") -> Close:
        return Close(market, reason)

    def hold(self, reason: str = "") -> Hold:
        return Hold(reason)


class Strategy:
    """Base class for agents. Override :meth:`decide`."""

    #: markets this strategy trades
    markets: List[str] = ["BTC-PERP", "ETH-PERP", "SOL-PERP"]
    #: seconds between decisions
    interval: float = 30.0

    def decide(self, ctx: Context) -> Union[Action, List[Action]]:  # pragma: no cover
        raise NotImplementedError
