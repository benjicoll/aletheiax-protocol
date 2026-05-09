import { describe, it, expect, vi } from 'vitest';
import { AletheiaClient } from '../src/index.js';
import { AletheiaApiError } from '../src/errors.js';

function mockFetch(status: number, body: unknown): typeof fetch {
  return vi.fn(async () =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  ) as unknown as typeof fetch;
}

describe('AletheiaClient', () => {
  it('fetches public market data without auth', async () => {
    const client = new AletheiaClient({
      baseUrl: 'https://api.test',
      fetchImpl: mockFetch(200, { market_id: 'SOL-PERP', bids: [], asks: [], timestamp: 't' }),
    });
    const book = await client.markets.orderbook('SOL-PERP');
    expect(book.market_id).toBe('SOL-PERP');
  });

  it('attaches the bearer token after login', async () => {
    const calls: RequestInit[] = [];
    const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
      calls.push(init);
      const path = String(_url);
      if (path.endsWith('/auth/challenge')) {
        return new Response(JSON.stringify({ message: 'sign me', nonce: 'n', timestamp: 1 }), { status: 200 });
      }
      if (path.endsWith('/auth/verify')) {
        return new Response(JSON.stringify({ token: 'jwt123', wallet_address: 'W', is_new_user: false }), { status: 200 });
      }
      return new Response(JSON.stringify([]), { status: 200 });
    }) as unknown as typeof fetch;

    const client = new AletheiaClient({ baseUrl: 'https://api.test', fetchImpl });
    const addr = await client.auth.login({ publicKey: 'W', signMessage: async () => 'sig' });
    expect(addr).toBe('W');
    expect(client.auth.isAuthenticated).toBe(true);

    await client.trading.positions();
    const last = calls[calls.length - 1];
    expect((last.headers as Record<string, string>)['Authorization']).toBe('Bearer jwt123');
  });

  it('throws a typed error with the API detail', async () => {
    const client = new AletheiaClient({
      baseUrl: 'https://api.test',
      fetchImpl: mockFetch(400, { detail: 'Insufficient collateral' }),
    });
    await expect(client.trading.placeOrder({ market: 'SOL-PERP', side: 'buy', type: 'market', size: '1' }))
      .rejects.toMatchObject({ status: 400, message: 'Insufficient collateral' });
  });

  it('formats FastAPI validation arrays', () => {
    const err = new AletheiaApiError(422, [{ msg: 'size must be positive' }, { msg: 'bad market' }]);
    expect(err.message).toBe('size must be positive; bad market');
  });
});
