# InfraKit Design (Concise)

## One-Sentence Summary
InfraKit is a **shared staking infra layer** that standardizes server setup and operations across chains using shared shell primitives plus thin chain adapters.

## High-Level Architecture (Business View)
```
Market: New chains + validator demand
        |
        v
InfraKit (shared ops layer) -> Faster chain onboarding -> Validator revenue
        |
        v
Optional hosted control plane (later) -> Multi-tenant ops -> Managed services
```

## Pitch Diagram (1-Minute Explanation)
```
Operator
  -> InfraKit (shared ops)
     -> Adapter (chain-specific)
        -> Validator node (Ethereum / Monad / Aztec)

Value: reuse 80% ops, swap 20% chain logic
```

## What It Is (MVP)
- A **repository-based control plane** (scripts + runbooks).
- **Shared primitives** for provisioning, hardening, services, monitoring.
- **Adapters** for chain-specific installs/configs.

## What It Is Not (Yet)
- No hosted central UI/API control plane (optional future phase).
- No Kubernetes orchestration (optional future phase).

## Top-Level Architecture (Human Review)

```
Operator -> Adapter -> Shared Primitives -> Server OS
                         |        |        |
                         |        |        +-> Aztec stack (node/sequencer/prover + dev tooling)
                         |        +------------> Monad stack (monad-bft)
                         +---------------------> Ethereum stack (exec/consensus/MEV)
```

## Control Plane Evolution (Repo -> Hosted)

```
Repo-based control plane (scripts + runbooks)
        |
        v
Hosted control plane (API/UI + orchestration)
        |
        v
Kubernetes / fleet orchestration
```

## Component Layers

```
Adapters -> Shared Primitives -> OS/systemd -> Chain binaries/config
```

## Deployment Topology (Single Node)
```
Host
  - systemd services (validator + status)
  - firewall + SSH hardening
  - optional web proxy + SSL
```

## Deployment Topology (Fleet / Future)
```
Control plane
  -> applies shared primitives + adapters
  -> fleet of hosts per chain
```

## Chain Separation (Reality Check)
```
Shared layer (ops primitives only)
  - user creation, SSH hardening, UFW, fail2ban, sysctl
  - systemd helpers + env files
  - status/health checks + optional web proxy + SSL
  - monitoring plumbing (status endpoint + RPC checks + log capture)

Per-chain adapters
  - Ethereum: geth/reth/etc + prysm/lighthouse/etc + mev-boost/commit-boost + relay config
  - Monad: monad-bft binary + validator config
  - Aztec: node/sequencer/prover infra (devnet) + dev/test tooling for contracts
```

## Shared Ops vs Chain Stacks (Hardware Profiles)
```
Shared ops layer
  -> Ethereum host profile (chain-specific sizing)
  -> Monad host profile (chain-specific sizing)
  -> Aztec host profile (node/sequencer/prover, devnet + dev tooling)
```

## Dependency Graph (Conceptual)

```
Provision -> Hardening -> Services -> Monitoring -> HealthChecks
Provision --------> Services
Hardening --------> Monitoring
```

## Shared Components Inventory (Explicit)
```
Provisioning
  - base packages, updates
  - user + sudo

Hardening
  - SSH hardening (with lockout prevention: verify key-auth before disabling password)
  - UFW firewall (parameterized ports per chain)
  - fail2ban (parameterized jail config)
  - sysctl tuning (chain-specific values via args)
  - AIDE (integrity checks)
  - unattended upgrades
  - secure_env_file (pre-create with 0600 perms for secrets, no TOCTOU)
  - safe_download_and_run (download installer to temp, verify, execute -- never curl|bash)

Services
  - systemd unit helpers
  - env file helpers

Monitoring
  - status endpoint service
  - rpc/health check wrappers
  - service supervision (systemd)
  - log access via journalctl

Web Exposure (optional)
  - NGINX/Caddy install
  - SSL issuance helpers
```

## Low-Level Component Map (Files/Modules)
```
shared/
  lib/           (common.sh - logging to stderr, systemd, download, firewall, security helpers)
  provision/     (base_packages, create_user)
  hardening/     (ssh, firewall, fail2ban, sysctl, unattended_upgrades)
  services/      (systemd install, env files)
  monitoring/    (status server, health checks, preflight, uptime probe)
  web/           (nginx/caddy + SSL helpers)
adapters/
  ethereum/      (adapter.sh + README)
  monad/         (adapter.sh + README)
  aztec/         (adapter.sh + README)
runbooks/
  ethereum.md, monad.md, aztec-dev.md, template.md
tests/
  test_shared.sh, smoke_template.sh
```

## Data/Control Flow (Ops Sequence)
```
Input: chain choice + config (ports, keys, RPC)
  -> Adapter selects chain steps
  -> Shared primitives apply OS + hardening
  -> Services installed (systemd + env)
  -> Optional web proxy + SSL
  -> Health checks + status endpoint
Output: running validator node + runbook
```

## Adapter vs Shared Boundary (Quick View)
```
Shared primitives:
  - OS updates, packages
  - SSH hardening, firewall, fail2ban, sysctl
  - systemd unit helpers, env files
  - status/health checks
  - web proxy + SSL helpers (optional)

Adapters:
  - client binaries + configs
  - chain ports/flags
  - MEV/relay config (Ethereum)
  - role-specific steps
```

## Chain Onboarding Lifecycle (High Level)
```
Identify chain opportunity
  -> ROI screen (stake, hardware, slashing, yield)
  -> Draft adapter (chain-specific)
  -> Reuse shared primitives
  -> Runbook + smoke test
  -> Deploy + monitor
```

## Ops Control Surface (What We Touch)
```
Server OS
  -> systemd services
  -> firewall/SSH
  -> monitoring/status endpoint
  -> optional web proxy + SSL
```

## Technologies (Current, Script-Grounded)
- **OS:** Ubuntu (assumed by scripts).
- **Service manager:** systemd.
- **Web proxy:** NGINX or Caddy (optional).
- **Monitoring:** status endpoint + RPC checks (shared primitive candidate).

## Monitoring & Security (Now vs Future)
```
Now (script-grounded)
  Security: SSH hardening + UFW + fail2ban + AIDE + sysctl + security monitoring cron
  Monitoring: status endpoint + RPC/health checks + systemd/journal

Future (optional)
  Security: secrets management + fleet policy enforcement
  Monitoring: metrics/logs stack if adopted (Prometheus + Grafana + Loki)
```

## Monitoring Data Path (Phase 1)
```
Node (systemd services)
  -> status endpoint (local HTTP)
  -> rpc check scripts
  -> journalctl logs (manual)
```

## Proposed File Tree (Future `staking/infra-kit/`)

```text
staking/infra-kit/
  shared/
    lib/
      common.sh               # Shared functions (logging to stderr, systemd, download, firewall, security helpers)
    provision/
      base_packages.sh
      create_user.sh
    hardening/
      harden_ssh.sh
      firewall_ufw.sh
      fail2ban.sh
      sysctl.sh
      unattended_upgrades.sh
    services/
      install_systemd.sh
      install_env.sh
    monitoring/
      status_server.py
      check_rpc.sh
      healthcheck.sh
      uptime_probe.sh
      preflight_check.sh
    web/
      install_nginx.sh
      install_caddy.sh
      install_ssl_certbot.sh
      install_ssl_acme.sh
      nginx_helpers.sh
      caddy_helpers.sh
  adapters/
    ethereum/
      adapter.sh
      README.md
    monad/
      adapter.sh
      README.md
    aztec/
      adapter.sh
      README.md
  runbooks/
    ethereum.md
    monad.md
    aztec-dev.md
    template.md
  tests/
    test_shared.sh
    smoke_template.sh
  README.md
```

## Reuse Strategy (80/20)
- **Shared 80%:** OS updates, SSH hardening, firewall, fail2ban, sysctl, systemd install helpers, status/health endpoints.
- **Adapter 20%:** chain binaries, configs, ports, RPC/metrics checks, role-specific steps.

## Hardware/Role Notes (High Level)
- Ethereum, Monad, and Aztec are distinct chains and will require **different hardware profiles**.
- The shared layer covers ops primitives; **hardware sizing remains chain-specific** and lives in adapters/runbooks.

## Minimal Extensible Product (MEP)
1) Shared primitives (shell + small Python helpers).
2) One adapter per chain/role (Ethereum L1, Monad validator, Aztec node/sequencer/prover + dev tooling).
3) A runbook + smoke test per adapter.

## Evolution Path
- **Phase 1:** Shell/systemd (current target).
- **Phase 2:** Container-friendly wrappers (same primitives).
- **Phase 3:** Optional orchestration (Kubernetes or hosted control plane).
