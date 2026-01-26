# Monad Validator MVP Scripts

Small, safe helpers to validate RPC, uptime endpoints, and local devnet runs. These are intentionally minimal; no irreversible actions.

## Canonical Path

All Monad infra assets now live under `staking/monad/infra/`. Legacy `staking/impl/monad/infra` has been removed.

## Quickstart

```bash
./scripts/check_prereqs.sh
RPC_URL=http://localhost:8080 ./scripts/status_server.py
./scripts/e2e_smoke_test.sh
```

## One-Step Setup

```bash
./scripts/setup_server.sh
```

Optional Caddy install:

```bash
./scripts/setup_server.sh --with-caddy
```

Optional binary install:

```bash
MONAD_BFT_BIN_SRC=/path/to/monad-bft \
MONAD_CONFIG_SRC=/path/to/config.toml \
./scripts/setup_server.sh
```

## Ops TODO

- Set `RPC_URL` in `/etc/monad/status.env` and enable `monad-status.service`.
- Install sysctl tuning with `scripts/install_sysctl.sh` before running monad-bft devnet.
- Create the `monad` system user with `scripts/create_monad_user.sh`.
- Update `status.liquidmonad.xyz` and `ops@liquidmonad.xyz` if using a different domain.
- Block public access to `:8787`; expose only through Caddy or another proxy.
- Use `RUNBOOK.md` for start/restart/rollback steps.

## Scripts

- `scripts/check_rpc.sh <rpc-url> [method]`
  - Calls JSON-RPC (default `eth_blockNumber`).
- `scripts/uptime_probe.sh <status-url>`
  - Checks a `/status` endpoint or uptime URL.
- `scripts/status_server.py`
  - Minimal `/status` JSON endpoint for local use (set `RPC_URL`).
- `scripts/collect_node_info.sh`
  - Prints a small JSON snapshot of CPU, memory, and disk.
- `scripts/run_local_devnet.sh [monad-bft-path]`
  - Runs the monad-bft local devnet docker flow.
- `scripts/check_prereqs.sh`
  - Checks for required binaries (curl, rg, python3).
- `scripts/install_sysctl.sh [path]`
  - Writes the monad sysctl tuning file and applies it.
- `scripts/install_systemd_unit.sh [src] [dest]`
  - Installs the validator systemd unit skeleton.
- `scripts/create_monad_user.sh [user] [group] [home]`
  - Creates the system user/group and owns `/etc/monad` + `/opt/monad-status`.
- `scripts/install_status_service.sh [src] [dest] [target_dir] [env_src] [env_dest]`
  - Installs the status server systemd unit and copies the script.
- `scripts/install_validator_service.sh [src] [dest] [env_src] [env_dest]`
  - Installs the validator systemd unit and env file.
- `scripts/install_validator_binary.sh <binary-src> [config-src] [bin-dest] [config-dest]`
  - Installs the validator binary and optional config.
- `scripts/preflight_check.sh [bin] [config] [status_env]`
  - Validates critical file paths before starting services.
- `config/status.env.example`
  - Environment variables for the status server.
- `config/validator.env.example`
  - Environment variables for the validator service.
- `config/README.md`
  - Config layout and per-node overrides.
- `config/nodes/validator-1/README.md`
- `config/nodes/validator-2/README.md`
- `systemd/override.conf`
  - Example systemd overrides for flags/env/limits.
- `config/nginx-status.conf.example`
  - Nginx reverse proxy snippet for `/status`.
- `config/Caddyfile.status.example`
  - Caddy reverse proxy with basic rate limiting.
- `scripts/install_caddy.sh [caddyfile_src] [caddyfile_dest]`
  - Installs Caddy and applies the status reverse proxy.
- `scripts/setup_server.sh [--with-caddy]`
  - Runs sysctl + service installs + tests in one go.
- `RUNBOOK.md`
  - MVP runbook for start, checks, and rollback.
- `DEPLOY_CHECKLIST.md`
  - One-page production checklist.
- `watchers/README.md`
  - Placeholder for future monitoring.
- `scripts/e2e_smoke_test.sh`
  - End-to-end smoke test for status server + mock RPC routes.

## Example

```bash
./scripts/check_rpc.sh http://localhost:8080 eth_chainId
./scripts/uptime_probe.sh https://status.liquidmonad.xyz/status
./scripts/status_server.py
RPC_URL=http://localhost:8080 ./scripts/status_server.py
./scripts/collect_node_info.sh
./scripts/run_local_devnet.sh ~/monad-bft
./scripts/check_prereqs.sh
sudo ./scripts/install_sysctl.sh
sudo ./scripts/install_systemd_unit.sh
sudo ./scripts/install_status_service.sh
./scripts/e2e_smoke_test.sh
```

## Notes

- `rg` is required by the scripts (`ripgrep`).
- Local devnet uses `monad-bft` Docker flow and expects x86 hardware per repo docs.
