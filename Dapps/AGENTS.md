# AGENTS.md - Dapp Development Framework Comparison Guidelines

This document provides guidance for AI coding assistants working on the Dapp framework comparison project.

## Project Overview

This project compares **Foundry (Forge)** and **Hardhat** for smart contract development by implementing identical projects in each framework.

## Folder Structure

```
Dapps/
├── AGENTS.md              # This file
├── README.md              # Project overview and status
├── .artifacts/            # Comparison documents
│   ├── FRAMEWORK_COMPARISON.md
│   └── TLDR_SUMMARY.md
├── Foundry/               # Foundry implementation
│   ├── README.md
│   ├── TASKS.md
│   ├── HANDOFF.md
│   ├── UNDERSTANDING.md
│   ├── NEXT_STEPS.md
│   └── app/              # The actual Foundry project
└── Hardhat/              # Hardhat implementation
    ├── README.md
    ├── TASKS.md
    ├── HANDOFF.md
    ├── UNDERSTANDING.md
    ├── NEXT_STEPS.md
    └── app/              # The actual Hardhat project
```

## Implementation Requirements

### Contracts to Implement

Both frameworks must implement identical contracts:

1. **Token.sol (ERC-20)**
   - Constructor: `(name, symbol, initialSupply)`
   - Functions: `mint(to, amount)`, `burn(amount)`
   - Access: `Ownable` (only owner can mint)

2. **NFT.sol (ERC-721)**
   - Constructor: `(name, symbol, baseURI)`
   - Functions: `mint(to)` returns `tokenId`
   - Metadata: `tokenURI(tokenId)` returns URI

### Test Coverage

Both implementations must test:
- Deployment and initial state
- Token transfers
- Minting and burning
- Access control (onlyOwner)
- Edge cases and reverts
- (Foundry only) Fuzz tests

### Metrics to Collect

After implementation, record:
- Compilation time
- Test execution time
- Gas usage per function
- Code coverage percentage
- Lines of code (contracts + tests)

## Agent Workflow

### Starting Work

1. Read `HANDOFF.md` in the framework folder
2. Review `TASKS.md` for current task backlog
3. Check `NEXT_STEPS.md` for prioritized actions
4. Implement following the task priorities (P0 first)

### During Implementation

1. Follow the exact contract interfaces specified
2. Use the provided code templates as starting points
3. Update `TASKS.md` as you complete tasks
4. Document any issues or insights

### After Completion

1. Update framework `README.md` with final status
2. Create `METRICS.md` with benchmark data
3. Update `/workspace/Dapps/README.md` status table
4. Compare results with the other framework

## Best Practices

### Foundry-Specific
- Use `forge-std/Test.sol` for testing utilities
- Leverage `vm` cheatcodes for test setup
- Add fuzz tests for numeric inputs
- Use `forge fmt` for code formatting

### Hardhat-Specific
- Use `loadFixture` for efficient test setup
- Follow Mocha/Chai patterns for assertions
- Use Hardhat Ignition for deployments
- Enable gas reporter in tests

### Both Frameworks
- Use OpenZeppelin for ERC-20/721 base
- Solidity version 0.8.20+
- Enable optimizer (200 runs)
- Aim for >80% test coverage

## Comparison Focus Areas

When comparing implementations, focus on:

1. **Developer Experience**
   - How intuitive is the setup?
   - How helpful are error messages?
   - How easy is debugging?

2. **Speed**
   - Compilation time
   - Test execution time
   - Hot reload/recompile speed

3. **Testing Patterns**
   - Ease of writing tests
   - Built-in capabilities (fuzzing, mocking)
   - Debugging failed tests

4. **Deployment**
   - Script complexity
   - Verification process
   - Multi-chain support

## Do NOT

- Modify the other framework's implementation
- Change the contract interfaces (must be identical)
- Skip P0 tasks to work on lower priority items
- Push to git without updating documentation

## Resources

### Foundry
- [Foundry Book](https://book.getfoundry.sh/)
- [forge-std](https://github.com/foundry-rs/forge-std)

### Hardhat
- [Hardhat Docs](https://hardhat.org/docs)
- [Hardhat Ignition](https://hardhat.org/ignition)

### Shared
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity Docs](https://docs.soliditylang.org/)

---

**Last Updated**: December 2024
