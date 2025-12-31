/**
 * Aztec Client Wrapper
 * 
 * This is a mock implementation for development.
 * Replace with actual AztecJS SDK when available.
 * 
 * Note: Aztec is NOT EVM - do not use ethers.js, viem, or wagmi.
 */

export interface AztecClientConfig {
  rpcUrl: string;
  privateKey?: string;
}

export interface TransactionReceipt {
  txHash: string;
  blockNumber: number;
  status: 'success' | 'reverted';
}

export interface EventLog {
  eventName: string;
  args: Record<string, unknown>;
  blockNumber: number;
  txHash: string;
}

export interface AztecClient {
  connect(rpcUrl: string): Promise<void>;
  disconnect(): Promise<void>;
  getBlockNumber(): Promise<number>;
  readContract<T>(address: string, method: string, args: unknown[]): Promise<T>;
  writeContract(address: string, method: string, args: unknown[]): Promise<TransactionReceipt>;
  watchEvents(
    address: string,
    eventName: string,
    callback: (event: EventLog) => void
  ): () => void;
  isConnected(): boolean;
}

class MockAztecClient implements AztecClient {
  private connected = false;
  private rpcUrl = '';
  private blockNumber = 0;
  private eventWatchers: Map<string, NodeJS.Timeout> = new Map();

  async connect(rpcUrl: string): Promise<void> {
    this.rpcUrl = rpcUrl;
    this.connected = true;
    this.blockNumber = 100000;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.eventWatchers.forEach((timer) => clearInterval(timer));
    this.eventWatchers.clear();
  }

  async getBlockNumber(): Promise<number> {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    this.blockNumber += 1;
    return this.blockNumber;
  }

  async readContract<T>(address: string, method: string, args: unknown[]): Promise<T> {
    if (!this.connected) {
      throw new Error('Not connected');
    }

    // Mock responses based on method name
    const mockResponses: Record<string, unknown> = {
      get_pending_pool: 150000n * 10n ** 18n,
      get_tvl: 10_500_000n * 10n ** 18n,
      get_exchange_rate: 10250n,
      get_queue_length: 5n,
      is_claimable: true,
      get_validator_stake: 200000n * 10n ** 18n,
      is_active: true,
    };

    return (mockResponses[method] ?? 0n) as T;
  }

  async writeContract(
    address: string,
    method: string,
    args: unknown[]
  ): Promise<TransactionReceipt> {
    if (!this.connected) {
      throw new Error('Not connected');
    }

    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      blockNumber: ++this.blockNumber,
      status: 'success',
    };
  }

  watchEvents(
    address: string,
    eventName: string,
    callback: (event: EventLog) => void
  ): () => void {
    const watcherId = `${address}:${eventName}`;
    
    // Simulate periodic events
    const timer = setInterval(() => {
      if (Math.random() > 0.7) {
        callback({
          eventName,
          args: { amount: 1000n * 10n ** 18n },
          blockNumber: ++this.blockNumber,
          txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        });
      }
    }, 5000);

    this.eventWatchers.set(watcherId, timer);

    return () => {
      const t = this.eventWatchers.get(watcherId);
      if (t) clearInterval(t);
      this.eventWatchers.delete(watcherId);
    };
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export function createAztecClient(): AztecClient {
  return new MockAztecClient();
}
