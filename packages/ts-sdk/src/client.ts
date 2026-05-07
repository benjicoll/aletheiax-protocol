import { Http } from './http.js';
import { AuthModule } from './auth.js';
import { MarketsModule } from './markets.js';
import { TradingModule } from './trading.js';
import { AgentsModule } from './agents.js';
import { AlethiaModule } from './alethia.js';
import { WsClient, type WsOptions } from './ws.js';

export interface AletheiaClientOptions {
  /** Platform API base URL, e.g. https://api.aletheiax.xyz */
  baseUrl: string;
  /** Override the WebSocket URL (defaults to baseUrl with ws/wss + /ws). */
  wsUrl?: string;
  /** Pre-set a JWT (skip auth.login). */
  token?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

function deriveWsUrl(baseUrl: string): string {
  return baseUrl.replace(/^http/, 'ws').replace(/\/+$/, '') + '/ws';
}

/**
 * The AletheiaX client. Composes typed modules over a shared HTTP layer:
 *
 *   client.markets   public market data
 *   client.auth      wallet-signature login
 *   client.trading   orders, positions, balance        (auth)
 *   client.agents    marketplace + allocations         (browse public, allocate auth)
 *   client.alethia   $ALETHIA holder tiers
 *   client.ws()      real-time streams
 *
 * @example
 * const client = new AletheiaClient({ baseUrl: 'https://api.aletheiax.xyz' });
 * const book = await client.markets.orderbook('SOL-PERP');
 */
export class AletheiaClient {
  readonly http: Http;
  readonly auth: AuthModule;
  readonly markets: MarketsModule;
  readonly trading: TradingModule;
  readonly agents: AgentsModule;
  readonly alethia: AlethiaModule;

  private readonly wsUrl: string;

  constructor(opts: AletheiaClientOptions) {
    this.http = new Http({ baseUrl: opts.baseUrl, timeoutMs: opts.timeoutMs, fetchImpl: opts.fetchImpl });
    if (opts.token) this.http.setToken(opts.token);
    this.wsUrl = opts.wsUrl ?? deriveWsUrl(opts.baseUrl);
    this.auth = new AuthModule(this.http);
    this.markets = new MarketsModule(this.http);
    this.trading = new TradingModule(this.http);
    this.agents = new AgentsModule(this.http);
    this.alethia = new AlethiaModule(this.http);
  }

  /** Create a real-time client; the current token is used for user channels. */
  ws(options?: Pick<WsOptions, 'WebSocketImpl' | 'reconnect'>): WsClient {
    return new WsClient({
      url: this.wsUrl,
      token: this.http.getToken() ?? undefined,
      WebSocketImpl: options?.WebSocketImpl,
      reconnect: options?.reconnect,
    });
  }
}
