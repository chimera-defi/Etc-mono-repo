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
- [`staking/monad/infra/scripts/`](../../monad/infra/scripts) (current production scripts)
- [`staking/aztec/scripts/`](../../aztec/scripts) (Aztec dev + testing toolchain)

Chain docs:
- https://ethereum.org/staking/
- https://docs.monad.xyz/
- https://docs.aztec.network/

## Working Name
**InfraKit**. Keep naming consistent in docs.

## Control Plane (MVP)
Phase 1 uses the repo as the control plane. A hosted API/UI is optional later.

## Core Operational Docs
- `COMMAND_CONTRACT.md` — **NEW** normalized command interface across all stacks (bootstrap, status, logs, etc.)
- `ENV_CONTRACT.md` — shared environment-variable contract + per-stack mappings.
- `PORT_REGISTRY.md` — cross-stack default port registry and collision guardrails.

## Design & Research
- `DESIGN.md` — concise top‑level architecture for human review.
- `OVERVIEW.md` — newcomer‑friendly summary (high level → detailed).
- `SPEC.md` — verified script inventory + mapping into shared primitives.
- `PLAN.md` — phased execution plan.
- `TASKS.md` — checklist of concrete next steps.
- `PROMPTS.md` — handoff prompts for future agents.
- `HANDOFF_PROMPT.md` — comprehensive implementation handoff (self‑contained).
- `AZTEC_NODE_SPEC.md` — gap analysis + spec for Aztec node setup scripts.

## Reference & Process
- `EXECUTIVE_SUMMARY.md` — high‑level summary for quick review.
- `EXACT_SUMMARY.md` — ultra‑concise summary (single paragraph).
- `DECISIONS.md` — key decisions and rationale.
- `PRD.md` — product requirements (problem/solution/MVP).
- `CONTEXT.md` — scratchpad for research notes and open questions.
- `MASTER_PROMPT.md` — research→design master prompt.
- `META_ENGINEERING.md` — prompt structure + anti‑hallucination rules.
- `REVIEW_CHECKLIST.md` — multi‑pass review checklist.
- `META_LEARNINGS.md` — process + content learnings.

## Quick Start: Stack Operations

Use the unified CLI to manage all stacks:

```bash
# Auto-detect and show status
./scripts/stack-ops/stack-cli.sh status

# Ethereum: Check preflight
./scripts/stack-ops/stack-cli.sh --stack=ethereum preflight

# Ethereum: Bootstrap with monitoring
sudo ./scripts/stack-ops/stack-cli.sh --stack=ethereum bootstrap --with-monitoring

# Aztec: Bootstrap with monitoring
sudo ./scripts/stack-ops/stack-cli.sh --stack=aztec bootstrap --with-monitoring

# Monad: Check health with JSON output
./scripts/stack-ops/stack-cli.sh --stack=monad preflight --json
```

### Supported Stacks

| Stack | Adapter | Commands |
|-------|---------|----------|
| **Ethereum** | `adapters/ethereum/` | bootstrap, preflight, smoke, status, start, stop, logs |
| **Aztec** | `adapters/aztec/` | bootstrap |
| **Monad** | `adapters/monad/` | bootstrap, preflight, smoke, status |

See [`scripts/stack-ops/README.md`](../../scripts/stack-ops/README.md) for full usage guide.
