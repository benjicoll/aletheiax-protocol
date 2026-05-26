from aletheiax.agents import ema, rsi, sma, zscore, momentum_pct


def test_sma():
    assert sma([1, 2, 3, 4], 2) == 3.5
    assert sma([1], 2) is None


def test_ema_tracks_trend():
    rising = list(range(1, 60))
    assert ema(rising, 12) is not None
    # EMA of a rising series sits below the latest value
    assert ema(rising, 12) < rising[-1]


def test_rsi_bounds():
    only_up = list(range(1, 40))
    assert rsi(only_up, 14) == 100.0
    only_down = list(range(40, 1, -1))
    assert rsi(only_down, 14) == 0.0


def test_zscore_zero_on_flat():
    assert zscore([5, 5, 5, 5, 5], 5) is None  # zero stdev → undefined


def test_momentum():
    assert momentum_pct([100, 110], 1) == 0.1
    assert momentum_pct([100], 5) is None
