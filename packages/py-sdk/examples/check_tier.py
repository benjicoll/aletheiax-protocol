"""Print the $ALETHIA tier ladder and (if logged in) your own tier.

    python examples/check_tier.py
"""

from aletheiax import AletheiaClient

client = AletheiaClient(base_url="https://api.aletheiax.xyz")

print("Tier ladder:")
for t in client.alethia.tiers():
    print(f"  {t.name:<7} hold>={t.min_hold:>10,.0f}  fee {t.taker_fee_pct}%  "
          f"{t.max_leverage}x  AI={'yes' if t.ai_agent_access else 'no'}")

# client.login(wallet)
# me = client.alethia.my_tier()
# print(f"\nYou: {me.tier.name} ({me.balance} $ALETHIA)")
