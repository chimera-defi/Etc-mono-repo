---
name: specforge-plan
description: |
  MANUAL TRIGGER ONLY: invoke only when user types /specforge-plan.
  Runs the SpecForge Act 1 Sprint Planning pipeline. Walks through up to 5 optional
  stages (Discovery, CEO Review, Engineering Review, Design Review, Security Review),
  each producing a governed patch proposal against the spec document. All stages are
  skippable. Stage completion state is recorded in the handoff JSON for provenance.
  Use /specforge for the full workflow, /specforge-handoff for the final export.
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

# SpecForge Plan — Act 1 Sprint Planning

You are running the SpecForge sprint planning pipeline. Guide the user through each planning stage conversationally, then wire the answers to the governed patch API.

## Context Detection

```bash
_LOCAL=$(ls ideas/collab-markdown-spec-studio/web/package.json 2>/dev/null && echo "yes" || echo "no")
_API_URL="${SPECFORGE_API_URL:-}"
echo "LOCAL: $_LOCAL | API_URL: $_API_URL"
```

## Stage Sequence

All stages are **optional**. Present each stage's questions, collect answers, then either:
- `POST /api/documents/:id/plan-sessions/:sid/advance` with the answers → creates a governed patch proposal
- `POST /api/documents/:id/plan-sessions/:sid/skip-stage` with `{ stage_name, actor_id }` → marks it skipped

### 1. Discovery
Questions:
- What specific problem does this product solve? Be concrete about the pain.
- Who are the 1-3 primary user segments? What is their job-to-be-done?
- How will you know the product succeeded in 6 months? List 2-3 measurable signals.
- What adjacent problems are explicitly NOT in scope?

### 2. CEO Review
Questions:
- If this product were a 10/10 experience — what would users say about it? Write the 10-star review.
- What must be true for v1 to ship? List the 3 non-negotiable scope items.
- What are we explicitly NOT building? List 3-5 anti-goals to guard the team.
- What does this product do that no existing solution does well?

### 3. Engineering Review
Questions:
- Describe the high-level architecture in 3-5 sentences. What are the main components?
- Walk through the critical data flow for the primary user action.
- What is the proposed tech stack and why? Call out any non-obvious choices.
- What are the top 3 failure modes and how will the system handle each?
- What are the must-have test scenarios? List 3-5 acceptance criteria.

### 4. Design Review
Questions:
- What are the 2-3 core design principles for this product?
- Describe the primary interaction pattern. How does the user move through the core flow?
- What accessibility requirements apply? (WCAG level, keyboard nav, screen reader support)
- What existing design system, brand, or platform constraints must be respected?

### 5. Security Review
Questions:
- Where are the trust boundaries? What data crosses them?
- List the top 3 threats (OWASP-aligned) relevant to this product.
- Describe the authentication and authorization model.
- What sensitive data is stored or processed? How is it protected?
- List 3-5 non-functional security requirements (e.g., rate limiting, audit logging).

## API Flow

```bash
# 1. Create a plan session
POST /api/documents/:documentId/plan-sessions
# Body: {} (stages pre-created as 'pending')

# 2. Complete a stage with answers
POST /api/documents/:documentId/plan-sessions/:sessionId/advance
# Body: { stage_name: "discovery", actor_id: "...", actor_type: "human", answers: { problem: "...", users: "..." } }

# 3. Skip a stage
POST /api/documents/:documentId/plan-sessions/:sessionId/skip-stage
# Body: { stage_name: "security-review", actor_id: "..." }

# 4. Check session state
GET /api/documents/:documentId/plan-sessions/:sessionId
```

## After Planning

Tell the user:
> "Planning complete! Your stage outputs have been queued as governed patch proposals.
> Review and accept them in the **Decide** stage at `?stage=decide`, then proceed to
> draft your spec at `?stage=draft`."

Use `/specforge-handoff` when ready to export the final handoff JSON.
