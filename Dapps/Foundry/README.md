# Foundry Implementation

## Status: ✅ Complete

All contracts, tests, and deployment scripts implemented and passing.

## Quick Start

```bash
cd app
forge test              # Run all tests (21 passing)
forge test -vvv         # Verbose output
forge test --gas-report # With gas metrics
forge coverage          # Coverage report (100%)
```

## What's Implemented

### Contracts (in `src/`)
- ✅ `Token.sol` - ERC-20, Ownable, mint/burn
- ✅ `NFT.sol` - ERC-721, Ownable, tokenURI, totalMinted

### Tests (in `test/`)
- ✅ `Token.t.sol` - 11 tests including 3 fuzz tests
  - Deploy, transfer, mint, burn, access control
  - Fuzz: transfer, mint, burn with random amounts
- ✅ `NFT.t.sol` - 10 tests including 2 fuzz tests
  - Mint, transfer, tokenURI, approval
  - Fuzz: sequential minting, transfers to random addresses

### Deployment
- ✅ `script/Deploy.s.sol` - Deploys both Token and NFT

## Metrics

| Metric | Value |
|--------|-------|
| Compile time | 0.65s |
| Test execution | 0.13s |
| Tests passing | 21/21 |
| Fuzz runs | 1280 (256 × 5 tests) |
| Coverage (src/) | 100% |
| Dependency size | 16 MB |

## Test Output

```
Ran 21 tests for 2 test suites
├── Token.t.sol: 11 passed (3 fuzz tests)
└── NFT.t.sol: 10 passed (2 fuzz tests)

Total: 21 passed, 0 failed
Time: 0.13s
```

## Gas Report (Key Functions)

| Contract | Function | Avg Gas |
|----------|----------|---------|
| Token | transfer | 51,502 |
| Token | mint | 53,442 |
| Token | burn | 33,609 |
| NFT | mint | 67,175 |
| NFT | transferFrom | 55,468 |

## Project Structure

```
app/
├── src/
│   ├── Token.sol      # ERC-20 implementation
│   └── NFT.sol        # ERC-721 implementation
├── test/
│   ├── Token.t.sol    # Token tests + fuzz
│   └── NFT.t.sol      # NFT tests + fuzz
├── script/
│   └── Deploy.s.sol   # Deployment script
├── lib/
│   ├── forge-std/     # Foundry standard library
│   └── openzeppelin-contracts/
├── foundry.toml       # Configuration
└── remappings.txt     # Import mappings
```

## Commands Reference

```bash
# Build
forge build
forge build --sizes     # Show contract sizes

# Test
forge test              # Run all tests
forge test -vvv         # Verbose (show logs)
forge test -vvvv        # Very verbose (show traces)
forge test --match-test testFuzz  # Run only fuzz tests
forge test --gas-report # Gas usage report

# Coverage
forge coverage
forge coverage --report lcov  # For IDE integration

# Deploy (local)
anvil                   # Start local node (terminal 1)
forge script script/Deploy.s.sol --fork-url http://localhost:8545 --broadcast
```

## Foundry Version

```
forge 1.5.0-stable (2025-11-26)
Solidity 0.8.30
OpenZeppelin 5.5.0
```
