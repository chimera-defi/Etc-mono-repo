import { AztecClient, Logger, metrics, withRetry } from '@aztec-staking/shared';
import { Config } from './config';

export class StakingExecutor {
  constructor(
    private client: AztecClient,
    private config: Config,
    private logger: Logger
  ) {}

  async executeBatchStake(): Promise<string> {
    this.logger.info('Executing batch stake');

    const startTime = Date.now();

    try {
      // Select next validator using round-robin
      const validatorAddress = await this.selectNextValidator();

      this.logger.info('Selected validator', { validator: validatorAddress });

      // Execute batch stake through VaultManager
      const receipt = await withRetry(
        () =>
          this.client.writeContract(
            this.config.vaultManagerAddress,
            'execute_batch_stake',
            [validatorAddress]
          ),
        {
          maxAttempts: 3,
          onRetry: (error, attempt) => {
            this.logger.warn('Batch stake failed, retrying', {
              attempt,
              errorMessage: error.message,
            });
          },
        }
      );

      const latency = (Date.now() - startTime) / 1000;
      metrics.transactionLatency.labels('batch_stake').observe(latency);
      metrics.stakingBatchesProcessed.inc();
      metrics.lastSuccessfulRun.labels('staking-keeper').set(Date.now() / 1000);

      this.logger.info('Batch stake completed', {
        txHash: receipt.txHash,
        blockNumber: receipt.blockNumber,
        latency,
      });

      return receipt.txHash;
    } catch (error) {
      metrics.transactionErrors.labels('batch_stake', (error as Error).name).inc();
      throw error;
    }
  }

  private async selectNextValidator(): Promise<string> {
    const validatorAddress = await this.client.readContract<string>(
      this.config.vaultManagerAddress,
      'select_next_validator',
      []
    );

    return validatorAddress || '0x0000000000000000000000000000000000000003';
  }
}
