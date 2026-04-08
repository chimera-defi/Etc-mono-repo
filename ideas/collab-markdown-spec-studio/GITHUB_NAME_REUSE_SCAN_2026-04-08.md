# GitHub Name + Reuse Scan (2026-04-08)

## Objective

Validate whether `SpecForge` is a viable product name and identify open-source work we should build on instead of re-deriving from scratch.

## Scan Method

GitHub repository search and targeted README/code-file inspection for:

- `specforge`
- `shipspec`
- adjacent PRD/spec planning generators

## Name Collision Findings

`SpecForge` has substantial collision risk on GitHub.

1. `sgl-project/SpecForge` — speculative decoding framework for SGLang, active project name usage in another category.  
   Link: https://github.com/sgl-project/SpecForge
2. `modal-labs/SpecForge` — same name, same category overlap with speculative decoding stack.  
   Link: https://github.com/modal-labs/SpecForge
3. `wangzhaode/SpecForge` — same name, same speculative decoding framing.  
   Link: https://github.com/wangzhaode/SpecForge
4. `achuajays/SpecForge` — AI PRD/spec blueprint generator, directly adjacent problem space.  
   Link: https://github.com/achuajays/SpecForge
5. `wirelessr/SpecForge-Agent` — multi-agent software lifecycle orchestration with requirements/design/tasks phases.  
   Link: https://github.com/wirelessr/SpecForge-Agent

Inference from inspected READMEs:

- `modal-labs/SpecForge` and `wangzhaode/SpecForge` appear to mirror/fork the same SGLang-oriented SpecForge content.
- Even when not direct competitors, collision density is high enough that `SpecForge` is not a clean, ownable public name.

### Supplemental Rescan (Later 2026-04-08 Pass)

Additional exact/near `SpecForge` repo-name collisions were found in a follow-up scan, including:

- `MingYuePop/SpecForge`
- `iKwesi/SpecForge`
- `marcmallet/specforge`
- `cadic/specforge`
- `wmeints/specforge`
- `nguyendlp/specforge`
- `NikitosKh/mini-specforge`

Implication:

- Collision risk is increasing over time, not decreasing.
- `SpecForge` should remain retired as an external primary brand.

`ShipSpec` also shows existing exact-name usage (`ktamulonis/shipspec`, `Karthikeyanmuthu25/shipspec`) and should be treated as `watch`, not a locked final brand.

## Reuse Candidates (Concrete)

These are the best immediate build-on targets:

1. `jsegov/shipspec-cli` (MIT)
   - Planning prompt structure and traceability-friendly templates:
     - `src/agents/prompts/planning-templates.ts`
     - `src/flows/planning-flow.ts`
   - Link: https://github.com/jsegov/shipspec-cli
2. `wirelessr/SpecForge-Agent` (MIT)
   - Multi-phase approval workflow orchestration:
     - `autogen_framework/workflow_manager.py`
     - `autogen_framework/agents/tasks_agent.py`
   - Link: https://github.com/wirelessr/SpecForge-Agent
3. `achuajays/SpecForge` (MIT)
   - Productized PRD wizard patterns, export UX, and draft-management ideas from README and architecture description.
   - Link: https://github.com/achuajays/SpecForge

## Recommended Actions

1. Retire `SpecForge` as the primary external name; keep it only as internal codename if needed.
2. Use `ScopeSpec` as the current provisional external candidate and treat `ShipSpec` as a watch-only fallback from this scan.
3. Add explicit "GitHub collision + reuse scan" as a required gate before locking any name.
4. Open implementation backlog items to borrow/adapt:
   - Requirements traceability matrix and prompt scaffolding from `shipspec-cli`
   - Workflow approval state machine hardening from `SpecForge-Agent`
   - Wizard flow and export ergonomics from `achuajays/SpecForge`
