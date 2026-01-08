import { AztecClient, Logger, metrics, withRetry } from '@aztec-staking/shared';
import { Config } from './config';

export interface RewardsClaim {
  validatorAddress: string;
  grossAmount: bigint;
  netAmount: bigint;
  protocolFee: bigint;
  txHash: string;
}

export class RewardsClaimer {
  constructor(
    private client: AztecClient,
    private config: Config,
    private logger: Logger
  ) {}

  async getValidatorRewards(validatorAddress: string): Promise<bigint> {
    const rewards = await this.client.readContract<bigint>(
      this.config.rewardsManagerAddress,
      'get_pending_rewards',
      [validatorAddress]
    );

    return rewards;
  }

  async processRewards(
    validatorAddress: string,
    grossAmount: bigint
  ): Promise<RewardsClaim> {
    this.logger.info('Processing rewards', {
      validator: validatorAddress,
      grossAmount: grossAmount.toString(),
    });

    const startTime = Date.now();

    try {
      // Calculate protocol fee (10%)
      const protocolFee = (grossAmount * BigInt(this.config.protocolFeePercent)) / 100n;
      const netAmount = grossAmount - protocolFee;

      // Call RewardsManager.process_rewards
      const receipt = await withRetry(
        () =>
          this.client.writeContract(
            this.config.rewardsManagerAddress,
            'process_rewards',
            [validatorAddress, grossAmount]
          ),
        {
          maxAttempts: 3,
          onRetry: (error, attempt) => {
            this.logger.warn('Process rewards failed, retrying', {
              attempt,
              errorMessage: error.message,
            });
          },
        }
      );

      const latency = (Date.now() - startTime) / 1000;
      metrics.transactionLatency.labels('process_rewards').observe(latency);
      metrics.rewardsClaimed.inc(Number(grossAmount / 10n ** 18n));

      this.logger.info('Rewards processed', {
        txHash: receipt.txHash,
        netAmount: netAmount.toString(),
        protocolFee: protocolFee.toString(),
        latency,
      });

      return {
        validatorAddress,
        grossAmount,
        netAmount,
        protocolFee,
        txHash: receipt.txHash,
      };
    } catch (error) {
      metrics.transactionErrors.labels('process_rewards', (error as Error).name).inc();
      throw error;
    }
  }

  async updateExchangeRate(): Promise<bigint> {
    this.logger.info('Updating exchange rate');

    try {
      // Get current exchange rate before update
      const oldRate = await this.client.readContract<bigint>(
        this.config.stakedAztecTokenAddress,
        'get_exchange_rate',
        []
      );

      // Call RewardsManager to update rate
      await withRetry(
        () =>
          this.client.writeContract(
            this.config.rewardsManagerAddress,
            'update_exchange_rate',
            []
          ),
        { maxAttempts: 3 }
      );

      // Get new exchange rate
      const newRate = await this.client.readContract<bigint>(
        this.config.stakedAztecTokenAddress,
        'get_exchange_rate',
        []
      );

      metrics.exchangeRate.set(Number(newRate));
      metrics.lastSuccessfulRun.labels('rewards-keeper').set(Date.now() / 1000);

      this.logger.info('Exchange rate updated', {
        oldRate: oldRate.toString(),
        newRate: newRate.toString(),
        change: ((Number(newRate) - Number(oldRate)) / Number(oldRate) * 100).toFixed(4) + '%',
      });

      return newRate;
    } catch (error) {
      metrics.transactionErrors.labels('update_exchange_rate', (error as Error).name).inc();
      throw error;
    }
  }

  async getActiveValidators(): Promise<string[]> {
    // In production, query ValidatorRegistry for active validators
    // For mock, return a static list
    return [
      '0x0000000000000000000000000000000000000010',
      '0x0000000000000000000000000000000000000011',
      '0x0000000000000000000000000000000000000012',
    ];
  }
}
