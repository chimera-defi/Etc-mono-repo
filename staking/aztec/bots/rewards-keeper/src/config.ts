import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  aztecRpcUrl: string;
  rewardsManagerAddress: string;
  stakedAztecTokenAddress: string;
  validatorRegistryAddress: string;
  claimInterval: number;
  protocolFeePercent: number;
  treasuryAddress: string;
  privateKey: string;
  metricsPort: number;
}

function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export function loadConfig(): Config {
  return {
    aztecRpcUrl: getEnv('AZTEC_RPC_URL', 'http://localhost:8080'),
    rewardsManagerAddress: getEnv('REWARDS_MANAGER_ADDRESS', '0x0000000000000000000000000000000000000004'),
    stakedAztecTokenAddress: getEnv('STAKED_AZTEC_TOKEN_ADDRESS', '0x0000000000000000000000000000000000000005'),
    validatorRegistryAddress: getEnv('VALIDATOR_REGISTRY_ADDRESS', '0x0000000000000000000000000000000000000006'),
    claimInterval: parseInt(getEnv('CLAIM_INTERVAL', '3600000'), 10), // 1 hour default
    protocolFeePercent: parseInt(getEnv('PROTOCOL_FEE_PERCENT', '10'), 10),
    treasuryAddress: getEnv('TREASURY_ADDRESS', '0x0000000000000000000000000000000000000007'),
    privateKey: getEnv('BOT_PRIVATE_KEY', ''),
    metricsPort: parseInt(getEnv('METRICS_PORT', '9091'), 10),
  };
}
