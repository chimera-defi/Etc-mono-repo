# Orbit Pilot

**Status:** Spec + CLI + V1 slices in [`apps/orbit-pilot/`](../../apps/orbit-pilot/) | **V1:** [`V1_SHIPPED.md`](./V1_SHIPPED.md) · [`V1_ROADMAP.md`](./V1_ROADMAP.md) | **V2 (planning):** [`V2_ROADMAP.md`](./V2_ROADMAP.md)

**Implementation:** [`apps/orbit-pilot/`](../../apps/orbit-pilot/) — humans [`HUMAN_GUIDE.md`](../../apps/orbit-pilot/HUMAN_GUIDE.md), agents [`AGENTS.md`](../../apps/orbit-pilot/AGENTS.md).

## One-Liner

Orbit Pilot is a compliance-first launch ops system that converts one product launch into platform-specific submissions across directories, company profiles, communities, and official content APIs.

## Why This Exists

Teams launching products repeatedly hit the same operational mess:

1. one source of truth does not exist,
2. every site wants slightly different copy and image sizes,
3. links are not tracked consistently,
4. duplicate or low-quality submissions create policy risk,
5. some platforms allow official automation and others clearly do not.

Orbit Pilot solves the operational layer, not just the copy layer.

## Product Thesis

The wedge is a structured launch-submission operator:

- canonical launch profile
- platform registry
- unique content variations
- UTM discipline
- asset adaptation
- duplicate detection
- rate limiting
- official API first
- manual-first fallback
- explicit high-risk browser fallback only when enabled

## Primary Use Cases

1. SaaS launch across startup directories and product databases.
2. Company profile synchronization across sites like Crunchbase and directory ecosystems.
3. Launch-content distribution to Medium, DEV, GitHub, Reddit, and similar channels.
4. Niche backlink campaign execution with audit logs and approval tracking.

## Output Pack Included Here

- architecture diagrams
- full orchestrator system prompt
- Python implementation (`apps/orbit-pilot/`) with LangGraph plan + generate graphs
- platform-by-platform quick reference
- sample outputs
- validation and execution docs
- seed platform registry

## Design Partner Example

WalletRadar is a concrete fit for Orbit Pilot because it needs repeatable submissions to backlink and discovery sites, but the product itself is generalizable beyond a single launch target.

## Read Order

1. `EXECUTIVE_SUMMARY.md`
2. `PRD.md`
3. `SPEC.md`
4. `PLATFORM_MATRIX.md`
5. `V0_BUILD_PLAN.md`
6. `ARCHITECTURE_DECISIONS.md`
7. `V2_ROADMAP.md` (monetization + GTM — when relevant)
8. `../../apps/orbit-pilot/` (implementation; [`HUMAN_GUIDE.md`](../../apps/orbit-pilot/HUMAN_GUIDE.md), [`AGENTS.md`](../../apps/orbit-pilot/AGENTS.md))
