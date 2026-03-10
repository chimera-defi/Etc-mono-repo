## Adversarial Tests (SpecForge)

### 1) Incumbent Gravity Attack
**Attack:** Teams stay in Notion/Docs and never migrate core workflow.

**Mitigation:** Win on execution outcomes (spec-to-ship speed), not generic editing.

**Kill Criterion:** Teams use tool only for drafts and finalize elsewhere.

### 2) AI Trust Attack
**Attack:** Agent edits are noisy and ignored.

**Mitigation:** Patch-level approval, provenance labels, section-level control.

**Kill Criterion:** Persistently low patch acceptance and poor retention.

### 3) Complexity Attack
**Attack:** Branch/merge workflow feels too heavy for small teams.

**Mitigation:** Progressive disclosure and simple defaults.

**Kill Criterion:** Onboarding drop-off tied to workflow complexity.

### 4) Reliability Attack
**Attack:** Realtime conflicts/data-loss events break trust.

**Mitigation:** Durable logs, rollback snapshots, robust sync layer.

**Kill Criterion:** Recurring reliability incidents during pilot.

### 5) Weak Outcome Attack
**Attack:** Repo generation does not materially reduce build time.

**Mitigation:** Track spec-to-first-commit delta and optimize templates.

**Kill Criterion:** No meaningful throughput gain in pilot cohorts.
