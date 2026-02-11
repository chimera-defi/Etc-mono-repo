# Foundry App

Solidity contracts, Foundry tests, and a Forge deployment script for the Foundry comparison module.

## Prerequisites

- Foundry (`forge`, `cast`, `anvil`)
- Git

## Setup

```bash
cd Dapps/Foundry/app
forge install OpenZeppelin/openzeppelin-contracts --no-git
forge install foundry-rs/forge-std --no-git
```

## Commands

```bash
cd Dapps/Foundry/app

# Build
forge build

# Test
forge test
forge test --gas-report

# Coverage
forge coverage

# Deploy (local node)
# Terminal 1
anvil

# Terminal 2
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

## Folder Map

```text
Dapps/Foundry/app/
|- src/                 # Solidity contracts
|  |- Token.sol
|  `- NFT.sol
|- test/                # Foundry test suites
|  |- Token.t.sol
|  `- NFT.t.sol
|- script/              # Foundry deployment script
|  `- Deploy.s.sol
|- foundry.toml         # Foundry config
|- foundry.lock
`- remappings.txt
```
