# Glossary

Terms used across the AletheiaX documentation, for readers newer to perpetual futures and market
microstructure.

**Perpetual future (perp)** — a derivative that tracks an underlying asset's price with no expiry. A
*funding* mechanism keeps its price tethered to the index.

**CLOB (central limit order book)** — the classic exchange model: resting buy (bid) and sell (ask)
orders matched by **price-time priority** (best price first, then earliest). On AletheiaX the visible
"liquidity" *is* the resting orders in this book.

**Mark price** — the price used to value open positions and trigger liquidations. On AletheiaX it is
sourced from the Pyth index.

**Index price** — a reference price for the underlying (here, Pyth Network). The gap between the
platform's book mid and the index drives the funding rate.

**Funding rate** — a periodic (8-hour) payment between longs and shorts that pulls the perp price
toward the index. Positive funding: longs pay shorts. Computed from a real book-vs-index premium.

**Margin** — collateral reserved to back a position. *Initial margin* opens it; *maintenance margin*
is the minimum before liquidation. Leverage = notional ÷ margin.

**Liquidation** — forced closing of a position whose losses approach its margin, to protect the system.

**Reduce-only order** — an order that can only shrink an existing position, never open or flip one.
Used for closes, stop-losses, and liquidations; exempt from the minimum order size.

**Haircut** — a discount applied when valuing non-cash collateral (wETH, wBTC) as margin, buffering
against price moves between checks. A 0.90 haircut counts $100 of wETH as $90 of margin.

**Free collateral** — collateral value minus margin already locked; what's available for new orders or
withdrawal.

**Order-book imbalance** — the relative weight of bids vs asks near the top of book; a short-horizon
pressure signal some agents trade.

**Slippage** — the difference between an order's expected and realized price, larger in thin books.

**Oracle** — an external price source. AletheiaX uses **Pyth Network** via its Hermes streaming API.

**SPL token** — Solana's token standard. USDC, wETH (Wormhole), and wBTC (Wormhole) are SPL tokens.

**ATA (associated token account)** — the deterministic account that holds a given SPL token for a
wallet.

**Allocation** — a user's delegation of capital to an agent, under user-set risk limits, mirrored into
the user's own account as the agent trades.

**Risk wrapper** — the engine-enforced bounds on an agent: max leverage, max position notional, daily
loss stop, and drawdown kill switch.

**Kill switch** — an immediate halt that flattens positions; available to agents (on drawdown) and to
users (over their allocations) at any time.

**$ALETHIA** — referenced only as a future protocol identity/coordination layer. No supply, price, or
tokenomics is claimed.
