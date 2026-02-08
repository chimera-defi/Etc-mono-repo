# InfraKit Design (Concise)

## One‑Sentence Summary
InfraKit is a shared infra control plane that standardizes provisioning, hardening,
service management, and monitoring for validators across chains, with thin
chain‑specific adapters.

## Scope
- **In scope:** server provisioning, security hardening, systemd services, env
  management, health checks, status endpoints, monitoring hooks.
- **Out of scope:** chain‑specific client logic beyond adapters; UI/control plane
  (future phase); Kubernetes orchestration (future phase).

## Architecture (Top Level)

```
          +---------------------------+
          |       InfraKit Core       |
          | shared modules (shell/py) |
          +-------------+-------------+
                        |
        +---------------+----------------+
        |                                |
 +------v------+                 +-------v------+
 | Ethereum    |                 | Monad        |
 | adapter     |                 | adapter      |
 +-------------+                 +--------------+
        |                                |
        +---------------+----------------+
                        |
                +-------v-------+
                | Aztec adapter |
                +---------------+
```

## Reuse Strategy
- Core modules do 80% of the work (provision, harden, services, monitoring).
- Adapters do 20% (client install, config, role‑specific checks).

## Minimal Extensible Product (MEP)
1) `infra/shared/` modules (shell): provision, harden, services, monitoring.
2) Adapters per chain (thin wrappers).
3) Runbook + smoke test.

## Evolution Path
- **Phase 1:** systemd + shell (MVP).
- **Phase 2:** containerized entrypoints.
- **Phase 3:** Kubernetes + policy/RBAC control plane.

## Risks
- Source licensing unknown for eth2‑quickstart; confirm before reuse.
- Chain roles diverge; adapters must remain thin and isolated.
