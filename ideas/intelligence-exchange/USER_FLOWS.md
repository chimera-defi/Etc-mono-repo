## User Flows (Intelligence Exchange)

State labels follow `STATE_MODEL.md`.

## 1) Buyer Happy Path
1. Buyer creates workspace and funding profile.
2. Buyer configures job policy: budget, SLA, quality threshold, allowed categories.
3. Buyer submits jobs via API or dashboard.
4. Broker matches jobs to eligible workers.
5. Buyer monitors acceptance/rework/latency metrics.
6. Accepted outputs settle and appear in ledger/export.

## 2) Worker Happy Path
1. Worker operator installs daemon and authenticates.
2. Worker sets guardrails: mode, schedule, budget, task classes.
3. Worker claims eligible jobs from broker.
4. Worker executes and submits result + trace.
5. Broker scores outputs and marks accept/reject/rework.
6. Earnings accrue and payout batch is processed.

## 3) Failure Path: Job Rejection Spike
1. Quality scorer flags rising rejection rate for worker.
2. Broker auto-throttles worker claim volume.
3. Worker receives rejection reason summary and remediation prompts.
4. Operator revises settings/prompts and retries in lower-risk lane.
5. If unresolved, account is paused pending review.

## 4) Failure Path: Spend/Abuse Anomaly
1. Buyer spend velocity exceeds configured threshold.
2. System auto-pauses new claims and notifies buyer.
3. Buyer reviews job sources and resumes with stricter guardrails.
4. High-risk events escalate to dispute/risk review queue.
