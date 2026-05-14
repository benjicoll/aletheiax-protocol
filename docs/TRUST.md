# Trust Model

AletheiaX is built for a skeptical first user — someone who has seen enough "AI trading" vaporware to
distrust a dashboard of pretty numbers. The design answer is **verifiability over claims**: wherever
possible, a statement the platform makes is something the user (or the code) can check, not something
they must believe.

This document states the guarantees plainly, and — just as importantly — states what is **not**
claimed.

---

## What is guaranteed

### 1. Every internal balance is backed by real on-chain funds
Agent capital is credited only after the engine verifies the treasury's actual on-chain USDC covers
all internal balances plus the new grants:

```
on-chain treasury USDC  ≥  Σ(internal balances)  +  pending grants
```

If the backing isn't present, balances are not created. This is enforced in code, re-checked on a
schedule, and logged precisely when unmet.

### 2. Deposits and withdrawals are real on-chain transfers
A deposit is credited only after the backend independently verifies the SPL transfer on-chain — right
mint, right recipient, right signer, right amount — and replays are rejected by signature. A
withdrawal is a real treasury-signed transfer, confirmed on-chain before the ledger is debited, and
blocked if it would undercollateralize open positions.

### 3. The ledger conserves
A margin-conservation invariant holds at all times:

```
margin_locked  ==  Σ(open-order reservations)  +  Σ(open-position margins)
```

Margin cannot leak or be double-spent, because every reserve has a paired release.

### 4. Metrics are measured, never seeded
No agent ships with fabricated performance. Returns, Sharpe, win rate, drawdown, and the equity curve
are all derived from real equity snapshots and closed trades. New agents show `—` until they earn a
record.

### 5. Agent reasoning is published
Every agent decision — including the verbatim text of an LLM's reasoning — is written to a public log
and streamed live. You can watch *why* an agent did what it did, as it happens.

### 6. Risk limits are enforced, not advisory
Leverage caps, position caps, daily-loss stops, and drawdown kill switches are applied by the engine
*before* an order executes — for platform agents and for user allocations alike.

### 7. $ALETHIA benefits come from on-chain holdings
Holder tiers (lower fees, higher leverage, AI-agent access, allocation capacity, agent-publishing
rights) are derived from a wallet's real on-chain $ALETHIA balance — no lock-up, no custody. Anyone
can verify a wallet's holdings and the tier it should receive. See **[TOKEN.md](./TOKEN.md)**.

---

## What is deliberately **not** claimed

Honesty cuts both ways. The platform does not pretend to be more than it is:

- **Not decentralized.** Matching and custody are operated off-chain by the platform today. On-chain
  settlement and verification are roadmap, described as roadmap.
- **$ALETHIA is utility, not an investment.** The token grants real platform utility (fees, leverage,
  access). No financial return, yield, revenue share, or price/supply claim is made — utility, not a
  security pitch.
- **Creator metrics are unverified by default.** Anyone can publish an agent; its self-reported
  numbers are flagged unverified and cannot attract allocations until a real record exists.
- **Past performance is not predictive.** Measured history is honest history — it is not a forecast.
- **Markets can be thin.** With modest agent capital, books are shallow and occasionally one-sided;
  this is shown truthfully (an order can return "no liquidity" between re-quotes) rather than papered
  over.

---

## Current vs roadmap

| Layer | Today | Direction |
|---|---|---|
| Custody & margin | USDC + wETH/wBTC, on-chain verified | on-chain vault program |
| Matching | off-chain low-latency CLOB | settlement-verification path |
| Agent metrics | measured from live platform trading | on-chain verifiable performance proofs |
| User controls | pause, resume, close, hard risk limits | protocol-level policy modules |
| $ALETHIA | on-chain holder utility tiers | governance + coordination layer |

---

## Why "Aletheia"

The Greek *ἀλήθεια* means truth in the sense of **disclosure** — literally "the state of not being
hidden." The platform is named for the standard it holds itself to: the machine should be legible, its
claims checkable, and its limits stated out loud. This repository is part of keeping that promise.
