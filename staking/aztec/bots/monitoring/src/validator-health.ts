import { AztecClient, Logger, metrics } from '@aztec-staking/shared';
import { Config } from './config';

export interface ValidatorStatus {
  address: string;
  isActive: boolean;
  stake: bigint;
  lastChecked: number;
}

export class ValidatorHealthChecker {
  private validatorStatuses: Map<string, ValidatorStatus> = new Map();

  constructor(
    private client: AztecClient,
    private config: Config,
    private logger: Logger
  ) {}

  async checkAllValidators(): Promise<ValidatorStatus[]> {
    const validators = await this.getRegisteredValidators();
    const statuses: ValidatorStatus[] = [];

    for (const address of validators) {
      try {
        const status = await this.checkValidator(address);
        statuses.push(status);
        this.validatorStatuses.set(address, status);
      } catch (error) {
        this.logger.error('Failed to check validator', error as Error, { address });
      }
    }

    // Update metrics
    const activeCount = statuses.filter((s) => s.isActive).length;
    const inactiveCount = statuses.filter((s) => !s.isActive).length;
    metrics.validatorCount.labels('active').set(activeCount);
    metrics.validatorCount.labels('inactive').set(inactiveCount);

    return statuses;
  }

  private async checkValidator(address: string): Promise<ValidatorStatus> {
    const isActive = await this.client.readContract<boolean>(
      this.config.validatorRegistryAddress,
      'is_active',
      [address]
    );

    const stake = await this.client.readContract<bigint>(
      this.config.validatorRegistryAddress,
      'get_validator_stake',
      [address]
    );

    return {
      address,
      isActive,
      stake,
      lastChecked: Date.now(),
    };
  }

  private async getRegisteredValidators(): Promise<string[]> {
    // In production, query ValidatorRegistry for all registered validators
    // For mock, return a static list
    return [
      '0x0000000000000000000000000000000000000010',
      '0x0000000000000000000000000000000000000011',
      '0x0000000000000000000000000000000000000012',
    ];
  }

  getUnhealthyValidators(): ValidatorStatus[] {
    const unhealthy: ValidatorStatus[] = [];

    for (const status of this.validatorStatuses.values()) {
      if (!status.isActive) {
        unhealthy.push(status);
      }
    }

    return unhealthy;
  }
}
