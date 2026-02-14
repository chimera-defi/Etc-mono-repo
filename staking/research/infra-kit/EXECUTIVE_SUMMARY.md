# InfraKit Executive Summary

## What It Is
InfraKit is a shared staking infra layer that consolidates server provisioning,
hardening, service management, and monitoring into reusable primitives, with
thin adapters for each chain.

## Business Value
- Reduce time and cost to onboard new chains.
- Standardize monitoring + security across deployments.
- Enable a path to managed services later.

## Why It Exists
Validator ops are duplicated across chains, causing drift and inconsistent
security posture. InfraKit reduces duplication and keeps adapters small and
auditable.

## MVP (Phase 1)
- Repo-based control plane (scripts + runbooks).
- Shared primitives for common ops steps.
- Adapters for Ethereum (eth2-quickstart), Monad, and Aztec (node + dev tooling).

## Constraints
- No hosted control plane in phase 1.
- Aztec sequencer staking blocked on TGE + 200k AZTEC deposit. Node infra scripts target devnet.

## Deliverables
- Verified architecture diagrams (`DESIGN.md`).
- Script-grounded spec (`SPEC.md`).
- Aztec node gap analysis (`AZTEC_NODE_SPEC.md`).
- Research-first plan and tasks (`PLAN.md`, `TASKS.md`, `PROMPTS.md`).
- Implementation handoff (`HANDOFF_PROMPT.md`).
