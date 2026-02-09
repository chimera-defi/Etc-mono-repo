# InfraKit Overview (From Zero → Detailed)

## 1) What We’re Building (High Level)
InfraKit is a **shared ops layer** for validator infrastructure. Instead of
re‑writing server setup for every chain, we reuse the same **provisioning,
hardening, services, and monitoring** steps, and plug in **thin chain adapters**
for chain‑specific binaries/configs.

**Outcome:** faster onboarding of new chains with consistent security and ops.

## 2) What “Shared” Means
Shared primitives are **ops‑only**:
- OS updates + base packages
- SSH hardening + firewall (UFW) + fail2ban + sysctl
- systemd helpers + env files
- status endpoint + RPC/health checks
- optional web proxy + SSL

These are used by **all chains**.

## 3) What “Adapter” Means
Adapters are **chain‑specific**:
- Which binaries to install
- Which ports/flags to run
- Role‑specific services (validator, consensus, etc.)
- Chain‑specific monitoring endpoints

Adapters remain thin and auditable.

## 4) Chains Covered (Current Scope)
**Ethereum (L1)**
- Uses eth2‑quickstart scripts (geth + prysm + mev‑boost).

**Monad**
- Uses monad infra scripts (monad‑bft + status service).

**Aztec**
- Current scripts are **dev/test tooling only** (no production validator roles).

## 5) Requirements: High Level
All chains require:
- Secure Linux host
- systemd services
- firewall + SSH hardening
- monitoring/health checks

Chain‑specific requirements (hardware sizing, stake, ports) live in adapters/runbooks.

## 6) Where to Read Next
- `DESIGN.md` — architecture + diagrams
- `SPEC.md` — verified scripts and flows
- `PRD.md` — business framing and scope
