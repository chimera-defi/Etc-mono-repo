# InfraKit: Shared Staking Infra Layer (Research)

This folder defines the **shared staking infra layer** for validator operations across chains
(Ethereum, Monad, Aztec, etc.). The goal is to **reuse common server‑ops primitives** while
keeping chain‑specific logic in thin adapters.

## Problem Statement
Validator infrastructure is duplicated across chains (provisioning, hardening, services, monitoring).
That duplication causes drift, inconsistent security, and slow iteration.

## Target Users
- Internal DevOps/operators deploying validators across multiple chains.
- Future contributors who need a standard layout and runbook.

## MVP Scope
- Repo‑based control plane (scripts + runbooks).
- Shared primitives for common ops steps.
- Thin per‑chain adapters for installs/config.

Sources reviewed:
- https://eth2quickstart.com/
- https://github.com/chimera-defi/eth2-quickstart (default branch `master`)
- `staking/monad/infra/scripts/` (current production scripts)
- `staking/aztec/scripts/` (Aztec dev + testing toolchain)

## Working Name
**InfraKit** (tentative). Keep naming consistent in docs.

## Control Plane (MVP)
Phase 1 uses the repo as the control plane. A hosted API/UI is optional later.

## Docs
- `DESIGN.md` — concise top‑level architecture for human review.
- `SPEC.md` — verified script inventory + mapping into shared primitives.
- `PLAN.md` — phased execution plan.
- `TASKS.md` — checklist of concrete next steps.
- `PROMPTS.md` — handoff prompts for future agents.
- `EXECUTIVE_SUMMARY.md` — high‑level summary for quick review.
- `EXACT_SUMMARY.md` — ultra‑concise summary (single paragraph).
- `DECISIONS.md` — key decisions and rationale.
- `PRD.md` — product requirements (problem/solution/MVP).
- `CONTEXT.md` — scratchpad for research notes and open questions.
- `MASTER_PROMPT.md` — research→design master prompt.
- `META_ENGINEERING.md` — prompt structure + anti‑hallucination rules.
- `REVIEW_CHECKLIST.md` — multi‑pass review checklist.
- `META_LEARNINGS.md` — process + content learnings.
