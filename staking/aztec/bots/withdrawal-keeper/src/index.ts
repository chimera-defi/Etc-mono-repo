import {
  createAztecClient,
  createLogger,
  startHealthServer,
  sleep,
  metrics,
} from '@aztec-staking/shared';
import { loadConfig } from './config';
import { QueueMonitor } from './queue-monitor';
import { WithdrawalProcessor } from './processor';
import { LiquidityManager } from './liquidity';

const logger = createLogger('withdrawal-keeper');

async function main(): Promise<void> {
  logger.info('Starting withdrawal keeper bot');

  const config = loadConfig();

  // Create Aztec client
  const client = createAztecClient();
  await client.connect(config.aztecRpcUrl);
  logger.info('Connected to Aztec RPC', { rpcUrl: config.aztecRpcUrl });

  // Create components
  const queueMonitor = new QueueMonitor(client, config, logger);
  const liquidityManager = new LiquidityManager(client, config, logger);
  const processor = new WithdrawalProcessor(
    client,
    config,
    logger,
    queueMonitor,
    liquidityManager
  );

  // Start health server
  await startHealthServer(
    {
      port: config.metricsPort,
      checks: {
        aztecConnection: async () => client.isConnected(),
        liquidityBuffer: async () => liquidityManager.checkMinBufferMaintained(),
      },
    },
    logger
  );

  // Main loop
  const startTime = Date.now();
  while (true) {
    try {
      // Update uptime metric
      metrics.botUptime.labels('withdrawal-keeper').set((Date.now() - startTime) / 1000);

      logger.info('Running withdrawal processing cycle');

      // Check queue and process ready withdrawals
      const processedCount = await processor.processReadyWithdrawals();

      logger.info('Withdrawal cycle complete', { processedCount });
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
