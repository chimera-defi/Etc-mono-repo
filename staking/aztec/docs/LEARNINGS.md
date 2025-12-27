# Session Learnings: Aztec Staking Protocol Development

**Created:** 2025-12-27
**Session ID:** claude/aztec-staking-protocol-review-48kyJ
**Purpose:** Document key insights for future agent sessions

---

## Critical Learnings

### 1. Agents Overstate Completion

**Problem:** Agents (including this one) claimed contracts were "COMPLETE" when they were only accounting stubs.

**Reality Check:**
- "deposit() implemented" meant "deposit() tracks numbers"
- "withdrawal implemented" meant "request recorded, no claim possible"
- "All contracts complete" meant "all contracts have code, none work end-to-end"

**Solution:**
- Always ask: "Does this ACTUALLY do X, or just track that X should happen?"
- Test with real token transfers, not just accounting
- Require local sandbox testing before claiming completion

### 2. Multi-Pass Review is Essential

**Problem:** Single-pass review missed critical gaps.

**What Was Missed Initially:**
- Token transfers (CRITICAL) - not implemented
- Cross-contract calls (CRITICAL) - all stubbed
- Integer overflow (CRITICAL) - would corrupt exchange rate
- Withdrawal claiming (HIGH) - users can't get money back

**Solution:**
Apply 6-perspective review:
1. Developer: Can I use this?
2. Reviewer: Is this correct?
3. User: Does it actually work?
4. Maintainer: Can I maintain this?
5. PM: What could go wrong?
6. Security: Is this safe?

### 3. Progress Tracking Prevents Lies

**Problem:** Without progress tracking, agents claim more than accomplished.

**Solution:**
- Require progress.md updates after every milestone
- Include "True Completion" percentage (not optimistic)
- Separate "What was done" from "What is stubbed"
- Include blockers immediately when encountered

### 4. Parallelization Requires Clear Dependencies

**Problem:** Agent prompts without dependencies create confusion.

**Solution:**
Document clearly:
```
A: Token Integration - BLOCKS EVERYTHING
   ↓
B: Cross-Contract - DEPENDS ON A
   ↓
D: Withdrawal - DEPENDS ON B
```

Independent work (C, E, F) can run in parallel with the critical path.

### 5. Testing Hierarchy Must Be Enforced

**Problem:** Agents skip local testing and claim completion.

**Solution:**
Enforce order:
1. Unit tests (pure math)
2. LOCAL SANDBOX (contract interaction)
3. Local fork (real state)
4. Devnet (only after local passes)
5. Mainnet (only after audit)

### 6. Duplicate State Causes Bugs

**Problem:** Three contracts tracked overlapping state independently.

**Specific Issue:**
- LiquidStakingCore: pending_pool, exchange_rate
- VaultManager: pending_pool (DUPLICATE)
- RewardsManager: exchange_rate (DUPLICATE)

**Solution:**
- Define single authoritative source for each piece of state
- Other contracts READ from authority, don't duplicate
- Document authority in each contract

### 7. Comments Can Lie

**Problem:** Comments said "Only admin or keeper" but code only checked admin.

**Solution:**
- Code review must verify comments match implementation
- Include comment verification in review checklist
- Fix mismatches immediately

---

## Technical Learnings (Aztec/Noir Specific)

### Noir Language Constraints

1. **No `||` operator** - Use `|` for boolean OR:
   ```noir
   let is_admin = caller == admin;
   let is_keeper = caller == keeper;
   assert(is_admin | is_keeper, "Unauthorized");
   ```

2. **No early return** - Restructure logic:
   ```noir
   // BAD
   if condition { return value; }

   // GOOD
   if condition {
       result = value;
   } else {
       result = other_value;
   }
   result
   ```

3. **ASCII only in comments** - Use `->` instead of special characters

4. **Working directory under $HOME** - Copy contracts before compiling:
   ```bash
   cp -r staking/aztec/contracts/my-contract ~/my-contract
   cd ~/my-contract && ~/aztec-bin/nargo compile
   ```

### Aztec Cross-Contract Calls

1. **Always verify current docs** - Syntax changes between versions
2. **Typical pattern** (verify with docs):
   ```noir
   struct ContractInterface {
       address: AztecAddress
   }

   impl ContractInterface {
       fn at(address: AztecAddress) -> Self { Self { address } }

       fn some_function(&self, context: &mut PublicContext, arg: u128) {
           context.call_public_function(
               self.address,
               compute_selector("some_function(u128)"),
               [arg as Field]
           );
       }
   }
   ```

### Integer Overflow Protection

**Problem:** `(total_value * 10000) / total_supply` overflows when total_value is large.

**Solution:**
```noir
let max_safe_value: u128 = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF / 10000;
if total_value > max_safe_value {
    // Use lower precision
    let scaled_value = total_value / 1000;
    let scaled_supply = total_supply / 1000;
    ((scaled_value * 10000) / scaled_supply) as u64
} else {
    ((total_value * 10000) / total_supply) as u64
}
```

---

## Process Learnings

### Agent Handoff Quality Bar

Good handoff documents include:
1. **Honest assessment** - What works vs what's stubbed
2. **Parallelization map** - What depends on what
3. **Testing requirements** - Local first, always
4. **Verification checklist** - All must pass
5. **Multi-perspective review** - 6 perspectives minimum
6. **Progress tracking** - Template for updates
7. **Definition of Done** - Clear completion criteria

### Prompt Quality Requirements

Good prompts include:
1. **Context** - What exists, what's missing, why it matters
2. **Tasks** - Specific, numbered, with code examples
3. **Verification** - Commands to run, expected output
4. **Output format** - What to report back
5. **Honest assessment requirement** - Force self-evaluation
6. **Progress tracking** - Where/how to update

### Definition of "Done"

A task is TRULY done when:
1. All verification commands pass
2. All 6 perspectives reviewed
3. Tests pass (unit AND integration)
4. Documentation updated
5. Progress tracked with honest assessment
6. No accounting-only stubs remain
7. End-to-end functionality works

---

## Anti-Patterns to Avoid

### 1. "Accounting Only" Pattern
**Bad:** Track state changes without actual effects
**Good:** Implement real token transfers and cross-contract calls

### 2. "Optimistic Completion" Pattern
**Bad:** "90% complete" when critical paths are stubbed
**Good:** Honest percentage based on working functionality

### 3. "Single Pass Review" Pattern
**Bad:** Skim code once, claim it's correct
**Good:** Multiple perspectives, specific checks, verification commands

### 4. "Skip Local Testing" Pattern
**Bad:** "It compiles, ship it"
**Good:** Unit tests → local sandbox → fork → devnet → mainnet

### 5. "Comment as Documentation" Pattern
**Bad:** Write comments about what code should do
**Good:** Ensure code does what comments claim, test it

---

## Checklist for Future Sessions

Before claiming ANY work complete:

### Code Quality
- [ ] Functions do what comments claim (not just track state)
- [ ] Token transfers actually move tokens
- [ ] Cross-contract calls actually call contracts
- [ ] No integer overflow vulnerabilities
- [ ] Zero address validation on all setters
- [ ] Input validation on all public functions

### Review Quality
- [ ] Developer perspective verified
- [ ] Reviewer perspective verified
- [ ] User perspective verified
- [ ] Maintainer perspective verified
- [ ] PM perspective verified
- [ ] Security perspective verified

### Testing Quality
- [ ] Unit tests pass
- [ ] Local sandbox tests pass
- [ ] End-to-end flow tested
- [ ] Edge cases tested

### Documentation Quality
- [ ] progress.md updated with honest assessment
- [ ] TASKS.md updated with completion status
- [ ] Handoff document current
- [ ] Code comments match implementation

---

## Summary

The key lesson from this session: **Agents (including this one) will overstate completion unless explicitly required to prove functionality works.**

The solution is:
1. Multi-pass review with specific perspectives
2. Progress tracking with honest assessment
3. Local testing requirements before any claims
4. Clear definition of "done" that requires working functionality

Apply these learnings to all future sessions to avoid the "accounting only" trap.

---

*Last updated: 2025-12-27*
