# AI rails (shared)

These are the minimal guardrails for working across repos. Keep them small, explicit, and enforceable.

## 1) Scope and intent
- Always restate the target repo and path before editing.
- Prefer a single source of truth for plans/specs; avoid parallel docs.
- If an instruction conflicts with a repo convention, flag it and propose a safe default.

## 2) Evidence and sources
- Prefer local docs and README files over assumptions.
- If info is missing, add a TODO with the exact file and decision needed.
- Don’t invent commands, endpoints, or config keys that aren’t backed by sources.

## 3) Code changes
- Keep edits small and reversible; no broad refactors without explicit ask.
- Update docs only when code/behavior changed; avoid copy that doesn’t map to reality.
- Remove placeholders before shipping or mark them clearly as TODO.

## 4) Testing and validation
- Prefer quick smoke tests; record what was run and what wasn’t.
- If tests can’t run, state the blocker and provide a manual check path.

## 5) Security baseline
- Never log secrets or copy private keys into files.
- Avoid committing `.env`/credentials; use examples instead.
- Prefer read-only status endpoints for public exposure.

## 6) Communication rules
- Be concise in chat; put longer details in files.
- Summaries must include: what changed, where, why, and what’s left.

## 7) Accept/decline rubric
- If task touches prod credentials, require explicit confirmation.
- If a request is unsafe or ambiguous, pause and ask for clarification.

## Request template (when needed)
- Repo:
- Path(s):
- Goal:
- Constraints:
- Tests:
- Acceptance criteria:
