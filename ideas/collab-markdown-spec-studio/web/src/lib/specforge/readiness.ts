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

  return {
    score,
    status,
    missing_sections: missingSections,
    open_patch_count: openPatchCount,
    open_comment_count: openCommentCount,
    open_clarification_count: openClarificationCount,
    recap,
  };
}
