# Hybrid App (Foundry + Hardhat)

Shared Solidity contracts tested with Foundry and deployed with Hardhat Ignition.

## Prerequisites

- Foundry (`forge`, `cast`, `anvil`)
- Node.js 20+
- npm

## Setup

Install dependencies in this order so Foundry and Hardhat are both ready:

```bash
cd Dapps/Hybrid/app
forge install OpenZeppelin/openzeppelin-contracts --no-git
forge install foundry-rs/forge-std --no-git
npm install
```

## Commands

```bash
cd Dapps/Hybrid/app

# Build (both toolchains)
npm run build

# Foundry tests (default)
forge test

# Hardhat tests
npm run test:hardhat

# Coverage (Foundry)
npm run coverage

# Local deployment flow (Hardhat Ignition)
# Terminal 1
npx hardhat node

# Terminal 2
npm run deploy:local
```

## Test Matrix

- `forge test`: Solidity-focused unit/fuzz tests under `test/foundry/`
- `npm run test:hardhat`: TypeScript integration tests under `test/hardhat/`

## Deployment Flow

- Start a local JSON-RPC network with `npx hardhat node`
- Deploy contracts via Ignition with `npm run deploy:local`
- Adjust `hardhat.config.ts` networks before targeting non-local environments

## Folder Map

```text
Dapps/Hybrid/app/
|- contracts/           # Shared Solidity contracts
|  |- Token.sol
|  `- NFT.sol
|- test/
|  |- foundry/          # Foundry tests
|  |  |- Token.t.sol
|  |  `- NFT.t.sol
|  `- hardhat/          # Hardhat tests
|     `- Deploy.test.ts
|- ignition/modules/    # Hardhat Ignition modules
|  `- Deploy.ts
|- foundry.toml         # Foundry config (src=test path remap for contracts/)
|- hardhat.config.ts    # Hardhat config
|- remappings.txt
|- package.json
`- package-lock.json
```
