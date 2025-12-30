/**
 * Staking Keeper Bot
 * 
 * Monitors deposits and executes batch staking when threshold (200k AZTEC) is reached.
 */

import { AztecClient, Logger, LogLevel, Metrics } from '../../shared/src/index.js';
import { loadConfig } from './config.js';
import { DepositWatcher } from './watcher.js';
import { StakingExecutor } from './executor.js';
import http from 'http';

async function main() {
  const config = loadConfig();

  // Validate required config
  if (!config.contracts.liquidStakingCore || !config.contracts.vaultManager) {
    console.error('Missing required contract addresses in config');
    process.exit(1);
  }

  // Initialize components
  const client = new AztecClient(config.rpcUrl);
  const logger = new Logger('staking-keeper', LogLevel[config.logLevel.toUpperCase() as keyof typeof LogLevel]);
  const metrics = new Metrics();

  // Create bot components
  const watcher = new DepositWatcher(client, logger, metrics, config);
  const executor = new StakingExecutor(client, logger, metrics, config);

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
    logger.info('Shutting down staking keeper');
    watcher.stop();
    server.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Start watching for deposits
  await watcher.start(async () => {
    try {
      await executor.executeBatchStake();
    } catch (error) {
      logger.error('Failed to execute batch stake', error instanceof Error ? error : new Error(String(error)));
    }
  });

  logger.info('Staking keeper started', {
    rpcUrl: config.rpcUrl,
    batchThreshold: config.batchThreshold.toString(),
    pollInterval: config.pollIntervalMs,
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
