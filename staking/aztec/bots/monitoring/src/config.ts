import dotenv from 'dotenv';

dotenv.config();

export interface AlertConfig {
  telegram?: { botToken: string; chatId: string };
  slack?: { webhookUrl: string };
  pagerduty?: { serviceKey: string };
}

export interface Config {
  aztecRpcUrl: string;
  liquidStakingCoreAddress: string;
  validatorRegistryAddress: string;
  pollingInterval: number;
  alertConfig: AlertConfig;
  metricsPort: number;
  aztecPriceUsd: number;
}

function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export function loadConfig(): Config {
  const alertConfig: AlertConfig = {};

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    alertConfig.telegram = {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
    };
  }

  if (process.env.SLACK_WEBHOOK_URL) {
    alertConfig.slack = {
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
    };
  }

  if (process.env.PAGERDUTY_SERVICE_KEY) {
    alertConfig.pagerduty = {
      serviceKey: process.env.PAGERDUTY_SERVICE_KEY,
    };
  }

  return {
    aztecRpcUrl: getEnv('AZTEC_RPC_URL', 'http://localhost:8080'),
    liquidStakingCoreAddress: getEnv('LIQUID_STAKING_CORE_ADDRESS', '0x0000000000000000000000000000000000000001'),
    validatorRegistryAddress: getEnv('VALIDATOR_REGISTRY_ADDRESS', '0x0000000000000000000000000000000000000006'),
    pollingInterval: parseInt(getEnv('POLLING_INTERVAL', '60000'), 10), // 1 minute
    alertConfig,
    metricsPort: parseInt(getEnv('METRICS_PORT', '9093'), 10),
    aztecPriceUsd: parseFloat(getEnv('AZTEC_PRICE_USD', '2.0')),
  };
}

export const ALERT_CONDITIONS = {
  validatorOffline: { severity: 'critical' as const, thresholdMs: 5 * 60 * 1000 }, // 5 minutes
  tvlDropPercent: { severity: 'warning' as const, threshold: 10 }, // 10% drop
  queueBacklog: { severity: 'warning' as const, threshold: 100 }, // 100+ pending
  exchangeRateDrop: { severity: 'critical' as const, thresholdBps: 100 }, // 1% drop
};
