/**
 * Watcher for Staking Keeper
 * 
 * Monitors the LiquidStakingCore contract for deposits and checks if
 * pending pool has reached the batch threshold (200k AZTEC).
 */

import { AztecClient, AztecAddress } from '../../shared/src/aztec-client.js';
import { Logger } from '../../shared/src/logger.js';
import { Metrics } from '../../shared/src/metrics.js';
import { Config } from './config.js';

export class DepositWatcher {
  private client: AztecClient;
  private logger: Logger;
  private metrics: Metrics;
  private config: Config;
  private isRunning = false;
  private pollInterval?: NodeJS.Timeout;

  constructor(client: AztecClient, logger: Logger, metrics: Metrics, config: Config) {
    this.client = client;
    this.logger = logger;
    this.metrics = metrics;
    this.config = config;
  }

  /**
   * Start watching for deposits
   */
  async start(onThresholdReached: () => Promise<void>): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Watcher already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Starting deposit watcher', {
      pollInterval: this.config.pollIntervalMs,
      threshold: this.config.batchThreshold.toString(),
    });

    // Initial check
    await this.checkPendingPool(onThresholdReached);

    // Set up polling
    this.pollInterval = setInterval(async () => {
      await this.checkPendingPool(onThresholdReached);
    }, this.config.pollIntervalMs);
  }

  /**
   * Stop watching for deposits
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
    this.logger.info('Stopped deposit watcher');
  }

  /**
   * Check if pending pool has reached threshold
   */
  private async checkPendingPool(onThresholdReached: () => Promise<void>): Promise<void> {
    try {
      // Read pending_pool from LiquidStakingCore
      const pendingPool = await this.client.readContract<bigint>(
        { toString: () => this.config.contracts.liquidStakingCore } as AztecAddress,
        'pending_pool',
        []
      );

      this.metrics.gauge('staking_keeper_pending_pool', 'Pending pool balance in wei').set(Number(pendingPool));
      this.logger.debug('Checked pending pool', { pendingPool: pendingPool.toString() });

      if (pendingPool >= this.config.batchThreshold) {
        this.logger.info('Batch threshold reached', {
          pendingPool: pendingPool.toString(),
          threshold: this.config.batchThreshold.toString(),
        });
        this.metrics.counter('staking_keeper_threshold_reached', 'Number of times threshold reached').inc();
        await onThresholdReached();
      }
    } catch (error) {
      this.logger.error('Error checking pending pool', error instanceof Error ? error : new Error(String(error)));
      this.metrics.counter('staking_keeper_errors', 'Number of errors', ['type']).inc({ type: 'check_pending_pool' });
    }
  }
}
