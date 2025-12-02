# AGENTS.md - Guide for AI Coding Assistants

## Project Overview

This is a Solidity smart contract development workspace with two parallel projects:
- **Foundry Project** (`foundry-project/`): Rust-based toolchain for fast testing
- **Hardhat Project** (`hardhat-project/`): JavaScript-based toolchain for dApp development

## Key Paths

| Path | Description |
|------|-------------|
| `foundry-project/src/` | Foundry Solidity contracts |
| `foundry-project/test/` | Foundry tests (Solidity) |
| `hardhat-project/contracts/` | Hardhat Solidity contracts |
| `hardhat-project/test/` | Hardhat tests (TypeScript) |
| `Makefile` | Unified commands for both projects |

## Commands

### Build
```bash
# Both projects
make build

# Individual
cd foundry-project && forge build
cd hardhat-project && npx hardhat compile
```

### Test
```bash
# Both projects  
make test

# Individual with verbose
cd foundry-project && forge test -vvvv
cd hardhat-project && npx hardhat test
```

### Security Analysis
```bash
make slither              # Run Slither on both
~/.local/bin/slither .    # In specific project directory
```

## Important Notes for AI Assistants

1. **Dual Framework**: Both projects contain similar contracts - changes should be synchronized when possible

2. **Test Conventions**:
   - Foundry: Test files end with `.t.sol`, test functions start with `test` or `testFuzz_`
   - Hardhat: Test files end with `.test.ts`

3. **Dependencies**:
   - Foundry: Uses `forge-std` from `lib/`
   - Hardhat: Uses OpenZeppelin from `node_modules/`

4. **Solidity Version**: Both use `0.8.20`

5. **Environment Variables**: RPC URLs and API keys should use `.env` (not committed)

6. **Path Resolution**:
   - Foundry binaries: `~/.foundry/bin/` (forge, cast, anvil, chisel)
   - Slither: `~/.local/bin/slither`

## Adding New Contracts

1. Create contract in both projects (if parity is desired)
2. Add tests in both test directories
3. Update deployment scripts if needed
4. Run `make test` to verify both work

## Common Issues

1. **Foundry not found**: Run `source ~/.bashrc` or use full path `~/.foundry/bin/forge`
2. **Slither not found**: Use `~/.local/bin/slither` or add to PATH
3. **Hardhat compile errors**: Run `npm install` first in `hardhat-project/`
4. **Type errors in Hardhat**: Run `npx hardhat compile` to regenerate typechain
