# Skills Launchpad Agent Handoff

Use this only in a runtime that supports real sub-agent delegation. Codex in this environment does not.

## Workstream 1: OSS Reuse Evaluation

**Goal:** determine whether `cass`, `caut`, `dcg`, and `fastmcp_rust` should be adopted, wrapped, or ignored.

**Read first**

- `ideas/skills-launchpad/README.md`
- `ideas/skills-launchpad/RESEARCH_NOTES.md`

**Output**

- one markdown report
- adopt / borrow-patterns / ignore recommendation per repo
- implementation complexity estimate

## Workstream 2: Launchpad CLI Spec

**Goal:** define the minimum viable CLI for install, verify, update, doctor, and benchmark.

**Read first**

- `ideas/skills-launchpad/README.md`
- `ideas/skills-launchpad/TASKS.md`

**Output**

- command list
- JSON schema notes
- local state model
- upgrade path and rollback policy

## Workstream 3: Marketplace Adapter Spec

**Goal:** define how launchpad entries get exported to third-party catalogs without becoming dependent on them.

**Read first**

- `ideas/skills-launchpad/RESEARCH_NOTES.md`
- `ideas/skills-launchpad/COMPETITOR_ANALYSIS.md`

**Output**

- export model
- incompatibility list
- moderation / policy risks

## Workstream 4: GTM / Landing Page Spec

**Goal:** define the human-facing marketing and catalog surface.

**Read first**

- `ideas/skills-launchpad/README.md`
- `ideas/skills-launchpad/COMPETITOR_ANALYSIS.md`

**Output**

- landing page sections
- catalog information architecture
- trust-signal and benchmark placement
- proof requirements before launch
