"""Typed views over API responses.

Monetary and size fields are kept as ``Decimal`` to preserve precision.
``from_api`` builders tolerate extra/missing fields so the SDK stays forward-
compatible with the platform.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Optional


def _dec(v: Any) -> Decimal:
    return Decimal(str(v)) if v is not None and v != "" else Decimal("0")


def _odec(v: Any) -> Optional[Decimal]:
    return Decimal(str(v)) if v is not None and v != "" else None


@dataclass
class Market:
    id: str
    base_asset: str
    quote_asset: str
    max_leverage: int
    mark_price: Optional[Decimal]
    funding_rate: Optional[Decimal]
    volume_24h: Decimal
    open_interest: Decimal
    raw: dict = field(repr=False, default_factory=dict)

    @classmethod
    def from_api(cls, d: dict) -> "Market":
        return cls(
            id=d["id"], base_asset=d["base_asset"], quote_asset=d["quote_asset"],
            max_leverage=int(d["max_leverage"]), mark_price=_odec(d.get("mark_price")),
            funding_rate=_odec(d.get("funding_rate")), volume_24h=_dec(d.get("volume_24h")),
            open_interest=_dec(d.get("open_interest")), raw=d,
        )


@dataclass
class Position:
    id: str
    market_id: str
    side: str
    size: Decimal
    entry_price: Decimal
    mark_price: Decimal
    unrealized_pnl: Decimal
    leverage: int
    raw: dict = field(repr=False, default_factory=dict)

    @classmethod
    def from_api(cls, d: dict) -> "Position":
        return cls(
            id=d["id"], market_id=d["market_id"], side=d["side"], size=_dec(d["size"]),
            entry_price=_dec(d["entry_price"]), mark_price=_dec(d["mark_price"]),
            unrealized_pnl=_dec(d["unrealized_pnl"]), leverage=int(d["leverage"]), raw=d,
        )


@dataclass
class Agent:
    id: str
    name: str
    strategy_type: str
    is_ai: bool
    returns_30d: Optional[Decimal]
    sharpe_ratio: Optional[Decimal]
    total_pnl: Optional[Decimal]
    runtime_status: str
    raw: dict = field(repr=False, default_factory=dict)

    @classmethod
    def from_api(cls, d: dict) -> "Agent":
        return cls(
            id=d["id"], name=d["name"], strategy_type=d.get("strategy_type", ""),
            is_ai=bool(d.get("is_ai")), returns_30d=_odec(d.get("returns_30d")),
            sharpe_ratio=_odec(d.get("sharpe_ratio")), total_pnl=_odec(d.get("total_pnl")),
            runtime_status=d.get("runtime_status", "inactive"), raw=d,
        )


@dataclass
class Tier:
    key: str
    name: str
    min_hold: Decimal
    taker_fee_pct: Decimal
    max_leverage: int
    ai_agent_access: bool
    max_allocation_usd: Decimal

    @classmethod
    def from_api(cls, d: dict) -> "Tier":
        return cls(
            key=d["key"], name=d["name"], min_hold=_dec(d["min_hold"]),
            taker_fee_pct=_dec(d["taker_fee_pct"]), max_leverage=int(d["max_leverage"]),
            ai_agent_access=bool(d["ai_agent_access"]), max_allocation_usd=_dec(d["max_allocation_usd"]),
        )


@dataclass
class MyTier:
    enabled: bool
    balance: Decimal
    tier: Tier
    next_tier: Optional[Tier]
    to_next: Optional[Decimal]

    @classmethod
    def from_api(cls, d: dict) -> "MyTier":
        return cls(
            enabled=bool(d["enabled"]), balance=_dec(d["balance"]),
            tier=Tier.from_api(d["tier"]),
            next_tier=Tier.from_api(d["next_tier"]) if d.get("next_tier") else None,
            to_next=_odec(d.get("to_next")),
        )
