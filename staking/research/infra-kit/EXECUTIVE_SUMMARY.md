# InfraKit Executive Summary

## What It Is
InfraKit is a shared staking infra layer that consolidates server provisioning,
hardening, service management, and monitoring into reusable primitives, with
thin adapters for each chain.

## Why It Exists
Validator ops are duplicated across chains, causing drift and inconsistent
security posture. InfraKit reduces duplication and keeps adapters small and
auditable.

## MVP (Phase 1)
- Repo‑based control plane (scripts + runbooks).
- Shared primitives for common ops steps.
- Adapters for Ethereum (eth2‑quickstart), Monad, and Aztec dev tooling.

## Constraints
- No hosted control plane in phase 1.
- Aztec production validator roles are not codified yet (dev/test only).

## Deliverables
- Verified architecture diagrams (`DESIGN.md`).
- Script‑grounded spec (`SPEC.md`).
- Research‑first plan and tasks (`PLAN.md`, `TASKS.md`, `PROMPTS.md`).
