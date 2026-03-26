# SpecForge Local-First Product and Spec System Plan

This document refines the current recommendations into one source of truth for:

1. the local-first product direction
2. the next implementation priority order
3. the meta learnings to bake into SpecForge
4. the next version of the `ideas/` scaffold for higher-quality one-shot builds

## 1. Product Direction

SpecForge should be treated as a `local-first multiplayer spec IDE` first.

That means the primary shipped product promise is:

- collaborative spec authoring
- local Codex / Claude CLI reuse
- governed agent patches
- deterministic export / handoff

Hosted SaaS remains important, but it is the second distribution mode, not the sharpest first wedge.

## 2. Refined Build Priority Order

### Priority 1: Package the Working Local Product

Build next:

1. Tauri desktop shell
2. local runtime status panel
3. local install/download flow
4. local CLI assist diagnostics

Reason:

- this turns the current working alpha into a real product
- it matches what users actually want from the current system
- it reduces onboarding friction without changing the core architecture

### Priority 2: Tighten the Local Product Surface

Build next:

5. pilot membership UX polish
6. acceptance test UX
7. design review workflow polish
8. store / workspace decomposition

Reason:

- this makes the local and design-partner experience cleaner
- it reduces internal complexity before more platform work lands

### Priority 3: Add Honest SaaS Scaffolding

Build next:

9. billing provider skeleton
10. entitlements enforcement cleanup
11. hosted ops surfaces

Reason:

- this prepares the hosted path without pretending full SaaS is already done

### Priority 4: Prepare the Hybrid Model

Build next:

12. hybrid local bridge design spike
13. local diagnostics export

Reason:

- this enables future hosted + local CLI reuse
- it is important, but it should not delay desktop packaging

### Priority 5: Improve the Spec System Itself

Build next:

14. future idea-generation improvements inside SpecForge

Reason:

- this is how we reduce future build friction
- it converts the lessons from this giant PR into product capability

## 3. Meta Learnings To Bake Into SpecForge

### Product Scoping

1. Split `MVP parity` from `platform/company parity`.
2. Require `real`, `scaffold`, or `future` status for major features.
3. Treat placeholders as product bugs, not harmless filler.

### Spec Quality

4. Require a `UX Pack` for any user-facing product.
5. Require explicit `API-only` / `CLI-only` declaration when no GUI exists.
6. Require acceptance tests early, not late.
7. Require `non-goals` and deferred scope.
8. Require distribution model and runtime topology up front.

### Agent Integration

9. Require an explicit local-vs-hosted assist model.
10. Require an explicit rule for agent writes vs governed patches.
11. Keep browser-safe and server-side boundaries explicit in the spec.

### Delivery

12. Require canonical verification commands in the spec.
13. Define `build complete`, `locally usable`, `design-partner alpha`, and `release candidate` as separate stages.
14. Keep export/handoff contracts deterministic and package-manager correct.

## 4. Improvements To The `ideas/` Scaffold

The next version of the idea scaffold should require these sections:

1. Product thesis
2. User and buyer
3. Problem
4. Goals
5. Non-goals
6. UX Pack
7. Distribution model
8. Runtime topology
9. Agent integration contract
10. Acceptance tests
11. Verification commands
12. Release stages
13. Future/post-MVP work

## 5. Stronger Defaults For New Ideas

Future generated ideas should default to:

1. Bun
2. deterministic export / handoff
3. governed agent changes
4. explicit UX coverage
5. local verification commands
6. honest scaffold vs shipped labeling

## 6. What SpecForge Should Ask During Idea Generation

SpecForge should add first-class guided fields for:

1. local-first vs hosted-first vs hybrid
2. local CLI reuse vs hosted provider
3. key screens / failure states / responsive rules
4. acceptance checks
5. release stage target
6. what a one-shot build must actually produce

## 7. How This Improves One-Shot Builds

These changes improve one-shot build quality because they reduce ambiguity about:

- what is being built
- how it runs
- how it is tested
- how humans and agents are allowed to interact
- what counts as done

The point is not a longer spec. The point is a more executable spec.

## 8. Recommended Next Product Changes

The highest-leverage changes to SpecForge itself are:

1. add the missing guided fields above
2. make depth gates reflect them
3. export a stronger `ideas/` pack directly from SpecForge
4. use SpecForge as the default generator for future repo ideas
