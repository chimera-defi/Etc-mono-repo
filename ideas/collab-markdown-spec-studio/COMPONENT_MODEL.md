# SpecForge Component Model

## Goal
Make SpecForge a shared product system instead of a web-first demo with orchestration bolted on:
1. one shared OpenSpec core,
2. one multiplayer web product,
3. one realtime collaboration service,
4. one delivery/orchestration runtime,
5. one CLI/TUI entrypoint for agents and terminal-native users.

## Current Reality
Today the product already has three real parts:
1. `web/`: the working UI, auth/session handling, APIs, and most product logic
2. `collab-server/`: the Yjs/Hocuspocus collaboration runtime
3. `tools/specforge-parity-runner.mjs`: the bounded delivery/orchestration loop

What is still too implicit:
1. the remaining export/handoff contract logic
2. more of the readiness/workflow contract surface
3. agent-assist prompting and field population

What is already real:
1. `core/` now owns the guided wizard defaults/builders and shared readiness logic
2. `core/` now also owns export bundle generation, execution brief generation, and launch-packet assembly
3. `orchestrator/` now owns shared backlog parsing for the delivery loop
4. `cli/` now exposes a first terminal-native `specforge` guided wizard

## Target Components

### 1. `specforge-core`
Shared OpenSpec domain package.

Owns:
1. canonical spec schema and validation
2. guided wizard steps and defaults
3. readiness and clarification rules
4. export, starter-handoff, and launch-packet builders
5. agent-assist prompt contracts
6. document/block/patch contract types

Used by:
1. web workspace
2. CLI/TUI wizard
3. delivery/orchestration runtime

### 2. `specforge-web`
Multiplayer SaaS product surface.

Owns:
1. landing page
2. pricing page
3. `/workspace` authoring/review/handoff UX
4. auth/session layer
5. HTTP APIs for documents, patches, comments, clarifications, exports

Depends on:
1. `specforge-core`
2. collaboration service
3. persistence layer

### 3. `specforge-collab`
Realtime collaboration runtime.

Owns:
1. Yjs room sync
2. room auth validation
3. persistence/recovery for room snapshots
4. room telemetry and runtime health

Does not own:
1. patch governance
2. export logic
3. long-running delivery orchestration

### 4. `specforge-orchestrator`
Delivery loop and agent runtime.

Owns:
1. intents, claims, context packages, and signals
2. bounded parity passes
3. handoff artifact generation for continuation
4. periodic multipass review/refactor cadence
5. agent runtime integration for Codex/Claude/local providers

Consumes:
1. approved OpenSpec bundle from `specforge-core`
2. workspace/task state

### 5. `specforge-cli`
Terminal-native entrypoint.

Owns:
1. `/specforge` style wizard flow for creating or refining specs
2. slash-command / CLI wrapper ergonomics for agents and humans
3. TUI views for guided creation, clarification, and launch packet review
4. local agent runtime reuse when the operator is already logged into Codex or Claude Code

Depends on:
1. `specforge-core`
2. optionally `specforge-orchestrator`
3. optionally remote `specforge-web` APIs for shared workspaces

## Product Principle
The CLI/TUI and the web app should not invent two different spec systems.

They should both use:
1. the same guided field model
2. the same readiness logic
3. the same export contract
4. the same launch-packet and orchestration context shape

## Migration Sequence
1. Extract guided spec, exports, launch packet, and contract logic into `specforge-core`.
2. Point `web/` at that shared core instead of local copies.
3. Replace the local parity runner script shape with a `specforge-orchestrator` package boundary.
4. Add a minimal `specforge-cli` wizard that creates or refines specs using the same core package.
5. Let the web product and CLI share the same OpenSpec contract instead of drifting.

## Current Progress
1. Guided wizard defaults/markdown builders are already shared through `core/`.
2. Readiness evaluation is already shared through `core/`.
3. The first `specforge-cli` wizard already emits the same guided markdown/metadata as the web flow.
4. Backlog parsing/delivery-target logic is already shared through `orchestrator/`.
5. Launch-context assembly is now shared through `core/`, and the remaining extraction target is the thin store-adapter and workspace-wiring layer in `web/`.

## What This Fixes
1. less duplicated logic between landing/workspace/tests/runner
2. cleaner packaging for self-hosted + SaaS
3. a real path to a terminal-native product instead of only a browser surface
4. a better foundation for letting agents bring SpecForge to humans in their existing CLI environments
