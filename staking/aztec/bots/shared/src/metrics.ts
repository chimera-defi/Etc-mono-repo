import { Counter, Gauge, Histogram, Registry } from 'prom-client';

const registry = new Registry();

// Common metrics
export const metrics = {
  // Staking metrics
  stakingBatchesProcessed: new Counter({
    name: 'aztec_staking_batches_processed_total',
    help: 'Total number of staking batches processed',
    registers: [registry],
  }),

  pendingPoolSize: new Gauge({
    name: 'aztec_pending_pool_size_aztec',
    help: 'Current pending pool size in AZTEC',
    registers: [registry],
  }),

  // Rewards metrics
  rewardsClaimed: new Counter({
    name: 'aztec_rewards_claimed_total',
    help: 'Total rewards claimed in AZTEC',
    registers: [registry],
  }),

  exchangeRate: new Gauge({
    name: 'aztec_exchange_rate_basis_points',
    help: 'Current exchange rate in basis points (10000 = 1.0)',
    registers: [registry],
  }),

  // Withdrawal metrics
  withdrawalsProcessed: new Counter({
    name: 'aztec_withdrawals_processed_total',
    help: 'Total withdrawals processed',
    registers: [registry],
  }),

  withdrawalQueueLength: new Gauge({
    name: 'aztec_withdrawal_queue_length',
    help: 'Current number of pending withdrawals',
    registers: [registry],
  }),

  // Monitoring metrics
  tvlTotal: new Gauge({
    name: 'aztec_tvl_total_usd',
    help: 'Total value locked in USD',
    registers: [registry],
  }),

  validatorCount: new Gauge({
    name: 'aztec_validator_count',
    help: 'Number of active validators',
    labelNames: ['status'],
    registers: [registry],
  }),

  // Transaction metrics
  transactionLatency: new Histogram({
    name: 'aztec_transaction_latency_seconds',
    help: 'Transaction confirmation latency',
    buckets: [0.5, 1, 2, 5, 10, 30, 60],
    labelNames: ['type'],
    registers: [registry],
  }),

  transactionErrors: new Counter({
    name: 'aztec_transaction_errors_total',
    help: 'Total transaction errors',
    labelNames: ['type', 'error'],
    registers: [registry],
  }),

  // Health metrics
  botUptime: new Gauge({
    name: 'aztec_bot_uptime_seconds',
    help: 'Bot uptime in seconds',
    labelNames: ['bot'],
    registers: [registry],
  }),

  lastSuccessfulRun: new Gauge({
    name: 'aztec_bot_last_successful_run_timestamp',
    help: 'Timestamp of last successful run',
    labelNames: ['bot'],
    registers: [registry],
  }),
};

export { registry };

export async function getMetrics(): Promise<string> {
  return registry.metrics();
}
