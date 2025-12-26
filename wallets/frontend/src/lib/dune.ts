/**
 * Dune Analytics API Client
 * 
 * Provides functions to fetch data from Dune Analytics dashboards and queries.
 * Requires DUNE_API_KEY environment variable to be set.
 * 
 * Documentation: https://docs.dune.com/api-reference
 */

import type {
  DuneApiConfig,
  DuneQueryExecution,
  DuneQueryResult,
  DuneDashboard,
  DuneDashboardQuery,
  DuneError,
  DuneCryptoCardData,
  TransformedDuneCardData,
} from './dune-types';

const DEFAULT_BASE_URL = 'https://api.dune.com/api/v1';

/**
 * Get Dune API configuration from environment variables
 */
function getDuneConfig(): DuneApiConfig | null {
  const apiKey = process.env.DUNE_API_KEY;
  
  if (!apiKey) {
    console.warn('DUNE_API_KEY not set. Dune Analytics integration will be disabled.');
    return null;
  }
  
  return {
    apiKey,
    baseUrl: process.env.DUNE_API_BASE_URL || DEFAULT_BASE_URL,
  };
}

/**
 * Make authenticated request to Dune API
 */
async function duneRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getDuneConfig();
  
  if (!config) {
    throw new Error('Dune API key not configured. Set DUNE_API_KEY environment variable.');
  }
  
  const url = `${config.baseUrl}${endpoint}`;
  const headers = {
    'X-Dune-API-Key': config.apiKey,
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error: DuneError = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || error.error || `Dune API error: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Execute a Dune query
 */
export async function executeDuneQuery(
  queryId: number,
  parameters?: Record<string, unknown>
): Promise<DuneQueryExecution> {
  const body = parameters ? { query_parameters: parameters } : {};
  
  return duneRequest<DuneQueryExecution>(`/query/${queryId}/execute`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Get query execution status
 */
export async function getQueryExecutionStatus(
  executionId: string
): Promise<DuneQueryExecution> {
  return duneRequest<DuneQueryExecution>(`/execution/${executionId}/status`);
}

/**
 * Get query results
 */
export async function getQueryResults(
  executionId: string
): Promise<DuneQueryResult> {
  return duneRequest<DuneQueryResult>(`/execution/${executionId}/results`);
}

/**
 * Get dashboard information
 */
export async function getDashboard(dashboardId: number): Promise<DuneDashboard> {
  return duneRequest<DuneDashboard>(`/dashboard/${dashboardId}`);
}

/**
 * Get queries in a dashboard
 */
export async function getDashboardQueries(
  dashboardId: number
): Promise<DuneDashboardQuery[]> {
  return duneRequest<DuneDashboardQuery[]>(`/dashboard/${dashboardId}/queries`);
}

/**
 * Poll for query results until completion
 * 
 * @param executionId - The execution ID from executeDuneQuery
 * @param maxWaitTime - Maximum time to wait in milliseconds (default: 5 minutes)
 * @param pollInterval - Time between polls in milliseconds (default: 2 seconds)
 */
export async function pollQueryResults(
  executionId: string,
  maxWaitTime = 5 * 60 * 1000,
  pollInterval = 2000
): Promise<DuneQueryResult> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const status = await getQueryExecutionStatus(executionId);
    
    if (status.state === 'QUERY_STATE_COMPLETED') {
      return getQueryResults(executionId);
    }
    
    if (status.state === 'QUERY_STATE_FAILED' || status.state === 'QUERY_STATE_CANCELLED') {
      throw new Error(`Query execution failed with state: ${status.state}`);
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error(`Query execution timed out after ${maxWaitTime}ms`);
}

/**
 * Execute a query and wait for results
 * 
 * Convenience function that combines executeDuneQuery and pollQueryResults
 */
export async function executeQueryAndWait(
  queryId: number,
  parameters?: Record<string, unknown>,
  maxWaitTime?: number
): Promise<DuneQueryResult> {
  const execution = await executeDuneQuery(queryId, parameters);
  return pollQueryResults(execution.execution_id, maxWaitTime);
}

/**
 * Transform Dune query results to frontend format
 * 
 * This function maps raw Dune data to our TransformedDuneCardData format.
 * The exact mapping will depend on the actual query structure.
 */
export function transformDuneCardData(
  rawData: DuneCryptoCardData[],
  queryId: number | null,
  dashboardUrl: string
): TransformedDuneCardData[] {
  // Group by card name
  const cardMap = new Map<string, TransformedDuneCardData>();
  
  for (const row of rawData) {
    const cardName = (row.card_name || row.card_provider || 'Unknown').toString();
    
    if (!cardMap.has(cardName)) {
      cardMap.set(cardName, {
        cardName,
        supportedChains: [],
        chainCount: 0,
        totalTransactions: null,
        totalVolumeUsd: null,
        activeUsers: null,
        chainMetrics: [],
        lastUpdated: new Date().toISOString(),
        source: {
          queryId,
          dashboardUrl,
          lastFetched: new Date().toISOString(),
        },
      });
    }
    
    const card = cardMap.get(cardName)!;
    
    // Extract chain information
    if (row.supported_chains && Array.isArray(row.supported_chains)) {
      const chains = row.supported_chains.map(c => c.toString());
      const uniqueChains = new Set([...card.supportedChains, ...chains]);
      card.supportedChains = Array.from(uniqueChains);
      card.chainCount = card.supportedChains.length;
    } else if (row.chain_count) {
      card.chainCount = Number(row.chain_count);
    }
    
    // Extract metrics
    if (row.total_transactions !== undefined) {
      card.totalTransactions = Number(row.total_transactions) || null;
    }
    if (row.total_volume_usd !== undefined) {
      card.totalVolumeUsd = Number(row.total_volume_usd) || null;
    }
    if (row.active_users !== undefined) {
      card.activeUsers = Number(row.active_users) || null;
    }
    
    // Extract chain-specific metrics
    if (row.date && row.chain) {
      const chain = row.chain.toString();
      card.chainMetrics.push({
        chain,
        transactions: Number(row.transactions) || 0,
        volume: Number(row.volume_usd || row.volume) || 0,
        users: Number(row.users) || 0,
      });
    }
  }
  
  return Array.from(cardMap.values());
}

/**
 * Check if Dune API is configured
 */
export function isDuneConfigured(): boolean {
  return !!process.env.DUNE_API_KEY;
}
