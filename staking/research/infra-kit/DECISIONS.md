# InfraKit Decision Log

## 2026‑02‑XX — Repo‑based control plane (MVP)
**Decision:** Keep the control plane as scripts + runbooks in phase 1.  
**Rationale:** Aligns with eth2‑quickstart/Monad workflows and minimizes overhead.

## 2026‑02‑XX — Shared primitives + thin adapters
**Decision:** Centralize common ops steps; keep chain‑specific logic in adapters.  
**Rationale:** Reduces duplication while preserving chain‑specific flexibility.

## 2026‑02‑XX — Aztec scope limited to dev/test tooling
**Decision:** Do not define production validator roles until scripts exist.  
**Rationale:** Avoid unverified assumptions; keep spec grounded in code.
