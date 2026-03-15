## Collaborative Spec Product Validation Plan

## Goal
Validate whether teams adopt this as a repeat authoring workflow, trust governed agent patches, and reach build-ready specs with less downstream rework.

### Phase 0: Broad Discovery (Week 1)
1. Interview 15 teams:
   - founders/product leads
   - eng leads/tech leads
   - AI-heavy dev teams
2. Map current workflow:
   - where they write specs
   - how AI is used today
   - where handoff breaks

### Phase 1: Authoring Fit Test (Week 2-3)
1. Prototype with multiplayer markdown + patch approval UI + depth gate recap.
2. Run 5 design-partner sessions on real projects.
3. Measure:
   - return usage within same project
   - time to implementation-ready spec
   - patch acceptance rates
   - user trust in agent edits
   - milestone-close completion rate

### Phase 2: Spec Quality Test (Week 3-5)
1. Add export bundle and instrumented build-readiness rubric.
2. Compare against control workflow (Notion/Docs + chat copy-paste).
3. Evaluate speed delta, ambiguity reduction, and rework outcomes.

### Phase 3: Example Build Test (Week 5-7)
1. Use selected `ideas/` packs as curated examples:
   - rough idea
   - mid-fidelity idea
   - mature spec pack
2. Run authoring -> export -> code generation on those examples.
3. Track first-commit time, rework rate, and spec-to-code fidelity.
4. Decide if repo generation is core, beta-only, or optional module.

## Success Thresholds
1. >= 60% of active pilot workspaces return for a second authoring session in the same project window.
2. >= 35% agent patch acceptance in mature sessions, segmented by patch type.
3. >= 40% faster spec-to-first-commit cycle on curated example builds.
4. >= 25% reduction in downstream rework or spec ambiguity on instrumented examples.
5. >= 70% of pilot milestone attempts reach gated recap completion.

## Kill Thresholds
1. Teams still default to incumbent docs for final specs.
2. Agent patch acceptance stays too low to create leverage.
3. Reliability/merge complexity undermines trust and retention.
4. Example builds show little quality gain despite heavier authoring workflow.

## Instrumentation Requirements
1. Every metric must have:
   - system of record
   - owner
   - collection method
2. Patch acceptance must be segmented by patch class:
   - wording/formatting
   - structural edits
   - requirement changes
   - task/export changes
3. Example build runs must record:
   - source idea pack
   - document versions used
   - export bundle version
   - downstream build defects or rework notes
