# InfraKit PRD (Draft)

## Problem Statement
Validator infrastructure is duplicated across chains, creating drift, inconsistent
security posture, and slower iteration. Teams reinvent provisioning, hardening,
service management, and monitoring for each chain.

## Solution
InfraKit standardizes the shared 80% of validator ops as reusable primitives and
keeps chain‑specific logic in thin adapters.

## Business Framing (Co‑Founder Digest)
- **Value prop:** Reduce the marginal cost and time to launch validators on new chains.
- **Revenue model:** Validator yield + MEV/fees where applicable; optionally ops‑as‑a‑service later.
- **Moat:** Consistent, secure ops layer + faster chain onboarding than competitors.
- **Scale:** Shared primitives → adapter factory → optional hosted control plane.

## Target Users
- Internal DevOps/operators running validators on multiple chains.
- Future contributors who need consistent scripts and runbooks.

## MVP Scope
- Repo‑based control plane (scripts + runbooks).
- Shared primitives (provision, hardening, services, monitoring, web/SSL).
- Adapters for Ethereum (eth2‑quickstart), Monad, and Aztec dev tooling.

## Chain Expansion Strategy (High‑Level)
1) Track new L1/L2 launches with validator demand.
2) Build a thin adapter from shared primitives.
3) Validate ROI (hardware, stake, slashing risk, rewards).
4) Deploy with standardized runbook and monitoring.

## Chain Targeting Checklist (ROI Screen)
- Minimum stake / validator slot scarcity
- Hardware requirements (CPU/RAM/SSD/network)
- Slashing risk and reliability requirements
- MEV/fee opportunities and relay requirements
- Delegation demand and liquidity

## Non‑Goals (Phase 1)
- Hosted control plane service.
- Kubernetes orchestration.
- Defining Aztec production roles (sequencer/prover/validator) without scripts.

## Success Criteria
- Shared primitives replace duplicated logic across Ethereum and Monad setups.
- Adapters remain thin and auditable.
- Runbooks and smoke tests are consistent across chains.
