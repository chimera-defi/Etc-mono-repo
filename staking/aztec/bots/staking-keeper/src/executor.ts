/**
 * Executor for Staking Keeper
 * 
 * Executes batch staking operations by calling VaultManager.execute_batch_stake()
 * with round-robin validator selection.
 */

import { AztecClient, AztecAddress } from '../../shared/src/aztec-client.js';
import { Logger } from '../../shared/src/logger.js';
import { Metrics } from '../../shared/src/metrics.js';
import { retry } from '../../shared/src/retry.js';
import { Config } from './config.js';

export class StakingExecutor {
  private client: AztecClient;
  private logger: Logger;
  private metrics: Metrics;
  private config: Config;

  constructor(client: AztecClient, logger: Logger, metrics: Metrics, config: Config) {
    this.client = client;
    this.logger = logger;
    this.metrics = metrics;
    this.config = config;
  }

  /**
   * Execute batch stake operation
   */
  async executeBatchStake(): Promise<void> {
    const startTime = Date.now();
    this.logger.info('Starting batch stake execution');

    try {
      // Get next validator using round-robin
      const validator = await this.getNextValidator();
      if (!validator) {
        this.logger.warn('No active validators available');
        this.metrics.counter('staking_keeper_errors', 'Number of errors', ['type']).inc({ type: 'no_validators' });
        return;
      }

      this.logger.info('Selected validator for batch stake', { validator: validator.toString() });

      // Execute batch stake via VaultManager
      const receipt = await retry(
        async () => {
          return await this.client.callContract(
            { toString: () => this.config.contracts.vaultManager } as AztecAddress,
            'execute_batch_stake',
            [validator]
          );
        },
        {
          maxRetries: this.config.maxRetries,
          retryableErrors: (error) => {
            // Retry on network errors, not on contract errors
            return error.message.includes('network') || error.message.includes('timeout');
          },
        }
      );

      const duration = Date.now() - startTime;
      this.metrics.histogram('staking_keeper_execution_duration', 'Batch stake execution duration in ms').observe(duration);
      this.metrics.counter('staking_keeper_batches_executed', 'Number of batches executed').inc();

      this.logger.info('Batch stake executed successfully', {
        txHash: receipt.txHash,
        validator: validator.toString(),
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.histogram('staking_keeper_execution_duration', 'Batch stake execution duration in ms').observe(duration);
      this.metrics.counter('staking_keeper_errors', 'Number of errors', ['type']).inc({ type: 'execution_failed' });
      this.logger.error('Failed to execute batch stake', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get next validator using round-robin selection
   */
  private async getNextValidator(): Promise<AztecAddress | null> {
    try {
      // Read next_validator_index from VaultManager
      const nextIndex = await this.client.readContract<number>(
        { toString: () => this.config.contracts.vaultManager } as AztecAddress,
        'next_validator_index',
        []
      );

      // Read active_validator_count
      const activeCount = await this.client.readContract<number>(
        { toString: () => this.config.contracts.vaultManager } as AztecAddress,
        'active_validator_count',
        []
      );

      if (activeCount === 0) {
        return null;
      }

      // Get validator at index (modulo active count)
      const validatorIndex = nextIndex % activeCount;
      const validator = await this.client.readContract<AztecAddress>(
        { toString: () => this.config.contracts.vaultManager } as AztecAddress,
        'validators',
        [validatorIndex]
      );

      return validator;
    } catch (error) {
      this.logger.error('Failed to get next validator', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}
