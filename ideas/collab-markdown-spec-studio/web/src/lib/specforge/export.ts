import {
  agentSpecExportSchema,
  type AgentSpecExport,
  type DocumentRecord,
  type StoredPatch,
} from "./contracts";

export type ExportClarificationRecord = {
  clarification_id: string;
  section_heading: string;
  question: string;
  priority: "critical" | "normal" | "optional";
  status: "open" | "answered";
  created_at: string;
};

function sparse(value: string | undefined, threshold = 20): boolean {
  return !value || value.trim().length < threshold;
}

function metaField(document: DocumentRecord, key: string): string {
  return document.metadata?.[key] ?? "";
}

function bulletLines(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `- ${l.replace(/^-+\s*/, "")}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// README.md
// ──────────────────────────────────────────────────────────────────────────────

function buildReadme(document: DocumentRecord): string {
  const problem = metaField(document, "problem");
  const scope = metaField(document, "scope");
  const requirements = metaField(document, "requirements");

  const mvpSource = requirements || scope;
  const mvpLines = sparse(mvpSource, 1) ? ["- TBD"] : bulletLines(mvpSource);

  return [
    `# ${document.title}`,
    "",
    sparse(problem, 1)
      ? `> Spec document — problem statement not yet provided.`
      : `> ${problem.split("\n")[0].trim()}`,
    "",
    "## Why it matters",
    "",
    ...(sparse(problem, 1) ? ["- TBD"] : bulletLines(problem)),
    "",
    "## MVP",
    "",
    ...mvpLines,
    "",
    "## Status",
    "",
    `- Version: ${document.version}`,
    `- Sections: ${document.sections.length}`,
    `- Updated: ${document.updated_at}`,
    "",
    "## Key docs",
    "",
    "- README.md — this file",
    "- EXECUTIVE_SUMMARY.md — one-page summary",
    "- PRD.md — full product requirements document",
    "- SPEC.md — technical specification",
    "- AGENT_HANDOFF.md — sub-agent execution pack",
    "- TASKS.md — numbered task list",
    "- OPEN_QUESTIONS.md — unresolved decisions",
    "- FIRST_60_MINUTES.md — local runbook",
    "- RISK_REGISTER.md — risk table",
    "- ACCEPTANCE_TEST_MATRIX.md — acceptance test cases",
    "- ARCHITECTURE_DECISIONS.md — ADR stubs",
    "- DECISIONS.md — recorded decisions",
    "- USER_FLOWS.md — actor flows",
    "- VALIDATION_PLAN.md — signal checkpoints",
    "- ADVERSARIAL_TESTS.md — hardening tests",
    "- SUBAGENT_PROMPT_PACK.md — bounded sub-agent prompts",
    "- agent_spec.json — machine-readable spec",
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// EXECUTIVE_SUMMARY.md
// ──────────────────────────────────────────────────────────────────────────────

function buildExecutiveSummary(document: DocumentRecord): string {
  const problem = metaField(document, "problem");
  const goals = metaField(document, "goals");
  const users = metaField(document, "users");
  const scope = metaField(document, "scope");
  const constraints = metaField(document, "constraints");
  const successSignals = metaField(document, "success_signals");

  const oneLiner = sparse(problem, 1)
    ? `${document.title} — spec in progress.`
    : `${document.title}: ${problem.split("\n")[0].trim()}`;

  const whyLines = sparse(problem, 1) ? ["- TBD"] : bulletLines(problem);
  const mvpLines = sparse(scope, 1) ? ["- TBD"] : bulletLines(scope);
  const goalLines = sparse(goals, 1) ? ["- TBD"] : bulletLines(goals);
  const riskLines = sparse(constraints, 1)
    ? ["- Constraints not yet defined"]
    : bulletLines(constraints);
  const decisionRule = sparse(successSignals, 1)
    ? "Proceed when success signals are defined and measurable."
    : `Proceed only if: ${successSignals.split("\n")[0].trim().toLowerCase()}.`;

  return [
    `## ${document.title} — Executive Summary`,
    "",
    "### One-Liner",
    oneLiner,
    "",
    "### Why It Matters",
    ...whyLines,
    "",
    "### Wedge",
    ...(sparse(users, 1) ? ["- Target users not yet specified"] : bulletLines(users)),
    "",
    "### MVP",
    ...mvpLines,
    "",
    "### GTM",
    ...goalLines,
    "",
    "### Biggest Risks",
    ...riskLines,
    "",
    "### Decision Rule",
    decisionRule,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// SPEC.md
// ──────────────────────────────────────────────────────────────────────────────

function buildSpec(document: DocumentRecord, patches: StoredPatch[]): string {
  const accepted = patches.filter((p) => p.status === "accepted" || p.status === "cherry_picked");
  const proposed = patches.filter((p) => p.status === "proposed");

  const sectionBlocks = document.sections.map((section) => {
    const block = document.blocks.find((b) => b.section_id === section.section_id);
    return [`## ${section.heading}`, "", block ? block.content : "_No content yet._"].join("\n");
  });

  const patchHistoryLines =
    accepted.length > 0
      ? accepted.map(
          (p) => `- ${p.patch_id} | ${p.patch_type} | ${p.status} | block: ${p.block_id}`,
        )
      : ["- none"];

  const proposedLines =
    proposed.length > 0
      ? proposed.map((p) => `- ${p.patch_id} :: ${p.patch_type} :: ${p.block_id}`)
      : ["- none"];

  return [
    `# SPEC — ${document.title}`,
    "",
    "## Summary",
    "",
    `Document ID: ${document.document_id}`,
    `Version: ${document.version}`,
    `Sections: ${document.sections.length}`,
    `Updated: ${document.updated_at}`,
    "",
    ...sectionBlocks.flatMap((s) => [s, ""]),
    "## Patch History (accepted)",
    "",
    ...patchHistoryLines,
    "",
    "## Patch Queue (proposed)",
    "",
    ...proposedLines,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// AGENT_HANDOFF.md
// ──────────────────────────────────────────────────────────────────────────────

function buildAgentHandoff(document: DocumentRecord): string {
  const problem = metaField(document, "problem");
  const requirements = metaField(document, "requirements");
  const successSignals = metaField(document, "success_signals");

  const objective = sparse(problem, 1)
    ? `Implement ${document.title}.`
    : `Implement ${document.title}: ${problem.split("\n")[0].trim()}`;

  const mustHaves = sparse(requirements, 1)
    ? ["1. Requirements not yet specified — clarify before build."]
    : requirements
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l, i) => `${i + 1}. ${l.replace(/^[-\d.]+\s*/, "")}`);

  const acceptanceCriteria = sparse(successSignals, 1)
    ? ["1. Success signals not yet defined."]
    : successSignals
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l, i) => `${i + 1}. ${l.replace(/^[-\d.]+\s*/, "")}`);

  return [
    `## Agent Handoff: ${document.title}`,
    "",
    "### Objective",
    objective,
    "",
    "### Must-Haves",
    ...mustHaves,
    "",
    "### Parallel Sub-Agent Prompts (Bounded)",
    "1. UX Agent",
    `   - Scope: \`PRD.md\`, \`USER_FLOWS.md\``,
    `   - Prompt: "Define user flows with explicit trust moments, failure paths, and measurable conversion points."`,
    "2. Architecture Agent",
    `   - Scope: \`SPEC.md\`, \`ARCHITECTURE_DECISIONS.md\``,
    `   - Prompt: "Define system components, data flows, and integration contracts with deterministic replay semantics."`,
    "3. Risk Agent",
    `   - Scope: \`ADVERSARIAL_TESTS.md\`, \`RISK_REGISTER.md\``,
    `   - Prompt: "Enumerate abuse and failure scenarios; specify controls and response playbooks."`,
    "4. Validation Agent",
    `   - Scope: \`VALIDATION_PLAN.md\`, \`ACCEPTANCE_TEST_MATRIX.md\``,
    `   - Prompt: "Map each success signal to a measurement method, source of truth, and pass/fail threshold."`,
    "",
    "### Merge Contract",
    "1. Every flow must map to a test case in ACCEPTANCE_TEST_MATRIX.md.",
    "2. Every metric must name its source of truth and review cadence.",
    "3. Open ambiguities must emit clarification questions before merge.",
    "4. Each agent pass ends with: decisions made, open items remaining.",
    "",
    "### Acceptance Criteria",
    ...acceptanceCriteria,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// TASKS.md
// ──────────────────────────────────────────────────────────────────────────────

function buildTasks(document: DocumentRecord, patches: StoredPatch[]): string {
  const tasks = metaField(document, "tasks");
  const accepted = patches.filter((p) => p.status === "accepted" || p.status === "cherry_picked");

  const taskLines = sparse(tasks, 1)
    ? document.sections.map((section, i) => `${i + 1}. Review and implement: ${section.heading}`)
    : tasks
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l, i) => `${i + 1}. ${l.replace(/^[-\d.]+\s*/, "")}`);

  const completedLines =
    accepted.length > 0
      ? accepted.map(
          (p) =>
            `- [x] Accepted patch \`${p.patch_id}\` (${p.patch_type}) on block \`${p.block_id}\``,
        )
      : ["- No accepted patches yet."];

  const reviewLines = document.sections.map(
    (s) => `- [ ] Review section: ${s.heading}`,
  );

  return [
    `# TASKS — ${document.title}`,
    "",
    `Source document: ${document.title}`,
    `Version: ${document.version}`,
    "",
    "## Implementation Tasks",
    "",
    ...taskLines,
    "",
    "## Completed Work (accepted patches)",
    "",
    ...completedLines,
    "",
    "## Sections to Review",
    "",
    ...reviewLines,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// OPEN_QUESTIONS.md
// ──────────────────────────────────────────────────────────────────────────────

function buildOpenQuestions(
  document: DocumentRecord,
  clarifications?: ExportClarificationRecord[],
): string {
  const questions: Array<{ section: string; question: string; decision: string }> = [];

  // Unanswered clarifications first
  if (clarifications) {
    const unanswered = clarifications.filter((c) => c.status === "open");
    for (const c of unanswered) {
      questions.push({
        section: c.section_heading,
        question: c.question,
        decision: "Answer this clarification before proceeding with implementation.",
      });
    }
  }

  // Sparse metadata fields generate placeholder questions
  const metaChecks: Array<{ key: string; section: string; question: string; decision: string }> = [
    {
      key: "problem",
      section: "Problem",
      question: "What specific problem does this solve, and for whom?",
      decision: "Define the core pain point before scoping requirements.",
    },
    {
      key: "goals",
      section: "Goals",
      question: "What are the 2–3 measurable outcomes that would make this a success?",
      decision: "Each goal should be verifiable with a concrete threshold.",
    },
    {
      key: "users",
      section: "Users",
      question: "Who are the primary users or operators?",
      decision: "Describe technical level and the job they are trying to do.",
    },
    {
      key: "scope",
      section: "Scope",
      question: "What is explicitly in scope for the first version?",
      decision: "Define what can be shipped in 4–6 weeks.",
    },
    {
      key: "requirements",
      section: "Requirements",
      question: "What must the system do? List the 3–5 minimum features.",
      decision: "Features needed before the first user can get value.",
    },
    {
      key: "constraints",
      section: "Constraints",
      question: "What constraints shape the build?",
      decision: "Tech stack, timeline, team size, budget, API limits.",
    },
    {
      key: "success_signals",
      section: "Success Signals",
      question: "How will you know the first version worked?",
      decision: "Give 2–3 measurable signals with thresholds.",
    },
  ];

  for (const check of metaChecks) {
    if (sparse(metaField(document, check.key))) {
      questions.push({
        section: check.section,
        question: check.question,
        decision: check.decision,
      });
    }
  }

  if (questions.length === 0) {
    return [
      `## Open Questions — ${document.title}`,
      "",
      "All critical questions have been answered. Ready for build.",
    ].join("\n");
  }

  const questionBlocks = questions.map(
    (q, i) =>
      [
        `### Q${i + 1}: ${q.question}`,
        "",
        `**Section:** ${q.section}`,
        "",
        `**Decision needed:** ${q.decision}`,
        "",
        "---",
      ].join("\n"),
  );

  return [
    `## Open Questions — ${document.title}`,
    "",
    "These questions must be answered before the MVP build can be executed.",
    "",
    "---",
    "",
    ...questionBlocks,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// FIRST_60_MINUTES.md
// ──────────────────────────────────────────────────────────────────────────────

function buildFirst60Minutes(document: DocumentRecord): string {
  const successSignals = metaField(document, "success_signals");

  const criteriaLines = sparse(successSignals, 1)
    ? ["1. Application boots without errors.", "2. Core workflow is exercisable end-to-end."]
    : successSignals
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l, i) => `${i + 1}. ${l.replace(/^[-\d.]+\s*/, "")}`);

  return [
    `# ${document.title} — First 60 Minutes`,
    "",
    "> **Pre-build status:** No implementation exists yet. This runbook defines the",
    "> target acceptance surface for when a build agent scaffolds the project.",
    "> Use the Stack Bootstrap section first.",
    "",
    "## Goal",
    `Run a local instance of ${document.title}, exercise the core workflow, and verify deterministic output.`,
    "",
    "## Commands",
    "```bash",
    `# Clone and install`,
    `bun install`,
    ``,
    `# Start development server`,
    `bun run dev`,
    ``,
    `# Health check`,
    `curl http://localhost:3000/api/health`,
    ``,
    `# Run acceptance tests`,
    `bun test`,
    "```",
    "",
    "## Success Criteria (within 60 min)",
    ...criteriaLines,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// RISK_REGISTER.md
// ──────────────────────────────────────────────────────────────────────────────

function buildRiskRegister(document: DocumentRecord): string {
  const constraints = metaField(document, "constraints");

  const derivedRisks: Array<{ risk: string; likelihood: string; impact: string; mitigation: string }> =
    [];

  if (!sparse(constraints, 1)) {
    const lines = constraints
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      derivedRisks.push({
        risk: `Constraint risk: ${line.replace(/^-+\s*/, "")}`,
        likelihood: "Medium",
        impact: "Medium",
        mitigation: "Monitor constraint and escalate if it blocks a milestone.",
      });
    }
  }

  const standardRisks = [
    {
      risk: "Technical complexity exceeds estimate",
      likelihood: "Medium",
      impact: "High",
      mitigation: "Time-box spikes; de-scope to non-goals if blocked.",
    },
    {
      risk: "Scope creep during build",
      likelihood: "High",
      impact: "Medium",
      mitigation: "Review non-goals list at every sprint boundary.",
    },
    {
      risk: "User adoption lower than expected",
      likelihood: "Medium",
      impact: "High",
      mitigation: "Ship to 3 pilot users before broader rollout.",
    },
  ];

  const allRisks = [...derivedRisks, ...standardRisks];
  const tableRows = allRisks.map(
    (r) => `| ${r.risk} | ${r.likelihood} | ${r.impact} | ${r.mitigation} |`,
  );

  return [
    `# Risk Register — ${document.title}`,
    "",
    "| Risk | Likelihood | Impact | Mitigation |",
    "|------|-----------|--------|------------|",
    ...tableRows,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// ACCEPTANCE_TEST_MATRIX.md
// ──────────────────────────────────────────────────────────────────────────────

function buildAcceptanceTestMatrix(document: DocumentRecord): string {
  const successSignals = metaField(document, "success_signals");
  const requirements = metaField(document, "requirements");

  const source = sparse(successSignals, 1) ? requirements : successSignals;
  const sourceLines = sparse(source, 1)
    ? ["Core functionality works as expected"]
    : source
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

  const rows = sourceLines.map((signal, i) => {
    const id = `AT-${String(i + 1).padStart(3, "0")}`;
    const scenario = signal.replace(/^[-\d.]+\s*/, "");
    return `| ${id} | ${scenario} | System satisfies: ${scenario} | Pending |`;
  });

  return [
    `# Acceptance Test Matrix — ${document.title}`,
    "",
    "| Test ID | Scenario | Expected Result | Status |",
    "|---------|----------|-----------------|--------|",
    ...rows,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE_DECISIONS.md
// ──────────────────────────────────────────────────────────────────────────────

function buildArchitectureDecisions(document: DocumentRecord): string {
  const constraints = metaField(document, "constraints");

  const stack = sparse(constraints, 1)
    ? "TBD — no constraints provided yet."
    : constraints.split("\n")[0].trim().replace(/^-+\s*/, "");

  return [
    `# Architecture Decisions — ${document.title}`,
    "",
    "## Persistence",
    "",
    `**Decision:** TBD`,
    `**Context:** ${stack}`,
    `**Status:** Pending`,
    "",
    "## Auth",
    "",
    `**Decision:** TBD`,
    `**Context:** Authentication strategy not yet specified.`,
    `**Status:** Pending`,
    "",
    "## Collaboration",
    "",
    `**Decision:** TBD`,
    `**Context:** Real-time collaboration model not yet specified.`,
    `**Status:** Pending`,
    "",
    "## Export",
    "",
    `**Decision:** TBD`,
    `**Context:** Export format and delivery mechanism not yet specified.`,
    `**Status:** Pending`,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// DECISIONS.md
// ──────────────────────────────────────────────────────────────────────────────

function buildDecisions(document: DocumentRecord, patches: StoredPatch[]): string {
  const accepted = patches.filter((p) => p.status === "accepted" || p.status === "cherry_picked");

  if (accepted.length === 0) {
    return [
      `# Decisions — ${document.title}`,
      "",
      "No decisions have been recorded yet (no accepted patches).",
    ].join("\n");
  }

  const header = "| Decision | Rationale | Date | Decided By |";
  const divider = "|----------|-----------|------|------------|";
  const rows = accepted.map((p) => {
    const rationale = p.rationale ?? p.patch_type;
    const date = p.created_at.slice(0, 10);
    const decidedBy = `${p.proposed_by.actor_type}:${p.proposed_by.actor_id}`;
    return `| Accept patch \`${p.patch_id}\` (${p.patch_type}) | ${rationale} | ${date} | ${decidedBy} |`;
  });

  return [
    `# Decisions — ${document.title}`,
    "",
    header,
    divider,
    ...rows,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// USER_FLOWS.md
// ──────────────────────────────────────────────────────────────────────────────

function buildUserFlows(document: DocumentRecord): string {
  const users = metaField(document, "users");
  const scope = metaField(document, "scope");

  const userList = sparse(users, 1)
    ? ["Primary User"]
    : users
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replace(/^-+\s*/, ""));

  const primaryAction = sparse(scope, 1)
    ? "uses the core functionality"
    : scope.split("\n")[0].trim().replace(/^-+\s*/, "").toLowerCase();

  const flowBlocks = userList.map((user) =>
    [
      `### Flow: ${user}`,
      "",
      `**Primary Path**`,
      `1. Actor: ${user}`,
      `2. Action: ${primaryAction}`,
      `3. Outcome: Task completed successfully`,
      "",
      `**Failure Path**`,
      `1. Actor: ${user}`,
      `2. Action: ${primaryAction} — system error occurs`,
      `3. Outcome: Error message displayed; user can retry`,
      "",
      `**Edge Cases**`,
      `- Empty input: Prompt for required fields`,
      `- Concurrent edit: Last-write-wins with conflict notification`,
    ].join("\n"),
  );

  return [
    `# User Flows — ${document.title}`,
    "",
    ...flowBlocks.flatMap((b) => [b, ""]),
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// VALIDATION_PLAN.md
// ──────────────────────────────────────────────────────────────────────────────

function buildValidationPlan(document: DocumentRecord): string {
  const successSignals = metaField(document, "success_signals");

  const signals = sparse(successSignals, 1)
    ? ["System works as expected"]
    : successSignals
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replace(/^-+\s*/, ""));

  const rows = signals.map((signal) => {
    return `| ${signal} | Manual verification | Acceptance test suite | Engineering | Pass |`;
  });

  return [
    `# Validation Plan — ${document.title}`,
    "",
    "| Signal | Measurement | Source of Truth | Owner | Threshold |",
    "|--------|------------|-----------------|-------|-----------|",
    ...rows,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// ADVERSARIAL_TESTS.md
// ──────────────────────────────────────────────────────────────────────────────

function buildAdversarialTests(document: DocumentRecord): string {
  return [
    `# Adversarial Tests — ${document.title}`,
    "",
    "These tests harden the spec against common failure modes.",
    "",
    "## AT-001: Incomplete inputs",
    "- Submit spec with all optional fields empty.",
    "- Expected: System accepts and flags missing fields; does not crash.",
    "",
    "## AT-002: Concurrent edits",
    "- Two actors submit patches to the same block simultaneously.",
    "- Expected: Both patches are queued; human review resolves conflict.",
    "",
    "## AT-003: Export with unresolved critical clarifications",
    "- Attempt export when critical clarifications are unanswered.",
    "- Expected: Export is blocked with a 409 and clear error message.",
    "",
    "## AT-004: Agent hallucination",
    "- Agent proposes a patch referencing a block that does not exist.",
    "- Expected: Patch is rejected at creation with a validation error.",
    "",
    "## AT-005: Stale patches",
    "- Document is updated after a patch is proposed.",
    "- Expected: Patch is marked stale; human must re-review before accepting.",
    "",
    "## AT-006: Large document",
    "- Document with 50+ sections and 100+ patches.",
    "- Expected: Export completes within 5 seconds; no truncation.",
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// SUBAGENT_PROMPT_PACK.md
// ──────────────────────────────────────────────────────────────────────────────

function buildSubagentPromptPack(document: DocumentRecord): string {
  return [
    `# Sub-Agent Prompt Pack — ${document.title}`,
    "",
    "These prompts are self-contained and can be run in parallel by independent agents.",
    "",
    "## Prompt 1: Spec Author",
    "",
    "```",
    `You are a senior product manager. Read PRD.md for the project "${document.title}".`,
    `Your task: identify any gaps in requirements, scope, or success signals.`,
    `Output a numbered list of gaps and a revised section for each gap found.`,
    `Constraint: do not add features outside the stated scope.`,
    "```",
    "",
    "## Prompt 2: Reviewer",
    "",
    "```",
    `You are a critical product reviewer. Read PRD.md and SPEC.md for "${document.title}".`,
    `Your task: identify contradictions, missing edge cases, and underspecified requirements.`,
    `Output: list of issues, each with section reference and suggested fix.`,
    `Constraint: focus only on correctness and completeness — not style.`,
    "```",
    "",
    "## Prompt 3: Technical Architect",
    "",
    "```",
    `You are a software architect. Read SPEC.md and ARCHITECTURE_DECISIONS.md for "${document.title}".`,
    `Your task: propose concrete ADR entries for the Persistence, Auth, and Export sections.`,
    `Output: one ADR per section in the standard format: Context / Decision / Status / Consequences.`,
    `Constraint: prefer off-the-shelf solutions; justify any custom builds.`,
    "```",
    "",
    "## Prompt 4: Risk Analyst",
    "",
    "```",
    `You are a risk analyst. Read RISK_REGISTER.md and ADVERSARIAL_TESTS.md for "${document.title}".`,
    `Your task: add 3 additional risks not covered by existing entries.`,
    `Output: risk table rows in format: Risk | Likelihood | Impact | Mitigation.`,
    `Constraint: risks must be specific to this project — no generic filler.`,
    "```",
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// agent_spec.json
// ──────────────────────────────────────────────────────────────────────────────

function buildAgentSpecJson(
  document: DocumentRecord,
  patches: StoredPatch[],
  clarifications?: ExportClarificationRecord[],
  planningStages?: Map<string, Record<string, string>>,
): string {
  const proposed = patches.filter((p) => p.status === "proposed");
  const agentSpec: AgentSpecExport = agentSpecExportSchema.parse({
    document_id: document.document_id,
    title: document.title,
    version: document.version,
    sections: document.sections,
    patch_queue: proposed.map((patch) => ({
      patch_id: patch.patch_id,
      block_id: patch.block_id,
      patch_type: patch.patch_type,
      status: patch.status,
    })),
  });

  const openQuestions = clarifications
    ? clarifications.filter((c) => c.status === "open").length
    : 0;
  const risks = sparse(metaField(document, "constraints"), 1)
    ? 3
    : document.metadata?.constraints?.split("\n").filter(Boolean).length ?? 0 + 3;

  const extended: Record<string, unknown> = {
    ...agentSpec,
    metadata: document.metadata ?? {},
    clarification_count: clarifications?.length ?? 0,
    open_question_count: openQuestions,
    risk_count: risks,
  };

  // Add planning session provenance if stages were completed
  if (planningStages && planningStages.size > 0) {
    const stageNames = ["discovery", "ceo-review", "eng-review", "design-review", "security-review"];
    extended.planningSession = {
      stages: stageNames.map((name) => {
        const outputs = planningStages.get(name);
        return {
          name,
          status: outputs ? "completed" : "skipped",
          outputs: outputs ?? null,
        };
      }),
    };
  }

  return JSON.stringify(extended, null, 2);
}

// ──────────────────────────────────────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────────────────────────────────────

export function exportDocumentBundle(
  document: DocumentRecord,
  patches: StoredPatch[],
  clarifications?: ExportClarificationRecord[],
  planningStages?: Map<string, Record<string, string>>,
) {
  const files: Record<string, string> = {
    "README.md": buildReadme(document),
    "EXECUTIVE_SUMMARY.md": buildExecutiveSummary(document),
    "PRD.md": document.markdown,
    "SPEC.md": buildSpec(document, patches),
    "AGENT_HANDOFF.md": buildAgentHandoff(document),
    "TASKS.md": buildTasks(document, patches),
    "OPEN_QUESTIONS.md": buildOpenQuestions(document, clarifications),
    "FIRST_60_MINUTES.md": buildFirst60Minutes(document),
    "RISK_REGISTER.md": buildRiskRegister(document),
    "ACCEPTANCE_TEST_MATRIX.md": buildAcceptanceTestMatrix(document),
    "ARCHITECTURE_DECISIONS.md": buildArchitectureDecisions(document),
    "DECISIONS.md": buildDecisions(document, patches),
    "USER_FLOWS.md": buildUserFlows(document),
    "VALIDATION_PLAN.md": buildValidationPlan(document),
    "ADVERSARIAL_TESTS.md": buildAdversarialTests(document),
    "SUBAGENT_PROMPT_PACK.md": buildSubagentPromptPack(document),
    "agent_spec.json": buildAgentSpecJson(document, patches, clarifications, planningStages),
  };

  // Conditionally add planning stage outputs
  if (planningStages) {
    const designOutputs = planningStages.get("design-review");
    if (designOutputs) {
      files["DESIGN_SYSTEM.md"] = buildDesignSystem(designOutputs);
    }

    const securityOutputs = planningStages.get("security-review");
    if (securityOutputs) {
      files["SECURITY.md"] = buildSecurity(securityOutputs);
    }
  }

  return {
    document_id: document.document_id,
    version: document.version,
    files,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Planning Stage Outputs
// ──────────────────────────────────────────────────────────────────────────────

function buildDesignSystem(outputs: Record<string, string>): string {
  return [
    "# Design System",
    "",
    "**Source**: Sprint Planning — Design Review stage",
    "",
    "## Design Principles",
    "",
    outputs.design_principles ?? "",
    "",
    "## Interaction Model",
    "",
    outputs.interaction_model ?? "",
    "",
    "## Accessibility",
    "",
    outputs.accessibility ?? "",
    "",
    "## Design Constraints",
    "",
    outputs.design_constraints ?? "",
  ].join("\n");
}

function buildSecurity(outputs: Record<string, string>): string {
  return [
    "# Security",
    "",
    "**Source**: Sprint Planning — Security Review stage",
    "",
    "## Trust Boundaries",
    "",
    outputs.trust_boundaries ?? "",
    "",
    "## Threat Model",
    "",
    outputs.threat_model ?? "",
    "",
    "## Authentication & Authorization",
    "",
    outputs.auth_model ?? "",
    "",
    "## Sensitive Data",
    "",
    outputs.sensitive_data ?? "",
    "",
    "## Security Requirements",
    "",
    outputs.security_requirements ?? "",
  ].join("\n");
}
