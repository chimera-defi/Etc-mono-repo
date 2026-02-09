# InfraKit Spec (Verified Script‑Based)

This spec is grounded in **scripts that currently exist** (eth2‑quickstart, Monad infra, Aztec dev tooling). It avoids unverified claims and notes unknowns explicitly.

## 1) Verified Script Inventory

### eth2‑quickstart (Ethereum L1 bootstrap)
Key entrypoints (observed in repo):
- `run_1.sh` (root): OS updates, SSH hardening, user creation, consolidated security setup.
- `run_2.sh` (non‑root): dependency install, MEV selection, client selection + install.
- `exports.sh`: shared config (user, ports, MEV relays, client settings).
- `lib/common_functions.sh`: helper functions (systemd creation, firewall helpers, downloads).

**Systemd creation (verified):**
- `create_systemd_service()` writes `/etc/systemd/system/<name>.service` and enables/starts via `systemctl`.

**Client install scripts (verified examples):**
- `install/execution/geth.sh` creates systemd `eth1` service.
- `install/consensus/prysm.sh` creates systemd `cl` (beacon) and `validator` services.
- `install/mev/install_mev_boost.sh` creates systemd `mev` service.

**Security/web scripts (verified):**
- `install/security/consolidated_security.sh`: UFW rules + fail2ban + AIDE.
- `install/web/install_nginx.sh`: installs/configures NGINX + hardening + systemd `nginx` service.
- `install/web/install_nginx_ssl.sh`: enables SSL if `/etc/letsencrypt/live/$SERVER_NAME/*` exists.
- `install/web/install_caddy.sh`: installs Caddy with auto‑HTTPS + hardening.
- `install/web/install_caddy_ssl.sh`: uses manual SSL certs for Caddy (Let’s Encrypt path).

**SSL issuance scripts (verified):**
- `install/ssl/install_ssl_certbot.sh`: installs NGINX, runs certbot manual DNS challenge, then `install_nginx_ssl.sh`.
- `install/ssl/install_acme_ssl.sh`: installs NGINX, runs acme.sh issuance, then `install_nginx_ssl.sh`.

**Flow (verified by script content):**
- Phase 1 (root): OS update → SSH hardening → user creation → consolidated security.
- Phase 2 (non‑root): dependencies → MEV choice → client choice → install scripts → systemd services.

### Monad infra (production scripts in this repo)
Entry points and critical steps (verified):
- `setup_server.sh`: create user → install monad‑bft binary (if provided) → sysctl tuning → install systemd units → optional Caddy/UFW → preflight + e2e smoke tests.
- `bootstrap_all.sh`: wraps `setup_server.sh` + optional monitoring (docker compose) + optional hardening (SSH, fail2ban, unattended upgrades).
- `install_validator_binary.sh`: fetch binary/config from local path or URL.
- `install_validator_service.sh`: installs systemd unit + env file.
- `install_status_service.sh`: installs a Python status server + unit + env file.
- Hardening utilities: `harden_ssh.sh`, `install_firewall_ufw.sh`, `install_fail2ban.sh`, `enable_unattended_upgrades.sh`.

### Aztec scripts (dev + testing toolchain)
These scripts are **developer toolchain and testing**, not validator ops:
- `scripts/setup-env.sh`: installs standard `nargo`, optional `aztec-nargo` via Docker, caches aztec‑packages deps, optional compile.
- `scripts/smoke-test.sh`: validates nargo + Aztec CLI + unit tests + optional sandbox E2E.
- `scripts/integration-test.sh`: compile contracts + run tests against Aztec devnet container (TXE).
- `scripts/local-sandbox-e2e.sh`: local sandbox deploy + end‑to‑end staking flow.

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

## 3) Chain‑Specific Adapters (Thin by Design)

### Ethereum (eth2‑quickstart)
Adapter responsibilities based on existing scripts:
- Wire `run_1.sh` (security baseline) and `run_2.sh` (client/MEV install) into shared primitives.
- Keep client selection + install scripts under Ethereum adapter because they are chain‑specific.
- Keep MEV configuration and relay lists in Ethereum adapter (chain‑specific economics).
- Optional NGINX/Caddy TLS proxy for public RPC access.

### Monad
Adapter responsibilities based on existing scripts:
- Use shared primitives for user, sysctl, firewall, SSH hardening, systemd.
- Keep `monad-bft` binary/config install and validator service as Monad‑specific.
- Keep status endpoint as the default shared pattern (can be reused as a shared primitive).

### Shared software (Ethereum ↔ Monad)
Based on current scripts, **shared software is operational tooling**, not protocol clients:
- OS/hardening packages, systemd helpers, firewall, monitoring/status endpoints.
- Optional web proxy (NGINX/Caddy) for RPC exposure.
No shared consensus/execution software is used across Ethereum and Monad in the scripts reviewed.

### Aztec
Current scripts are dev/test tooling, not validator‑role operations.
- InfraKit can reuse **testing scaffolding** patterns (env setup, smoke tests).
- **Validator/sequencer/prover ops** are TBD until production role scripts exist.
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
  -> install_validator_binary.sh (optional)
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
  -> OS update + SSH hardening
  -> Create user + sudo
  -> Consolidated security
run_2.sh (non-root)
  -> install_dependencies.sh
  -> MEV selection + install -> systemd: mev
  -> Execution + consensus install -> systemd: eth1 / cl / validator
  -> Optional web proxy (nginx/caddy)
  -> Optional SSL issuance (certbot/acme)
```

### Aztec dev toolchain flow (current behavior)
```
setup-env.sh
  -> standard nargo
  -> optional Docker + aztec-nargo
  -> cache aztec-packages
smoke-test.sh
  -> staking-math tests
  -> aztec CLI checks
local-sandbox-e2e.sh
  -> local sandbox deploy + staking flow
```

## 6) Reuse & Boundaries

- **Reusable:** system hardening, systemd utilities, status endpoints, smoke tests, optional proxy + SSL.
- **Chain‑specific:** client binaries/configs, MEV logic, role semantics (sequencer/prover/validator).
- **Aztec validator roles:** not codified in current scripts; avoid assumptions until role scripts exist.

## 7) Open Items (No Hallucinations)

- Decide whether the shared status server should be standard (Monad version is a candidate).
- Define Aztec production role scripts once available.

## 8) Monitoring & Security (Script‑Grounded)

**Security primitives present in scripts:**
- SSH hardening (`run_1.sh` + `harden_ssh.sh`)
- Firewall (UFW)
- fail2ban
- AIDE integrity checks
- Unattended upgrades (Monad scripts)

**Monitoring primitives present in scripts:**
- Status endpoint (Monad `install_status_service.sh`)
- RPC/health checks (Monad `check_rpc.sh`, `healthcheck.sh`)
- systemd + journalctl for service health/logs

**Shared monitoring candidates (explicit):**
- status endpoint service (shared)
- RPC/health check wrappers (shared, per‑chain endpoints)
- systemd health + restart policy (shared)
- log access via journalctl (shared)
