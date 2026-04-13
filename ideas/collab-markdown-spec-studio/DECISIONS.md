# SpecForge Decisions

## 2026-03-05 -- Wedge is workflow, not generic editing
**Decision:** Position around human+agent authoring, depth gates, and governed patch review.
**Rationale:** Generic collaborative editing is crowded.

## 2026-03-05 -- Repo generation is phase 2
**Decision:** Keep repo generation out of initial MVP core.
**Rationale:** Need trust and retention proof before adding complexity.

## 2026-03-05 -- Naming direction
**Decision:** Prefer execution-oriented names (SpecForge/ShipSpec).
**Rationale:** Names should communicate shipping outcomes, not just docs.

## 2026-03-05 -- Validation-first
**Decision:** Require design-partner workflow evidence before build expansion.
**Rationale:** Prevent overbuilding in a crowded category.

## 2026-03-13 -- Validate authoring behavior before code generation
**Decision:** Treat repeated authoring use and gated spec completion as the main pilot goal; use curated `ideas/` packs as example end-to-end runs.
**Rationale:** Example builds are valuable proof, but they do not replace real-user authoring validation.

## 2026-04-08 -- Retire `SpecForge` as external primary name
**Decision:** Treat `SpecForge` as collision-heavy on GitHub and remove it from external-name consideration while we continue low-collision naming exploration pending legal/domain sign-off.
**Rationale:** Multiple existing `SpecForge` repositories exist across both unrelated and adjacent categories, including direct PRD/spec-generation overlap; this weakens discoverability and brand distinctiveness.

## 2026-04-08 -- Add mandatory GitHub scan + reuse gate
**Decision:** No future name decision is considered complete without a GitHub collision scan and an explicit open-source reuse assessment.
**Rationale:** We should avoid preventable naming conflicts and systematically build on MIT/open work where it accelerates delivery.

## 2026-04-08 -- Execute upstream reuse as tracked backlog
**Decision:** Convert reuse findings into explicit implementation workstreams and done criteria in `UPSTREAM_REUSE_PLAN.md`.
**Rationale:** A scan without integration tasks does not reduce delivery risk; work must be directly wired into backlog execution.

## 2026-04-08 -- Provisional external rename direction
**Decision:** Use `ScopeSpec` as the provisional external rename candidate with `ScopeFrame` and `FrameSpec` as backups, based on strict naming workflow outputs in `branding/`.
**Rationale:** `ScopeSpec` currently shows the best combined score for category clarity and collision profile after excluding `SpecForge` and other high-collision names.
