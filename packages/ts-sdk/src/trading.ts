import { Http, qs } from './http.js';
import type { Balance, Order, OrderRequest, Position } from './types.js';

/** Trading: orders, positions, balance. All require authentication. */
export class TradingModule {
  constructor(private readonly http: Http) {}

  placeOrder(req: OrderRequest): Promise<Order> {
    return this.http.post<Order>('/trading/orders', {
      market_id: req.market,
      side: req.side,
      order_type: req.type,
      size: req.size,
      price: req.price,
      leverage: req.leverage ?? 1,
      reduce_only: req.reduceOnly ?? false,
    });
  }

  cancelOrder(orderId: string): Promise<{ message: string }> {
    return this.http.delete(`/trading/orders/${orderId}`);
  }

  orders(params: { market?: string; status?: string; limit?: number } = {}): Promise<Order[]> {
    return this.http.get<Order[]>(
      `/trading/orders${qs({ market_id: params.market, status: params.status, limit: params.limit })}`,
    );
  }

  positions(market?: string): Promise<Position[]> {
    return this.http.get<Position[]>(`/trading/positions${qs({ market_id: market })}`);
  }

  /** Close (or partially close) a position with a reduce-only market order. */
  closePosition(positionId: string, size?: string): Promise<{ message: string; close_size: string }> {
    return this.http.post(`/trading/positions/${positionId}/close`, size ? { size } : {});
  }

  balance(): Promise<Balance> {
    return this.http.get<Balance>('/users/me/balance');
  }

  // --- conditional orders ---

  stopLoss(req: { positionId: string; triggerPrice: string; size?: string }): Promise<unknown> {
    return this.http.post('/trading/orders/stop-loss', {
      position_id: req.positionId,
      trigger_price: req.triggerPrice,
      size: req.size,
    });
  }

  takeProfit(req: { positionId: string; triggerPrice: string; size?: string }): Promise<unknown> {
    return this.http.post('/trading/orders/take-profit', {
      position_id: req.positionId,
      trigger_price: req.triggerPrice,
      size: req.size,
    });
  }

  conditionalOrders(): Promise<unknown[]> {
    return this.http.get('/trading/orders/conditional');
  }
}
