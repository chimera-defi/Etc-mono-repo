/**
 * Rewards Keeper Bot
 * 
 * Periodically claims rewards from validators and processes them via RewardsManager
 * to update the exchange rate and distribute protocol fees.
 */

import { AztecClient, Logger, LogLevel, Metrics } from '../../shared/src/index.js';
import { loadConfig } from './config.js';
import { RewardsProcessor } from './processor.js';
import http from 'http';

async function main() {
  const config = loadConfig();

  // Validate required config
  if (!config.contracts.rewardsManager || !config.contracts.vaultManager) {
    console.error('Missing required contract addresses in config');
    process.exit(1);
  }

  // Initialize components
  const client = new AztecClient(config.rpcUrl);
  const logger = new Logger('rewards-keeper', LogLevel[config.logLevel.toUpperCase() as keyof typeof LogLevel]);
  const metrics = new Metrics();

  // Create processor
  const processor = new RewardsProcessor(client, logger, metrics, config);

  // Set up metrics endpoint
  const server = http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(await metrics.getMetrics());
    } else if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy' }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(config.metricsPort, () => {
    logger.info('Metrics server started', { port: config.metricsPort });
  });

  // Handle shutdown gracefully
  const shutdown = async () => {
    logger.info('Shutting down rewards keeper');
    server.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Process rewards immediately on start
  await processor.processRewards();

  // Set up interval for periodic processing
  const interval = setInterval(async () => {
    try {
      await processor.processRewards();
    } catch (error) {
      logger.error('Failed to process rewards', error instanceof Error ? error : new Error(String(error)));
    }
  }, config.claimIntervalMs);

  logger.info('Rewards keeper started', {
    rpcUrl: config.rpcUrl,
    claimInterval: config.claimIntervalMs,
  });

  // Keep process alive
  process.on('beforeExit', () => {
    clearInterval(interval);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
