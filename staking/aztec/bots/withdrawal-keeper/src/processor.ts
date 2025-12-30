import { AztecClient, Logger, metrics, withRetry } from '@aztec-staking/shared';
import { Config } from './config';
import { QueueMonitor } from './queue-monitor';
import { LiquidityManager } from './liquidity';

export class WithdrawalProcessor {
  constructor(
    private client: AztecClient,
    private config: Config,
    private logger: Logger,
    private queueMonitor: QueueMonitor,
    private liquidityManager: LiquidityManager
  ) {}

  async processReadyWithdrawals(): Promise<number> {
    const status = await this.queueMonitor.getQueueStatus();

    if (status.readyToClaim.length === 0) {
      this.logger.info('No withdrawals ready to process');
      return 0;
    }

    this.logger.info('Found ready withdrawals', {
      count: status.readyToClaim.length,
      requestIds: status.readyToClaim,
    });

    // Calculate total amount needed
    let totalNeeded = 0n;
    for (const requestId of status.readyToClaim) {
      totalNeeded += await this.queueMonitor.getRequestAmount(requestId);
    }

    // Ensure liquidity
    await this.ensureLiquidity(totalNeeded);

    // Process each withdrawal
    let processedCount = 0;
    for (const requestId of status.readyToClaim) {
      try {
        await this.processWithdrawal(requestId);
        processedCount++;
      } catch (error) {
        this.logger.error('Failed to process withdrawal', error as Error, {
          requestId,
        });
      }
    }

    metrics.withdrawalsProcessed.inc(processedCount);
    metrics.lastSuccessfulRun.labels('withdrawal-keeper').set(Date.now() / 1000);

    return processedCount;
  }

  private async processWithdrawal(requestId: number): Promise<void> {
    this.logger.info('Processing withdrawal', { requestId });

    const startTime = Date.now();
    const currentTime = Math.floor(Date.now() / 1000);

    try {
      const receipt = await withRetry(
        () =>
          this.client.writeContract(
            this.config.withdrawalQueueAddress,
            'claim_withdrawal',
            [requestId, currentTime]
          ),
        {
          maxAttempts: 3,
          onRetry: (error, attempt) => {
            this.logger.warn('Claim withdrawal failed, retrying', {
              requestId,
              attempt,
              errorMessage: error.message,
            });
          },
        }
      );

      const latency = (Date.now() - startTime) / 1000;
      metrics.transactionLatency.labels('claim_withdrawal').observe(latency);

      this.logger.info('Withdrawal processed', {
        requestId,
        txHash: receipt.txHash,
        latency,
      });
    } catch (error) {
      metrics.transactionErrors.labels('claim_withdrawal', (error as Error).name).inc();
      throw error;
    }
  }

  private async ensureLiquidity(requiredAmount: bigint): Promise<void> {
    const bufferBalance = await this.liquidityManager.getBufferBalance();

    if (bufferBalance >= requiredAmount) {
      this.logger.info('Sufficient liquidity available', {
        required: requiredAmount.toString(),
        available: bufferBalance.toString(),
      });
      return;
    }

    const shortfall = requiredAmount - bufferBalance;
    this.logger.info('Liquidity shortfall, requesting unstake', {
      required: requiredAmount.toString(),
      available: bufferBalance.toString(),
      shortfall: shortfall.toString(),
    });

    await this.liquidityManager.requestUnstake(shortfall);
  }
}
