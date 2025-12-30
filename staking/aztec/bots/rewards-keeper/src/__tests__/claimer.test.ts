import { RewardsClaimer } from '../claimer';
import { createAztecClient, createLogger } from '@aztec-staking/shared';

describe('RewardsClaimer', () => {
  const mockConfig = {
    aztecRpcUrl: 'http://localhost:8080',
    rewardsManagerAddress: '0x004',
    stakedAztecTokenAddress: '0x005',
    validatorRegistryAddress: '0x006',
    claimInterval: 3600000,
    protocolFeePercent: 10,
    treasuryAddress: '0x007',
    privateKey: '',
    metricsPort: 9091,
  };

  const logger = createLogger('test');
  let client: ReturnType<typeof createAztecClient>;
  let claimer: RewardsClaimer;

  beforeEach(async () => {
    client = createAztecClient();
    await client.connect(mockConfig.aztecRpcUrl);
    claimer = new RewardsClaimer(client, mockConfig, logger);
  });

  afterEach(async () => {
    await client.disconnect();
  });

  it('gets validator rewards', async () => {
    const rewards = await claimer.getValidatorRewards('0x010');

    expect(typeof rewards).toBe('bigint');
    expect(rewards >= 0n).toBe(true);
  });

  it('processes rewards with correct fee calculation', async () => {
    const grossAmount = 1000n * 10n ** 18n; // 1000 AZTEC
    const result = await claimer.processRewards('0x010', grossAmount);

    expect(result.grossAmount).toBe(grossAmount);
    expect(result.protocolFee).toBe(100n * 10n ** 18n); // 10% = 100 AZTEC
    expect(result.netAmount).toBe(900n * 10n ** 18n); // 90% = 900 AZTEC
    expect(result.txHash).toBeDefined();
  });

  it('updates exchange rate', async () => {
    const newRate = await claimer.updateExchangeRate();

    expect(typeof newRate).toBe('bigint');
    expect(newRate > 0n).toBe(true);
  });

  it('gets active validators', async () => {
    const validators = await claimer.getActiveValidators();

    expect(Array.isArray(validators)).toBe(true);
    expect(validators.length).toBeGreaterThan(0);
    validators.forEach((v) => {
      expect(v.startsWith('0x')).toBe(true);
    });
  });
});
