# Handoff Document — Foundry Implementation

## Quick Start for Next Agent

```bash
# 1. Install Foundry (if not installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 2. Navigate to project
cd /workspace/Dapps/Foundry/app

# 3. Initialize project (if not done)
forge init --no-commit

# 4. Build and test
forge build
forge test
```

## Current Status

| Phase | Status | Notes |
|-------|--------|-------|
| Setup | ⏳ Not Started | Need to run `forge init` |
| Contracts | ⏳ Not Started | Implement Token + NFT |
| Tests | ⏳ Not Started | Write Solidity tests |
| Deploy | ⏳ Not Started | Create deployment scripts |

## Your Mission

Implement a complete Foundry project with:
1. **ERC-20 Token** with mint/burn capabilities
2. **ERC-721 NFT** with metadata URI
3. **Comprehensive tests** including fuzz tests
4. **Deployment scripts**
5. **Performance metrics** (compile time, test time, gas)

## Key Files to Create

```
app/
├── foundry.toml          # Config - set solc version to 0.8.20+
├── src/
│   ├── Token.sol         # ERC-20 implementation
│   └── NFT.sol           # ERC-721 implementation
├── test/
│   ├── Token.t.sol       # Token tests
│   └── NFT.t.sol         # NFT tests
└── script/
    └── Deploy.s.sol      # Deployment script
```

## Important Commands

```bash
# Install OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Set up remappings
echo '@openzeppelin/=lib/openzeppelin-contracts/' >> remappings.txt

# Run specific test
forge test --match-test testTransfer -vvvv

# Gas report
forge test --gas-report

# Coverage
forge coverage

# Format code
forge fmt
```

## Expected Output

After completion, update:
1. `README.md` - Mark implementation complete
2. `TASKS.md` - Check off completed tasks
3. `../README.md` - Update status table
4. Create `METRICS.md` with performance data

## Contract Requirements

### Token.sol
```solidity
// Required functions:
- constructor(name, symbol, initialSupply)
- mint(to, amount) onlyOwner
- burn(amount)
- Standard ERC-20 (transfer, approve, transferFrom)
```

### NFT.sol
```solidity
// Required functions:
- constructor(name, symbol)
- mint(to) onlyOwner -> returns tokenId
- tokenURI(tokenId) -> string
- Standard ERC-721 (transferFrom, safeTransferFrom, approve)
```

## Comparison Notes

When complete, compare against Hardhat implementation:
- Compile time
- Test execution time
- Gas usage
- Code verbosity
- Developer experience

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [forge-std Cheatcodes](https://book.getfoundry.sh/cheatcodes/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

## Caveats for Implementing Agent

1. **Verify remapping path** - The `@openzeppelin/contracts/` path may need adjustment after `forge install`
2. **Template code is untested** - Contract templates are starting points, not verified
3. **32 tasks total** - Plan for 2-4 hours of work
4. **Measure actual benchmarks** - Don't trust claims about speed; measure compile/test times

---

**Priority**: Complete P0 tasks first, then P1 tasks.
**Time Estimate**: 2-4 hours for full implementation with testing.
