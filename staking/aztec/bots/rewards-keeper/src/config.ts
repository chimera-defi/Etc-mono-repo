/**
 * Configuration for Rewards Keeper Bot
 */

export interface Config {
  // Aztec RPC endpoint
  rpcUrl: string;
  
  // Contract addresses
  contracts: {
    rewardsManager: string;
    vaultManager: string;
    liquidStakingCore: string;
  };
  
  // Bot settings
  claimIntervalMs: number; // How often to claim rewards (default: 24 hours)
  maxRetries: number;
  
  // Metrics
  metricsPort: number;
  
  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export function loadConfig(): Config {
  return {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8080',
    contracts: {
      rewardsManager: process.env.REWARDS_MANAGER_ADDRESS || '',
      vaultManager: process.env.VAULT_MANAGER_ADDRESS || '',
      liquidStakingCore: process.env.LIQUID_STAKING_CORE_ADDRESS || '',
    },
    claimIntervalMs: parseInt(process.env.CLAIM_INTERVAL_MS || '86400000', 10), // 24 hours default
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    metricsPort: parseInt(process.env.METRICS_PORT || '9091', 10),
    logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
  };
}
