## SpecForge Architecture Diagrams

## 1) Human + Agent Collaboration Flow

```text
Human edits doc
   +
Agent proposes patches
   -> Review queue (accept/reject/cherry-pick)
      -> Canonical doc update
         -> Version snapshot + audit event
            -> Depth-gate / recap checks
```

## 2) Product Pipeline

```text
Collaborative Draft
   -> Gated Build-Ready Spec
      -> Structured Spec Bundle
      -> Tasks/Acceptance Criteria
         -> (Phase 2) Starter Repo Generation
            -> Developer Execution
```

## 3) MVP Component Map

```text
[Web Editor UI]
    |      \ 
    |       -> [Agent Panel]
    v
[Collab Sync Service (CRDT)]
    |
[Doc API + Canonical State Store]
    |
[Patch Engine + Policy Guardrails + Depth Gates]
    |
[Export Service -> PRD/SPEC/TASKS/agent_spec.json]
```

## 4) Phase 2 Extension

```text
[Approved Spec Bundle]
      -> [Template Selector]
         -> [Repo Scaffold Service]
            -> [Git Provider API]
               -> [Starter Repo + Linked Tasks]
```

## 5) Conflict Resolution Model

```text
Concurrent edits on same section
   -> detect overlap
      -> route to manual resolver
         -> apply merged patch
            -> snapshot + provenance update
```

## 6) Multi-Surface Architecture

```text
                        ┌─────────────────────────┐
                        │      SpecForge Core       │
                        │  Doc Store · Patch Engine │
                        │  Export · Readiness · DB  │
                        └──────────┬────────────────┘
                                   │
              ┌────────────────────┼──────────────────────┐
              │                    │                       │
    ┌─────────▼──────┐   ┌────────▼────────┐   ┌────────▼────────────┐
    │  Browser GUI   │   │   Terminal CLI  │   │   REST Service API  │
    │  /workspace    │   │  specforge init │   │  /api/service/      │
    │  (Tiptap+Yjs)  │   │  specforge tui  │   │    spec-jobs        │
    └────────────────┘   └─────────────────┘   └────────┬────────────┘
                                                         │
                                          ┌──────────────┴─────────────┐
                                          │                             │
                                 ┌────────▼───────┐         ┌──────────▼──────┐
                                 │  BYOA (mode:   │         │  Autonomous      │
                                 │  "assisted")   │         │  (mode: "auto-  │
                                 │  Your agent    │         │  nomous")        │
                                 │  reviews       │         │  SpecForge runs  │
                                 │  patches       │         │  full loop       │
                                 └────────────────┘         └─────────────────┘
```
