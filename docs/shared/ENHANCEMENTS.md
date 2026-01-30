# Enhancements and suggestions (cross-project)

## 1) Architecture and docs
- Keep a single source of truth for each plan/spec.
- Add decision logs for major changes.
- Require a minimal runbook per service.

## 2) Testing
- Smoke tests for critical endpoints.
- Pre-merge checks for formatting and lint.
- Integration tests for external dependencies (DB/RPC).

## 3) Observability
- Standard `/healthz` and `/metrics` endpoints.
- Structured logs with request IDs.
- Dashboards for uptime, latency, and error rates.

## 4) Security
- Secrets in a vault or environment variables only.
- Mandatory log redaction of tokens/keys.
- Baseline host hardening checklist.

## 5) Automation
- `make` targets or `scripts/` wrappers for all routine tasks.
- One-shot bootstrap scripts with idempotency.
- A cleanup script for local env reset.

## 6) Release process
- Changelog on user-facing changes.
- Versioned config templates.
- Rollback steps documented.

## 7) Operations
- Alerting on uptime, disk, memory, and RPC failures.
- Backup policy for critical data.
- On-call escalation notes.
