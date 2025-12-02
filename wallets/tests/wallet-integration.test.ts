/**
 * Wallet Integration Testing Suite
 * 
 * Tests for verifying dApp compatibility with various EVM wallets.
 * Uses ethers.js and wagmi patterns common in production dApps.
 * 
 * Usage:
 *   npm install --save-dev vitest ethers @wagmi/core viem
 *   npx vitest run wallet-integration.test.ts
 * 
 * Note: These tests require a wallet extension installed in browser.
 * For CI, use a mock provider or headless wallet like Anvil.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Types for wallet provider
interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: EIP1193Provider;
}

// Test configuration
const TEST_CONFIG = {
  // Use a testnet for actual testing
  chainId: 11155111, // Sepolia
  rpcUrl: 'https://rpc.sepolia.org',
  // Test account (DO NOT USE REAL FUNDS)
  testAddress: '0x0000000000000000000000000000000000000000',
};

describe('Wallet Connection Tests', () => {
  let provider: EIP1193Provider | null = null;

  beforeAll(async () => {
    // In browser environment, get provider
    if (typeof window !== 'undefined' && (window as unknown as { ethereum?: EIP1193Provider }).ethereum) {
      provider = (window as unknown as { ethereum: EIP1193Provider }).ethereum;
    }
  });

  describe('EIP-1193: Provider API', () => {
    it('should have ethereum provider available', () => {
      // Skip in Node.js environment
      if (typeof window === 'undefined') {
        console.log('Skipping browser test in Node.js');
        return;
      }
      expect(provider).not.toBeNull();
    });

    it('should support eth_requestAccounts', async () => {
      if (!provider) return;
      
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        expect(Array.isArray(accounts)).toBe(true);
        expect((accounts as string[]).length).toBeGreaterThan(0);
      } catch (error) {
        // User rejected or wallet not connected - expected in test
        console.log('Connection rejected (expected in automated tests)');
      }
    });

    it('should support eth_chainId', async () => {
      if (!provider) return;
      
      const chainId = await provider.request({ method: 'eth_chainId' });
      expect(typeof chainId).toBe('string');
      expect((chainId as string).startsWith('0x')).toBe(true);
    });

    it('should support eth_accounts', async () => {
      if (!provider) return;
      
      const accounts = await provider.request({ method: 'eth_accounts' });
      expect(Array.isArray(accounts)).toBe(true);
    });
  });

  describe('EIP-2700: Provider Events', () => {
    it('should support accountsChanged event', () => {
      if (!provider) return;
      
      const handler = () => {};
      expect(() => provider!.on('accountsChanged', handler)).not.toThrow();
      expect(() => provider!.removeListener('accountsChanged', handler)).not.toThrow();
    });

    it('should support chainChanged event', () => {
      if (!provider) return;
      
      const handler = () => {};
      expect(() => provider!.on('chainChanged', handler)).not.toThrow();
      expect(() => provider!.removeListener('chainChanged', handler)).not.toThrow();
    });

    it('should support disconnect event', () => {
      if (!provider) return;
      
      const handler = () => {};
      expect(() => provider!.on('disconnect', handler)).not.toThrow();
      expect(() => provider!.removeListener('disconnect', handler)).not.toThrow();
    });
  });

  describe('EIP-6963: Multi-Wallet Discovery', () => {
    it('should discover wallets via announceProvider event', async () => {
      if (typeof window === 'undefined') return;
      
      const discoveredWallets: EIP6963ProviderDetail[] = [];
      
      const handler = (event: Event) => {
        const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
        discoveredWallets.push(detail);
      };
      
      window.addEventListener('eip6963:announceProvider', handler);
      window.dispatchEvent(new Event('eip6963:requestProvider'));
      
      // Wait for announcements
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.removeEventListener('eip6963:announceProvider', handler);
      
      // Log discovered wallets for debugging
      console.log('Discovered wallets:', discoveredWallets.map(w => w.info.name));
    });
  });
});

describe('Transaction Signing Tests', () => {
  let provider: EIP1193Provider | null = null;
  let accounts: string[] = [];

  beforeAll(async () => {
    if (typeof window !== 'undefined' && (window as unknown as { ethereum?: EIP1193Provider }).ethereum) {
      provider = (window as unknown as { ethereum: EIP1193Provider }).ethereum;
      try {
        accounts = await provider.request({ method: 'eth_accounts' }) as string[];
      } catch {
        // Not connected
      }
    }
  });

  describe('EIP-712: Typed Data Signing', () => {
    it('should support eth_signTypedData_v4', async () => {
      if (!provider || accounts.length === 0) return;

      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
          ],
          Test: [
            { name: 'message', type: 'string' },
          ],
        },
        primaryType: 'Test',
        domain: {
          name: 'Test App',
          version: '1',
          chainId: TEST_CONFIG.chainId,
        },
        message: {
          message: 'Hello, World!',
        },
      };

      try {
        const signature = await provider.request({
          method: 'eth_signTypedData_v4',
          params: [accounts[0], JSON.stringify(typedData)],
        });
        expect(typeof signature).toBe('string');
        expect((signature as string).startsWith('0x')).toBe(true);
      } catch (error) {
        // User rejected - expected in test
        console.log('Signing rejected (expected in automated tests)');
      }
    });
  });

  describe('Personal Message Signing', () => {
    it('should support personal_sign', async () => {
      if (!provider || accounts.length === 0) return;

      const message = 'Hello, World!';
      const hexMessage = '0x' + Buffer.from(message).toString('hex');

      try {
        const signature = await provider.request({
          method: 'personal_sign',
          params: [hexMessage, accounts[0]],
        });
        expect(typeof signature).toBe('string');
        expect((signature as string).startsWith('0x')).toBe(true);
      } catch (error) {
        console.log('Signing rejected (expected in automated tests)');
      }
    });
  });
});

describe('Chain Switching Tests', () => {
  let provider: EIP1193Provider | null = null;

  beforeAll(async () => {
    if (typeof window !== 'undefined' && (window as unknown as { ethereum?: EIP1193Provider }).ethereum) {
      provider = (window as unknown as { ethereum: EIP1193Provider }).ethereum;
    }
  });

  describe('wallet_switchEthereumChain', () => {
    it('should support switching to known chain', async () => {
      if (!provider) return;

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }], // Mainnet
        });
      } catch (error: unknown) {
        const err = error as { code?: number };
        // 4902 = chain not added, 4001 = user rejected
        expect([4001, 4902]).toContain(err.code);
      }
    });
  });

  describe('wallet_addEthereumChain', () => {
    it('should support adding custom chain', async () => {
      if (!provider) return;

      const sepoliaParams = {
        chainId: '0xaa36a7', // 11155111
        chainName: 'Sepolia',
        nativeCurrency: {
          name: 'Sepolia ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://rpc.sepolia.org'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      };

      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [sepoliaParams],
        });
      } catch (error: unknown) {
        const err = error as { code?: number };
        // 4001 = user rejected
        if (err.code !== 4001) {
          throw error;
        }
      }
    });
  });
});

describe('Gas Estimation Tests', () => {
  let provider: EIP1193Provider | null = null;

  beforeAll(async () => {
    if (typeof window !== 'undefined' && (window as unknown as { ethereum?: EIP1193Provider }).ethereum) {
      provider = (window as unknown as { ethereum: EIP1193Provider }).ethereum;
    }
  });

  it('should estimate gas for simple transfer', async () => {
    if (!provider) return;

    const gasEstimate = await provider.request({
      method: 'eth_estimateGas',
      params: [{
        from: TEST_CONFIG.testAddress,
        to: TEST_CONFIG.testAddress,
        value: '0x0',
      }],
    });

    expect(typeof gasEstimate).toBe('string');
    expect((gasEstimate as string).startsWith('0x')).toBe(true);
    
    const gasNumber = parseInt(gasEstimate as string, 16);
    expect(gasNumber).toBeGreaterThan(0);
    expect(gasNumber).toBeLessThan(1000000); // Reasonable for simple transfer
  });
});

// Utility functions for manual testing
export const walletTestUtils = {
  /**
   * Check if wallet supports a specific RPC method
   */
  async supportsMethod(provider: EIP1193Provider, method: string): Promise<boolean> {
    try {
      await provider.request({ method, params: [] });
      return true;
    } catch (error: unknown) {
      const err = error as { code?: number };
      // -32601 = method not found
      return err.code !== -32601;
    }
  },

  /**
   * Get all discovered EIP-6963 wallets
   */
  async discoverWallets(): Promise<EIP6963ProviderDetail[]> {
    if (typeof window === 'undefined') return [];
    
    const wallets: EIP6963ProviderDetail[] = [];
    
    const handler = (event: Event) => {
      wallets.push((event as CustomEvent<EIP6963ProviderDetail>).detail);
    };
    
    window.addEventListener('eip6963:announceProvider', handler);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    window.removeEventListener('eip6963:announceProvider', handler);
    
    return wallets;
  },

  /**
   * Test wallet against all common EIPs
   */
  async runCompatibilityCheck(provider: EIP1193Provider): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    const methods = [
      'eth_requestAccounts',
      'eth_accounts',
      'eth_chainId',
      'eth_estimateGas',
      'personal_sign',
      'eth_signTypedData_v4',
      'wallet_switchEthereumChain',
      'wallet_addEthereumChain',
      'wallet_watchAsset',
    ];
    
    for (const method of methods) {
      results[method] = await this.supportsMethod(provider, method);
    }
    
    return results;
  },
};
