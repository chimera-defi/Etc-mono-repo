## Wireframes (Lo-Fi)

## 1) Buyer Console

```text
+------------------------------------------------------------------+
| Intelligence Exchange | Buyer Workspace                          |
+------------------------------------------------------------------+
| Spend Today: $214   Acceptance: 93%   Rework: 6%   Alerts: 1     |
|------------------------------------------------------------------|
| Job Queue                                                         |
| - job_1021  Code review batch     [In Progress]  ETA 3m          |
| - job_1022  Spec transform         [Completed]    Accepted        |
| - job_1023  Support classification [Paused: Spend Guardrail]      |
|------------------------------------------------------------------|
| [Submit Jobs] [Set Policies] [View Exports] [Dispute Center]     |
+------------------------------------------------------------------+
```

## 2) Worker Console

```text
+------------------------------------------------------------------+
| Worker Node: chimera-node-7                                      |
+------------------------------------------------------------------+
| Mode: scheduled  Next Window: 21:00-02:00  Trust Tier: T2        |
| Completed: 128  Rejected: 11  Quality Score: 0.91                |
|------------------------------------------------------------------|
| Guardrails                                                        |
| Budget/day: $30  Task classes: code,spec  Kill switch: [OFF]     |
|------------------------------------------------------------------|
| Recent Jobs                                                       |
| - job_1017 [Accepted] payout $1.20                               |
| - job_1018 [Rework] reason: schema mismatch                      |
| - job_1019 [Rejected] reason: failed validation checks           |
|------------------------------------------------------------------|
| [Pause Worker] [Adjust Limits] [View Trace Logs]                 |
+------------------------------------------------------------------+
```

## 3) Risk and Dispute Panel

```text
+------------------------------------------------------------------+
| Risk / Disputes                                                   |
+------------------------------------------------------------------+
| Open Cases: 3                                                     |
| - case_77 spend spike anomaly         [Needs Buyer Review]        |
| - case_78 repeated schema failures    [Needs Worker Action]       |
| - case_79 payout hold                 [Risk Team]                 |
|------------------------------------------------------------------|
| [Auto-Pause Rules] [Escalation Policies] [Resolve Selected]      |
+------------------------------------------------------------------+
```
