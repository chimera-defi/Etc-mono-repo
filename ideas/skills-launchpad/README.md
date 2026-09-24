# Skills Launchpad

**Status**: Research / planning  
**Last Updated**: March 27, 2026

## Thesis

There is room for a better skills launchpad for coding agents, but the winning product is not "a folder of markdown skills." It is a packaged distribution layer:

1. Discoverable catalog
2. One-command install and updates
3. Agent-friendly verification and examples
4. Benchmarks and usage proof
5. Optional marketplace adapters instead of single-platform lock-in

The immediate opportunity is to build a launchpad that helps Claude Code, Codex, and MCP-native users install, verify, benchmark, and keep skills updated without forcing them onto a third-party hosted marketplace.

## Why This Matters

Today, most skills have weak distribution:

- copied manually from a repo
- poorly versioned
- hard to verify after install
- hard to benchmark honestly
- hard to market beyond GitHub README readers

Jeffrey's Skills.md shows that there is real demand for a more productized experience. The key lesson is not "host our skills on his site." The lesson is that packaging, lifecycle management, trust signals, and install UX are part of the product.

## Core Product Concept

Build a **skills launchpad** with four layers:

### 1. Human-facing discovery layer

- landing page with value proposition, examples, and install flow
- catalog pages for skills, prompts, MCP servers, and bundles
- benchmark pages with honest numbers and caveats
- "why this exists" and "works with" compatibility surfaces

### 2. Agent-facing install layer

- one-command install
- verify / doctor / update commands
- stable JSON output for agent use
- project-scoped and global install modes
- optional sync across Claude / Codex / Gemini style directories

### 3. Proof and observability layer

- benchmark harnesses for first-move token reduction
- real end-to-end task benchmarks
- usage tracking by provider and subscription bucket
- session-mining to prove whether skills were actually invoked

### 4. Distribution adapter layer

- native repo install
- direct plugin / MCP install surfaces
- optional export for third-party catalogs like Jeffrey's Skills.md
- optional internal catalog for our own launchpad

## What To Copy From Jeffrey's Skills.md

- CLI-first install and update flow
- versioning and integrity verification
- local/offline search
- examples, "why", and related-skill discovery
- productized packaging instead of raw markdown
- category / tag / compatibility metadata
- one-liner installers that feel like a real product

## What Not To Copy

- dependence on a single hosted marketplace
- subscriber-only lock-in as the primary distribution path
- moderation rules that can reject meta-skill or launchpad-related content
- OAuth / billing / sync infrastructure we do not control

## Third-Party Marketplace Position

Jeffrey's domain is useful as an **additional channel**, not the canonical home.

Current recommendation:

1. Keep our own repo and site as source of truth
2. Build an export path for third-party catalogs
3. Submit selected skills where it helps discovery
4. Do not make core install or update workflows depend on any one marketplace

## Initial Product Scope

### MVP

- launchpad landing page
- catalog page for our skills
- install / verify / benchmark CLI
- benchmark artifact generation
- direct Claude / Codex / MCP install docs
- one reference marketplace export target

### Phase 2

- multi-skill bundles
- diff / pin / rollback
- project-aware recommendations
- usage dashboards
- session-based proof of real invocation

## Most Relevant Open-Source Inputs

- `coding_agent_session_search` (`cass`) for session mining
- `coding_agent_usage_tracker` (`caut`) for real subscription impact tracking
- `destructive_command_guard` (`dcg`) for hook packaging and safety patterns
- `fastmcp_rust` for a future Rust MCP server path
- `jeffreysprompts.com` for product packaging and marketing structure

See [RESEARCH_NOTES.md](./RESEARCH_NOTES.md) for the detailed breakdown.

## Key Decision

**Build our own launchpad.**

Treat Jeffrey's Skills.md as:

- a benchmark for packaging quality
- an optional distribution surface
- a source of OSS-adjacent tooling ideas

Do **not** treat it as the product substrate.

## Next Step

Use [TASKS.md](./TASKS.md) as the execution plan and [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) if the work gets split across multiple agents in a runtime that supports sub-agent delegation.
