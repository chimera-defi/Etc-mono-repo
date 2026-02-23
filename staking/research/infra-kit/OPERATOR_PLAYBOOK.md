# Operator Playbook: Validator Stack Operations

**Status**: P1 Work (in progress, ready for post-merge PR #221)  
**Date**: 2026-02-22  
**Scope**: Daily operations, deployment, troubleshooting across Ethereum, Aztec, Monad stacks

This playbook provides step-by-step procedures for common validator operator tasks.

---

## Table of Contents

1. [Bootstrap a New Stack](#bootstrap-a-new-stack)
2. [Daily Health Checks](#daily-health-checks)
3. [Deploying Fallback Model](#deploying-fallback-model)
4. [Troubleshooting](#troubleshooting)

---

## Bootstrap a New Stack

### Prerequisites

Before starting, ensure:
- [ ] Ubuntu 22.04 LTS or compatible
- [ ] Minimum 16GB RAM (varies by stack)
- [ ] 200GB free disk space (depends on chain)
- [ ] SSH access to deploy host
- [ ] Git installed

### Step 1: Choose Your Stack

Available stacks:
- **ethereum**: Ethereum consensus + execution clients
- **aztec**: Aztec L2 validator
- **monad**: Monad validator
- **mega-eth**: Mega ETH (available Q2 2026)

### Step 2: Set Environment

```bash
# Clone/update repository
git clone https://github.com/chimera-defi/Etc-mono-repo
cd Etc-mono-repo

# Set stack name
export STACK_NAME=ethereum  # or aztec, monad

# Review contracts
cat dev/Etc-mono-repo/staking/research/infra-kit/ENV_CONTRACT.md
cat dev/Etc-mono-repo/staking/research/infra-kit/PORT_REGISTRY.md
```

### Step 3: Run Bootstrap

```bash
# Ethereum (requires two phases)
bash eth2-quickstart/run_1.sh          # Phase 1: root setup
bash eth2-quickstart/run_2.sh          # Phase 2: non-root setup

# Aztec or Monad
bash staking/aztec/infra/scripts/bootstrap_aztec.sh    # Aztec
# or
bash staking/monad/infra/scripts/bootstrap_monad.sh    # Monad
```

### Step 4: Validate

```bash
# Run preflight checks
bash staking/aztec/infra/scripts/preflight_aztec.sh --json

# Run smoke test
bash staking/aztec/infra/scripts/smoke_aztec.sh --json
```

---

## Daily Health Checks

### Quick Status Check

```bash
# See current service status
bash staking/aztec/infra/scripts/status_aztec.sh

# JSON output for monitoring systems
bash staking/aztec/infra/scripts/status_aztec.sh --json
```

### Logs Access

```bash
# Last 50 lines
bash staking/aztec/infra/scripts/logs_aztec.sh --tail=50

# Follow live logs
bash staking/aztec/infra/scripts/logs_aztec.sh --follow

# Logs since specific time
bash staking/aztec/infra/scripts/logs_aztec.sh --since="1 hour ago"
```

### Service Lifecycle

```bash
# Start validator
bash staking/aztec/infra/scripts/start_aztec.sh

# Stop validator
bash staking/aztec/infra/scripts/stop_aztec.sh --timeout=30

# Force stop (if graceful fails)
bash staking/aztec/infra/scripts/stop_aztec.sh --force

# Restart
bash staking/aztec/infra/scripts/stop_aztec.sh && \
bash staking/aztec/infra/scripts/start_aztec.sh
```

---

## Deploying Fallback Model

### Overview

The fallback model (LFM2.5-1.2B) provides tool-calling capability when primary models are unavailable. 
This section covers deployment alongside your validator.

### Review Fallback Model Details

First, understand the fallback model:
- **Model**: LFM2.5-1.2B (state-space hybrid architecture)
- **Accuracy**: 11/12 (91.67%) on tool-calling benchmark
- **Safety**: Perfect restraint (never calls tools unnecessarily)
- **Status**: Production-ready for fallback selection (PR #219)

See [Benchmark Results](../../../../bench/MODEL_SELECTION.md) for detailed comparison with other models.

### Prerequisites for Fallback Model

Ensure you have:
- [ ] Ollama installed (see [installation guide](https://ollama.ai/))
- [ ] ~3-4GB available memory
- [ ] ~5GB free disk space (for model)
- [ ] Network access to RPC endpoints

### Step 1: Install Ollama Runtime

```bash
# Download and install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Verify installation
ollama --version
```

### Step 2: Pull LFM Model

```bash
# Pull LFM2.5-1.2B (takes 1-2 hours on first run)
ollama pull lfm2.5-thinking:1.2b

# Verify installation
ollama list | grep lfm
```

Installation guide: See [Benchmark README](../../../../bench/README.md) § "LFM Installation".

### Step 3: Reserve Port and Resources

Check [Port Registry](../PORT_REGISTRY.md) for port allocations:

```bash
# Default: LFM uses port 8000
# Check if available:
netstat -an | grep 8000

# If conflict (e.g., another validator using 8080), override:
export STACK_FALLBACK_MODEL_PORT=8001
```

Reserve memory:

```bash
# Check available RAM
free -h

# Recommended: at least 6GB free total (for LFM + validator together)
# LFM uses ~3-4GB; validator uses ~4-8GB depending on chain
```

### Step 4: Deploy Fallback Model with Validator

```bash
# Bootstrap validator with fallback model support
export STACK_FALLBACK_MODEL_PORT=8000   # or custom port

# For Ethereum (example)
bash eth2-quickstart/run_1.sh
bash eth2-quickstart/run_2.sh

# For Aztec/Monad
bash staking/aztec/infra/scripts/bootstrap_aztec.sh --with-fallback

# Note: In P1 work (PR #221), unified CLI will simplify this:
# stack-ops.sh --stack=ethereum bootstrap --with-fallback
```

### Step 5: Start Fallback Model Service

```bash
# In a separate terminal or as systemd service
ollama serve

# Alternative: Run in background
nohup ollama serve > /var/log/ollama.log 2>&1 &
```

### Step 6: Validate Integration

```bash
# Check health
curl http://localhost:8000/api/health

# Run integrated smoke test
bash staking/aztec/infra/scripts/smoke_aztec.sh --json

# Expected output:
# {
#   "validator_rpc": "ok",
#   "fallback_model": "ok", 
#   "sync_status": "synced"
# }
```

### Monitoring Fallback Model

```bash
# Check if model is running
ps aux | grep ollama

# Check logs
tail -f /var/log/ollama.log

# Monitor resource usage
# LFM memory: watch -n 1 'free -h | grep -E "Mem|available"'
# LFM CPU: watch -n 1 'top -p $(pgrep ollama)'

# Call status endpoint for JSON metrics
curl http://localhost:8000/api/status --silent | jq '.'
```

---

### Troubleshooting Fallback Model

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Port 8000 already in use | `netstat -an \| grep 8000` shows LISTEN | Override: `export STACK_FALLBACK_MODEL_PORT=8001` |
| Ollama not installed | `which ollama` returns nothing | Run: `curl -fsSL https://ollama.ai/install.sh \| sh` |
| Model pull fails | `ollama pull` times out or errors | Check internet connection; retry with `--timeout 3600` |
| Insufficient memory | `free -h` shows <4GB available | Stop other services or deploy LFM on separate host |
| Health check returns error | `curl http://localhost:8000/api/health` fails | Check LFM logs: `tail -f /var/log/ollama.log` |
| LFM doesn't respond to tools | `curl http://localhost:8000/api/tools` fails | Restart Ollama; check model is loaded: `ollama list` |

---

## Troubleshooting

### Service Won't Start

1. **Check logs for errors:**
   ```bash
   bash staking/aztec/infra/scripts/logs_aztec.sh --tail=100
   ```

2. **Verify preflight checks pass:**
   ```bash
   bash staking/aztec/infra/scripts/preflight_aztec.sh --json
   ```

3. **Check resource availability:**
   ```bash
   free -h                    # Memory
   df -h /var/lib/aztec      # Disk (or STACK_DATA_DIR)
   ps aux | wc -l            # Processes
   ```

4. **Verify environment variables:**
   ```bash
   env | grep STACK_
   ```

### RPC Not Responsive

1. **Check service status:**
   ```bash
   systemctl status aztec-node
   ```

2. **Test RPC directly:**
   ```bash
   curl -X POST http://localhost:8080 \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"net_version","id":1}'
   ```

3. **Check logs for RPC errors:**
   ```bash
   bash staking/aztec/infra/scripts/logs_aztec.sh --since="10 minutes ago" | grep -i rpc
   ```

### Port Conflicts

1. **Find what's using port:**
   ```bash
   sudo netstat -tulpn | grep :8080
   # or
   sudo lsof -i :8080
   ```

2. **Resolve conflict:**
   - Option A: Stop conflicting service
   - Option B: Override port via ENV: `export STACK_RPC_PORT=8081`
   - See [Port Registry](../PORT_REGISTRY.md) for safe allocations

### Sync Issues

1. **Check block height:**
   ```bash
   curl http://localhost:8080/api/status --silent | jq '.block_height'
   ```

2. **Review peer connections:**
   ```bash
   curl http://localhost:8080/api/peers --silent | jq '.peer_count'
   ```

3. **Check network:**
   ```bash
   ping -c 3 8.8.8.8        # Internet
   curl https://1.1.1.1     # External DNS
   ```

---

### Multi-Stack Host

If running multiple stacks on same host:

1. **Allocate unique ports:**
   ```bash
   # See PORT_REGISTRY.md for defaults
   # Override as needed:
   export STACK_RPC_PORT=8081        # Instead of 8080
   export STACK_P2P_PORT=40401       # Instead of 40400
   ```

2. **Verify no collisions:**
   ```bash
   netstat -tulpn | grep -E '8080|8081|40400|40401'
   ```

3. **Check each service independently:**
   ```bash
   bash staking/ethereum/infra/scripts/status_ethereum.sh --json
   bash staking/aztec/infra/scripts/status_aztec.sh --json
   ```

---

## Integration with Unified CLI (P1)

**Coming in PR #221**: Infrastructure Phase P1 will provide unified dispatcher:

```bash
# Instead of:
bash staking/aztec/infra/scripts/bootstrap_aztec.sh

# You'll be able to use:
./stack-ops.sh --stack=aztec bootstrap

# Run status on all stacks:
./stack-ops.sh all status --json
```

For now, use stack-specific scripts documented above.

---

## Additional Resources

- **Environment Contract**: [ENV_CONTRACT.md](ENV_CONTRACT.md) — Environment variables reference
- **Port Registry**: [PORT_REGISTRY.md](PORT_REGISTRY.md) — Port allocations and guardrails
- **Command Contract**: [COMMAND_CONTRACT.md](COMMAND_CONTRACT.md) — Available commands and options
- **Benchmark Results**: [../../../../bench/MODEL_SELECTION.md](../../../../bench/MODEL_SELECTION.md) — Fallback model selection rationale
- **Architect Documentation**: [ARCHITECTURE.md](ARCHITECTURE.md) — Design + shared primitives

---

**Last Updated**: 2026-02-22  
**Status**: P1 work (playbook expanded in PR #221)  
**Feedback**: File issues in GitHub
