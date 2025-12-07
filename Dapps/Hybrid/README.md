# Hybrid Foundry + Hardhat Template

Combines **Foundry** (testing) + **Hardhat** (deployment) in one project.

## Quick Start

```bash
cd app
forge install && npm install   # Install deps
forge test                     # Run tests (23 passing)
```

## Why Hybrid?

| Task | Framework | Why |
|------|-----------|-----|
| Testing | Foundry | 11x faster, built-in fuzzing |
| Deployment | Hardhat | Ignition modules, TypeScript types |

## Structure

```
app/
├── contracts/           # Shared Solidity (both frameworks use this)
│   ├── Token.sol       # ERC-20
│   └── NFT.sol         # ERC-721
├── test/foundry/       # Foundry tests (Solidity, with fuzz)
├── test/hardhat/       # Hardhat tests (TypeScript, integration)
├── ignition/modules/   # Deployment scripts
├── foundry.toml        # Foundry config
└── hardhat.config.ts   # Hardhat config
```

## Commands

```bash
# Testing (Foundry)
forge test              # All tests
forge test -vvv         # Verbose
forge test --gas-report # Gas report
forge test --watch      # Watch mode

# Testing (Hardhat integration)
npx hardhat test

# Deploy locally
npx hardhat node                                                    # Terminal 1
npx hardhat ignition deploy ignition/modules/Deploy.ts --network localhost  # Terminal 2

# Coverage
forge coverage
```

## Workflow

1. Write contracts in `contracts/`
2. Write Foundry tests in `test/foundry/`
3. Run `forge test --watch` for fast iteration
4. Deploy with Hardhat Ignition when ready

## Versions

- Foundry 1.5.0, Hardhat 2.27.1, Solidity 0.8.24, OpenZeppelin 5.x
