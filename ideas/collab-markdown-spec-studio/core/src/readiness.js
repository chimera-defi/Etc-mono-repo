/**
 * Core readiness evaluator.
 */

const REQUIRED_SECTIONS = ["Problem", "Goals", "Non-Goals", "Requirements", "Tasks"];

const SECTION_WEIGHTS = {
  Problem: 20,
  Goals: 20,
  "Non-Goals": 10,
  Requirements: 25,
  Tasks: 25,
};

export function evaluateReadiness({ document, patches, comments, clarifications = [] }) {
  const presentHeadings = new Set(document.sections.map((s) => s.heading));

  const missing_sections = REQUIRED_SECTIONS.filter((s) => !presentHeadings.has(s));

  let score = 0;
  for (const [section, weight] of Object.entries(SECTION_WEIGHTS)) {
    if (presentHeadings.has(section)) score += weight;
  }

  const open_patch_count = patches.filter(
    (p) => p.status === "proposed" || p.status === "stale"
  ).length;

  const open_comment_count = comments.filter((c) => c.status === "open").length;

  const open_clarification_count = clarifications.filter(
    (c) => c.status === "open"
  ).length;

  // Deduct for open issues
  score = Math.max(0, score - open_patch_count * 3 - open_comment_count * 2 - open_clarification_count * 5);

  let status;
  if (missing_sections.length > 0) {
    status = "blocked";
  } else if (open_patch_count > 0 || open_comment_count > 0 || open_clarification_count > 0) {
    status = "needs_review";
  } else {
    status = "ready";
  }

  const recap = [];
  if (missing_sections.length > 0) {
    recap.push(`Missing sections: ${missing_sections.join(", ")}.`);
  }
  if (open_patch_count > 0) recap.push(`${open_patch_count} open patch(es) need review.`);
  if (open_comment_count > 0) recap.push(`${open_comment_count} open comment thread(s).`);
  if (open_clarification_count > 0) recap.push(`${open_clarification_count} unanswered clarification(s).`);
  if (status === "ready") recap.push("Spec is ready for handoff.");

  return {
    score,
    status,
    missing_sections,
    open_patch_count,
    open_comment_count,
    open_clarification_count,
    recap,
  };
}
