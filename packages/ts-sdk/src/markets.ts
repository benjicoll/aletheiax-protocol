import { Http, qs } from './http.js';
import type { Candle, Market, MarketId, MarketTrade, OrderBook, Ticker } from './types.js';

/** Public market data — none of these require authentication. */
export class MarketsModule {
  constructor(private readonly http: Http) {}

  list(activeOnly = true): Promise<Market[]> {
    return this.http.get<Market[]>(`/markets${qs({ active_only: activeOnly })}`);
  }

  get(market: MarketId): Promise<Market> {
    return this.http.get<Market>(`/markets/${market}`);
  }

  orderbook(market: MarketId, depth = 20): Promise<OrderBook> {
    return this.http.get<OrderBook>(`/markets/${market}/orderbook${qs({ depth })}`);
  }

  ticker(market: MarketId): Promise<Ticker> {
    return this.http.get<Ticker>(`/markets/${market}/ticker`);
  }

  trades(market: MarketId, limit = 50): Promise<MarketTrade[]> {
    return this.http.get<MarketTrade[]>(`/markets/${market}/trades${qs({ limit })}`);
  }

  candles(market: MarketId, timeframe: string, limit = 300): Promise<{ candles: Candle[] }> {
    return this.http.get<{ candles: Candle[] }>(
      `/markets/${market}/candles${qs({ timeframe, limit })}`,
    );
  }

  funding(market: MarketId): Promise<{
    market_id: string;
    current_rate: string;
    next_funding_time: string;
    time_to_next_funding: number;
  }> {
    return this.http.get(`/markets/${market}/funding`);
  }
}
