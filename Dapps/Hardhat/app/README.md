# Hardhat App

Solidity contracts, TypeScript tests, and Hardhat Ignition deployment module for the Hardhat comparison module.

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
cd Dapps/Hardhat/app
npm install
```

## Commands

```bash
cd Dapps/Hardhat/app

# Compile
npx hardhat compile

# Test
npx hardhat test
REPORT_GAS=true npx hardhat test

# Coverage
npx hardhat coverage

# Deploy (local node)
# Terminal 1
npx hardhat node

# Terminal 2
npx hardhat ignition deploy ignition/modules/Deploy.ts --network localhost
```

## Folder Map

```text
Dapps/Hardhat/app/
|- contracts/           # Solidity contracts
|  |- Token.sol
|  `- NFT.sol
|- test/                # Hardhat TypeScript tests
|  |- Token.ts
|  `- NFT.ts
|- ignition/modules/    # Hardhat Ignition modules
|  `- Deploy.ts
|- hardhat.config.ts    # Hardhat config
|- tsconfig.json
|- package.json
`- package-lock.json
```
