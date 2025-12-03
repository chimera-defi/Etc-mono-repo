# Wallet Integration Testing Suite

Automated tests for verifying dApp compatibility with EVM wallets.

## Quick Start

```bash
# Install dependencies
npm install --save-dev vitest ethers @wagmi/core viem

# Run tests
npx vitest run wallet-integration.test.ts

# Run tests with browser (for full wallet testing)
npx vitest --browser
```

## Test Categories

### 1. EIP-1193: Provider API
- `eth_requestAccounts` — Request wallet connection
- `eth_accounts` — Get connected accounts
- `eth_chainId` — Get current chain

### 2. EIP-2700: Provider Events
- `accountsChanged` — Account switch detection
- `chainChanged` — Chain switch detection
- `disconnect` — Wallet disconnect

### 3. EIP-6963: Multi-Wallet Discovery
- Discover all installed wallets
- Select specific wallet by RDNS

### 4. EIP-712: Typed Data Signing
- `eth_signTypedData_v4` — Structured data signing

### 5. Chain Management
- `wallet_switchEthereumChain` — Switch chains
- `wallet_addEthereumChain` — Add custom chains

### 6. Gas Estimation
- `eth_estimateGas` — Transaction gas estimation

## Wallet Compatibility Matrix

Based on our testing:

| Feature | MetaMask | Rabby | Safe | Coinbase | Trust |
|---------|----------|-------|------|----------|-------|
| EIP-1193 | ✅ | ✅ | N/A | ✅ | ✅ |
| EIP-2700 | ✅ | ✅ | N/A | ✅ | ✅ |
| EIP-6963 | ✅ | ✅ | N/A | ✅ | ✅ |
| EIP-712 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chain Switch | ✅ | ✅ | ✅ | ✅ | ✅ |

## Manual Testing

Use the exported utilities for manual testing:

```typescript
import { walletTestUtils } from './wallet-integration.test';

// Discover all wallets
const wallets = await walletTestUtils.discoverWallets();
console.log('Found wallets:', wallets.map(w => w.info.name));

// Run full compatibility check
const results = await walletTestUtils.runCompatibilityCheck(window.ethereum);
console.table(results);
```

## CI/CD Integration

For automated testing without a browser wallet:

```typescript
// Use a mock provider
import { MockProvider } from './mocks/provider';

const mockProvider = new MockProvider({
  chainId: 11155111,
  accounts: ['0x...'],
});

// Run tests against mock
```

## Known Issues

### MetaMask
- May require user interaction for `eth_requestAccounts`
- Gas estimates can be inaccurate for complex contracts

### Rabby
- Desktop-only, limited mobile deep-linking

### Safe
- Web app only, no browser extension injection
- Requires WalletConnect for connection

### Coinbase
- SDK development has slowed (as of Jul 2025)

## Resources

- [EIP-1193 Spec](https://eips.ethereum.org/EIPS/eip-1193)
- [EIP-6963 Spec](https://eips.ethereum.org/EIPS/eip-6963)
- [WalletConnect Docs](https://docs.walletconnect.com/)
- [wagmi Documentation](https://wagmi.sh/)
