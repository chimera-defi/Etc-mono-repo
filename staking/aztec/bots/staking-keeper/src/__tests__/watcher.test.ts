import { DepositWatcher } from '../watcher';
import { createAztecClient, createLogger } from '@aztec-staking/shared';

describe('DepositWatcher', () => {
  const mockConfig = {
    aztecRpcUrl: 'http://localhost:8080',
    liquidStakingCoreAddress: '0x001',
    vaultManagerAddress: '0x002',
    batchThreshold: 200000n * 10n ** 18n,
    pollingInterval: 60000,
    privateKey: '',
    metricsPort: 9090,
  };

  const logger = createLogger('test');
  let client: ReturnType<typeof createAztecClient>;
  let watcher: DepositWatcher;

  beforeEach(async () => {
    client = createAztecClient();
    await client.connect(mockConfig.aztecRpcUrl);
    watcher = new DepositWatcher(client, mockConfig, logger);
  });

  afterEach(async () => {
    await watcher.stop();
    await client.disconnect();
  });

  it('gets pending pool size', async () => {
    const poolSize = await watcher.getPendingPoolSize();

    expect(poolSize).toBeDefined();
    expect(typeof poolSize).toBe('bigint');
    expect(poolSize >= 0n).toBe(true);
  });

  it('checks batch readiness', async () => {
    const isReady = await watcher.isBatchReady();

    expect(typeof isReady).toBe('boolean');
  });

  it('starts and stops without error', async () => {
    const onBatchReady = jest.fn();

    await watcher.start(onBatchReady);
    await watcher.stop();

    // No errors thrown
    expect(true).toBe(true);
  });
});
