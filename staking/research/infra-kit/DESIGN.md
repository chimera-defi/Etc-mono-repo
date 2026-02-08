# InfraKit Design (Concise)

## One‑Sentence Summary
InfraKit is a **shared staking infra layer** that standardizes server setup and operations across chains using shared shell primitives plus thin chain adapters.

## High‑Level Architecture (Business View)
```
Market: New chains + validator demand
        |
        v
InfraKit (shared ops layer) -> Faster chain onboarding -> Validator revenue
        |
        v
Optional hosted control plane (later) -> Multi‑tenant ops -> Managed services
```

## What It Is (MVP)
- A **repository‑based control plane** (scripts + runbooks).
- **Shared primitives** for provisioning, hardening, services, monitoring.
- **Adapters** for chain‑specific installs/configs.

## What It Is Not (Yet)
- No hosted central UI/API control plane (optional future phase).
- No Kubernetes orchestration (optional future phase).

## Top‑Level Architecture (Human Review)

```
Operator -> Adapter -> Shared Primitives -> Server OS
                         |        |        |
                         |        |        +-> Aztec dev/tooling (tests)
                         |        +------------> Monad stack (monad-bft)
                         +---------------------> Ethereum stack (exec/consensus/MEV)
```

## Control Plane Evolution (Repo → Hosted)

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

## Dependency Graph (Conceptual)

```
Provision -> Hardening -> Services -> Monitoring -> HealthChecks
Provision --------> Services
Hardening --------> Monitoring
```

## Low‑Level Component Map (Files/Modules)
```
shared/
  provision/   (base_packages, create_user)
  hardening/   (ssh, firewall, fail2ban, sysctl)
  services/    (systemd install, env files)
  monitoring/  (status server, health checks)
  web/         (nginx/caddy + SSL helpers)
adapters/
  ethereum/    (run_1/run_2 wrappers)
  monad/       (setup_server wrapper)
  aztec/       (dev tooling wrapper)
runbooks/
  ethereum.md, monad.md, aztec-dev.md
```

## Technologies (Current, Script‑Grounded)
- **OS:** Ubuntu (assumed by scripts).
- **Service manager:** systemd.
- **Web proxy:** NGINX or Caddy (optional).
- **Monitoring:** status endpoint + RPC checks (shared primitive candidate).
## Proposed File Tree (Future `staking/infra-kit/`)

```text
staking/infra-kit/
  shared/
    provision/
      base_packages.sh
      create_user.sh
    hardening/
      harden_ssh.sh
      firewall_ufw.sh
      fail2ban.sh
      sysctl.sh
    services/
      install_systemd.sh
      install_env.sh
    monitoring/
      status_server.py
      check_rpc.sh
      uptime_probe.sh
    web/
      install_nginx.sh
      install_caddy.sh
      install_ssl_certbot.sh
      install_acme_ssl.sh
  adapters/
    ethereum/
      run_1_adapter.sh
      run_2_adapter.sh
    monad/
      setup_server_adapter.sh
    aztec/
      dev_tooling_adapter.sh
  runbooks/
    ethereum.md
    monad.md
    aztec-dev.md
```

## Reuse Strategy (80/20)
- **Shared 80%:** OS updates, SSH hardening, firewall, fail2ban, sysctl, systemd install helpers, status/health endpoints.
- **Adapter 20%:** chain binaries, configs, ports, RPC/metrics checks, role‑specific steps.

## Hardware/Role Notes (High Level)
- Ethereum, Monad, and Aztec are distinct chains and will require **different hardware profiles**.
- The shared layer covers ops primitives; **hardware sizing remains chain‑specific** and lives in adapters/runbooks.

## Minimal Extensible Product (MEP)
1) Shared primitives (shell + small Python helpers).
2) One adapter per chain/role (Ethereum L1, Monad validator; Aztec dev tooling).
3) A runbook + smoke test per adapter.

## Evolution Path
- **Phase 1:** Shell/systemd (current target).
- **Phase 2:** Container‑friendly wrappers (same primitives).
- **Phase 3:** Optional orchestration (Kubernetes or hosted control plane).
