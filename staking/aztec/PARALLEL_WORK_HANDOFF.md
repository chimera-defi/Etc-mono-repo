# Parallel Work Handoff — Aztec Liquid Staking (Compressed 2026-08-09)

**Original date:** 2026-01-23 | **Status:** Planning prompt for post-contract frontend + bot work

## What This Was

Multi-agent orchestration prompt for 6 parallel agents to work simultaneously after smart contracts completed Phase 2.

## Planned Work Streams (as of 2026-01-23)

| Stream | Agents | Scope |
|--------|--------|-------|
| Frontend (Mock Data) | 3 (F1/F2/F3) | Next.js + Tailwind UI scaffolding, StakeWidget, PortfolioView, TransactionStatus, mock hooks (useStaking, useWallet) |
| Bot Infrastructure | 2 (B1/B2) | Rebalancing bot + monitoring/alerting bot using Aztec RPC |
| Security Docs | 1 | Threat model + operational runbook |

## Contract State at Time of Writing

- 3-contract architecture: StakedAztecToken, LiquidStakingCore, WithdrawalQueue
- 74/74 unit tests passing, 7/7 smoke, 6/6 integration
- Frontend scaffold: Next.js + Tailwind shell existed at `staking/aztec/frontend`

## Where Agent Prompts Live Now

- **Frontend agent prompts:** `docs/FRONTEND_HANDOFF.md` → §Prompts for Coding Agents (Prompt 1–N)
- **Bot agent prompts:** `docs/AGENT-PROMPTS-QUICKREF.md` → Agent B1/B2 sections
- **Project state:** `HANDOFF.md` (compressed, 29 lines)
