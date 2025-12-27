# Mobile Speech Agent App - Risk Analysis & Startup Viability Assessment

> **Analysis Date:** December 26, 2025 (Revised v3)
> **Status:** Strategic Pivot Evaluation
> **Strategy:** Multi-Path (Self-Hosted MVP -> Managed SaaS)

---

## Executive Summary

### The "Pro Tool" Pivot (Path B)

We are adding a **Self-Hosted (BYOC)** path as the primary MVP strategy.

**Why?**
1.  **Eliminates Infrastructure Risk:** We don't manage VMs. No zombie processes, no security patching.
2.  **Eliminates Cost Risk:** User pays for the compute (Hetzner/DigitalOcean). We just route packets.
3.  **Solves Context Blindness:** The agent runs *on the user's machine*, so it has native, fast access to the filesystem (ripgrep, git) without complex RAG pipelines.
4.  **Privacy:** "Your code never leaves your server" is a massive selling point for seniors/enterprises.

---

## 1. Strategy Comparison

### Path A: Managed SaaS (The "Cursor for Mobile")
*   **Pros:** Low friction (sign up -> go). Mass market appeal.
*   **Cons:** High cost ($20/mo cost basis). DevOps nightmare. Security liability.
*   **Target:** Junior devs, agencies, rapid prototypers.

### Path B: Self-Hosted / BYOC (The "Terminal on Steroids")
*   **Pros:** Zero infrastructure cost. Zero liability. High privacy.
*   **Cons:** High friction (must run `npm install`). Niche market (devs with VPS).
*   **Target:** Senior devs, DevOps engineers, Privacy advocates.

---

## 2. Updated Risk Profile (Path B)

| Risk | Impact | Path B Mitigation |
| :--- | :--- | :--- |
| **Cost Explosion** | 🔴 Critical | **ELIMINATED.** No compute costs. |
| **Context Blindness** | 🔴 Critical | **MITIGATED.** Local agent uses `grep`/`find` natively. |
| **DevOps Complexity** | 🔴 Critical | **ELIMINATED.** User manages their own OS. |
| **Adoption Friction** | 🟡 Medium | **INCREASED.** Mitigation: One-line install script. |
| **Connectivity** | 🟡 Medium | **MITIGATED.** WebSocket Relay (no open ports needed). |

---

## 3. Financial Viability (Path B)

**Unit Economics (Self-Hosted):**
*   **Revenue:** $10/month (Lower price point possible due to lower cost).
*   **COGS:**
    *   Whisper API: $3.00/mo (500 mins)
    *   Relay Bandwidth: $0.10/mo
    *   **Total Cost:** $3.10/mo
*   **Gross Margin:** **69%** (Healthy SaaS margin).

**vs Path A (Managed):**
*   **Revenue:** $20/month.
*   **COGS:** $15.00/mo (Compute + API).
*   **Gross Margin:** 25% (Dangerous).

---

## 4. Recommendations

**Pivot to Path B for MVP.**

1.  **Build the "Cadence Agent" CLI:** A Node.js wrapper around Claude Agent SDK that connects to a websocket.
2.  **Build the Relay Server:** A simple Fastify websocket bridge.
3.  **Build the Mobile App:** The remote control interface.

**Defer Path A (Managed SaaS)** until Series A / Scale-up phase when we have the team to handle DevOps complexity.

---

**Document Version:** 3.0
**Last Updated:** December 26, 2025
**Analysis Conducted By:** Claude Code Risk Analysis Agent
