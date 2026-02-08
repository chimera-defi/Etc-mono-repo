# InfraKit Integration Spec (ETH2 Quickstart)

## Architecture

```
infra/
  shared/
    provision/
      base_packages.sh
      create_user.sh
    hardening/
      ssh_hardening.sh
      firewall_ufw.sh
      fail2ban.sh
      sysctl.sh
    services/
      install_systemd_unit.sh
      install_env.sh
    monitoring/
      status_server.py
      check_rpc.sh
      uptime_probe.sh
  eth2-quickstart/
    README.md
    PLAN.md
    SPEC.md
staking/
  monad/
    infra/
      scripts/ -> wrappers calling infra/shared/*
```

## Script Interfaces (Shared)

- `provision/base_packages.sh`
  - Installs core packages (curl, rg, python3, ufw, fail2ban).
- `provision/create_user.sh [user] [group] [home]`
  - Mirrors existing monad helper behavior.
- `hardening/ssh_hardening.sh [port]`
  - Disables root/password auth, sets SSH port.
- `hardening/firewall_ufw.sh [ports]`
  - Minimal inbound rules.
- `hardening/sysctl.sh [profile]`
  - Writes kernel tuning for validator workloads.
- `services/install_systemd_unit.sh [src] [dest]`
  - Generic unit installer.
- `services/install_env.sh [src] [dest]`
  - Env file installer with permissions.
- `monitoring/status_server.py`
  - Shared JSON status endpoint (RPC + node stats).
- `monitoring/check_rpc.sh [rpc-url] [method]`
- `monitoring/uptime_probe.sh [status-url]`

## Mapping: eth2-quickstart -> shared

- `run_1.sh` -> `provision/*` + `hardening/*`
- `exports.sh` -> `services/install_env.sh`
- `select_clients.sh` -> future `clients/select.sh` (optional module)
- `run_2.sh` -> `services/install_systemd_unit.sh` + client installers

## Project Adapters

- `staking/monad/infra/scripts/setup_server.sh`
  - Calls shared provision + hardening modules.
  - Keeps monad-specific config, binary install, and status endpoints.
- Any ETH2 validator project adapter
  - Uses shared modules plus client-specific installers.

## Standards

- Idempotent scripts (safe to rerun).
- No destructive defaults (explicit flags for firewall/ssh changes).
- Consistent env paths:
  - `/etc/<project>/` for config
  - `/opt/<project>/` for app
  - `/var/log/<project>/` for logs

## Risks / Open Questions

- Licensing is unknown (no license metadata). Confirm before reuse.
- Client install flows vary across chains (need adapter layer).
- Ensure all scripts are non-destructive and reversible.

## Roles by Chain (InfraKit Context)

References:
- Ethereum nodes & clients: https://ethereum.org/developers/docs/nodes-and-clients/
- Monad docs: https://docs.monad.xyz/
- Aztec docs: https://docs.aztec.network/

InfraKit covers the shared ops layer. Chain-specific roles live in adapters:

### Ethereum (L1, execution + consensus split)

Typical installed components (4–6):
- Execution client (e.g., Geth/Nethermind/Besu/Erigon)
- Consensus client (e.g., Prysm/Lighthouse/Teku/Nimbus)
- Validator client (often bundled with consensus)
- MEV-Boost (economically near-mandatory for competitive rewards)
- Systemd units + env files
- Monitoring (metrics + status endpoints)

### Monad (L1, monad-bft)

Typical installed components (3–5):
- `monad-bft` validator node binary
- Config + validator keys
- Systemd unit + env file
- Monitoring (status endpoint + metrics)
- Optional reverse proxy (Caddy/Nginx) for public status

### Aztec (L2 rollup roles)

Sequencer role (3–5):
- Aztec sequencer node/daemon
- L1 connectivity (Ethereum RPC + contract addresses)
- Systemd unit + env file
- Monitoring
- Optional bundler/relayer tooling (operator-dependent)

Prover role (4–6):
- Prover daemon
- Proving toolchain (Noir/aztec-nargo + proving artifacts)
- Systemd unit + env file
- High-spec compute dependencies (GPU/CPU tuned)
- Monitoring
- Optional worker orchestration for scaled proving

Validator/committee role (2–4):
- Validator node
- Systemd unit + env file
- Monitoring
- Optional L1 watcher

### MEV vs Proving (Economic Analogy)

- Ethereum MEV is optional by protocol but **near-mandatory economically** for competitive rewards.
- Aztec proving is **core production work** for rollup validity. Revenue is from protocol incentives/fees,
  not extractable ordering like MEV.
