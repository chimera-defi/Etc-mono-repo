import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  aztecRpcUrl: string;
  withdrawalQueueAddress: string;
  liquidStakingCoreAddress: string;
  vaultManagerAddress: string;
  pollingInterval: number;
  minLiquidityBuffer: bigint;
  privateKey: string;
  metricsPort: number;
}

function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export function loadConfig(): Config {
  return {
    aztecRpcUrl: getEnv('AZTEC_RPC_URL', 'http://localhost:8080'),
    withdrawalQueueAddress: getEnv('WITHDRAWAL_QUEUE_ADDRESS', '0x0000000000000000000000000000000000000008'),
    liquidStakingCoreAddress: getEnv('LIQUID_STAKING_CORE_ADDRESS', '0x0000000000000000000000000000000000000001'),
    vaultManagerAddress: getEnv('VAULT_MANAGER_ADDRESS', '0x0000000000000000000000000000000000000002'),
    pollingInterval: parseInt(getEnv('POLLING_INTERVAL', '300000'), 10), // 5 minutes
    minLiquidityBuffer: BigInt(getEnv('MIN_LIQUIDITY_BUFFER', '50000000000000000000000')), // 50k AZTEC
    privateKey: getEnv('BOT_PRIVATE_KEY', ''),
    metricsPort: parseInt(getEnv('METRICS_PORT', '9092'), 10),
  };
}
