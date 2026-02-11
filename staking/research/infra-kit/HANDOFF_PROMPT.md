# InfraKit Implementation Handoff Prompt

> **Purpose:** This prompt contains everything a sub-agent needs to implement the InfraKit shared staking infra layer. It is self-contained and grounded in verified scripts.

---

## Context

You are implementing **InfraKit**, a shared staking infrastructure layer that extracts common server-ops primitives from existing scripts across three chains and puts chain-specific logic in thin adapters.

**Workspace rules:** Read `.cursorrules` and `CLAUDE.md` at the workspace root before starting. Follow all PR attribution, commit format, and coding guidelines described there.

**Project docs:**
- Research docs: `staking/research/infra-kit/` (18 files -- SPEC.md is the ground truth)
- Monad scripts: `staking/monad/infra/scripts/` (23 production scripts)
- Aztec scripts: `staking/aztec/scripts/` (6 scripts + lib/common.sh)
- eth2-quickstart: `github.com/chimera-defi/eth2-quickstart` (clone from master branch)

---

## What Already Exists

### 1. Monad Infra Scripts (23 files, production-grade)
Located at `staking/monad/infra/scripts/`:
- **Bootstrap:** `setup_server.sh`, `bootstrap_all.sh`
- **User:** `create_monad_user.sh`
- **Binary:** `install_validator_binary.sh`
- **Systemd:** `install_validator_service.sh`, `install_status_service.sh`, `install_systemd_unit.sh`
- **Hardening:** `harden_ssh.sh`, `install_firewall_ufw.sh`, `install_fail2ban.sh`, `enable_unattended_upgrades.sh`, `install_sysctl.sh`
- **Web:** `install_caddy.sh`
- **Monitoring:** `status_server.py`, `healthcheck.sh`, `check_rpc.sh`, `uptime_probe.sh`, `preflight_check.sh`, `e2e_smoke_test.sh`
- **Other:** `collect_node_info.sh`, `backup_monad_config.sh`, `check_prereqs.sh`, `run_local_devnet.sh`

**Key patterns:** `set -euo pipefail`, env var defaults with `${VAR:-default}`, systemd unit copying from config examples, portable grep (not rg).

### 2. eth2-quickstart Scripts (60+ files, external repo)
Located at `github.com/chimera-defi/eth2-quickstart`:
- **Core:** `run_1.sh` (root phase), `run_2.sh` (non-root phase), `exports.sh`, `lib/common_functions.sh` (~1000 lines)
- **7 EL clients:** geth, reth, nethermind, besu, erigon, nimbus_eth1, ethrex
- **6 CL clients:** prysm, lighthouse, teku, nimbus, lodestar, grandine
- **5 MEV scripts:** install_mev_boost, install_commit_boost, install_ethgas, fb_builder_geth, fb_mev_prysm
- **Security:** consolidated_security.sh (UFW + fail2ban + AIDE), nginx_harden.sh, caddy_harden.sh
- **Web:** install_nginx.sh, install_caddy.sh, nginx_helpers.sh, caddy_helpers.sh, web_helpers_common.sh
- **SSL:** install_ssl_certbot.sh, install_acme_ssl.sh
- **Utils:** install_dependencies, select_clients, configure, doctor, start, stats, refresh, update, purge, optional_tools
- **Tests:** run_tests.sh, ci_test_run_1.sh, ci_test_run_2.sh, docker_test.sh, mock_functions.sh, test_utils.sh

**Key patterns:** `common_functions.sh` has logging (`log_info`/`log_warn`/`log_error`), `create_systemd_service()`, `download_file()`, `extract_archive()`, `setup_firewall_rules()`, `configure_ssh()`, `setup_secure_user()`, `check_system_compatibility()`, hardware profile detection.

### 3. Aztec Dev Tooling (6 scripts + shared lib)
Located at `staking/aztec/scripts/`:
- `setup-env.sh`, `smoke-test.sh`, `compile-contracts.sh`, `integration-test.sh`, `local-sandbox-e2e.sh`, `query-devnet.mjs`
- `lib/common.sh`: shared library with colors, logging, env detection, binary finders, contract helpers, devnet connectivity, argument parsing

**Key pattern:** These are dev/test only -- NOT validator ops.

### 4. Aztec Node Infra (3 scripts, functional)
Located at `staking/aztec/infra/scripts/`:
- `setup_aztec_node.sh`: Core setup -- create user, install CLI, sysctl, systemd units for node/sequencer/prover, firewall
- `bootstrap_aztec.sh`: Full bootstrap -- wraps setup + monitoring + hardening + L1 connectivity check
- `check_aztec_node.sh`: Health check -- queries node version and L2 tips

**Key pattern:** These mirror the Monad `setup_server.sh`/`bootstrap_all.sh` pattern. Currently targeting devnet. Sequencer staking requires TGE + 200k AZTEC on L1. See `AZTEC_NODE_SPEC.md` for full gap analysis.

---

## What to Build

### Target Layout

```
staking/infra-kit/
  shared/
    lib/
      common.sh           # Shared functions (logging to stderr, colors, arg parsing, require_root, secure_env_file, safe_download_and_run)
    provision/
      base_packages.sh    # apt update + essential packages
      create_user.sh      # Create system user + group + sudo
    hardening/
      harden_ssh.sh       # SSH config hardening
      firewall_ufw.sh     # UFW setup + chain-specific port rules
      fail2ban.sh         # fail2ban install + jail config
      sysctl.sh           # Kernel tuning (chain-specific params via args)
      unattended_upgrades.sh
    services/
      install_systemd.sh  # Create + install systemd unit from template
      install_env.sh      # Install env file from template
    monitoring/
      status_server.py    # Generic HTTP status endpoint (from Monad)
      check_rpc.sh        # Generic JSON-RPC health check
      healthcheck.sh      # Quick connectivity probe
      uptime_probe.sh     # URL uptime probe
      preflight_check.sh  # Pre-start validation (binary, config, env)
    web/
      install_nginx.sh    # NGINX + rate limiting + DDoS protection
      install_caddy.sh    # Caddy with auto-HTTPS
      install_ssl_certbot.sh
      install_ssl_acme.sh
      nginx_helpers.sh
      caddy_helpers.sh
  adapters/
    ethereum/
      README.md           # How to use with eth2-quickstart
      adapter.sh          # Thin wrapper calling shared primitives + eth2-quickstart
    monad/
      README.md
      adapter.sh          # Thin wrapper calling shared primitives + monad scripts
    aztec/
      README.md
      adapter.sh          # Node infra (devnet) + dev tooling wrapper
  runbooks/
    ethereum.md
    monad.md
    aztec-dev.md
    template.md           # Runbook template for new chains
  tests/
    test_shared.sh        # Unit tests for shared primitives
    smoke_template.sh     # Smoke test template for new adapters
  README.md               # InfraKit top-level README
```

### Implementation Steps

#### Step 1: Create skeleton + shared library
1. Create the directory structure above.
2. Create `shared/lib/common.sh` by merging the best patterns from:
   - eth2-quickstart `lib/common_functions.sh` (logging, systemd, download, firewall)
   - Aztec `scripts/lib/common.sh` (env detection, argument parsing)
   - Monad scripts (portable patterns, env var defaults)

The shared library should include:
- Color constants + logging to stderr (`log_info`, `log_warn`, `log_error` with `>&2`)
- Source guard (`_INFRAKIT_COMMON_SH_LOADED`) to prevent double-sourcing
- `set -euo pipefail` by default
- `show_help_if_requested()` and `has_flag()` from Aztec common.sh
- `create_systemd_service()` from eth2-quickstart common_functions.sh
- `download_file()` / `extract_archive()` from eth2-quickstart
- `setup_firewall_rules()` from eth2-quickstart
- `check_system_compatibility()` from eth2-quickstart
- `command_exists()`, `ensure_directory()`, `check_port()` from eth2-quickstart
- `detect_hardware_profile()` from eth2-quickstart
- `require_root()` -- checks `EUID == 0` or `sudo` available
- `secure_env_file()` -- creates env files with restrictive permissions (`install -m 0600`) to prevent TOCTOU exposure windows for secrets like L1 private keys
- `safe_download_and_run()` -- downloads installer to temp file, verifies HTTP status, then executes (never pipe `curl | bash`)

#### Step 2: Extract shared primitives from Monad scripts
For each script in `staking/monad/infra/scripts/`, create a corresponding shared primitive:

| Monad Script | InfraKit Shared Primitive |
|---|---|
| `create_monad_user.sh` | `provision/create_user.sh` (parameterize user/group) |
| `harden_ssh.sh` | `hardening/harden_ssh.sh` (already portable) |
| `install_firewall_ufw.sh` | `hardening/firewall_ufw.sh` (parameterize ports) |
| `install_fail2ban.sh` | `hardening/fail2ban.sh` (parameterize jail config) |
| `enable_unattended_upgrades.sh` | `hardening/unattended_upgrades.sh` (direct copy) |
| `install_sysctl.sh` | `hardening/sysctl.sh` (parameterize conf path + values) |
| `install_systemd_unit.sh` | `services/install_systemd.sh` (parameterize src/dest) |
| `install_status_service.sh` | `monitoring/status_server_install.sh` (parameterize) |
| `status_server.py` | `monitoring/status_server.py` (already generic) |
| `check_rpc.sh` | `monitoring/check_rpc.sh` (already generic) |
| `healthcheck.sh` | `monitoring/healthcheck.sh` (already generic) |
| `uptime_probe.sh` | `monitoring/uptime_probe.sh` (already generic) |
| `preflight_check.sh` | `monitoring/preflight_check.sh` (parameterize paths) |
| `install_caddy.sh` | `web/install_caddy.sh` (parameterize Caddyfile path) |

#### Step 3: Create adapters
Each adapter is a thin wrapper that:
1. Sources `shared/lib/common.sh`
2. Sets chain-specific env vars
3. Calls shared primitives in the correct order
4. Calls chain-specific install scripts

**Monad adapter** (`adapters/monad/adapter.sh`):
```bash
#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../../shared/lib/common.sh"

# Chain-specific config
CHAIN_USER="${MONAD_USER:-monad}"
CHAIN_GROUP="${MONAD_GROUP:-monad}"
# ... call shared primitives with Monad-specific args
```

**Ethereum adapter** (`adapters/ethereum/adapter.sh`):
- References eth2-quickstart as a git submodule or documents how to wire it in.
- Calls shared hardening primitives for run_1.sh equivalents.
- Delegates to eth2-quickstart client installers for run_2.sh equivalents.

**Aztec adapter** (`adapters/aztec/adapter.sh`):
- Wraps the Aztec infra scripts (`staking/aztec/infra/scripts/`) for node/sequencer/prover setup.
- Also wraps the dev tooling scripts (`staking/aztec/scripts/`) for contract development.
- Sequencer staking is gated on TGE + 200k AZTEC deposit. See `AZTEC_NODE_SPEC.md`.

#### Step 4: Create runbooks
Each runbook should follow this template:
```markdown
# [Chain] Validator Runbook
## Prerequisites (hardware, accounts, keys)
## Setup (step-by-step using adapter)
## Monitoring & Health Checks
## Troubleshooting
## Maintenance (updates, restarts)
```

#### Step 5: Add tests
- `tests/test_shared.sh`: Source `shared/lib/common.sh` and validate key functions work.
- `tests/smoke_template.sh`: Template for adapter-level smoke tests.

---

## Constraints

1. **No hosted control plane** in this phase. Scripts + runbooks only.
2. **Aztec has two layers.** Dev tooling (scripts/) for contracts + node infra (infra/) for node/sequencer/prover. Sequencer staking gated on TGE + 200k AZTEC. See `AZTEC_NODE_SPEC.md`.
3. **Ground every claim in a verified script.** If unsure, mark as TBD.
4. **Use ASCII diagrams only** (no Mermaid) for GitHub compatibility.
5. **snake_case** for all shared primitive filenames and function names.
6. **set -euo pipefail** in every bash script.
7. **Portable commands only** -- use `grep` not `rg`, standard coreutils. No `grep -oP` (PCRE) -- use `sed` for extraction.
8. **Parameterize via env vars** with sane defaults (${VAR:-default} pattern).
9. **Security primitives are shared, not per-chain.** SSH hardening, firewall, fail2ban, secrets management, file permissions all belong in `shared/hardening/`. Chain adapters call them with chain-specific args.
10. **Logging to stderr.** All `log_info`/`log_warn`/`log_error` must write to stderr (`>&2`) so stdout stays clean for data output.

---

## Key Design Decisions (From DECISIONS.md)

1. **Repo-based control plane (MVP):** Scripts + runbooks, no hosted UI.
2. **Shared primitives + thin adapters:** Centralize common ops, keep chain logic in adapters.
3. **Aztec has two layers:** Dev tooling (scripts/) for contracts + node infra (infra/) for node/sequencer/prover. Sequencer staking blocked on TGE.
4. **Status server is shared:** Monad's `status_server.py` is the reference implementation.
5. **Naming:** snake_case for shared scripts, InfraKit for the project name.

---

## Verification Checklist (Before Completing)

- [ ] All shared primitives source `shared/lib/common.sh`.
- [ ] All scripts start with `#!/usr/bin/env bash` and `set -euo pipefail`.
- [ ] All scripts have a `--help` flag.
- [ ] No hardcoded paths -- use env vars with defaults.
- [ ] No `rg` usage -- use `grep` for portability.
- [ ] Monad adapter reproduces the behavior of `setup_server.sh` and `bootstrap_all.sh`.
- [ ] Ethereum adapter documents how to wire in eth2-quickstart.
- [ ] Aztec adapter wraps node infra (devnet) + dev tooling. Sequencer staking gated on TGE.
- [ ] Each adapter has a runbook.
- [ ] `tests/test_shared.sh` passes.
- [ ] README.md documents the project structure and usage.
- [ ] shellcheck passes on all .sh files (if available).
- [ ] No duplicated logic between shared primitives and existing scripts.
- [ ] Env files with secrets use `secure_env_file()` (pre-create with 0600, no TOCTOU window).
- [ ] No `curl | bash` patterns. Use `safe_download_and_run()` (download, verify, execute).
- [ ] All logging functions write to stderr (`>&2`), not stdout.
- [ ] No `grep -oP` (PCRE). Use `sed` or `awk` for portable extraction.

---

## Reference: Shared Functions to Extract from eth2-quickstart common_functions.sh

These functions from eth2-quickstart's `lib/common_functions.sh` are strong candidates for the InfraKit shared library:

**Logging:** `log_info()`, `log_warn()`, `log_error()`
**System:** `command_exists()`, `ensure_directory()`, `check_port()`, `check_service_status()`, `detect_hardware_profile()`, `check_system_requirements()`, `check_system_compatibility()`, `require_root()`
**Download:** `get_latest_release()`, `download_file()` / `secure_download()`, `extract_archive()`
**Systemd:** `create_systemd_service()`, `enable_systemd_service()`, `enable_and_start_systemd_service()`, `stop_all_services()`
**Security:** `generate_secure_password()`, `setup_secure_user()`, `configure_ssh()`, `configure_sudo_nopasswd()`, `setup_firewall_rules()`, `secure_config_files()`, `apply_network_security()`, `setup_security_monitoring()`, `setup_intrusion_detection()`

**InfraKit security functions to create (not in eth2-quickstart):**
- `require_root()` -- fail-fast if not root and sudo unavailable
- `secure_env_file()` -- `install -m 0600 -o $user -g $group /dev/null $path` then write content (prevents TOCTOU for secrets)
- `safe_download_and_run()` -- `curl -fsSL $url -o $tmpfile && chmod +x $tmpfile && bash $tmpfile` (never `curl | bash`)
- `verify_ssh_key_auth()` -- check that key-based auth is configured before disabling password auth (prevents lockout)
**Validation:** `validate_menu_choice()`, `validate_user_input()`
**Config:** `merge_client_config()`, `append_once()`
**UI:** `whiptail_msg()`, `whiptail_yesno()` (optional, for interactive setups)

---

## Anti-Patterns to Avoid

1. **Don't duplicate scripts.** Extract, parameterize, and call from adapters.
2. **Don't assume chain binaries are shared.** Only ops tooling is shared.
3. **Don't duplicate security.** SSH hardening, firewall, fail2ban, secrets management live in shared primitives. Adapters pass chain-specific args (ports, users, jail names).
4. **Don't use Mermaid diagrams.** ASCII only for GitHub compatibility.
5. **Don't hardcode paths.** Always use env vars with `${VAR:-default}`.
6. **Don't break existing scripts.** Adapters wrap existing behavior; they don't replace it.
7. **Don't pipe curl to bash.** Download to temp file, verify, then execute.
8. **Don't write secrets then chmod.** Pre-create files with restrictive perms via `install -m 0600`.
9. **Don't log to stdout.** Use stderr for all log output so stdout can carry data (JSON, function returns).
