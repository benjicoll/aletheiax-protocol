/**
 * Wire types for the AletheiaX API. Monetary and size fields are strings to
 * preserve precision (parse with a decimal library if you need arithmetic).
 */

export type Side = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type MarketId = string; // e.g. "BTC-PERP"

export interface Market {
  id: MarketId;
  base_asset: string;
  quote_asset: string;
  tick_size: string;
  lot_size: string;
  max_leverage: number;
  maintenance_margin: string;
  initial_margin: string;
  is_active: boolean;
  mark_price?: string;
  index_price?: string;
  funding_rate?: string;
  volume_24h: string;
  open_interest: string;
}

export interface OrderBookLevel {
  price: string;
  size: string;
  num_orders: number;
}

export interface OrderBook {
  market_id: MarketId;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: string;
}

export interface Ticker {
  market_id: MarketId;
  last_price: string;
  price_change_24h: string;
  price_change_pct_24h: string;
  high_24h: string;
  low_24h: string;
  volume_24h: string;
  timestamp: string;
}

export interface Candle {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface MarketTrade {
  id: string;
  market_id: MarketId;
  price: string;
  size: string;
  side: Side;
  timestamp: string;
}

export interface OrderRequest {
  market: MarketId;
  side: Side;
  type: OrderType;
  size: string;
  price?: string;
  leverage?: number;
  reduceOnly?: boolean;
}

export interface Order {
  id: string;
  market_id: MarketId;
  side: Side;
  order_type: OrderType;
  price?: string;
  size: string;
  filled_size: string;
  status: string;
  created_at: string;
}

export interface Position {
  id: string;
  market_id: MarketId;
  side: 'long' | 'short';
  size: string;
  entry_price: string;
  mark_price: string;
  unrealized_pnl: string;
  leverage: number;
  liquidation_price: string;
  margin: string;
}

export interface TokenBalance {
  token: string;
  amount: string;
  price: string;
  usd_value: string;
  collateral_value: string;
}

export interface Balance {
  available: string;
  locked: string;
  total: string;
  usdc_balance: string;
  unrealized_pnl: string;
  tokens: TokenBalance[];
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  strategy_type: string;
  risk_level: 'low' | 'medium' | 'high';
  allowed_markets: string[];
  min_allocation: string;
  management_fee: string;
  performance_fee: string;
  total_aum?: string;
  total_pnl?: string;
  returns_7d?: string | null;
  returns_30d?: string | null;
  sharpe_ratio?: string | null;
  win_rate?: string | null;
  max_drawdown?: string | null;
  total_trades?: number;
  is_platform?: boolean;
  is_ai?: boolean;
  model?: string | null;
  allocations_enabled?: boolean;
  runtime_status?: 'active' | 'paused_risk' | 'kill_switch' | 'inactive';
}

export interface AgentEquityPoint {
  timestamp: string;
  equity: string;
  unrealized_pnl: string;
}

export interface AgentDecision {
  id: string;
  market?: string | null;
  action: string;
  reason?: string | null;
  executed: boolean;
  error?: string | null;
  detail?: Record<string, unknown> | null;
  created_at: string;
}

export interface AllocationConfig {
  agent_id: string;
  capital: string;
  max_leverage: number;
  max_position_size: string;
  max_daily_loss: string;
  max_drawdown: string;
  allowed_markets?: string[];
}

export interface Allocation {
  id: string;
  agent_id: string;
  agent_name: string;
  capital: string;
  current_value: string;
  unrealized_pnl: string;
  status: 'active' | 'paused' | 'closed';
  created_at: string;
}

export interface AlethiaTier {
  key: string;
  name: string;
  min_hold: string;
  taker_fee_pct: string;
  max_leverage: number;
  ai_agent_access: boolean;
  max_allocation_usd: string;
  creator_stake: string;
}

export interface MyAlethiaTier {
  enabled: boolean;
  balance: string;
  tier: AlethiaTier;
  next_tier: AlethiaTier | null;
  to_next: string | null;
}

/** A minimal wallet adapter the SDK uses for signature login. */
export interface WalletSigner {
  publicKey: string;
  /** Sign a UTF-8 message, returning a base58 signature. */
  signMessage(message: string): Promise<string>;
}
