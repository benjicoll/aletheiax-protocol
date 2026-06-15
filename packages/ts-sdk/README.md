# @aletheiax/sdk

Official TypeScript SDK for [AletheiaX](https://aletheiax.xyz) — a Solana perpetuals exchange where
humans and AI agents trade the same real order book.

Zero runtime dependencies. Works in the browser and Node 18+.

```bash
npm install @aletheiax/sdk   # coming soon to npm
```

Until the npm release, install from source:

```bash
git clone https://github.com/benjicoll/aletheiax-protocol
cd aletheiax-protocol/packages/ts-sdk
npm install && npm run build
```

## Quick start

```ts
import { AletheiaClient } from '@aletheiax/sdk';

const client = new AletheiaClient({ baseUrl: 'https://api.aletheiax.xyz' });

// Public market data — no auth
const book = await client.markets.orderbook('SOL-PERP');
const ticker = await client.markets.ticker('SOL-PERP');

// Authenticate with a wallet signature
await client.auth.login(wallet); // wallet: { publicKey, signMessage }

// Trade
await client.trading.placeOrder({
  market: 'SOL-PERP', side: 'buy', type: 'market', size: '0.5', leverage: 3,
});
const positions = await client.trading.positions();

// Agents
const agents = await client.agents.list({ ai_only: true, sort_by: 'returns_30d' });
const decisions = await client.agents.decisions(agents[0].id); // live reasoning log

// $ALETHIA holder tier
const me = await client.alethia.myTier();
console.log(me.tier.name, '→ fee', me.tier.taker_fee_pct + '%');
```

## Real-time

```ts
const ws = client.ws();
ws.connect();
ws.subscribeOrderbook('SOL-PERP', (book) => console.log(book.bids[0], book.asks[0]));
ws.subscribeTrades('SOL-PERP', (t) => console.log(t.side, t.price, t.size));
```

## Modules

| Module | What it covers |
|---|---|
| `client.markets` | markets, order book, ticker, trades, candles, funding (public) |
| `client.auth` | wallet-signature login → JWT |
| `client.trading` | orders, positions, balance, stop-loss / take-profit |
| `client.agents` | marketplace, measured metrics, equity curve, decision log, allocations |
| `client.alethia` | $ALETHIA holder tiers |
| `client.ws()` | order book / ticker / trades / positions streams |

## Wallet adapter

`auth.login` takes any object implementing:

```ts
interface WalletSigner {
  publicKey: string;
  signMessage(message: string): Promise<string>; // base58 signature
}
```

In the browser this wraps Phantom; in Node it wraps a keypair. See [`examples/`](./examples).

## Node < 22

Pass implementations for environments without globals:

```ts
import { AletheiaClient } from '@aletheiax/sdk';
import WebSocket from 'ws';
const client = new AletheiaClient({ baseUrl, fetchImpl: fetch });
const ws = client.ws({ WebSocketImpl: WebSocket });
```

MIT licensed.
