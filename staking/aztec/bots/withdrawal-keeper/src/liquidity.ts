import { AztecClient, Logger, withRetry } from '@aztec-staking/shared';
import { Config } from './config';

export class LiquidityManager {
  constructor(
    private client: AztecClient,
    private config: Config,
    private logger: Logger
  ) {}

  async getBufferBalance(): Promise<bigint> {
    const balance = await this.client.readContract<bigint>(
      this.config.liquidStakingCoreAddress,
      'get_liquidity_buffer',
      []
    );

    return balance;
  }

  async requestUnstake(amount: bigint): Promise<string> {
    this.logger.info('Requesting unstake from validators', {
      amount: amount.toString(),
    });

    const receipt = await withRetry(
      () =>
        this.client.writeContract(
          this.config.vaultManagerAddress,
          'request_unstake',
          [amount]
        ),
      {
        maxAttempts: 3,
        onRetry: (error, attempt) => {
          this.logger.warn('Unstake request failed, retrying', {
            attempt,
            errorMessage: error.message,
          });
        },
      }
    );

    this.logger.info('Unstake requested', {
      txHash: receipt.txHash,
      amount: amount.toString(),
    });

    return receipt.txHash;
  }

  async checkMinBufferMaintained(): Promise<boolean> {
    const balance = await this.getBufferBalance();
    return balance >= this.config.minLiquidityBuffer;
  }
}
