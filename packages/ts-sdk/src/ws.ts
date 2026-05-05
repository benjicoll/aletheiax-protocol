import type { OrderBook, Ticker, MarketTrade } from './types.js';

type Handler<T> = (data: T) => void;
type WebSocketCtor = new (url: string) => WebSocket;

export interface WsOptions {
  url: string;
  token?: string;
  /** WebSocket implementation (browsers/Node 22 have a global; older Node passes `ws`). */
  WebSocketImpl?: WebSocketCtor;
  reconnect?: boolean;
}

/**
 * Real-time client for the public market channels and authenticated user
 * channels. Auto-reconnects with backoff and replays subscriptions.
 */
export class WsClient {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private readonly token?: string;
  private readonly Impl: WebSocketCtor;
  private readonly reconnect: boolean;
  private attempts = 0;
  private closedByUser = false;
  private readonly handlers = new Map<string, Set<Handler<unknown>>>();
  private readonly subs = new Set<string>();

  constructor(opts: WsOptions) {
    this.url = opts.url;
    this.token = opts.token;
    this.reconnect = opts.reconnect ?? true;
    const impl = opts.WebSocketImpl ?? (globalThis as { WebSocket?: WebSocketCtor }).WebSocket;
    if (!impl) throw new Error('No WebSocket implementation; pass `WebSocketImpl` (Node < 22).');
    this.Impl = impl;
  }

  connect(): void {
    this.closedByUser = false;
    const url = this.token ? `${this.url}?token=${encodeURIComponent(this.token)}` : this.url;
    const ws = new this.Impl(url);
    this.ws = ws;
    ws.onopen = () => {
      this.attempts = 0;
      for (const channel of this.subs) this.send({ type: 'subscribe', channel });
    };
    ws.onmessage = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data));
        const key = msg.market_id ? `${msg.type}:${msg.market_id}` : msg.type;
        this.emit(key, msg);
        this.emit(msg.type, msg);
      } catch {
        /* ignore malformed frames */
      }
    };
    ws.onclose = () => {
      if (!this.closedByUser && this.reconnect && this.attempts < 6) {
        const delay = Math.min(30_000, 1000 * 2 ** this.attempts++);
        setTimeout(() => this.connect(), delay);
      }
    };
  }

  close(): void {
    this.closedByUser = true;
    this.ws?.close();
  }

  private send(obj: unknown): void {
    if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(obj));
  }

  private emit(key: string, data: unknown): void {
    this.handlers.get(key)?.forEach((h) => h(data));
  }

  private on<T>(key: string, handler: Handler<T>): () => void {
    let set = this.handlers.get(key);
    if (!set) {
      set = new Set();
      this.handlers.set(key, set);
    }
    set.add(handler as Handler<unknown>);
    return () => set?.delete(handler as Handler<unknown>);
  }

  private subscribe(channel: string): void {
    this.subs.add(channel);
    this.send({ type: 'subscribe', channel });
  }

  subscribeOrderbook(market: string, handler: Handler<OrderBook>): () => void {
    this.subscribe(`orderbook:${market}`);
    return this.on(`orderbook_update:${market}`, handler);
  }

  subscribeTicker(market: string, handler: Handler<Ticker>): () => void {
    this.subscribe(`ticker:${market}`);
    return this.on(`ticker:${market}`, handler);
  }

  subscribeTrades(market: string, handler: Handler<MarketTrade>): () => void {
    this.subscribe(`trades:${market}`);
    return this.on(`trade:${market}`, handler);
  }

  /** Authenticated: your position updates (requires a token). */
  subscribePositions(handler: Handler<unknown>): () => void {
    this.subscribe('positions');
    return this.on('position_update', handler);
  }
}
