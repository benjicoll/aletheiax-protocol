"""Market indicators for building agents.

Pure functions over a list of closing prices (oldest → newest) or candles.
These are generic technical-analysis primitives — the same building blocks the
platform's algorithmic agents use, provided here so you can build your own.
"""

from __future__ import annotations

import math
from typing import Optional, Sequence


def sma(values: Sequence[float], period: int) -> Optional[float]:
    """Simple moving average of the last ``period`` values."""
    if len(values) < period:
        return None
    return sum(values[-period:]) / period


def ema(values: Sequence[float], period: int) -> Optional[float]:
    """Exponential moving average (final value of the series)."""
    if len(values) < period:
        return None
    k = 2.0 / (period + 1)
    avg = sum(values[:period]) / period
    for v in values[period:]:
        avg = v * k + avg * (1 - k)
    return avg


def stdev(values: Sequence[float], period: int) -> Optional[float]:
    if len(values) < period:
        return None
    window = values[-period:]
    mean = sum(window) / period
    return math.sqrt(sum((v - mean) ** 2 for v in window) / period)


def zscore(values: Sequence[float], period: int) -> Optional[float]:
    """How many standard deviations the latest value is from its mean."""
    mean = sma(values, period)
    sd = stdev(values, period)
    if mean is None or sd is None or sd == 0:
        return None
    return (values[-1] - mean) / sd


def rsi(values: Sequence[float], period: int = 14) -> Optional[float]:
    """Relative Strength Index in [0, 100]."""
    if len(values) < period + 1:
        return None
    gains = losses = 0.0
    for i in range(-period, 0):
        delta = values[i] - values[i - 1]
        if delta >= 0:
            gains += delta
        else:
            losses -= delta
    if losses == 0:
        return 100.0
    rs = (gains / period) / (losses / period)
    return 100.0 - 100.0 / (1.0 + rs)


def atr_pct(candles: Sequence[dict], period: int = 14) -> Optional[float]:
    """Average true range as a fraction of the last close."""
    if len(candles) < period + 1:
        return None
    trs = []
    for i in range(-period, 0):
        high, low = float(candles[i]["high"]), float(candles[i]["low"])
        prev_close = float(candles[i - 1]["close"])
        trs.append(max(high - low, abs(high - prev_close), abs(low - prev_close)))
    last_close = float(candles[-1]["close"])
    return (sum(trs) / period) / last_close if last_close else None


def momentum_pct(values: Sequence[float], lookback: int) -> Optional[float]:
    """Percent change over the last ``lookback`` periods."""
    if len(values) < lookback + 1 or values[-lookback - 1] == 0:
        return None
    return (values[-1] - values[-lookback - 1]) / values[-lookback - 1]
