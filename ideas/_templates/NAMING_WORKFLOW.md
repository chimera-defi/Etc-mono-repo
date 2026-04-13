# Naming Workflow (Strict)

Use this workflow when naming any externally visible product. The output should be decision-ready, auditable, and easy to package into an idea pack handoff.

## Inputs

- `POSITIONING_BRIEF.md` (what the product is and is not)
- Audience definition (primary users + buyer language)
- Naming constraints (for example, max two words)
- Market and competitor context

## Stage 0: Positioning Lock (Required)

Before naming, freeze one clear sentence for:

1. Product category
2. Primary user
3. Core promise
4. Differentiator

If this sentence is not stable, stop naming and fix positioning first.

## Stage 1: Candidate Generation (Divergent)

Generate 30-60 options under explicit constraints:

- Max two words (or one fused compound of two semantic words)
- Pronounceable in English
- No confusing numerals or punctuation
- Avoid category-generic combinations (`crypto + generic noun`, `blockchain + generic noun`)

Store raw outputs in `CANDIDATES.txt` (one candidate per line).

## Stage 2: Hard Filter (Pass/Fail)

Remove candidates that fail any of the following:

- Violates word-count constraint
- Hard to pronounce or spell from hearing
- Too close to a direct competitor
- Over-generic or legally high-risk phrasing

## Stage 3: Weighted Scoring (0-100)

Score surviving names with explicit weights:

- Category clarity: 25
- Distinctiveness: 20
- Memorability: 15
- Brevity/readability: 10
- SEO intent fit (non-spammy): 15
- Domain/TLD headroom (`.com/.org/.net/.xyz/.finance`): 15

Document the scoring table in `NAMING_VALIDATION.md`.

## Stage 4: Validation Checks

Required checks for each shortlisted candidate:

1. Domain availability across `.com`, `.org`, `.net`, `.xyz`, `.finance`
2. Direct search collision scan (brand/product collisions)
3. Trademark risk triage (quick screen)
4. Social handle viability (if go-to-market depends on social channels)
5. GitHub repository collision scan (`<name>` exact/near matches in repo names)
6. Open-source reuse scan (top 3 relevant repos + license compatibility notes)

Mark each result as `clear`, `watch`, or `block`.

## Stage 5: Decision + Fallback

Select:

- Primary name
- Backup #1
- Backup #2

Decision rule:

- Primary must have no `block` flags.
- If primary has one `watch` risk, confirm backup is immediately launchable.

Record final selection and rationale in `NAMING_DECISION.md`.

## Required Outputs

- `POSITIONING_BRIEF.md`
- `CANDIDATES.txt`
- `NAMING_VALIDATION.md`
- `naming-workflow-output.json` (machine-readable)
- `NAMING_DECISION.md`
- `GITHUB_NAME_SCAN.md` (collision + reuse evidence)

## Packaging

Package artifacts with:

```bash
./ideas/scripts/export-naming-pack.sh --source <path-to-naming-dir> --slug <project-slug>
```
