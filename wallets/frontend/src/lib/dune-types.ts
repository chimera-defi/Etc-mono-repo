/**
 * TypeScript types for Dune Analytics API responses
 * 
 * Based on Dune Analytics API documentation:
 * https://docs.dune.com/api-reference
 */

export interface DuneApiConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface DuneQueryExecution {
  execution_id: string;
  query_id: number;
  state: 'QUERY_STATE_PENDING' | 'QUERY_STATE_EXECUTING' | 'QUERY_STATE_COMPLETED' | 'QUERY_STATE_FAILED' | 'QUERY_STATE_CANCELLED';
  submitted_at: string;
  expires_at: string;
  execution_started_at?: string;
  execution_ended_at?: string;
  result_metadata?: {
    column_names: string[];
    result_set_bytes: number;
    total_row_count: number;
    datapoint_count: number;
    pending_time_millis: number;
    execution_time_millis: number;
  };
}

export interface DuneQueryResult {
  execution_id: string;
  query_id: number;
  state: string;
  submitted_at: string;
  expires_at: string;
  execution_started_at?: string;
  execution_ended_at?: string;
  result: {
    rows: Record<string, unknown>[];
    metadata: {
      column_names: string[];
      result_set_bytes: number;
      total_row_count: number;
      datapoint_count: number;
      pending_time_millis: number;
      execution_time_millis: number;
    };
  };
}

export interface DuneDashboard {
  dashboard_id: number;
  name: string;
  description?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
  is_featured?: boolean;
  is_archived?: boolean;
}

export interface DuneDashboardQuery {
  query_id: number;
  name: string;
  description?: string;
  visualization_settings?: Record<string, unknown>;
}

export interface DuneError {
  error: string;
  message?: string;
}

/**
 * Crypto card data structure from Dune Analytics
 * This will be populated based on actual query results
 */
export interface DuneCryptoCardData {
  // Card identification
  card_name?: string;
  card_provider?: string;
  card_type?: string;
  
  // Chain support
  supported_chains?: string[];
  chain_count?: number;
  
  // Usage metrics
  total_transactions?: number;
  total_volume_usd?: number;
  active_users?: number;
  
  // Time-based data
  date?: string;
  transactions?: number;
  volume_usd?: number;
  users?: number;
  
  // Additional fields (will be discovered from actual data)
  [key: string]: unknown;
}

/**
 * Transformed crypto card data ready for frontend
 */
export interface TransformedDuneCardData {
  cardName: string;
  supportedChains: string[];
  chainCount: number;
  totalTransactions: number | null;
  totalVolumeUsd: number | null;
  activeUsers: number | null;
  chainMetrics: {
    chain: string;
    transactions: number;
    volume: number;
    users: number;
  }[];
  lastUpdated: string;
  source: {
    queryId: number | null;
    dashboardUrl: string;
    lastFetched: string;
  };
}
