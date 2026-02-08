# Launchpad Refinements (Configuration UX + Migration + Distribution)

**Last Updated**: Feb 8, 2026

## Product Shape (What We’re Actually Building)

Launchpad is a **configuration-first managed hosting** product:
- **One-click install** (guided wizard, not “bring your own Dockerfile”).
- **Manage + upgrade from UI** (safe updates, rollback, health checks).
- **Opinionated defaults** (security/safety/operability) to keep support load low.

### MVP Non-Goals (keep this strict)
- Running arbitrary user code / plugins in MVP (signed images only).
- Shell access by default.
- Multi-region, enterprise compliance, custom runtimes.

## Configuration UX (MVP Definition)

### Install Wizard (golden path)
1. Choose bot: Clawdbot or Moltbot (MVP may start with Clawdbot only).
2. Connect required keys/secrets (provider-specific prompts, validation, redaction).
3. Choose safe defaults (rate limits, outbound allowlist presets, log retention tier).
4. “Send test message” / run a health check.
5. “Ready” state with a stable URL/subdomain and status page.

### Config as a First-Class Object
- Store a **versioned config** (e.g., `config_versions`) per deployment.
- Show a **diff** before applying changes.
- Maintain **last known good** (LKG) and allow pinning.

### Upgrade UX (and rollback)
- Present: “what changes” (release notes + config compatibility notes).
- Upgrade modes:
  - **Pinned** (manual upgrades)
  - **Canary opt-in** (safer default once you have telemetry)
- Always provide **one-click rollback** to LKG.

### Diagnostics UX (support-cost killer feature)
- Logs with filters + timestamps.
- “Download diagnostics bundle” (sanitized config + recent logs + runtime metadata).
- “Share bundle with support” (time-limited link).

## Migration as the Best Early Offer

Migration should be a primary GTM lever because it converts intent into revenue:

### Migration paths (offer both)
- **Self-serve import**: user uploads a sanitized `.env` + data export (volume snapshot) and Launchpad runs a dry-run boot.
- **Concierge migration** (paid or bundled in Pro/Team): user grants temporary access; Launchpad team migrates + verifies + cuts over.

### Cutover/rollback
- Cutover only after automated checks pass.
- Provide immediate rollback guidance (and keep old host running during a window).

## Distribution Plan (Tokenized Credits, Not a Tradable Token)

“Tokens” are best implemented as **off-chain credits/points** tied to billing to avoid regulatory/UX drag.

### Referral credits (“tokens”)
- A referral link/code grants:
  - **Referrer**: credits redeemable for free months / upgrades / migration fees
  - **Referred**: discounted first month or migration credit
- Credits ledger lives in the control plane (auditable, non-transferable by default).

### Partner program
- Target ecosystem curators/installers and community maintainers.
- Offer revshare as either credits or payouts (later).

### On-chain token (explicitly defer)
- Consider only after PMF and only if there is a clear, non-securities utility.

## Decisions to Lock Before Build
- Define “one-click” success criteria (time-to-ready, required steps, health checks).
- Decide MVP bot coverage (Clawdbot-only vs both).
- Decide upgrade policy default (pinned vs auto minor vs canary opt-in).
- Decide migration packaging (price/bundle, SLA, allowed sources).
- Decide referral credit rules (eligibility, caps, abuse controls).

