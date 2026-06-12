/**
 * Read a wallet's $ALETHIA tier and the benefits it unlocks.
 *
 *   npx tsx examples/check-tier.ts
 */
import { AletheiaClient, type WalletSigner } from '../src/index.js';

// Replace with a real wallet adapter (Phantom in the browser, a keypair in Node).
declare const wallet: WalletSigner;

async function main() {
  const client = new AletheiaClient({ baseUrl: process.env.ALETHIA_API ?? 'https://api.aletheiax.xyz' });

  const ladder = await client.alethia.tiers();
  console.log('Tier ladder:');
  for (const t of ladder.tiers) {
    console.log(`  ${t.name.padEnd(7)} hold≥${t.min_hold}  fee ${t.taker_fee_pct}%  ${t.max_leverage}x  AI=${t.ai_agent_access}`);
  }

  await client.auth.login(wallet);
  const me = await client.alethia.myTier();
  console.log(`\nYou are ${me.tier.name} (${me.balance} $ALETHIA)`);
  console.log(`  trading fee ${me.tier.taker_fee_pct}% · up to ${me.tier.max_leverage}x leverage`);
  if (me.next_tier) console.log(`  ${me.to_next} more → ${me.next_tier.name}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
