import {
  createAztecClient,
  createLogger,
  startHealthServer,
  sleep,
  metrics,
} from '@aztec-staking/shared';
import { loadConfig } from './config';
import { DepositWatcher } from './watcher';
import { StakingExecutor } from './executor';

const logger = createLogger('staking-keeper');

async function main(): Promise<void> {
  logger.info('Starting staking keeper bot');

  const config = loadConfig();

  // Create Aztec client
  const client = createAztecClient();
  await client.connect(config.aztecRpcUrl);
  logger.info('Connected to Aztec RPC', { rpcUrl: config.aztecRpcUrl });

  // Create components
  const watcher = new DepositWatcher(client, config, logger);
  const executor = new StakingExecutor(client, config, logger);

  // Start health server
  await startHealthServer(
    {
      port: config.metricsPort,
      checks: {
        aztecConnection: async () => client.isConnected(),
      },
    },
    logger
  );

  // Handle batch ready callback
  let isProcessing = false;
  const handleBatchReady = async (poolSize: bigint): Promise<void> => {
    if (isProcessing) {
      logger.info('Already processing a batch, skipping');
      return;
    }

    isProcessing = true;
    try {
      logger.info('Batch threshold reached', {
        poolSize: poolSize.toString(),
        threshold: config.batchThreshold.toString(),
      });

      const txHash = await executor.executeBatchStake();
      logger.info('Batch staked successfully', { txHash });
    } catch (error) {
      logger.error('Failed to execute batch stake', error as Error);
    } finally {
      isProcessing = false;
    }
  };

  // Start watcher
  await watcher.start(handleBatchReady);

  // Main polling loop
  const startTime = Date.now();
  while (true) {
    try {
      // Update uptime metric
      metrics.botUptime.labels('staking-keeper').set((Date.now() - startTime) / 1000);

      // Poll for batch readiness
      const poolSize = await watcher.getPendingPoolSize();

      logger.debug('Pool size checked', {
        poolSize: poolSize.toString(),
        threshold: config.batchThreshold.toString(),
        isReady: poolSize >= config.batchThreshold,
      });

      if (poolSize >= config.batchThreshold && !isProcessing) {
        await handleBatchReady(poolSize);
      }
    } catch (error) {
      logger.error('Error in main loop', error as Error);
    }

    await sleep(config.pollingInterval);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down');
  process.exit(0);
});

main().catch((error) => {
  logger.error('Fatal error', error);
  process.exit(1);
});
