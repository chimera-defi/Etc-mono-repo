# Infra-Kit Modular Architecture

**Goal:** Extensible framework for multi-chain infrastructure adapters

---

## Current Structure

```
staking/research/infra-kit/
├── adapters/
│   ├── ethereum/       # NEW - Our implementation
│   ├── aztec/         # Existing
│   └── monad/         # Existing
├── COMMAND_CONTRACT.md  # 7 required commands
├── ENV_CONTRACT.md     # Environment variables
├── PORT_REGISTRY.md    # Port allocations
└── README.md
```

---

## Adapter Interface (The Contract)

Every chain adapter MUST implement:

```
adapters/<chain>/
├── bootstrap.sh      # Required: Full setup
├── preflight.sh    # Required: Validate env
├── smoke.sh        # Required: Quick health check
├── status.sh       # Required: Service status
├── start.sh        # Required: Start services
├── stop.sh         # Required: Stop services
├── logs.sh         # Required: View logs
└── exports.sh      # Required: Configuration
```

---

## Environment Contract (Shared)

All adapters MUST support these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `STACK_NAME` | Chain identifier | ethereum |
| `STACK_USER` | Service user | eth-ethereum |
| `NETWORK` | Network | mainnet/sepolia |
| `STACK_DATA_DIR` | Data directory | /data/ethereum |
| `STACK_RPC_URL` | RPC endpoint | http://localhost:8545 |
| `STACK_P2P_PORT` | P2P port | 30303 |
| `STACK_METRICS_PORT` | Metrics port | 6060 |

---

## Port Registry (Global)

Each adapter registers ports to avoid conflicts:

| Chain | Service | Port | Protocol |
|-------|---------|------|----------|
| ethereum | EL RPC | 8545 | HTTP |
| ethereum | EL Engine | 8551 | HTTP |
| ethereum | CL RPC | 5052 | HTTP |
| ethereum | EL P2P | 30303 | TCP |
| aztec | RPC | 8080 | HTTP |
| monad | RPC | 8545 | HTTP |
| monad | Status | 8787 | HTTP |

---

## Shared Utilities

```
adapters/
└── shared/
    ├── common_functions.sh    # Shared by all adapters
    ├── systemd_utils.sh       # systemctl wrappers
    ├── jwt_utils.sh          # JWT secret generation
    ├── port_check.sh         # Validate ports free
    └── install_utils.sh      # Binary download, verify
```

---

## Adding a New Chain

### Step 1: Create Adapter Directory
```bash
mkdir -p adapters/newchain
cp -r adapters/ethereum/* adapters/newchain/
```

### Step 2: Customize exports.sh
Set chain-specific variables:
```bash
export STACK_NAME=newchain
export DEFAULT_RPC_PORT=8545
export DEFAULT_P2P_PORT=30303
```

### Step 3: Update PORT_REGISTRY.md
Add new chain's port allocations.

### Step 4: Test Commands
Verify all 7 commands work:
```bash
./preflight.sh
./smoke.sh
./status.sh
./start.sh
./stop.sh
./logs.sh
```

---

## Ethereum Adapter (Reference Implementation)

```
adapters/ethereum/
├── bootstrap.sh      # Phase 1 (run_1.sh) + Phase 2 (run_2.sh)
├── preflight.sh    # Port, deps, disk checks
├── smoke.sh        # RPC health (eth_blockNumber)
├── status.sh       # systemctl status
├── start.sh        # systemctl start
├── stop.sh         # systemctl stop
├── logs.sh         # journalctl wrapper
└── exports.sh      # EL_CLIENT, CL_CLIENT, NETWORK, etc.
```

---

## Configuration Precedence

1. Environment variables (highest priority)
2. exports.sh defaults
3. PORT_REGISTRY.md allocations
4. COMMAND_CONTRACT.md requirements (lowest)

---

## Integration with stack-cli

The unified CLI should dispatch to chain-specific adapters:

```bash
# Current:
./stack-cli.sh --stack=ethereum status

# Future (with modular):
./stack-cli.sh --stack=<chain> <command>
```

---

## Benefits of Modular Architecture

1. **Copy-Paste New Chains**: New adapters can copy ethereum/ and modify exports.sh
2. **Shared Utils**: Common functions in shared/ avoid duplication
3. **Port Registry**: Prevents conflicts between chains
4. **Contract Compliance**: COMMAND_CONTRACT.md ensures all adapters implement same 7 commands
5. **Testing**: Each adapter can be tested independently

---

## Next Steps

1. Create `adapters/shared/` with common utilities
2. Refactor ethereum adapter to use shared utilities
3. Document the adapter interface in COMMAND_CONTRACT.md
4. Add Port Registry entries for all chains
