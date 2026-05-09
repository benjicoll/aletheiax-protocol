import { Http, qs } from './http.js';
import type {
  Agent,
  AgentDecision,
  AgentEquityPoint,
  Allocation,
  AllocationConfig,
} from './types.js';

export interface AgentFilters {
  strategy_type?: string;
  risk_level?: 'low' | 'medium' | 'high';
  ai_only?: boolean;
  sort_by?: 'returns_30d' | 'sharpe_ratio' | 'total_pnl' | 'total_aum' | 'created_at';
  limit?: number;
  offset?: number;
}

/** Agent marketplace: browse agents, read measured metrics, manage allocations. */
export class AgentsModule {
  constructor(private readonly http: Http) {}

  list(filters: AgentFilters = {}): Promise<Agent[]> {
    return this.http.get<Agent[]>(`/agents${qs({ ...filters })}`);
  }

  get(agentId: string): Promise<Agent> {
    return this.http.get<Agent>(`/agents/${agentId}`);
  }

  /** Measured per-period metrics (7d/30d/90d/all) — empty until the agent has traded. */
  metrics(agentId: string): Promise<unknown[]> {
    return this.http.get(`/agents/${agentId}/metrics`);
  }

  /** The agent's real equity curve (periodic on-chain-valued snapshots). */
  equity(agentId: string, days = 30): Promise<{ points: AgentEquityPoint[] }> {
    return this.http.get(`/agents/${agentId}/equity${qs({ days })}`);
  }

  /** The agent's live decision log — includes verbatim LLM reasoning for AI agents. */
  decisions(agentId: string, limit = 50): Promise<AgentDecision[]> {
    return this.http.get<AgentDecision[]>(`/agents/${agentId}/decisions${qs({ limit })}`);
  }

  // --- allocations (authenticated) ---

  allocate(config: AllocationConfig): Promise<Allocation> {
    return this.http.post<Allocation>('/agents/allocations', config);
  }

  myAllocations(status?: 'active' | 'paused' | 'closed'): Promise<Allocation[]> {
    return this.http.get<Allocation[]>(`/agents/allocations/me${qs({ status })}`);
  }

  pause(allocationId: string): Promise<{ message: string }> {
    return this.http.post(`/agents/allocations/${allocationId}/pause`);
  }

  resume(allocationId: string): Promise<{ message: string }> {
    return this.http.post(`/agents/allocations/${allocationId}/resume`);
  }

  /** Kill switch: close all open positions for an allocation immediately. */
  closeAllPositions(allocationId: string): Promise<{ message: string; closed_count: number }> {
    return this.http.post(`/agents/allocations/${allocationId}/close-positions`);
  }

  close(allocationId: string): Promise<{ message: string; final_value: string }> {
    return this.http.delete(`/agents/allocations/${allocationId}`);
  }
}
