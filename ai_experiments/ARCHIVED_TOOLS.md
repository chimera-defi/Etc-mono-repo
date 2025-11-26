# Archived Tools

These tools were evaluated but **removed from active comparison** because they don't fit our focus on **spec-driven development**.

## Why They Were Removed

Our focus is on tools that:
- Use **specifications** to guide AI behavior
- Enable **spec-first development** workflows
- Help AI agents follow defined methodologies

The tools below focus on **runtime validation** or **token-level constraints** rather than spec-driven development guidance.

---

## Guardrails AI

**Location:** `guardrails_ai/`

**What it does:** Runtime validation layer with RAIL files, validators, and re-asking strategies.

**Why removed:** Focuses on **validating AI outputs after generation**, not guiding development through specifications. Good for compliance and safety, but not spec-driven development.

**When to reconsider:** If you need post-hoc validation of AI outputs for compliance, PII filtering, or safety.

---

## Microsoft Guidance

**Location:** `microsoft_guidance/`

**What it does:** Token-level templating and control for LLM outputs with regex/JSON schema constraints.

**Why removed:** A **programming paradigm for controlling generation**, not a spec-driven development methodology. Great for structured outputs, but not about development guidance.

**When to reconsider:** If you need fine-grained control over token generation for structured outputs.

---

## Outlines

**Location:** `outlines/`

**What it does:** Grammar-constrained decoding that guarantees valid structured outputs (JSON, code, etc.).

**Why removed:** Focuses on **ensuring valid output format**, not guiding development through specifications. Excellent for guaranteed valid JSON, but not spec-driven development.

**When to reconsider:** If you need 100% guaranteed valid structured outputs and work primarily in Python.

---

## Note

The documentation in these folders is preserved for reference. These are quality tools for their intended purposes—they just don't fit our current focus on spec-driven development guidance.

If your needs change, these tools may become relevant again.
