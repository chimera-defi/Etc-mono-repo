# Aztec Node Setup Script -- Gap Analysis & Spec

## Why Aztec Doesn't Have a Setup Script

Ethereum and Monad both have full server-provisioning scripts because they have **well-defined, production-grade validator roles**:

| Chain | Role | Setup Script | What It Does |
|-------|------|-------------|--------------|
| Ethereum | Validator | `run_1.sh` + `run_2.sh` | OS harden, create user, install EL+CL+MEV clients, systemd services, firewall, AIDE |
| Monad | Validator | `setup_server.sh` + `bootstrap_all.sh` | Create user, install monad-bft binary, sysctl, systemd services, Caddy, UFW, monitoring |
| Aztec | **None defined** | `setup-env.sh` (dev only) | Installs nargo + aztec-nargo + deps for contract development |

The Aztec scripts today are **developer toolchain**, not infrastructure. They set up a dev laptop to write/compile/test Noir contracts -- they don't provision a server to run an Aztec network node.

### Why the gap exists

1. **Aztec mainnet is new** (launched Nov 2025). Network roles are still stabilizing.
2. **No public "run a validator" guide** exists yet -- the team is still iterating on the sequencer/prover economics.
3. **Our focus was contracts first** -- build the liquid staking protocol, validate economics, then worry about infra.
4. **Staking requires running validators** -- the IMPLEMENTATION-PLAN.md calls for 3 validators at ~$500/mo each, but nobody built the provisioning scripts yet.

---

## What Aztec Network Roles Exist

From the Aztec CLI source (`aztec-packages/yarn-project/aztec/src/cli/aztec_start_options.ts`), verified Feb 2026:

| Role | CLI Flag | Description | Production-Ready |
|------|----------|-------------|-----------------|
| **Node** | `--node` | Full Aztec node (state sync, P2P, RPC) | Yes (devnet running) |
| **Sequencer** | `--sequencer` | Orders and batches L2 txs into blocks | Yes (devnet has sequencers) |
| **Prover Node** | `--prover-node` | Generates ZK proofs for rollup batches | Partial (within node only) |
| **Prover Broker** | `--prover-broker` | Distributes proving jobs | Partial |
| **Prover Agent** | `--prover-agent` | Worker that executes proving jobs | Partial |
| **Archiver** | `--archiver` | Indexes L2 blocks and events | Yes |
| **PXE** | `--pxe` | Private execution environment (user-facing) | Yes |
| **P2P Bootstrap** | `--p2p-bootstrap` | P2P network bootstrap node | Yes |
| **TXE** | `--txe` | Testing execution environment | Dev only |
| **Bot** | `--bot` | Transaction bot for testing | Dev only |

### Roles relevant to our liquid staking protocol

For the stAZTEC protocol, we need to run:

1. **Aztec Node** (required) -- syncs state, serves RPC, participates in P2P network
2. **Sequencer** (required for validators) -- proposes blocks, earns fees/rewards
3. **Prover Agent** (optional, revenue opportunity) -- generates proofs, earns prover fees
4. **PXE** (required for our protocol) -- private execution for user-facing operations
5. **Archiver** (optional, useful) -- indexes events for our frontend/bots

---

## Key Environment Variables (from Aztec source)

### Node config
| Variable | Description | Default |
|----------|-------------|---------|
| `ETHEREUM_HOSTS` | L1 RPC endpoints (comma-separated) | Required |
| `L1_CHAIN_ID` | L1 chain ID | 1 (mainnet) |
| `NETWORK` | Network name | Required |
| `DATA_DIRECTORY` | Where to store node data | `/data` |
| `P2P_ENABLED` | Enable P2P networking | true |
| `PORT` | HTTP RPC port | 8080 |
| `ADMIN_PORT` | Admin API port | 8880 |

### Sequencer config
| Variable | Description | Default |
|----------|-------------|---------|
| `SEQ_POLLING_INTERVAL_MS` | Poll interval for new slots | 1000 |
| `SEQ_MAX_TX_PER_BLOCK` | Max txs per block | varies |
| `SEQ_MIN_TX_PER_BLOCK` | Min txs per block | 1 |
| `COINBASE` | Recipient of block rewards | Required |
| `FEE_RECIPIENT` | Address to receive fees | Required |
| `SEQ_PUBLISHER_PRIVATE_KEY` | L1 private key for publishing proofs | Required |

### L1 contracts (auto-discovered from registry)
| Variable | Description |
|----------|-------------|
| `L1_CONTRACTS_REGISTRY_ADDRESS` | L1 registry contract address |
| `ROLLUP_CONTRACT_ADDRESS` | L1 rollup contract address |

---

## Proposed Setup Scripts

### Comparison with existing chains

```
Ethereum:                        Monad:                          Aztec (proposed):
run_1.sh (root)                  setup_server.sh                 setup_aztec_node.sh
  -> OS update                     -> create user                  -> create user
  -> SSH hardening                 -> install binary               -> install aztec CLI
  -> create user                   -> sysctl                       -> install node service
  -> consolidated security         -> install services             -> install sequencer service (opt)
                                   -> caddy/firewall               -> install prover service (opt)
run_2.sh (non-root)             bootstrap_all.sh                  -> sysctl tuning
  -> dependencies                  -> setup_server.sh              -> caddy/firewall
  -> MEV selection                 -> monitoring                   -> preflight + smoke test
  -> client selection              -> hardening
  -> install clients                                             bootstrap_aztec.sh
  -> systemd services                                              -> setup_aztec_node.sh
                                                                   -> monitoring
                                                                   -> hardening
                                                                   -> L1 connectivity check
```

### `setup_aztec_node.sh` -- Core setup (mirrors Monad `setup_server.sh`)

```
setup_aztec_node.sh [--with-sequencer] [--with-prover] [--with-caddy] [--with-firewall]

Phase 1: Provisioning
  -> create_aztec_user.sh (system user: aztec)
  -> install_aztec_cli.sh (aztec CLI from official installer or Docker)
  -> install_sysctl.sh (shared primitive, tuned for Aztec)

Phase 2: Services
  -> install_aztec_node_service.sh (systemd unit for aztec start --node)
  -> install_aztec_pxe_service.sh (systemd unit for PXE, optional)
  -> if --with-sequencer: install_aztec_sequencer_service.sh
  -> if --with-prover: install_aztec_prover_service.sh

Phase 3: Networking
  -> if --with-caddy: install_caddy.sh (shared primitive)
  -> if --with-firewall: install_firewall_ufw.sh (shared primitive, Aztec ports)

Phase 4: Verification
  -> preflight_check.sh (verify binary, config, L1 connectivity)
  -> e2e_smoke_test.sh (node responds to RPC, block height advancing)
```

### `bootstrap_aztec.sh` -- Full bootstrap (mirrors Monad `bootstrap_all.sh`)

```
bootstrap_aztec.sh [--with-sequencer] [--with-prover] [--with-caddy]
                   [--with-firewall] [--with-monitoring] [--with-hardening]

  -> setup_aztec_node.sh (with forwarded flags)
  -> if --with-monitoring: docker compose up (prometheus + grafana + loki)
  -> if --with-hardening: harden_ssh.sh + fail2ban + unattended upgrades
  -> L1 connectivity verification (can reach Ethereum RPC + Aztec registry)
```

---

## Aztec-Specific Ports

| Port | Service | Protocol | Firewall |
|------|---------|----------|----------|
| 8080 | Node RPC | TCP | Allow (local or Caddy proxy) |
| 8880 | Admin API | TCP | Deny external |
| 40400 | P2P TCP | TCP | Allow |
| 40400 | P2P UDP | UDP | Allow |

---

## Aztec-Specific Config Files

```
/etc/aztec/
  node.env              # ETHEREUM_HOSTS, NETWORK, DATA_DIRECTORY, PORT, P2P_ENABLED
  sequencer.env         # SEQ_PUBLISHER_PRIVATE_KEY, COINBASE, FEE_RECIPIENT (if sequencer)
  prover.env            # Prover agent config (if prover)
/var/lib/aztec/         # Node data directory
```

---

## Systemd Units

### aztec-node.service
```ini
[Unit]
Description=Aztec Network Node
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=aztec
EnvironmentFile=/etc/aztec/node.env
ExecStart=/usr/local/bin/aztec start --node --archiver --port ${PORT} --admin-port ${ADMIN_PORT}
Restart=on-failure
RestartSec=10
TimeoutStopSec=120
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### aztec-sequencer.service (optional)
```ini
[Unit]
Description=Aztec Sequencer
After=aztec-node.service
Requires=aztec-node.service

[Service]
Type=simple
User=aztec
EnvironmentFile=/etc/aztec/node.env
EnvironmentFile=/etc/aztec/sequencer.env
ExecStart=/usr/local/bin/aztec start --node --sequencer --archiver
Restart=on-failure
RestartSec=10
TimeoutStopSec=120
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### aztec-prover.service (optional)
```ini
[Unit]
Description=Aztec Prover Agent
After=network-online.target

[Service]
Type=simple
User=aztec
EnvironmentFile=/etc/aztec/prover.env
ExecStart=/usr/local/bin/aztec start --prover-agent
Restart=on-failure
RestartSec=30
TimeoutStopSec=300
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

---

## Hardware Requirements (Estimated)

| Role | CPU | RAM | Disk | Network |
|------|-----|-----|------|---------|
| Node only | 4+ cores | 16 GB | 500 GB SSD | 100 Mbps |
| Node + Sequencer | 8+ cores | 32 GB | 1 TB SSD | 500 Mbps |
| Prover Agent | 16+ cores | 64 GB | 100 GB SSD | 100 Mbps |

Note: These are estimates. Actual requirements will be validated on devnet/testnet before mainnet deployment. The prover is CPU/memory-intensive due to ZK proof generation.

---

## What Blocks Implementation Today

| Blocker | Status | When Resolved |
|---------|--------|---------------|
| Aztec CLI binary distribution | Available via `aztec-up` installer | Now |
| Node can sync from devnet | Yes, `aztec start --node --network devnet` works | Now |
| Sequencer registration on L1 | Requires staking 200k AZTEC on L1 rollup contract | After TGE |
| Prover economics finalized | Still evolving | TBD |
| Mainnet RPC endpoints stable | Devnet endpoints available | Mainnet stable Q2 2026? |

### What we CAN build now
- `setup_aztec_node.sh` for devnet/testnet node operators
- Systemd units + env file templates
- UFW rules for Aztec ports
- Health checks (node RPC responds, block height advancing, L1 reachable)
- Smoke test (start node, query version, check sync)

### What we CANNOT build yet
- Sequencer staking flow (requires L1 staking contract interaction + 200k AZTEC)
- Prover agent economics (fee structure not finalized)
- Mainnet-specific config (endpoints, chain IDs, contract addresses)

---

## Implementation Priority

**Phase 1 (now):** Build the node setup scripts targeting devnet. This validates the infra-kit pattern and gives us a working Aztec adapter before sequencer economics are finalized.

**Phase 2 (post-TGE):** Add sequencer registration, staking flow, L1 contract interaction. This requires tokens and a stable mainnet.

**Phase 3 (when prover economics land):** Add prover agent setup, proving job distribution, hardware sizing recommendations.
