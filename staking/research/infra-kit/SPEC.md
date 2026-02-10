# InfraKit Spec (Verified Script-Based)

This spec is grounded in **scripts that currently exist** (eth2-quickstart, Monad infra, Aztec dev tooling). It avoids unverified claims and notes unknowns explicitly.

## 1) Verified Script Inventory

### eth2-quickstart (Ethereum L1 bootstrap)
*Full script tree verified from `github.com/chimera-defi/eth2-quickstart` (master branch, Feb 2026).*

**Core entrypoints:**
- `run_1.sh` (root): OS updates, SSH hardening (`configure_ssh`), user creation (`setup_secure_user`), consolidated security (UFW+fail2ban+AIDE), config permissions, network security sysctl, security monitoring cron, intrusion detection AIDE cron.
- `run_2.sh` (non-root): dependency install, MEV solution selection (MEV-Boost / Commit-Boost / ETHGas / skip), interactive or default client selection, security validation.
- `exports.sh`: shared config (user, ports, MEV relays, per-client cache sizes, Commit-Boost/ETHGas settings, user config override via `config/user_config.env`).
- `lib/common_functions.sh`: ~1000-line shared library (logging, systemd helpers, download/extract, security functions, firewall, SSH config, AIDE, input validation, config merging).
- `lib/utils.sh`: additional utility functions.

**Execution clients (7):** geth, reth, nethermind, besu, erigon, nimbus_eth1, ethrex.
**Consensus clients (6):** prysm, lighthouse, teku, nimbus, lodestar, grandine.
**MEV scripts (5):** install_mev_boost, install_commit_boost, install_ethgas, fb_builder_geth, fb_mev_prysm + test_mev_implementations.

**Systemd creation (verified):**
- `create_systemd_service()` in `common_functions.sh` writes `/etc/systemd/system/<name>.service` and enables/starts via `systemctl`.

**Security/web scripts (verified):**
- `install/security/consolidated_security.sh`: UFW rules (incl. private-network blocks, Hetzner abuse-report subnet blocks) + fail2ban + AIDE.
- `install/security/nginx_harden.sh`, `caddy_harden.sh`, `test_security_fixes.sh`.
- `install/web/install_nginx.sh`: NGINX + rate limiting + DDoS protection + hardening via `nginx_helpers.sh`.
- `install/web/install_caddy.sh`: Caddy with auto-HTTPS + `caddy_helpers.sh`.
- `install/web/{nginx,caddy}_helpers.sh`, `web_helpers_common.sh`: shared web helpers.

**SSL issuance scripts (verified):**
- `install/ssl/install_ssl_certbot.sh`: certbot manual DNS challenge.
- `install/ssl/install_acme_ssl.sh`: acme.sh issuance.

**Utility scripts (verified):**
- `install/utils/`: install_dependencies, select_clients, configure (wizard), doctor, start, stats, refresh, update, update_all, update_git, purge_ethereum_data, optional_tools, run_manifest.

**Test/CI scripts (verified):**
- `test/run_tests.sh`, `ci_test_run_1.sh`, `ci_test_run_2.sh`, `docker_test.sh`, `test_ethrex.sh`.
- `test/lib/`: mock_functions, test_utils, shellcheck_config.
- `install/test/test_common_functions.sh`, `install/templates/install_template.sh`.

**Flow (verified by script content):**
- Phase 1 (root): OS update -> SSH hardening -> user creation -> consolidated security -> network security sysctl -> AIDE -> security monitoring cron.
- Phase 2 (non-root): dependencies -> MEV choice (MEV-Boost/Commit-Boost+ETHGas/skip) -> client choice (interactive or default Geth+Prysm) -> install scripts -> systemd services -> security validation.

### Monad infra (production scripts in this repo)
Entry points and critical steps (verified):
- `setup_server.sh`: create user -> install monad-bft binary (if provided) -> sysctl tuning -> install systemd units -> optional Caddy/UFW -> preflight + e2e smoke tests.
- `bootstrap_all.sh`: wraps `setup_server.sh` + optional monitoring (docker compose) + optional hardening (SSH, fail2ban, unattended upgrades).
- `install_validator_binary.sh`: fetch binary/config from local path or URL.
- `install_validator_service.sh`: installs systemd unit + env file.
- `install_status_service.sh`: installs a Python status server + unit + env file.
- Hardening utilities: `harden_ssh.sh`, `install_firewall_ufw.sh`, `install_fail2ban.sh`, `enable_unattended_upgrades.sh`.
- Monitoring: `healthcheck.sh`, `check_rpc.sh`, `uptime_probe.sh`, `status_server.py`, `preflight_check.sh`, `e2e_smoke_test.sh`.
- Other: `create_monad_user.sh`, `install_sysctl.sh`, `install_systemd_unit.sh`, `install_caddy.sh`, `collect_node_info.sh`, `backup_monad_config.sh`, `check_prereqs.sh`, `run_local_devnet.sh`.

### Aztec scripts (dev + testing toolchain)
These scripts are **developer toolchain and testing**, not validator ops:
- `scripts/setup-env.sh`: installs standard `nargo`, optional `aztec-nargo` via Docker, caches aztec-packages deps, optional compile.
- `scripts/smoke-test.sh`: validates nargo + Aztec CLI + unit tests + optional sandbox E2E.
- `scripts/compile-contracts.sh`: standalone compilation of one or all Aztec contracts (auto-detects compiler).
- `scripts/integration-test.sh`: compile contracts + run tests against Aztec devnet container (TXE).
- `scripts/local-sandbox-e2e.sh`: local sandbox deploy + end-to-end staking flow.
- `scripts/query-devnet.mjs`: query Aztec L2 devnet info via AztecJS.
- `scripts/lib/common.sh`: shared library (colors, logging, env detection, binary finders, contract helpers, devnet connectivity, argument parsing).

## 2) InfraKit Shared Primitives (Derived from Scripts)

These are the **common operations** we can safely reuse across chains:
- OS update + base packages
- SSH hardening
- User creation + sudo setup
- Firewall setup (UFW)
- Fail2ban + unattended upgrades
- Sysctl tuning
- Systemd unit install + env file management
- Status endpoint/health checks
- Preflight + smoke tests
- Optional web proxy + SSL (NGINX or Caddy) for RPC exposure

## 3) Chain-Specific Adapters (Thin by Design)

### Ethereum (eth2-quickstart)
Adapter responsibilities based on existing scripts:
- Wire `run_1.sh` (security baseline) and `run_2.sh` (client/MEV install) into shared primitives.
- Keep client selection + install scripts under Ethereum adapter because they are chain-specific.
- Keep MEV configuration and relay lists in Ethereum adapter (chain-specific economics).
- Keep Commit-Boost/ETHGas config in Ethereum adapter (Ethereum-only preconfirmations).
- Optional NGINX/Caddy TLS proxy for public RPC access.

### Monad
Adapter responsibilities based on existing scripts:
- Use shared primitives for user, sysctl, firewall, SSH hardening, systemd.
- Keep `monad-bft` binary/config install and validator service as Monad-specific.
- Keep status endpoint as the default shared pattern (can be reused as a shared primitive).

### Shared software (Ethereum <-> Monad)
Based on current scripts, **shared software is operational tooling**, not protocol clients:
- OS/hardening packages, systemd helpers, firewall, monitoring/status endpoints.
- Optional web proxy (NGINX/Caddy) for RPC exposure.
No shared consensus/execution software is used across Ethereum and Monad in the scripts reviewed.

### Aztec
Current scripts are dev/test tooling, not validator-role operations.
- InfraKit can reuse **testing scaffolding** patterns (env setup, smoke tests).
- **Validator/sequencer/prover ops** are TBD until production role scripts exist.
- Aztec scripts now have a shared library (`lib/common.sh`) with env detection, binary finders, contract helpers.
Aztec scripts in this repo do **not** require running an Ethereum validator; they use a local sandbox or Aztec CLI.

## 4) Proposed Layout (Target, Not Yet Implemented)

```text
staking/
  infra-kit/                 # future shared library (code)
    shared/
      provision/
      hardening/
      services/
      monitoring/
      web/
    adapters/
      ethereum/
      monad/
      aztec/
    runbooks/
  research/
    infra-kit/               # current research/design docs (this folder)
```

## 5) Adapter Flows (Verified)

### Monad adapter flow (current behavior)
```
setup_server.sh
  -> create_monad_user.sh
  -> install_validator_binary.sh (if URL/path provided)
  -> install_sysctl.sh
  -> install_validator_service.sh
  -> install_status_service.sh
  -> with-caddy? / with-firewall?
  -> preflight_check.sh
  -> e2e_smoke_test.sh
```

### Ethereum quickstart flow (current behavior)
```
run_1.sh (root)
  -> OS update + SSH hardening (configure_ssh)
  -> Create user + sudo (setup_secure_user)
  -> Consolidated security (UFW+fail2ban+AIDE)
  -> Network security sysctl + config permissions
  -> Security monitoring + intrusion detection cron
run_2.sh (non-root)
  -> install_dependencies.sh
  -> MEV selection (MEV-Boost / Commit-Boost+ETHGas / skip)
  -> Client selection (interactive / default Geth+Prysm)
  -> install scripts -> systemd services
  -> Security validation (validate_security_safe + server_security_validation)
```

### Aztec dev toolchain flow (current behavior)
```
setup-env.sh
  -> standard nargo
  -> Docker + aztec-nargo (if enabled)
  -> cache aztec-packages
smoke-test.sh
  -> staking-math tests
  -> aztec CLI checks
  -> devnet connectivity
  -> contract project structure
local-sandbox-e2e.sh
  -> local sandbox deploy + staking flow
```

## 6) Reuse & Boundaries

- **Reusable:** system hardening, systemd utilities, status endpoints, smoke tests, optional proxy + SSL.
- **Chain-specific:** client binaries/configs, MEV logic, role semantics (sequencer/prover/validator).
- **Aztec validator roles:** not codified in current scripts; avoid assumptions until role scripts exist.

## 7) Open Items (No Hallucinations)

- Decide whether the shared status server should be standard (Monad version is a candidate).
- Define Aztec production role scripts once available.
- Decide naming convention for shared scripts (snake_case recommended, matching Monad pattern).

## 8) Monitoring & Security (Script-Grounded)

**Security primitives present in scripts:**
- SSH hardening (`run_1.sh` configure_ssh + `harden_ssh.sh`)
- Firewall (UFW) - both eth2-quickstart (with private-network + problematic subnet blocks) and Monad
- fail2ban (both chains)
- AIDE integrity checks (eth2-quickstart)
- Unattended upgrades (Monad scripts)
- Network security sysctl (eth2-quickstart: ICMP, TCP syncookies, redirect filtering)
- Security monitoring cron (eth2-quickstart: failed logins, suspicious processes, disk usage)

**Monitoring primitives present in scripts:**
- Status endpoint (Monad `install_status_service.sh` + `status_server.py`)
- RPC/health checks (Monad `check_rpc.sh`, `healthcheck.sh`, `uptime_probe.sh`)
- systemd + journalctl for service health/logs
- Preflight checks (Monad `preflight_check.sh`)
- E2E smoke test with mock RPC (Monad `e2e_smoke_test.sh`)

**Shared monitoring candidates (explicit):**
- status endpoint service (shared)
- RPC/health check wrappers (shared, per-chain endpoints)
- systemd health + restart policy (shared)
- log access via journalctl (shared)
- preflight + e2e smoke test patterns (shared)

**Optional monitoring stack (Monad repo, docker compose):**
- Prometheus, Grafana, Loki, Promtail, Alertmanager, node_exporter.
- Ports bound to localhost by default (9090/3000/9093/3100/9100).
