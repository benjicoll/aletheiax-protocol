/**
 * Stream the live order book and place a small market order.
 *
 *   ALETHIA_API=https://api.aletheiax.xyz npx tsx examples/stream-and-trade.ts
 */
import { AletheiaClient, type WalletSigner } from '../src/index.js';

declare const wallet: WalletSigner; // browser: Phantom; Node: a keypair adapter

async function main() {
  const client = new AletheiaClient({ baseUrl: process.env.ALETHIA_API ?? 'https://api.aletheiax.xyz' });

  // 1. public data, no auth
  const market = 'SOL-PERP';
  const ticker = await client.markets.ticker(market);
  console.log(`${market} last ${ticker.last_price} (${ticker.price_change_pct_24h}% 24h)`);

  // 2. live book stream
  const ws = client.ws();
  ws.connect();
  ws.subscribeOrderbook(market, (book) => {
    console.log('best bid/ask', book.bids[0]?.price, '/', book.asks[0]?.price);
  });

  // 3. authenticated trade
  await client.auth.login(wallet);
  const order = await client.trading.placeOrder({
    market,
    side: 'buy',
    type: 'market',
    size: '0.5',
    leverage: 3,
  });
  console.log('order', order.status, 'filled', order.filled_size);

  setTimeout(() => ws.close(), 10_000);
}

main().catch(console.error);
