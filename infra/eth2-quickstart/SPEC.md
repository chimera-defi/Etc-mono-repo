# ETH2 Quickstart Integration Spec

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

