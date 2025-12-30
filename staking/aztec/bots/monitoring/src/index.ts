import {
  createAztecClient,
  createLogger,
  startHealthServer,
  sleep,
  metrics,
} from '@aztec-staking/shared';
import { loadConfig, ALERT_CONDITIONS } from './config';
import { ValidatorHealthChecker } from './validator-health';
import { TVLTracker } from './tvl-tracker';
import { Alerter } from './alerting';

const logger = createLogger('monitoring');

async function main(): Promise<void> {
  logger.info('Starting monitoring bot');

  const config = loadConfig();

  // Create Aztec client
  const client = createAztecClient();
  await client.connect(config.aztecRpcUrl);
  logger.info('Connected to Aztec RPC', { rpcUrl: config.aztecRpcUrl });

  // Create components
  const validatorChecker = new ValidatorHealthChecker(client, config, logger);
  const tvlTracker = new TVLTracker(client, config, logger);
  const alerter = new Alerter(config.alertConfig, logger);

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

  // Main monitoring loop
  const startTime = Date.now();
  while (true) {
    try {
      // Update uptime metric
      metrics.botUptime.labels('monitoring').set((Date.now() - startTime) / 1000);
      metrics.lastSuccessfulRun.labels('monitoring').set(Date.now() / 1000);

      logger.info('Running monitoring cycle');

      // Check validator health
      const validatorStatuses = await validatorChecker.checkAllValidators();
      const unhealthy = validatorChecker.getUnhealthyValidators();

      if (unhealthy.length > 0) {
        for (const validator of unhealthy) {
          await alerter.sendAlert(
            ALERT_CONDITIONS.validatorOffline.severity,
            `Validator ${validator.address} is offline`,
            { validator }
          );
        }
      }

      logger.info('Validator check complete', {
        total: validatorStatuses.length,
        healthy: validatorStatuses.length - unhealthy.length,
        unhealthy: unhealthy.length,
      });

      // Track TVL
      const tvl = await tvlTracker.getCurrentTVL();
      tvlTracker.emitMetrics(tvl);

      // Check for significant TVL drop
      if (tvlTracker.checkSignificantDrop(tvl, ALERT_CONDITIONS.tvlDropPercent.threshold)) {
        const changePercent = tvlTracker.getTvlChangePercent(tvl.total);
        await alerter.sendAlert(
          ALERT_CONDITIONS.tvlDropPercent.severity,
          `TVL dropped by ${Math.abs(changePercent).toFixed(2)}%`,
          { tvl, changePercent }
        );
      }

      logger.info('TVL check complete', {
        totalUsd: `$${tvl.totalUsd.toLocaleString()}`,
        pendingPool: (Number(tvl.pendingPool) / 1e18).toFixed(2),
        staked: (Number(tvl.stakedToValidators) / 1e18).toFixed(2),
        buffer: (Number(tvl.liquidityBuffer) / 1e18).toFixed(2),
      });

      // Get and log exchange rate
      const exchangeRate = await client.readContract<bigint>(
        config.liquidStakingCoreAddress,
        'get_exchange_rate',
        []
      );
      metrics.exchangeRate.set(Number(exchangeRate));

      logger.info('Exchange rate', {
        rate: (Number(exchangeRate) / 10000).toFixed(4),
      });

      logger.info('Monitoring cycle complete');
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
