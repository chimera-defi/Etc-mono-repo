import { AztecClient, Logger, metrics } from '@aztec-staking/shared';
import { Config } from './config';

export interface TVLData {
  pendingPool: bigint;
  stakedToValidators: bigint;
  liquidityBuffer: bigint;
  total: bigint;
  totalUsd: number;
}

export class TVLTracker {
  private previousTvl: bigint = 0n;

  constructor(
    private client: AztecClient,
    private config: Config,
    private logger: Logger
  ) {}

  async getCurrentTVL(): Promise<TVLData> {
    const total = await this.client.readContract<bigint>(
      this.config.liquidStakingCoreAddress,
      'get_tvl',
      []
    );

    const pendingPool = await this.client.readContract<bigint>(
      this.config.liquidStakingCoreAddress,
      'get_pending_pool',
      []
    );

    const liquidityBuffer = await this.client.readContract<bigint>(
      this.config.liquidStakingCoreAddress,
      'get_liquidity_buffer',
      []
    );

    // Calculate staked to validators
    const stakedToValidators = total - pendingPool - liquidityBuffer;

    // Calculate USD value
    const totalAztec = Number(total) / 1e18;
    const totalUsd = totalAztec * this.config.aztecPriceUsd;

    const tvlData: TVLData = {
      pendingPool,
      stakedToValidators,
      liquidityBuffer,
      total,
      totalUsd,
    };

    // Store for comparison
    this.previousTvl = total;

    return tvlData;
  }

  emitMetrics(tvl: TVLData): void {
    metrics.tvlTotal.set(tvl.totalUsd);
    metrics.pendingPoolSize.set(Number(tvl.pendingPool / 10n ** 18n));
  }

  getTvlChangePercent(newTvl: bigint): number {
    if (this.previousTvl === 0n) return 0;

    const change = Number(newTvl - this.previousTvl);
    const previous = Number(this.previousTvl);

    return (change / previous) * 100;
  }

  checkSignificantDrop(tvl: TVLData, threshold: number): boolean {
    const changePercent = this.getTvlChangePercent(tvl.total);
    return changePercent < -threshold;
  }
}
