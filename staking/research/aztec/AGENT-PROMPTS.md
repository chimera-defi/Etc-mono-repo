# Parallel Agent Prompts for Aztec Staking Development

**Purpose:** Copy-paste prompts for spawning parallel agents to accelerate development.
**Last Updated:** 2025-12-27

---

## 🔴 Stream A: Contract Compilation Agent

**Agent Type:** `general-purpose` or `Plan`
**Priority:** CRITICAL (blocks other streams)
**Estimated Time:** 2-4 hours

```markdown
## Task: Compile Aztec Staking Contracts

You are working on the Aztec liquid staking project at `/home/user/Etc-mono-repo/staking/`.

### Context
We have 6 Noir contracts written for Aztec v2.1.9, but only 1 has been compiled. The others
need compilation with aztec-nargo, which requires Docker.

### Your Mission
1. Set up aztec-nargo compilation environment
2. Attempt to compile each contract in `staking/contracts/aztec-staking-pool/src/`:
   - staked_aztec_token.nr
   - liquid_staking_core.nr
   - vault_manager.nr
   - withdrawal_queue.nr
   - rewards_manager.nr
3. Fix any syntax/compilation errors you encounter
4. Document what works and what doesn't in COMPILATION-STATUS.md

### Key Commands
```bash
# Install Aztec (if Docker available)
bash -i <(curl -s install.aztec.network)
aztec-up

# Compile
cd staking/contracts/aztec-staking-pool
aztec-nargo compile
```

### Success Criteria
- All 6 contracts compile without errors
- Compilation artifacts exist in `target/`
- COMPILATION-STATUS.md updated with ✅ for each contract

### If Docker Unavailable
Document the specific errors and what's needed. Mark TASK-001A as blocked.
```

---

## 🟡 Stream B: Cross-Contract Integration Agent

**Agent Type:** `general-purpose` or `Explore`
**Priority:** HIGH
**Estimated Time:** 3-5 hours

```markdown
## Task: Implement Cross-Contract Calls

You are working on the Aztec liquid staking project at `/home/user/Etc-mono-repo/staking/`.

### Context
The contracts have TODO stubs where they should call other contracts. For example,
LiquidStakingCore.deposit() should call StakedAztecToken.mint() and VaultManager.add_to_pending_pool().

### Your Mission
1. Read all 6 contracts in `staking/contracts/aztec-staking-pool/src/`
2. Find all `// TODO:` comments indicating cross-contract calls
3. Implement the actual contract-to-contract calls using Aztec patterns
4. Update each contract's storage to hold addresses of other contracts

### Aztec Cross-Contract Call Pattern
```noir
// For public→public calls:
OtherContract::at(other_address).function_name(args).call(&mut context);

// For private→public (enqueue for later):
OtherContract::at(other_address).function_name(args).enqueue(&mut context);
```

### Key Files to Modify
- `liquid_staking_core.nr` (most TODOs - calls token, queue, vault)
- `vault_manager.nr` (calls native staking)
- `rewards_manager.nr` (calls token for rate update)

### Success Criteria
- All TODO stubs replaced with actual cross-contract calls
- Each contract stores addresses of contracts it needs to call
- No circular dependencies between contracts
- Update TASKS.md: Mark TASK-106, TASK-107 as complete when done
```

---

## 🟢 Stream C: Keeper Bot Infrastructure Agent

**Agent Type:** `general-purpose`
**Priority:** MEDIUM
**Estimated Time:** 4-6 hours

```markdown
## Task: Build Keeper Bot Infrastructure

You are working on the Aztec liquid staking project at `/home/user/Etc-mono-repo/staking/`.

### Context
The liquid staking protocol needs off-chain keeper bots to:
1. Trigger staking when pool reaches 200k AZTEC
2. Claim rewards and update exchange rate periodically
3. Process withdrawal queue for fulfilled requests

### Your Mission
1. Create `staking/bots/` directory structure
2. Implement 3 keeper bots in TypeScript:
   - `staking-keeper/` - monitors pool, triggers execute_stake()
   - `rewards-keeper/` - periodic reward collection
   - `withdrawal-keeper/` - processes ready withdrawals
3. Use Aztec.js for RPC connection

### Reference: Aztec RPC Connection
```typescript
import { createAztecNodeClient } from "@aztec/aztec.js/node";
const node = createAztecNodeClient("https://next.devnet.aztec-labs.com");
```

### Directory Structure to Create
```
staking/bots/
├── package.json
├── tsconfig.json
├── staking-keeper/
│   └── src/index.ts
├── rewards-keeper/
│   └── src/index.ts
└── withdrawal-keeper/
    └── src/index.ts
```

### Success Criteria
- All 3 bot skeletons compile with `tsc`
- Bots can connect to Aztec devnet RPC
- README with running instructions
- Update TASKS.md: Mark TASK-301, TASK-303, TASK-304 as in-progress
```

---

## 🔵 Stream D: Integration Test Agent

**Agent Type:** `general-purpose`
**Priority:** MEDIUM (blocked by Stream A)
**Estimated Time:** 4-6 hours

```markdown
## Task: Create Integration Tests

You are working on the Aztec liquid staking project at `/home/user/Etc-mono-repo/staking/`.

### Context
Once contracts compile (Stream A), we need end-to-end tests that verify the full user flow.

### Your Mission
1. Create `staking/contracts/aztec-staking-pool/tests/` directory
2. Write integration tests in TypeScript using Aztec's test framework
3. Test flows:
   - Deposit AZTEC → receive stAZTEC
   - Exchange rate calculation
   - Request withdrawal → wait unbonding → claim
   - 200k threshold triggers staking

### Test Structure
```typescript
describe('Aztec Liquid Staking', () => {
  beforeAll(async () => {
    // Deploy all contracts to sandbox
  });

  it('should deposit AZTEC and receive stAZTEC', async () => {
    // Test deposit flow
  });

  it('should update exchange rate on rewards', async () => {
    // Test rewards flow
  });

  it('should process withdrawal after unbonding', async () => {
    // Test withdrawal flow
  });
});
```

### Success Criteria
- Tests deploy all 6 contracts to local sandbox
- Full deposit→stake→reward→withdraw cycle tested
- Tests pass with `npm test`
- Update TASKS.md: Mark TASK-201, TASK-202 as complete
```

---

## 🟣 Stream E: Documentation & Cleanup Agent

**Agent Type:** `general-purpose` or `Explore`
**Priority:** LOW
**Estimated Time:** 2-3 hours

```markdown
## Task: Documentation Cleanup and NatSpec

You are working on the Aztec liquid staking project at `/home/user/Etc-mono-repo/staking/`.

### Your Mission
1. Add NatSpec documentation to all contract functions
2. Update README.md with current architecture
3. Create deployment guide
4. Ensure all docs are consistent with code

### NatSpec Format for Noir
```noir
/// @notice Deposits AZTEC and mints stAZTEC tokens
/// @dev Calculates stAZTEC amount based on current exchange rate
/// @param amount Amount of AZTEC to deposit (wei)
/// @return Amount of stAZTEC minted
#[public]
fn deposit(amount: u128) -> pub u128 {
    // ...
}
```

### Files to Update
- All `.nr` files in `staking/contracts/aztec-staking-pool/src/`
- `staking/README.md` - add architecture diagram
- Create `staking/contracts/aztec-staking-pool/DEPLOYMENT.md`

### Success Criteria
- Every public function has NatSpec comments
- README has ASCII architecture diagram
- Deployment guide exists with step-by-step instructions
```

---

## 📋 Agent Coordination Notes

### Dependencies
```
Stream A (Compilation) ──┬──→ Stream D (Integration Tests)
                         └──→ Stream C (Keeper Bots need ABIs)

Stream B (Cross-Contract) ──→ Independent, merge when done

Stream E (Docs) ──→ Independent, can run anytime
```

### Merge Strategy
1. Start A and B in parallel
2. When A completes, start C and D
3. E can run anytime
4. Final merge: verify all streams compile together

### Communication Points
- Stream A should update COMPILATION-STATUS.md frequently
- Stream B should not modify function signatures
- Stream C needs ABI files from Stream A output
- Stream D needs Stream A to complete first
