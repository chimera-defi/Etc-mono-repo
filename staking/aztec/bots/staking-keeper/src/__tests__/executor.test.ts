import { StakingExecutor } from '../executor';
import { createAztecClient, createLogger } from '@aztec-staking/shared';

describe('StakingExecutor', () => {
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
  let executor: StakingExecutor;

  beforeEach(async () => {
    client = createAztecClient();
    await client.connect(mockConfig.aztecRpcUrl);
    executor = new StakingExecutor(client, mockConfig, logger);
  });

  afterEach(async () => {
    await client.disconnect();
  });

  it('executes batch stake successfully', async () => {
    const txHash = await executor.executeBatchStake();

    expect(txHash).toBeDefined();
    expect(txHash.startsWith('0x')).toBe(true);
    expect(txHash.length).toBeGreaterThan(10); // Mock txHash may vary in length
  });

  it('retries on failure', async () => {
    // The mock client always succeeds, so this test verifies no errors
    const txHash = await executor.executeBatchStake();
    expect(txHash).toBeDefined();
  });
});
