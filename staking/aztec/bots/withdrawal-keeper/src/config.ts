/**
 * Configuration for Withdrawal Keeper Bot
 */

export interface Config {
  // Aztec RPC endpoint
  rpcUrl: string;
  
  // Contract addresses
  contracts: {
    withdrawalQueue: string;
    liquidStakingCore: string;
    vaultManager: string;
  };
  
  // Bot settings
  pollIntervalMs: number; // How often to check for claimable withdrawals
  maxRetries: number;
  minLiquidityBuffer: bigint; // Minimum liquidity buffer before triggering unstaking
  
  // Metrics
  metricsPort: number;
  
  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export function loadConfig(): Config {
  return {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8080',
    contracts: {
      withdrawalQueue: process.env.WITHDRAWAL_QUEUE_ADDRESS || '',
      liquidStakingCore: process.env.LIQUID_STAKING_CORE_ADDRESS || '',
      vaultManager: process.env.VAULT_MANAGER_ADDRESS || '',
    },
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '60000', 10), // 1 minute default
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    minLiquidityBuffer: BigInt(process.env.MIN_LIQUIDITY_BUFFER || '100000000000000000000000'), // 100k AZTEC default
    metricsPort: parseInt(process.env.METRICS_PORT || '9092', 10),
    logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
  };
}
