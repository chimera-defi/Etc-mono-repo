## Wireframes (Lo-Fi)

## 1) Workspace Home

```text
+--------------------------------------------------------------+
| SpecForge | Search | New Workspace                          |
+--------------------------------------------------------------+
| Workspaces                                                  |
| - Token Exchange v3      [In Review] [3 Open Questions]     |
| - Spec-to-Ship Revamp     [Draft]    [Needs UX Pack]        |
| - Validator Ops Tool      [Final]                            |
+--------------------------------------------------------------+
```

## 2) Main Editor

```text
+------------------+--------------------------------+----------------------+
| Sections         | Markdown Editor                | Agent / Review       |
|------------------|--------------------------------|----------------------|
| PRD        [ok]  | ## Product Thesis              | [Chat] [Patches]     |
| SPEC      [rev]  | ...                            |                      |
| UX Pack   [gap]  | << inline provenance tags >>   | Patch #42            |
| Risks      [ok]  |                                | + Replace section 2  |
| Financial  [ok]  |                                | Risk: Medium         |
| Recap      [new] |                                | [Accept] [Reject]    |
+------------------+--------------------------------+----------------------+
```

## 3) Recap + Gate Check

```text
+--------------------------------------------------------------+
| Milestone Close: Phase 1                                     |
|--------------------------------------------------------------|
| Thesis Now: ...                                              |
| What Changed: ...                                            |
| Open Decisions: 3                                            |
| Go/No-Go Posture: Conditional Go                             |
|--------------------------------------------------------------|
| Gate Status                                                  |
| [x] PRD   [x] SPEC   [x] Risk   [x] Financial               |
| [x] Validation   [ ] UX Pack (missing wireframe for mobile) |
|--------------------------------------------------------------|
| [Ask Focused Questions] [Return to Editor] [Close Milestone]|
+--------------------------------------------------------------+
```

## 4) Mobile Review Mode

```text
+------------------------------+
| SpecForge                    |
| Patch #42                    |
|------------------------------|
| Section: SPEC > APIs         |
| Risk: Medium                 |
| Diff preview...              |
|------------------------------|
| [Reject] [Comment] [Accept]  |
+------------------------------+
```
