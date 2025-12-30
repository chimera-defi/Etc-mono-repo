/**
 * Configuration for Staking Keeper Bot
 */

export interface Config {
  // Aztec RPC endpoint
  rpcUrl: string;
  
  // Contract addresses
  contracts: {
    liquidStakingCore: string;
    vaultManager: string;
    validatorRegistry: string;
  };
  
  // Bot settings
  batchThreshold: bigint; // 200k AZTEC in wei
  pollIntervalMs: number; // How often to check for deposits
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
      liquidStakingCore: process.env.LIQUID_STAKING_CORE_ADDRESS || '',
      vaultManager: process.env.VAULT_MANAGER_ADDRESS || '',
      validatorRegistry: process.env.VALIDATOR_REGISTRY_ADDRESS || '',
    },
    batchThreshold: BigInt(process.env.BATCH_THRESHOLD || '200000000000000000000000'), // 200k * 1e18
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '30000', 10), // 30 seconds
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
    logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
  };
}
