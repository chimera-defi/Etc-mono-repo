## User Flows (SpecForge)

## 1) Happy Path: Idea -> Build-Ready Spec
1. User creates workspace and enters high-level idea.
2. Assistant runs clarification pass and asks targeted questions with options/tradeoffs.
3. Team and agents co-edit PRD/SPEC with patch proposals.
4. Reviewer accepts/rejects patches at section level.
5. System generates recap (thesis, changes, open decisions, go/no-go posture).
6. System validates artifact completeness + consistency.
7. User exports build-ready bundle (`PRD`, `SPEC`, `TASKS`, `agent_spec.json`).
8. Optional: create starter repo from approved bundle.

## 5) Clarification Path: Ambiguous Requirements
1. System detects low-confidence section (example: pricing model unclear).
2. Assistant opens question card with 2-3 option paths and tradeoffs.
3. User answers/selects option.
4. System updates:
   - PRD section
   - assumptions log
   - decision record
5. Generation resumes with clarified constraints.

## 2) Failure Path: Low-Quality Agent Output
1. Agent proposes patch with low confidence/risk flag.
2. Reviewer opens diff + provenance + rationale.
3. Reviewer rejects patch and requests regeneration with constraints.
4. Assistant updates prompt/context and proposes revised patch.
5. If repeated failure, route section to manual editing lane.

## 3) Failure Path: Concurrent Edit Conflict
1. Human edits section while agent patch is pending.
2. Conflict detector marks overlapping ranges.
3. User chooses resolve mode:
   - keep human edit
   - apply agent patch
   - merge manually
4. System logs resolution in audit trail.

## 4) Governance Path: Milestone Close
1. User clicks milestone close.
2. System blocks close if depth/UX/checklist gates fail.
3. Assistant lists blockers and asks focused completion questions.
4. After gates pass, recap is produced and user confirms alignment.
