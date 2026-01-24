import { AztecClient, Logger, metrics } from '@aztec-staking/shared';
import { Config } from './config';

export interface QueueStatus {
  queueLength: number;
  totalPending: bigint;
  readyToClaim: number[];
}

export class QueueMonitor {
  constructor(
    private client: AztecClient,
    private config: Config,
    private logger: Logger
  ) {}

  async getQueueStatus(): Promise<QueueStatus> {
    const queueLength = await this.client.readContract<bigint>(
      this.config.withdrawalQueueAddress,
      'get_queue_length',
      []
    );

    const readyToClaim: number[] = [];
    let totalPending = 0n;
    const currentTime = Math.floor(Date.now() / 1000);

    // Check each request in the queue
    for (let i = 0; i < Number(queueLength); i++) {
      try {
        const isClaimable = await this.checkRequestClaimable(i, currentTime);
        if (isClaimable) {
          readyToClaim.push(i);
        }

        const amount = await this.client.readContract<bigint>(
          this.config.withdrawalQueueAddress,
          'get_request_amount',
          [i]
        );
        totalPending += amount;
      } catch (error) {
        this.logger.warn('Failed to check request', { requestId: i });
      }
    }

    // Update metrics
    metrics.withdrawalQueueLength.set(Number(queueLength));

    return {
      queueLength: Number(queueLength),
      totalPending,
      readyToClaim,
    };
  }

  async checkRequestClaimable(requestId: number, currentTime: number): Promise<boolean> {
    const isClaimable = await this.client.readContract<boolean>(
      this.config.withdrawalQueueAddress,
      'is_claimable',
      [requestId, currentTime]
    );

    return isClaimable;
  }

  async getRequestAmount(requestId: number): Promise<bigint> {
    const amount = await this.client.readContract<bigint>(
      this.config.withdrawalQueueAddress,
      'get_request_amount',
      [requestId]
    );

    return amount;
  }
}
