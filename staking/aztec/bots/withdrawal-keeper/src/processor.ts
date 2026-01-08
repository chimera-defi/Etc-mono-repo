/**
 * Withdrawal Processor for Withdrawal Keeper
 * 
 * Monitors withdrawal queue and processes claimable withdrawals.
 * Manages liquidity buffer and triggers unstaking if needed.
 */

import { AztecClient, AztecAddress } from '../../shared/src/aztec-client.js';
import { Logger } from '../../shared/src/logger.js';
import { Metrics } from '../../shared/src/metrics.js';
import { retry } from '../../shared/src/retry.js';
import { Config } from './config.js';

interface WithdrawalRequest {
  requestId: number;
  user: AztecAddress;
  aztecAmount: bigint;
  timestamp: number;
  claimable: boolean;
}

export class WithdrawalProcessor {
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
   * Process withdrawal queue: check for claimable requests and process them
   */
  async processQueue(): Promise<void> {
    const startTime = Date.now();
    this.logger.info('Starting withdrawal queue processing');

    try {
      // Check liquidity buffer
      await this.ensureLiquidityBuffer();

      // Get claimable withdrawal requests
      const claimableRequests = await this.getClaimableRequests();
      if (claimableRequests.length === 0) {
        this.logger.debug('No claimable withdrawal requests found');
        return;
      }

      this.logger.info('Found claimable withdrawal requests', { count: claimableRequests.length });

      // Process each claimable request
      let processedCount = 0;
      for (const request of claimableRequests) {
        try {
          await this.processWithdrawal(request);
          processedCount++;
        } catch (error) {
          this.logger.error('Failed to process withdrawal', error instanceof Error ? error : new Error(String(error)), {
            requestId: request.requestId,
            user: request.user.toString(),
          });
          this.metrics.counter('withdrawal_keeper_errors', 'Number of errors', ['type']).inc({ type: 'process_failed' });
        }
      }

      const duration = Date.now() - startTime;
      this.metrics.histogram('withdrawal_keeper_processing_duration', 'Withdrawal processing duration in ms').observe(duration);
      this.metrics.counter('withdrawal_keeper_withdrawals_processed', 'Number of withdrawals processed').inc(processedCount);

      this.logger.info('Withdrawal queue processing completed', {
        processed: processedCount,
        total: claimableRequests.length,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.histogram('withdrawal_keeper_processing_duration', 'Withdrawal processing duration in ms').observe(duration);
      this.metrics.counter('withdrawal_keeper_errors', 'Number of errors', ['type']).inc({ type: 'queue_processing_failed' });
      this.logger.error('Failed to process withdrawal queue', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Ensure liquidity buffer is sufficient
   */
  private async ensureLiquidityBuffer(): Promise<void> {
    try {
      // Read liquidity_buffer from LiquidStakingCore
      const liquidityBuffer = await this.client.readContract<bigint>(
        { toString: () => this.config.contracts.liquidStakingCore } as AztecAddress,
        'liquidity_buffer',
        []
      );

      this.metrics.gauge('withdrawal_keeper_liquidity_buffer', 'Liquidity buffer in wei').set(Number(liquidityBuffer));

      // Check if buffer is below minimum
      if (liquidityBuffer < this.config.minLiquidityBuffer) {
        this.logger.warn('Liquidity buffer below minimum', {
          current: liquidityBuffer.toString(),
          minimum: this.config.minLiquidityBuffer.toString(),
        });
        this.metrics.counter('withdrawal_keeper_liquidity_warnings', 'Liquidity buffer warnings').inc();

        // TODO: Trigger unstaking from validators if needed
        // This would require calling VaultManager.unstake() or similar
        this.logger.info('Liquidity buffer low - unstaking may be needed');
      }
    } catch (error) {
      this.logger.error('Failed to check liquidity buffer', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get claimable withdrawal requests from queue
   */
  private async getClaimableRequests(): Promise<WithdrawalRequest[]> {
    try {
      // Read queue_head and queue_tail from WithdrawalQueue
      const queueHead = await this.client.readContract<number>(
        { toString: () => this.config.contracts.withdrawalQueue } as AztecAddress,
        'queue_head',
        []
      );

      const queueTail = await this.client.readContract<number>(
        { toString: () => this.config.contracts.withdrawalQueue } as AztecAddress,
        'queue_tail',
        []
      );

      if (queueHead >= queueTail) {
        return []; // Queue is empty
      }

      // Read unbonding_period
      const unbondingPeriod = await this.client.readContract<number>(
        { toString: () => this.config.contracts.withdrawalQueue } as AztecAddress,
        'unbonding_period',
        []
      );

      const currentTime = Math.floor(Date.now() / 1000); // Current Unix timestamp
      const claimableRequests: WithdrawalRequest[] = [];

      // Check each request in queue
      for (let i = queueHead; i < queueTail; i++) {
        const requestId = await this.client.readContract<number>(
          { toString: () => this.config.contracts.withdrawalQueue } as AztecAddress,
          'queue_position_to_id',
          [i]
        );

        // Check if request is fulfilled
        const fulfilled = await this.client.readContract<boolean>(
          { toString: () => this.config.contracts.withdrawalQueue } as AztecAddress,
          'request_fulfilled',
          [requestId]
        );

        if (fulfilled) {
          continue; // Already fulfilled
        }

        // Read request data
        const timestamp = await this.client.readContract<number>(
          { toString: () => this.config.contracts.withdrawalQueue } as AztecAddress,
          'request_timestamp',
          [requestId]
        );

        const aztecAmount = await this.client.readContract<bigint>(
          { toString: () => this.config.contracts.withdrawalQueue } as AztecAddress,
          'request_aztec_amount',
          [requestId]
        );

        const user = await this.client.readContract<AztecAddress>(
          { toString: () => this.config.contracts.withdrawalQueue } as AztecAddress,
          'request_user',
          [requestId]
        );

        // Check if unbonding period has passed
        const claimable = currentTime >= timestamp + unbondingPeriod;

        if (claimable) {
          claimableRequests.push({
            requestId,
            user,
            aztecAmount,
            timestamp,
            claimable: true,
          });
        }
      }

      return claimableRequests;
    } catch (error) {
      this.logger.error('Failed to get claimable requests', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Process a single withdrawal request
   */
  private async processWithdrawal(request: WithdrawalRequest): Promise<void> {
    this.logger.info('Processing withdrawal', {
      requestId: request.requestId,
      user: request.user.toString(),
      amount: request.aztecAmount.toString(),
    });

    const receipt = await retry(
      async () => {
        return await this.client.callContract(
          { toString: () => this.config.contracts.withdrawalQueue } as AztecAddress,
          'claim_withdrawal',
          [request.requestId]
        );
      },
      {
        maxRetries: this.config.maxRetries,
        retryableErrors: (error) => {
          return error.message.includes('network') || error.message.includes('timeout');
        },
      }
    );

    this.logger.info('Withdrawal processed successfully', {
      requestId: request.requestId,
      txHash: receipt.txHash,
      user: request.user.toString(),
      amount: request.aztecAmount.toString(),
    });
  }
}
