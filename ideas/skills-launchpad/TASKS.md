# Skills Launchpad Tasks

## Phase 1: Define The Product Surface

- [ ] Decide launchpad scope: skills only vs skills + prompts + MCP + tool bundles
- [ ] Define canonical metadata schema for launchpad entries
- [ ] Define install targets: Claude, Codex, MCP, plugin/package, direct repo
- [ ] Define what "verified" means for an entry
- [ ] Define what benchmark evidence is required before marketing claims

## Phase 2: Evidence Layer

- [ ] Evaluate `cass` for session-mining and invocation proof
- [ ] Evaluate `caut` for subscription and provider-usage measurement
- [ ] Design a benchmark contract: first-move savings, end-to-end task savings, install success
- [ ] Define artifact format for benchmark outputs

## Phase 3: Packaging Layer

- [ ] Design launchpad CLI commands: `install`, `verify`, `update`, `list`, `doctor`, `benchmark`
- [ ] Define stable JSON output schemas for every command
- [ ] Define project-local vs global install mode
- [ ] Define update / diff / pin / rollback policy

## Phase 4: Catalog / GTM Layer

- [ ] Design landing page and catalog IA
- [ ] Define "examples", "why", "works with", and benchmark sections
- [ ] Create compatibility matrix across Claude / Codex / MCP
- [ ] Create third-party marketplace export path

## Phase 5: Validation

- [ ] Prototype one launchpad-managed skill end to end
- [ ] Validate local install flow
- [ ] Validate marketplace export compatibility
- [ ] Validate benchmark artifact generation
- [ ] Validate human-facing positioning with one polished landing page

## Suggested Workstreams

### Workstream A: OSS Reuse Evaluation

- inspect `cass`
- inspect `caut`
- inspect `dcg`
- decide adopt vs borrow vs ignore

### Workstream B: Launchpad CLI

- define command set
- define schemas
- define install state model

### Workstream C: Catalog / Marketing

- define metadata model
- define catalog page structure
- define benchmark and trust-signal UX

### Workstream D: Marketplace Adapters

- define export path for Jeffrey-compatible package shape
- validate what can and cannot be listed

## Exit Criteria

This idea moves from planning to build-ready when:

1. the launchpad scope is frozen
2. benchmark evidence requirements are frozen
3. the install/update/verify CLI surface is frozen
4. at least one entry can be exported to a third-party marketplace without manual repackaging
