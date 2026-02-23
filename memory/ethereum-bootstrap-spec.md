# Ethereum Bootstrap Specification

**Based on:** eth2-quickstart code analysis + infra-kit COMMAND_CONTRACT

---

## Overview

Ethereum bootstrap wraps `run_1.sh` (system setup) + `run_2.sh` (client installation) into a single `bootstrap.sh` that respects the infra-kit framework.

---

## Phase Breakdown

### Phase 1: System Setup (root required)

**Source:** `run_1.sh` from eth2-quickstart

**Flow:**
1. SSH Key Collection - Calls `collect_and_backup_authorized_keys()` to gather keys from root, SUDO_USER, and all /home/* users
2. System Update - `apt update`, `apt upgrade`, `apt full-upgrade`
3. Phase 1 Dependencies - Runs `$SCRIPT_DIR/install/utils/install_dependencies.sh --phase1`
4. User Setup - Creates non-root user (`LOGIN_UNAME='eth'`) with sudo + SSH key migration via `setup_secure_user()`
5. SSH Hardening - Deploys hardened sshd_config, changes port, enables key-only auth via `configure_ssh()`
6. Security Setup - Runs `$SCRIPT_DIR/install/security/consolidated_security.sh` (firewall, fail2ban, AIDE)
7. Network Hardening - `apply_network_security()` - sysctl settings, disables bluetooth/cups/avahi
8. Security Monitoring - `setup_security_monitoring()` - cron job every 15 min
9. Copy to User Home - Copies repo to `/home/eth/eth2-quickstart`
10. Handoff Info - Generates `/root/handoff_info.txt` with SSH connection details

**Environment Variables Used:** `LOGIN_UNAME`, `YourSSHPortNumber`, `maxretry`, `SUDO_USER`, `CI`, `CI_KEYS_FILE`

### Phase 2: Client Installation (non-root)

**Source:** `run_2.sh` from eth2-quickstart

**Two Modes:**
A. Flag Mode (Non-interactive):
```
./run_2.sh --execution=geth --consensus=prysm --mev=mev-boost
./run_2.sh --execution=besu --consensus=lighthouse --mev=commit-boost --ethgas
./run_2.sh --execution=reth --consensus=lighthouse --mev=none --skip-deps
```

B. Interactive Mode: TUI menus for client selection

**Installation Flow:**
1. Phase 2 Dependencies - Runs install_dependencies.sh --phase2 (user-level: Go, Rust, etc.)
2. JWT Secret - Ensures `$HOME/secrets/jwt.hex` exists via `ensure_jwt_secret()`
3. Client Installation:
   - Consensus first (generates JWT)
   - Execution client (needs JWT)
   - MEV solution (mev-boost, commit-boost, or none)
   - Optional ETHGas (requires commit-boost)

**Scripts Called:**
- `$SCRIPT_DIR/install/consensus/{prysm,lighthouse,lodestar,teku,nimbus,grandine}.sh`
- `$SCRIPT_DIR/install/execution/{geth,besu,erigon,nethermind,nimbus_eth1,reth,ethrex}.sh`
- `$SCRIPT_DIR/install/mev/install_mev_boost.sh`
- `$SCRIPT_DIR/install/mev/install_commit_boost.sh`
- `$SCRIPT_DIR/install/mev/install_ethgas.sh`

**Adapter Wrap Strategy:**
```bash
# Preferred: flag mode for automation
./run_2.sh \
  --execution=geth \
  --consensus=prysm \
  --mev=mev-boost \
  --skip-deps  # if deps already installed
```

---

## Environment Variables

### Required (from ENV_CONTRACT)

| Variable | Description | Default |
|----------|-------------|---------|
| `STACK_NAME` | Stack identifier | "ethereum" |
| `EL_CLIENT` | Execution client | geth |
| `CL_CLIENT` | Consensus client | lighthouse |
| `NETWORK` | Network to join | mainnet |
| `STACK_USER` | User to run services | eth-${STACK_NAME} |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `MEV_BOOST_ENABLED` | Enable MEV-Boost | false |
| `MEV_RELAY` | MEV relay URL | flashbots |
| `VALIDATOR_MODE` | validator/light/full | validator |
| `GETH_HTTP_PORT` | EL RPC port | 8545 |
| `GETH_P2P_PORT` | EL P2P port | 30303 |
| `CL_RPC_PORT` | CL RPC port | 5052 |
| `CL_P2P_PORT` | CL P2P port | 9000 |
| `FEE_RECIPIENT` | Fee recipient address | - |
| `GRAFITTI` | Validator graffiti string | - |
| `MAX_PEERS` | Max P2P peers | 100 |

### MEV Relay Options (from exports.sh)
| Relay | URL |
|-------|-----|
| Flashbots | https://relay.flashbots.net |
| Ultrasound | https://relay.ultrasound.money |
| Relayooor | https://relayooor.wtf |
| Agnostic | https://agnostic-relay.net |
| Eden | https://relay.edennetwork.io |

---

## Port Registry (from exports.sh)

### Execution Clients
| Client | HTTP RPC | WebSocket | Engine API | P2P |
|--------|----------|-----------|------------|------|
| Nethermind | 8545 | 8546 | 8551 | 30303 |
| Besu | 8545 | 8546 | 8551 | 30303 |
| Erigon | 8545 | 8546 | 8551 | 30303 |
| Reth | 8545 | 8546 | 8551 | 30303 |
| Nimbus-eth1 | 8545 | 8546 | 8551 | 30303 |
| Geth | 8545 | 8546 | 8551 | 30303 |
| Ethrex | 8545 | - | 8551 | 30303 |

### Consensus Clients
| Client | RPC | P2P | Metrics |
|--------|-----|------|---------|
| Teku | 5051 | 9000 | 5040 |
| Nimbus | 5052 | 9000 | 8008 |
| Lodestar | 9596 | 9000 | 9796 |
| Grandine | 5052 | 9000 | 5054 |
| Prysm | 4000 | 13000 | 6000 |
| Lighthouse | 5052 | 9000 | 5054 |

### Additional Services
| Service | Port | Protocol |
|---------|------|----------|
| MEV-Boost | 18550 | HTTP |
| Commit-Boost | 18550 | HTTP |
| Commit-Signer | 20000 | HTTP |
| Commit-Metrics | 10000 | HTTP |
| ETHGas | 18552 | HTTP |
| Prometheus | 9090 | HTTP |
| Grafana | 3000 | HTTP |

---

## Command Implementation

### bootstrap.sh

```bash
#!/bin/bash
# Ethereum Adapter - Bootstrap
# Usage: ./bootstrap.sh [--with-monitoring] [--with-firewall] [--with-hardening]

set -e

# Load config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/exports.sh"

STACK_NAME="${ENV_CONTRACT:-ethereum}"
USER_NAME="eth-${STACK_NAME}"

echo "=== Ethereum Bootstrap for ${STACK_NAME} ==="

# Phase 1: System setup (requires root)
if [[ $EUID -eq 0 ]]; then
    echo "[Phase 1/2] System setup..."
    
    # Create user
    useradd -m -s /bin/bash "${USER_NAME}" 2>/dev/null || true
    
    # Setup firewall
    ufw allow 30303/tcp  # Geth P2P
    ufw allow 8551/tcp   # EL Engine API
    ufw allow 9000/tcp   # Lighthouse P2P
    ufw allow 5052/tcp   # Lighthouse RPC
    
    # Generate JWT
    openssl rand -hex 32 > /var/lib/ethereum/jwtsecret
    
    echo "[Phase 1/2] System setup complete. Run as ${USER_NAME} for Phase 2."
    exit 0
fi

# Phase 2: Client installation (as non-root)
echo "[Phase 2/2] Installing clients..."

# Install EL
case "${EL_CLIENT}" in
    geth)
        # Download and install geth
        ;;
    nethermind)
        # Download and install nethermind
        ;;
    # ... other clients
esac

# Install CL
case "${CL_CLIENT}" in
    lighthouse)
        # Download and install lighthouse
        ;;
    # ... other clients
esac

# Create systemd units
sudo tee /etc/systemd/system/eth1.service > /dev/null <<EOF
[Unit]
Description=Ethereum Execution Client
After=network-online.target
Wants=network-online.target

[Service]
User=${USER_NAME}
ExecStart=/usr/local/bin/geth --http --http.port 8545 --authrpc.port 8551 --p2p.port 30303
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
systemctl enable eth1 beacon-chain
systemctl start eth1 beacon-chain

echo "=== Bootstrap Complete ==="
```

---

## Flags (per COMMAND_CONTRACT)

| Flag | Description |
|------|-------------|
| `--with-monitoring` | Enable Prometheus/Grafana |
| `--with-firewall` | Configure UFW rules |
| `--with-hardening` | SSH hardening, fail2ban |
| `--help` | Show usage |

---

## Preflight Checks

Before bootstrap, validate:

1. **Ports free**: 8545, 8551, 30303, 5052, 9000
2. **Dependencies**: curl, jq, openssl, systemctl
3. **Disk space**: Minimum 500GB for mainnet
4. **Memory**: Minimum 16GB RAM
5. **User permissions**: Can create systemd units

---

## Smoke Test

After bootstrap, verify:

1. `curl -X POST localhost:8545 -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'` returns block number
2. `curl localhost:5052/eth/v1/node/syncing` returns sync status
3. `systemctl status eth1 beacon-chain` shows active

---

## Exit Codes

| Code | Meaning |
|------|----------|
| 0 | Success |
| 1 | Generic error (missing dependency, port bound) |
| 2 | Bad arguments |

---

## Idempotency

Bootstrap should be safe to re-run:
- Skip user creation if exists
- Skip port rules if already open
- Skip client download if binary exists
- Skip systemd unit creation if identical

---

## Integration with infra-kit

The adapter should be callable as:
```
staking/research/infra-kit/adapters/ethereum/bootstrap.sh --with-firewall
```

This matches the COMMAND_CONTRACT interface.
