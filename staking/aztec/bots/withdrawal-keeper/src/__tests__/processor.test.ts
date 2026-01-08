import { WithdrawalProcessor } from '../processor';
import { QueueMonitor } from '../queue-monitor';
import { LiquidityManager } from '../liquidity';
import { createAztecClient, createLogger } from '@aztec-staking/shared';

describe('WithdrawalProcessor', () => {
  const mockConfig = {
    aztecRpcUrl: 'http://localhost:8080',
    withdrawalQueueAddress: '0x008',
    liquidStakingCoreAddress: '0x001',
    vaultManagerAddress: '0x002',
    pollingInterval: 300000,
    minLiquidityBuffer: 50000n * 10n ** 18n,
    privateKey: '',
    metricsPort: 9092,
  };

  const logger = createLogger('test');
  let client: ReturnType<typeof createAztecClient>;
  let processor: WithdrawalProcessor;
  let queueMonitor: QueueMonitor;
  let liquidityManager: LiquidityManager;

  beforeEach(async () => {
    client = createAztecClient();
    await client.connect(mockConfig.aztecRpcUrl);
    queueMonitor = new QueueMonitor(client, mockConfig, logger);
    liquidityManager = new LiquidityManager(client, mockConfig, logger);
    processor = new WithdrawalProcessor(
      client,
      mockConfig,
      logger,
      queueMonitor,
      liquidityManager
    );
  });

  afterEach(async () => {
    await client.disconnect();
  });

  it('processes ready withdrawals', async () => {
    const processedCount = await processor.processReadyWithdrawals();

    expect(typeof processedCount).toBe('number');
    expect(processedCount >= 0).toBe(true);
  });
});
