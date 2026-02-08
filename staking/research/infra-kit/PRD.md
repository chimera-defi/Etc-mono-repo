# InfraKit PRD (Draft)

## Problem Statement
Validator infrastructure is duplicated across chains, creating drift, inconsistent
security posture, and slower iteration. Teams reinvent provisioning, hardening,
service management, and monitoring for each chain.

## Solution
InfraKit standardizes the shared 80% of validator ops as reusable primitives and
keeps chain‑specific logic in thin adapters.

## Target Users
- Internal DevOps/operators running validators on multiple chains.
- Future contributors who need consistent scripts and runbooks.

## MVP Scope
- Repo‑based control plane (scripts + runbooks).
- Shared primitives (provision, hardening, services, monitoring, web/SSL).
- Adapters for Ethereum (eth2‑quickstart), Monad, and Aztec dev tooling.

## Non‑Goals (Phase 1)
- Hosted control plane service.
- Kubernetes orchestration.
- Defining Aztec production roles (sequencer/prover/validator) without scripts.

## Success Criteria
- Shared primitives replace duplicated logic across Ethereum and Monad setups.
- Adapters remain thin and auditable.
- Runbooks and smoke tests are consistent across chains.
