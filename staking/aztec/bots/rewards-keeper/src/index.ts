import {
  createAztecClient,
  createLogger,
  startHealthServer,
  sleep,
  metrics,
} from '@aztec-staking/shared';
import { loadConfig } from './config';
import { RewardsClaimer } from './claimer';

const logger = createLogger('rewards-keeper');

async function main(): Promise<void> {
  logger.info('Starting rewards keeper bot');

  const config = loadConfig();

  // Create Aztec client
  const client = createAztecClient();
  await client.connect(config.aztecRpcUrl);
  logger.info('Connected to Aztec RPC', { rpcUrl: config.aztecRpcUrl });

  // Create components
  const claimer = new RewardsClaimer(client, config, logger);

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

  // Main loop
  const startTime = Date.now();
  while (true) {
    try {
      // Update uptime metric
      metrics.botUptime.labels('rewards-keeper').set((Date.now() - startTime) / 1000);

      logger.info('Running rewards claim cycle');

      // Get active validators
      const validators = await claimer.getActiveValidators();
      logger.info('Found validators', { count: validators.length });

      // Process rewards for each validator
      for (const validator of validators) {
        try {
          const pendingRewards = await claimer.getValidatorRewards(validator);

          if (pendingRewards > 0n) {
            logger.info('Claiming rewards for validator', {
              validator,
              pendingRewards: pendingRewards.toString(),
            });

            await claimer.processRewards(validator, pendingRewards);
          } else {
            logger.debug('No pending rewards for validator', { validator });
          }
        } catch (error) {
          logger.error('Failed to process rewards for validator', error as Error, {
            validator,
          });
        }
      }

      // Update exchange rate
      try {
        await claimer.updateExchangeRate();
      } catch (error) {
        logger.error('Failed to update exchange rate', error as Error);
      }

      logger.info('Rewards claim cycle complete');
    } catch (error) {
      logger.error('Error in main loop', error as Error);
    }

    await sleep(config.claimInterval);
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
