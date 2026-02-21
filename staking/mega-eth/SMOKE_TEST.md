# MegaETH Smoke Test Documentation

## Overview

The smoke test (`smoke-test.sh`) validates local MegaETH setup without requiring external dependencies like a running Ethereum node or RPC endpoint.

**Run Time:** <10 seconds  
**Dependencies:** Bash, curl (optional)  
**Exit Code:** 0 = pass, 1 = fail  

## What It Tests

### 1. Environment Configuration (Test 1)
**Purpose:** Verify `.env` file exists  
**Checks:**
- `.env` file present
- File is readable

**Why:** Without configuration, nothing else can work.

**Example Output:**
```
✅ Environment file (.env) exists
```

### 2. Environment Variables (Test 2)
**Purpose:** Load and parse environment file  
**Checks:**
- `.env` syntax is valid
- Variables can be parsed

**Why:** Catches format errors (invalid shell syntax).

**Example Output:**
```
✅ Environment variables loaded
```

### 3. Required Variables Present (Test 3)
**Purpose:** Verify all required config keys are set  
**Required Variables:**
```
RPC_URL
CHAIN_ID
MIN_STAKE_AMOUNT
MAX_STAKE_AMOUNT
PROTOCOL_FEE_BPS
VALIDATOR_PUBKEY
```

**Checks:**
- Each variable exists in `.env`
- Variable has a value assigned

**Why:** Missing variables cause runtime errors.

**Example Output:**
```
✅ Variable set: RPC_URL
✅ Variable set: CHAIN_ID
⚠️  Variable not set: PROMETHEUS_URL (using default)
```

### 4. Configuration Files (Test 4)
**Purpose:** Verify supporting config files exist  
**Required Files:**
```
config/.env.example
README.md
SETUP.md
RUNBOOK.md
```

**Why:** Documentation and templates needed for operation.

**Example Output:**
```
✅ File exists: config/.env.example
✅ File exists: README.md
✅ File exists: SETUP.md
✅ File exists: RUNBOOK.md
```

### 5. Directory Structure (Test 5)
**Purpose:** Verify folder layout is correct  
**Required Directories:**
```
config/
scripts/
logs/
docs/
monitoring/
```

**Checks:**
- Each directory exists
- Directories are readable

**Why:** Scripts and logs need proper locations.

**Example Output:**
```
✅ Directory exists: config
✅ Directory exists: scripts
✅ Directory exists: logs
✅ Directory exists: docs
✅ Directory exists: monitoring
```

### 6. Value Validation (Test 6)
**Purpose:** Check parameter formats and ranges  
**Checks:**
- `CHAIN_ID` is numeric
- `VALIDATOR_PUBKEY` is 0x-prefixed hex
- `PROTOCOL_FEE_BPS` is numeric
- `MIN_STAKE_AMOUNT` is numeric
- `MAX_STAKE_AMOUNT` is numeric

**Why:** Catches configuration typos early.

**Example Output:**
```
✅ CHAIN_ID is numeric: 11155111
✅ Validator pubkey format valid (66 chars)
✅ PROTOCOL_FEE_BPS is numeric: 500
✅ MIN_STAKE_AMOUNT is numeric: 32
✅ MAX_STAKE_AMOUNT is numeric: 1000
```

### 7. RPC Connectivity (Test 7)
**Purpose:** Verify RPC endpoint is reachable (optional)  
**Checks:**
- If `RPC_URL` is set to local (`localhost:8545`): skip
- Otherwise: try HTTP POST to RPC endpoint
- If succeeds: mark as reachable
- If fails: warn (might not have internet)

**Why:** Catches network issues before validator startup.

**Example Output:**
```
ℹ️  Local RPC URL detected (skip connectivity check for local dev)
```

Or:
```
✅ RPC endpoint reachable: https://sepolia.infura.io/v3/YOUR_KEY
```

Or:
```
⚠️  RPC endpoint unreachable: https://sepolia.infura.io/v3/YOUR_KEY
(dev environment may not have internet)
```

### 8. Script Permissions (Test 8)
**Purpose:** Ensure scripts are executable  
**Checks:**
- `setup-env.sh` is executable
- `smoke-test.sh` is executable
- `validate-config.sh` is executable
- `check-endpoints.sh` is executable

**Why:** Non-executable scripts can't run.

**Example Output:**
```
✅ Executable: setup-env.sh
✅ Executable: smoke-test.sh
✅ Executable: validate-config.sh
✅ Executable: check-endpoints.sh
```

## Running the Test

### Basic Run
```bash
./scripts/smoke-test.sh
```

### Output Examples

**All Pass:**
```
🧪 MegaETH Smoke Test
======================================
Test 1: Environment configuration
✅ Environment file (.env) exists

Test 2: Loading environment variables
✅ Environment variables loaded

Test 3: Required environment variables
✅ Variable set: RPC_URL
✅ Variable set: CHAIN_ID
...

Test 8: Script permissions
✅ Executable: setup-env.sh
...

======================================
Test Results Summary
======================================
Passed:  17
Failed:  0
Warned:  1

✅ Smoke test PASSED with warnings

Next steps:
  1. Review warnings above
  2. Edit .env if needed: nano .env
  3. Run full test: ./scripts/validate-config.sh
```

**With Failures:**
```
🧪 MegaETH Smoke Test
======================================
Test 1: Environment configuration
❌ Environment file (.env) not found
   Run: ./scripts/setup-env.sh

======================================
Test Results Summary
======================================
Passed:  0
Failed:  1
Warned:  0

❌ Smoke test FAILED

Next steps:
  1. Run: ./scripts/setup-env.sh
  2. Edit: .env
  3. Retry: ./scripts/smoke-test.sh
```

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Pass or pass with warnings | Ready to proceed |
| 1 | Failed | Fix errors and retry |

## Using in CI/CD

Smoke test is CI-friendly:

```bash
#!/bin/bash
# .github/workflows/config-check.yml

- name: Smoke test
  run: |
    cd staking/mega-eth
    ./scripts/smoke-test.sh
    
# Exits with 0 if valid, 1 if invalid
# CI automatically fails job if exit code is 1
```

## Common Failures

### 1. ".env not found"
```bash
./scripts/setup-env.sh
./scripts/smoke-test.sh
```

### 2. "Variable not set"
Edit `.env`:
```bash
nano .env
# Set the missing variable
./scripts/smoke-test.sh
```

### 3. "Invalid validator pubkey"
Check format:
```bash
# Valid: 0x + 64 hex characters (32 bytes)
grep VALIDATOR_PUBKEY .env

# Generate new:
VALIDATOR_PUBKEY=0x$(openssl rand -hex 32)
echo "VALIDATOR_PUBKEY=$VALIDATOR_PUBKEY" >> .env
```

### 4. "RPC endpoint unreachable"
If local:
```bash
# Expected for local dev (no internet needed)
# Configure testnet if you want RPC tests:
grep RPC_URL .env
# Should be: https://sepolia.infura.io/v3/YOUR_KEY
```

## Integration with Other Tests

**Test Chain:**
1. `smoke-test.sh` — Local validation (this file)
2. `validate-config.sh` — Value range checking
3. `check-endpoints.sh` — RPC connectivity (if configured)

**Typical Flow:**
```bash
# 1. Setup
./scripts/setup-env.sh

# 2. Validate (this test)
./scripts/smoke-test.sh

# 3. Check connectivity
./scripts/check-endpoints.sh

# 4. Full validation
./scripts/validate-config.sh

# 5. Ready to start validators!
```

## Extending the Test

To add custom validation:

```bash
# Edit scripts/smoke-test.sh
# Add test after "Test 8: Script permissions"

echo "Test 9: Custom Validation"
if some_condition; then
    test_pass "Description"
else
    test_fail "Description"
fi
```

## Performance

**Benchmarks:**

| Operation | Time |
|-----------|------|
| Load .env | <100ms |
| Validate format | <50ms |
| Check files | <200ms |
| RPC connectivity | 1-5s (depends on endpoint) |
| **Total** | <10s |

## See Also

- [SETUP.md](SETUP.md) — Setup guide
- [RUNBOOK.md](RUNBOOK.md) — Operations
- [scripts/smoke-test.sh](scripts/smoke-test.sh) — Test implementation

---

**Test Version:** 1.0  
**Last Updated:** February 21, 2026  
**Status:** Production
