## Wireframes (Lo-Fi)

Legend:
- `[S:*]` = lifecycle state
- `[R:*]` = risk level
- `[T:*]` = trust tier

Canonical values are defined in `STATE_MODEL.md`.

## 1) Buyer Console (Queue + Controls)

```text
+------------------------------------------------------------------+
| Intelligence Exchange | Buyer Workspace                          |
+------------------------------------------------------------------+
| Spend Today: $214   Acceptance: 93%   Rework: 6%   Alerts: 1     |
|------------------------------------------------------------------|
| Job Queue (mode: claim)                                           |
| - job_1021  Code review batch     [S:running] ETA 3m             |
| - job_1022  Spec transform         [S:accepted]                   |
| - job_1023  Support classification [S:paused] [R:high]            |
|------------------------------------------------------------------|
| [Submit Jobs] [Task Market Mode] [Set Policies] [Dispute Center] |
+------------------------------------------------------------------+
```

## 2) Worker Console (Runtime + Guardrails)

```text
+------------------------------------------------------------------+
| Worker Node: chimera-node-7                                      |
+------------------------------------------------------------------+
| Mode: scheduled  Next Window: 21:00-02:00  [T:T2]                |
| Completed: 128  Rejected: 11  Quality Score: 0.91                |
|------------------------------------------------------------------|
| Guardrails                                                        |
| Budget/day: $30  Classes: code,spec  Kill switch: [OFF]          |
|------------------------------------------------------------------|
| Recent Jobs                                                       |
| - job_1017 [S:accepted] payout $1.20                             |
| - job_1018 [S:rework] reason: schema mismatch                    |
| - job_1019 [S:rejected] reason: failed validation checks         |
|------------------------------------------------------------------|
| [Pause Worker] [Adjust Limits] [View Trace Logs]                 |
+------------------------------------------------------------------+
```

## 3) Job Detail (Agent-First State/Action Loop)

```text
+------------------------------------------------------------------+
| Job: job_1021  Mode: benchmark                                   |
+------------------------------------------------------------------+
| Current State                                                     |
| - status: running                                                 |
| - policy_profile: strict_code                                     |
| - quality_threshold: 0.90                                         |
|------------------------------------------------------------------|
| Pending Actions                                                   |
| 1) fetch_context_bundle                                           |
| 2) run_agent_step(plan_and_patch)                                 |
| 3) submit_artifact_and_trace                                      |
|------------------------------------------------------------------|
| Last Action Result                                                |
| - run_agent_step: success (latency 12.1s, tokens ~2.4k)          |
|------------------------------------------------------------------|
| [Advance Action] [Requeue] [Escalate Review]                     |
+------------------------------------------------------------------+
```

## 4) Risk and Dispute Panel

```text
+------------------------------------------------------------------+
| Risk / Disputes                                                   |
+------------------------------------------------------------------+
| Open Cases: 3                                                     |
| - case_77 spend spike anomaly         [S:open] [R:high]           |
| - case_78 repeated schema failures    [S:open] [R:med]            |
| - case_79 payout hold                 [S:open] [R:high]           |
|------------------------------------------------------------------|
| [Auto-Pause Rules] [Escalation Policies] [Resolve Selected]      |
+------------------------------------------------------------------+
```

## 5) Mobile Review (MVP)

```text
+----------------------------------+
| IE Mobile Review                 |
| case_77 [R:high]                 |
|----------------------------------|
| Trigger: spend velocity spike    |
| Jobs affected: 14                |
| Current action: claim paused     |
|----------------------------------|
| [Keep Paused] [Resume Safe Mode] |
+----------------------------------+
```
