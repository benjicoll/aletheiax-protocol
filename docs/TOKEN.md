# $ALETHIA — Holder Utility

$ALETHIA is the platform token of AletheiaX. Its purpose is **utility**: holding it improves how you
use the exchange. Benefits are derived directly from a wallet's **on-chain balance** — no lock-up, no
deposit, no custody. The platform reads your balance and assigns a tier; the tier changes your fees,
leverage, access, and agent-publishing rights in real time.

> $ALETHIA is a utility token, not an investment. This document describes platform mechanics. It does
> not promise financial return, yield, revenue share, or price appreciation.

---

## Holder tiers

Your tier is the highest one whose threshold your wallet meets. Cross a threshold and the benefits
apply immediately on your next action.

| Tier | Hold ≥ | Trading fee | Max leverage | AI agents | Allocation capacity |
|---|---|---|---|---|---|
| **Base** | — | 0.10% | 20× | — | $250 |
| **Holder** | 1,000 | 0.08% | 40× | ✓ | $2,500 |
| **Pro** | 10,000 | 0.05% | 75× | ✓ | $25,000 |
| **Prime** | 100,000 | 0.03% | 100× | ✓ | $1,000,000 |

*Thresholds are configurable and will be tuned to the token's supply at launch.*

---

## What each benefit means

### 1. Lower trading fees
The taker fee scales from **0.10% down to 0.03%** with your tier. The discount is applied **per fill,
inside the settlement engine** — it is a real reduction in what you pay, not a rebate you have to
claim. Active traders feel this directly.

### 2. Higher leverage caps
Base wallets trade up to 20×; Prime wallets up to **100×**. The cap is enforced at order placement.
(Higher leverage means higher liquidation risk — the cap is a ceiling, not a recommendation.)

### 3. Access to AI agents
Allocating capital to the platform's **LLM-driven AI agents** requires a holder tier (Holder+).
Algorithmic agents remain open to everyone; the AI desk is a holder benefit.

### 4. Allocation capacity
Your total capital allocated across agents is capped by tier — from **$250 at Base to $1M at Prime**
— so larger allocators are holders.

### 5. Publish your own agent (staking sink)
Publishing an agent to the marketplace requires **holding at least the Holder threshold** of
$ALETHIA. This is skin-in-the-game and anti-spam: creators have standing in the ecosystem. It is a
genuine demand sink for the token, tied to real platform activity rather than emissions.

---

## How it works (verifiable)

1. You connect your wallet.
2. The platform reads your **on-chain $ALETHIA balance** (works for classic SPL and Token-2022 mints).
3. It resolves your tier and applies the benefits to fees, leverage, access, and publishing.
4. The result is shown live in the app (your tier, balance, and progress to the next tier).

Because tiers come from your real on-chain balance, there is nothing to trust: anyone can verify a
wallet's holdings and the tier it should receive. Move tokens in or out and your tier follows.

You can read your own tier programmatically:

```ts
import { AletheiaClient } from '@aletheiax/sdk';

const client = new AletheiaClient({ baseUrl: 'https://api.aletheiax.xyz' });
await client.auth.login(wallet);                 // wallet-signature login
const me = await client.alethia.myTier();
console.log(me.tier.name, me.balance, '→ fee', me.tier.taker_fee_pct + '%');
```

```python
from aletheiax import AletheiaClient

client = AletheiaClient(base_url="https://api.aletheiax.xyz")
client.login(wallet)
me = client.alethia.my_tier()
print(me.tier.name, me.balance, "→", me.tier.max_leverage, "x leverage")
```

---

## Design principles

- **Utility over yield.** Benefits are discounts and access — real platform mechanics — not a promise
  of return. This is intentional, and keeps the token's role clear.
- **No custody.** Holding qualifies you; the platform never takes or locks your tokens for tiers.
- **On-chain truth.** Your balance is the source of truth, readable by anyone.
- **Honest limits.** No supply, price, or financial-return claim is made here.
