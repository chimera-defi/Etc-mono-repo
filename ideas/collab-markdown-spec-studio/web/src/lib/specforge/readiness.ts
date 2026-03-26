import type { DocumentRecord, StoredPatch } from "./contracts";
import type { ClarificationRecord, CommentThreadRecord } from "./store";

type ReadinessStatus = "blocked" | "needs_review" | "ready";

export type ReadinessReport = {
  score: number;
  status: ReadinessStatus;
  missing_sections: string[];
  open_patch_count: number;
  open_comment_count: number;
  open_clarification_count: number;
  recap: string[];
  gates?: DepthGateReport;
};

// ---------------------------------------------------------------------------
// Depth Gates
// ---------------------------------------------------------------------------

export type DepthGate = {
  id: string;
  label: string;
  passed: boolean;
  reason?: string;
};

export type DepthGateReport = {
  passed: boolean;
  gates: DepthGate[];
  blockers: string[];
};

const requiredSections = [
  "Problem",
  "Goals",
  "Non-Goals",
  "Requirements",
  "UX Pack",
  "Tasks",
];

function normalizeHeading(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function hasSection(document: DocumentRecord, expected: string) {
  const normalizedExpected = normalizeHeading(expected);
  return document.sections.some((section) =>
    normalizeHeading(section.heading).includes(normalizedExpected),
  );
}

export function evaluateReadiness(input: {
  document: DocumentRecord;
  patches: StoredPatch[];
  comments: CommentThreadRecord[];
  clarifications?: ClarificationRecord[];
}): ReadinessReport {
  const { document, patches, comments, clarifications = [] } = input;
  const missingSections = requiredSections.filter(
    (requiredSection) => !hasSection(document, requiredSection),
  );
  const openPatchCount = patches.filter((patch) =>
    ["proposed", "stale"].includes(patch.status),
  ).length;
  const openCommentCount = comments.filter((thread) => thread.status === "open").length;
  const openClarificationCount = clarifications.filter((item) => item.status === "open").length;

  let score = 100;
  score -= missingSections.length * 15;
  if (document.sections.length < 4) {
    score -= 10;
  }
  if (openPatchCount > 0) {
    score -= Math.min(15, openPatchCount * 3);
  }
  if (openCommentCount > 0) {
    score -= Math.min(15, openCommentCount * 3);
  }
  if (openClarificationCount > 0) {
    score -= Math.min(20, openClarificationCount * 5);
  }
  score = Math.max(0, score);

  const status: ReadinessStatus =
    score >= 80 ? "ready" : score >= 50 ? "needs_review" : "blocked";

  const recap = [
    missingSections.length > 0
      ? `Missing sections: ${missingSections.join(", ")}.`
      : "All required sections are present.",
    openPatchCount > 0
      ? `${openPatchCount} patch${openPatchCount === 1 ? "" : "es"} still need review.`
      : "Patch queue is clear.",
    openCommentCount > 0
      ? `${openCommentCount} open comment thread${openCommentCount === 1 ? "" : "s"} remain.`
      : "No open comment threads remain.",
    openClarificationCount > 0
      ? `${openClarificationCount} clarification${openClarificationCount === 1 ? "" : "s"} still need answers.`
      : "Clarification queue is clear.",
  ];

  const gates = evaluateDepthGates({
    document,
    patches,
    clarifications,
    readinessScore: score,
  });

  return {
    score,
    status,
    missing_sections: missingSections,
    open_patch_count: openPatchCount,
    open_comment_count: openCommentCount,
    open_clarification_count: openClarificationCount,
    recap,
    gates,
  };
}

// ---------------------------------------------------------------------------
// Depth Gate Evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate quality gates that block export unless `?force=true` is set.
 *
 * Gates:
 * 1. PROBLEM_DEFINED — Problem section exists and is substantive (>50 chars)
 * 2. GOALS_DEFINED — Goals section has at least 1 goal item
 * 3. UX_PACK_PRESENT — UX Pack section exists (unless metadata marks API-only)
 * 4. NO_OPEN_CRITICAL_CLARIFICATIONS — no unanswered critical clarifications
 * 5. MIN_READINESS_SCORE — readiness score >= 50
 * 6. TASKS_DEFINED — Tasks section has at least 1 task item
 */
export function evaluateDepthGates(input: {
  document: DocumentRecord;
  patches: StoredPatch[];
  clarifications: ClarificationRecord[];
  readinessScore: number;
}): DepthGateReport {
  const { document, clarifications, readinessScore } = input;
  const gates: DepthGate[] = [];

  // Gate 1: PROBLEM_DEFINED
  const problemBlock = findSectionBlock(document, "Problem");
  const problemContent = problemBlock?.content ?? "";
  gates.push({
    id: "PROBLEM_DEFINED",
    label: "Problem section is substantive",
    passed: problemContent.trim().length > 50,
    reason:
      problemContent.trim().length > 50
        ? undefined
        : problemBlock
          ? "Problem section content is too short (must be >50 chars)"
          : "Problem section is missing",
  });

  // Gate 2: GOALS_DEFINED
  const goalsBlock = findSectionBlock(document, "Goals");
  const goalsContent = goalsBlock?.content ?? "";
  const hasGoalItem = /[-*]\s+\S/.test(goalsContent) || /^\d+\.\s+\S/m.test(goalsContent);
  gates.push({
    id: "GOALS_DEFINED",
    label: "Goals section has at least 1 goal",
    passed: hasGoalItem,
    reason: hasGoalItem
      ? undefined
      : goalsBlock
        ? "Goals section has no list items"
        : "Goals section is missing",
  });

  // Gate 3: UX_PACK_PRESENT
  const isApiOnly =
    (document.metadata?.scope ?? "").toLowerCase().includes("api-only") ||
    (document.metadata?.scope ?? "").toLowerCase().includes("cli-only");
  const hasUxPack = hasSection(document, "UX Pack");
  gates.push({
    id: "UX_PACK_PRESENT",
    label: "UX Pack section present",
    passed: hasUxPack || isApiOnly,
    reason:
      hasUxPack || isApiOnly
        ? undefined
        : "UX Pack section is missing (set scope to API-only or CLI-only to bypass)",
  });

  // Gate 4: NO_OPEN_CRITICAL_CLARIFICATIONS
  const openCritical = clarifications.filter(
    (c) => c.priority === "critical" && c.status === "open",
  );
  gates.push({
    id: "NO_OPEN_CRITICAL_CLARIFICATIONS",
    label: "No unanswered critical clarifications",
    passed: openCritical.length === 0,
    reason:
      openCritical.length === 0
        ? undefined
        : `${openCritical.length} unanswered critical clarification${openCritical.length === 1 ? "" : "s"}`,
  });

  // Gate 5: MIN_READINESS_SCORE
  gates.push({
    id: "MIN_READINESS_SCORE",
    label: "Readiness score >= 50",
    passed: readinessScore >= 50,
    reason:
      readinessScore >= 50
        ? undefined
        : `Readiness score is ${readinessScore} (minimum: 50)`,
  });

  // Gate 6: TASKS_DEFINED
  const tasksBlock = findSectionBlock(document, "Tasks");
  const tasksContent = tasksBlock?.content ?? "";
  const hasTaskItem = /[-*]\s+\S/.test(tasksContent) || /^\d+\.\s+\S/m.test(tasksContent);
  gates.push({
    id: "TASKS_DEFINED",
    label: "Tasks section has at least 1 task item",
    passed: hasTaskItem,
    reason: hasTaskItem
      ? undefined
      : tasksBlock
        ? "Tasks section has no list items"
        : "Tasks section is missing",
  });

  const blockers = gates
    .filter((g) => !g.passed)
    .map((g) => g.reason ?? g.label);

  return {
    passed: blockers.length === 0,
    gates,
    blockers,
  };
}

/**
 * Find the first block belonging to a section whose heading matches the
 * expected name (case-insensitive, normalized).
 */
function findSectionBlock(
  document: DocumentRecord,
  expected: string,
): DocumentRecord["blocks"][number] | undefined {
  const normalizedExpected = normalizeHeading(expected);
  const section = document.sections.find((s) =>
    normalizeHeading(s.heading).includes(normalizedExpected),
  );
  if (!section) return undefined;
  return document.blocks.find((b) => b.section_id === section.section_id);
}
