import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  aztecRpcUrl: string;
  liquidStakingCoreAddress: string;
  vaultManagerAddress: string;
  batchThreshold: bigint;
  pollingInterval: number;
  privateKey: string;
  metricsPort: number;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export function loadConfig(): Config {
  return {
    aztecRpcUrl: getEnv('AZTEC_RPC_URL', 'http://localhost:8080'),
    liquidStakingCoreAddress: getEnv('LIQUID_STAKING_CORE_ADDRESS', '0x0000000000000000000000000000000000000001'),
    vaultManagerAddress: getEnv('VAULT_MANAGER_ADDRESS', '0x0000000000000000000000000000000000000002'),
    batchThreshold: BigInt(getEnv('BATCH_THRESHOLD', '200000000000000000000000')), // 200k AZTEC
    pollingInterval: parseInt(getEnv('POLLING_INTERVAL', '60000'), 10), // 1 minute
    privateKey: getEnv('BOT_PRIVATE_KEY', ''),
    metricsPort: parseInt(getEnv('METRICS_PORT', '9090'), 10),
  };
}
