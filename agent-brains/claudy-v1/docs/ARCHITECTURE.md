# System Architecture

The Claudy agent system operates across three domains with strict layering rules.

## Core Domains

```
┌─────────────────┬─────────────────┬─────────────────┐
│  Agent Control  │  Eth2 Node      │  Infrastructure │
│  & Orchestration│  Stack          │  & Ops          │
├─────────────────┼─────────────────┼─────────────────┤
│ - Tasks         │ - Validators    │ - Deployment    │
│ - Memory        │ - Staking       │ - Monitoring    │
│ - Skills        │ - Consensus     │ - Health checks │
│ - Prompts       │ - MEV           │ - Scaling       │
└─────────────────┴─────────────────┴─────────────────┘
```

## Strict Layering

Within each domain, dependency flow is unidirectional:

```
UI ← Tests ← Runtime ← Service ← Repo ← Config ← Types
         ↓
    [Providers: Auth, Logging, Secrets, Observability]
```

**Rules:**
- UI never imports Service/Repo directly
- Service never touches database directly (must use Repo)
- Config is read-only after init
- Providers are injected, never imported

**Enforcement:** Custom linter (`linters/layering.sh`)

## Domain Interfaces

### Agent Control → Eth2 Stack
- Eth2 stack exposes: `start()`, `stop()`, `query()`, `validate()`
- Agent uses only these interfaces; no implementation details
- Schema: `domain/eth2/types/interfaces.json`

### Eth2 Stack → Infrastructure
- Infrastructure exposes: `deploy()`, `monitor()`, `alert()`, `recover()`
- Eth2 never directly modifies infrastructure state
- Schema: `domain/infra/types/interfaces.json`

### Agent ↔ Memory/Storage
- Memory is single source of truth for context
- Git is version control for durable artifacts
- Session state isolated (no cross-session mutation)

---

## Technology Choices (Agent-Legible)

These are chosen for **composability, API stability, training set representation**:

- **Ethereum:** Standard client APIs (Geth, Prysm, Lighthouse)
- **Deployment:** Docker Compose (simple, inspectable, reproducible)
- **Observability:** OpenTelemetry (agent can query spans/metrics)
- **Configs:** YAML/JSON (parseable, validated)
- **Logging:** Structured JSON (queryable, sortable)

**Anti-pattern:** Opaque third-party packages. If behavior can't be read from code, implement it.

---

## Failure Modes & Recovery

Each domain has documented failure modes + recovery procedures:

- **Validator failure:** See `domain/eth2/recovery/validator_failover.md`
- **Node sync loss:** See `domain/eth2/recovery/resync_procedures.md`
- **Deployment failure:** See `domain/infra/recovery/rollback_procedures.md`

Agents use these as playbooks when errors occur.

---

_Last reviewed: 2026-02-15 | Next review: 2026-02-29_
