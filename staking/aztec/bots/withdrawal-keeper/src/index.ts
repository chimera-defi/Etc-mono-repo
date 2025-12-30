/**
 * Withdrawal Keeper Bot
 * 
 * Monitors withdrawal queue and processes claimable withdrawals.
 * Manages liquidity buffer and triggers unstaking if needed.
 */

import { AztecClient, Logger, LogLevel, Metrics } from '../../shared/src/index.js';
import { loadConfig } from './config.js';
import { WithdrawalProcessor } from './processor.js';
import http from 'http';

async function main() {
  const config = loadConfig();

  // Validate required config
  if (!config.contracts.withdrawalQueue || !config.contracts.liquidStakingCore) {
    console.error('Missing required contract addresses in config');
    process.exit(1);
  }

  // Initialize components
  const client = new AztecClient(config.rpcUrl);
  const logger = new Logger('withdrawal-keeper', LogLevel[config.logLevel.toUpperCase() as keyof typeof LogLevel]);
  const metrics = new Metrics();

  // Create processor
  const processor = new WithdrawalProcessor(client, logger, metrics, config);

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
    logger.info('Shutting down withdrawal keeper');
    server.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Process queue immediately on start
  await processor.processQueue();

  // Set up interval for periodic processing
  const interval = setInterval(async () => {
    try {
      await processor.processQueue();
    } catch (error) {
      logger.error('Failed to process withdrawal queue', error instanceof Error ? error : new Error(String(error)));
    }
  }, config.pollIntervalMs);

  logger.info('Withdrawal keeper started', {
    rpcUrl: config.rpcUrl,
    pollInterval: config.pollIntervalMs,
    minLiquidityBuffer: config.minLiquidityBuffer.toString(),
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
