# Task Backlog — Hardhat Implementation

## Priority Levels
- **P0**: Critical - Must complete for valid comparison
- **P1**: High - Important for meaningful comparison  
- **P2**: Medium - Nice to have
- **P3**: Low - Future enhancement

---

## Phase 1: Project Setup

| ID | Priority | Task | Status |
|----|----------|------|--------|
| HH-01 | P0 | Initialize Hardhat project with TypeScript | ⏳ Not Started |
| HH-02 | P0 | Configure hardhat.config.ts (solc version, optimizer) | ⏳ Not Started |
| HH-03 | P0 | Install OpenZeppelin contracts | ⏳ Not Started |
| HH-04 | P1 | Configure gas reporter plugin | ⏳ Not Started |
| HH-05 | P1 | Configure coverage plugin | ⏳ Not Started |

## Phase 2: Smart Contracts

| ID | Priority | Task | Status |
|----|----------|------|--------|
| HH-10 | P0 | Implement ERC-20 Token contract (contracts/Token.sol) | ⏳ Not Started |
| HH-11 | P0 | Add minting functionality to Token | ⏳ Not Started |
| HH-12 | P0 | Add burn functionality to Token | ⏳ Not Started |
| HH-13 | P0 | Implement ERC-721 NFT contract (contracts/NFT.sol) | ⏳ Not Started |
| HH-14 | P0 | Add metadata URI functionality to NFT | ⏳ Not Started |
| HH-15 | P1 | Add access control (Ownable) to contracts | ⏳ Not Started |

## Phase 3: Testing

| ID | Priority | Task | Status |
|----|----------|------|--------|
| HH-20 | P0 | Write Token unit tests (test/Token.ts) | ⏳ Not Started |
| HH-21 | P0 | Test: deployment and initial state | ⏳ Not Started |
| HH-22 | P0 | Test: transfer functionality | ⏳ Not Started |
| HH-23 | P0 | Test: minting and burning | ⏳ Not Started |
| HH-24 | P0 | Test: allowance and transferFrom | ⏳ Not Started |
| HH-25 | P0 | Write NFT unit tests (test/NFT.ts) | ⏳ Not Started |
| HH-26 | P0 | Test: NFT minting and ownership | ⏳ Not Started |
| HH-27 | P0 | Test: NFT transfers | ⏳ Not Started |
| HH-28 | P0 | Test: tokenURI functionality | ⏳ Not Started |
| HH-29 | P1 | Test: access control (onlyOwner) | ⏳ Not Started |
| HH-30 | P1 | Test: edge cases and reverts | ⏳ Not Started |

## Phase 4: Deployment

| ID | Priority | Task | Status |
|----|----------|------|--------|
| HH-40 | P0 | Create Hardhat Ignition module (ignition/modules/Deploy.ts) | ⏳ Not Started |
| HH-41 | P1 | Add deployment verification | ⏳ Not Started |
| HH-42 | P2 | Document deployment to testnet | ⏳ Not Started |

## Phase 5: Analysis & Documentation

| ID | Priority | Task | Status |
|----|----------|------|--------|
| HH-50 | P0 | Generate gas report (`REPORT_GAS=true npx hardhat test`) | ⏳ Not Started |
| HH-51 | P0 | Run coverage report (`npx hardhat coverage`) | ⏳ Not Started |
| HH-52 | P0 | Record compilation time | ⏳ Not Started |
| HH-53 | P0 | Record test execution time | ⏳ Not Started |
| HH-54 | P1 | Document any issues encountered | ⏳ Not Started |
| HH-55 | P1 | Update README with final instructions | ⏳ Not Started |

---

## Acceptance Criteria

A task is complete when:
1. Code compiles without errors (`npx hardhat compile`)
2. All tests pass (`npx hardhat test`)
3. No linting issues (`npm run lint`)
4. Functionality matches Foundry implementation

## Notes

- Use ethers.js v6 (default with Hardhat)
- Follow Mocha/Chai patterns for tests
- Use `loadFixture` for efficient test setup
- Document any Hardhat-specific patterns discovered
- Compare experience with Foundry for final report

---

**Last Updated**: December 2024
