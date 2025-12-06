# Task Backlog — Foundry Implementation

## Priority Levels
- **P0**: Critical - Must complete for valid comparison
- **P1**: High - Important for meaningful comparison  
- **P2**: Medium - Nice to have
- **P3**: Low - Future enhancement

---

## Phase 1: Project Setup

| ID | Priority | Task | Status |
|----|----------|------|--------|
| FND-01 | P0 | Install Foundry toolchain (`foundryup`) | ⏳ Not Started |
| FND-02 | P0 | Initialize project with `forge init` | ⏳ Not Started |
| FND-03 | P0 | Configure `foundry.toml` (solc version, optimizer) | ⏳ Not Started |
| FND-04 | P0 | Install OpenZeppelin contracts via forge install | ⏳ Not Started |
| FND-05 | P1 | Set up remappings for imports | ⏳ Not Started |

## Phase 2: Smart Contracts

| ID | Priority | Task | Status |
|----|----------|------|--------|
| FND-10 | P0 | Implement ERC-20 Token contract (src/Token.sol) | ⏳ Not Started |
| FND-11 | P0 | Add minting functionality to Token | ⏳ Not Started |
| FND-12 | P0 | Add burn functionality to Token | ⏳ Not Started |
| FND-13 | P0 | Implement ERC-721 NFT contract (src/NFT.sol) | ⏳ Not Started |
| FND-14 | P0 | Add metadata URI functionality to NFT | ⏳ Not Started |
| FND-15 | P1 | Add access control (Ownable) to contracts | ⏳ Not Started |

## Phase 3: Testing

| ID | Priority | Task | Status |
|----|----------|------|--------|
| FND-20 | P0 | Write Token unit tests (test/Token.t.sol) | ⏳ Not Started |
| FND-21 | P0 | Test: deployment and initial state | ⏳ Not Started |
| FND-22 | P0 | Test: transfer functionality | ⏳ Not Started |
| FND-23 | P0 | Test: minting and burning | ⏳ Not Started |
| FND-24 | P0 | Test: allowance and transferFrom | ⏳ Not Started |
| FND-25 | P0 | Write NFT unit tests (test/NFT.t.sol) | ⏳ Not Started |
| FND-26 | P0 | Test: NFT minting and ownership | ⏳ Not Started |
| FND-27 | P0 | Test: NFT transfers | ⏳ Not Started |
| FND-28 | P0 | Test: tokenURI functionality | ⏳ Not Started |
| FND-29 | P1 | Add fuzz tests for Token transfers | ⏳ Not Started |
| FND-30 | P1 | Add fuzz tests for NFT operations | ⏳ Not Started |
| FND-31 | P2 | Add invariant tests | ⏳ Not Started |

## Phase 4: Deployment

| ID | Priority | Task | Status |
|----|----------|------|--------|
| FND-40 | P0 | Create deployment script (script/Deploy.s.sol) | ⏳ Not Started |
| FND-41 | P1 | Add deployment verification script | ⏳ Not Started |
| FND-42 | P2 | Document deployment to testnet | ⏳ Not Started |

## Phase 5: Analysis & Documentation

| ID | Priority | Task | Status |
|----|----------|------|--------|
| FND-50 | P0 | Generate gas report (`forge test --gas-report`) | ⏳ Not Started |
| FND-51 | P0 | Run coverage report (`forge coverage`) | ⏳ Not Started |
| FND-52 | P0 | Record compilation time | ⏳ Not Started |
| FND-53 | P0 | Record test execution time | ⏳ Not Started |
| FND-54 | P1 | Document any issues encountered | ⏳ Not Started |
| FND-55 | P1 | Update README with final instructions | ⏳ Not Started |

---

## Acceptance Criteria

A task is complete when:
1. Code compiles without errors (`forge build`)
2. All tests pass (`forge test`)
3. No linting issues (`forge fmt --check`)
4. Functionality matches Hardhat implementation

## Notes

- Use forge-std for testing utilities (Test, console, vm)
- Follow Solidity style guide
- Document any Foundry-specific patterns discovered
- Compare experience with Hardhat for final report

---

**Last Updated**: December 2024
