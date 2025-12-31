import { AztecClient, Logger, metrics } from '@aztec-staking/shared';
import { Config } from './config';

export class DepositWatcher {
  private unsubscribe?: () => void;

  constructor(
    private client: AztecClient,
    private config: Config,
    private logger: Logger
  ) {}

  async start(onBatchReady: (poolSize: bigint) => void): Promise<void> {
    this.logger.info('Starting deposit watcher');

    // Watch for deposit events
    this.unsubscribe = this.client.watchEvents(
      this.config.liquidStakingCoreAddress,
      'DepositProcessed',
      async (event) => {
        this.logger.info('Deposit detected', {
          txHash: event.txHash,
          amount: String(event.args.amount),
        });

        // Check if batch threshold reached
        const poolSize = await this.getPendingPoolSize();
        if (poolSize >= this.config.batchThreshold) {
          onBatchReady(poolSize);
        }
      }
    );
  }

  async stop(): Promise<void> {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
    this.logger.info('Deposit watcher stopped');
  }

  async getPendingPoolSize(): Promise<bigint> {
    const poolSize = await this.client.readContract<bigint>(
      this.config.liquidStakingCoreAddress,
      'get_pending_pool',
      []
    );

    // Update metrics
    metrics.pendingPoolSize.set(Number(poolSize / 10n ** 18n));

    return poolSize;
  }

  async isBatchReady(): Promise<boolean> {
    const poolSize = await this.getPendingPoolSize();
    return poolSize >= this.config.batchThreshold;
  }
}
