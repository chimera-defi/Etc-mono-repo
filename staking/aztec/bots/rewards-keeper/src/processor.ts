/**
 * Rewards Processor for Rewards Keeper
 * 
 * Claims rewards from validators and processes them via RewardsManager.
 */

import { AztecClient, AztecAddress } from '../../shared/src/aztec-client.js';
import { Logger } from '../../shared/src/logger.js';
import { Metrics } from '../../shared/src/metrics.js';
import { retry } from '../../shared/src/retry.js';
import { Config } from './config.js';

export class RewardsProcessor {
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
   * Process rewards: claim from validators and update exchange rate
   */
  async processRewards(): Promise<void> {
    const startTime = Date.now();
    this.logger.info('Starting rewards processing');

    try {
      // Get list of validators with stakes
      const validators = await this.getStakedValidators();
      if (validators.length === 0) {
        this.logger.warn('No validators with stakes found');
        this.metrics.counter('rewards_keeper_errors', 'Number of errors', ['type']).inc({ type: 'no_validators' });
        return;
      }

      this.logger.info('Found validators with stakes', { count: validators.length });

      // Claim rewards from each validator
      let totalRewards = 0n;
      for (const validator of validators) {
        try {
          const rewards = await this.claimRewardsFromValidator(validator);
          totalRewards += rewards;
        } catch (error) {
          this.logger.error('Failed to claim rewards from validator', error instanceof Error ? error : new Error(String(error)), {
            validator: validator.toString(),
          });
          this.metrics.counter('rewards_keeper_validator_errors', 'Validator reward claim errors', ['validator']).inc({
            validator: validator.toString(),
          });
        }
      }

      if (totalRewards === 0n) {
        this.logger.info('No rewards to process');
        return;
      }

      // Process rewards via RewardsManager
      const receipt = await retry(
        async () => {
          return await this.client.callContract(
            { toString: () => this.config.contracts.rewardsManager } as AztecAddress,
            'process_rewards',
            [totalRewards]
          );
        },
        {
          maxRetries: this.config.maxRetries,
          retryableErrors: (error) => {
            return error.message.includes('network') || error.message.includes('timeout');
          },
        }
      );

      const duration = Date.now() - startTime;
      this.metrics.histogram('rewards_keeper_processing_duration', 'Rewards processing duration in ms').observe(duration);
      this.metrics.counter('rewards_keeper_rewards_processed', 'Total rewards processed in wei').inc(Number(totalRewards));
      this.metrics.counter('rewards_keeper_processing_count', 'Number of reward processing cycles').inc();

      this.logger.info('Rewards processed successfully', {
        txHash: receipt.txHash,
        totalRewards: totalRewards.toString(),
        validators: validators.length,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.histogram('rewards_keeper_processing_duration', 'Rewards processing duration in ms').observe(duration);
      this.metrics.counter('rewards_keeper_errors', 'Number of errors', ['type']).inc({ type: 'processing_failed' });
      this.logger.error('Failed to process rewards', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get list of validators that have stakes
   */
  private async getStakedValidators(): Promise<AztecAddress[]> {
    try {
      // Read active_validator_count from VaultManager
      const activeCount = await this.client.readContract<number>(
        { toString: () => this.config.contracts.vaultManager } as AztecAddress,
        'active_validator_count',
        []
      );

      const validators: AztecAddress[] = [];
      for (let i = 0; i < activeCount; i++) {
        const validator = await this.client.readContract<AztecAddress>(
          { toString: () => this.config.contracts.vaultManager } as AztecAddress,
          'validators',
          [i]
        );

        // Check if validator has stake
        const stake = await this.client.readContract<bigint>(
          { toString: () => this.config.contracts.vaultManager } as AztecAddress,
          'stake_per_validator',
          [validator]
        );

        if (stake > 0n) {
          validators.push(validator);
        }
      }

      return validators;
    } catch (error) {
      this.logger.error('Failed to get staked validators', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Claim rewards from a specific validator
   */
  private async claimRewardsFromValidator(validator: AztecAddress): Promise<bigint> {
    // TODO: Implement actual reward claiming from Aztec validators
    // For now, return mock value
    this.logger.debug('Claiming rewards from validator', { validator: validator.toString() });
    return 0n;
  }
}
