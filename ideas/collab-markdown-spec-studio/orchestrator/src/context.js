import { readFile } from "node:fs/promises";

import { getDeliveryTarget, parseBacklogMarkdown, parseChecklist, sectionSlice } from "./backlog.js";

export function toIntentId(phaseHeading, itemText) {
  return `${phaseHeading}:${itemText}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function loadBacklog(tasksPath) {
  const markdown = await readFile(tasksPath, "utf8");
  const recommendedSection = sectionSlice(markdown, "Recommended Parallel Execution Now");
  const implementationSection = sectionSlice(markdown, "Current Implementation Status");
  const parsed = parseBacklogMarkdown(markdown);

  return {
    phases: parsed.sections,
    activePhase: parsed.activeSection,
    remaining: parsed.sections.flatMap((phase) => phase.items),
    current: parseChecklist(implementationSection),
    recommended: recommendedSection
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^\d+\./.test(line)),
  };
}

export function buildFeaturePrompt(nextItem, backlog, paths) {
  const deliveryTarget = getDeliveryTarget(backlog.activePhase?.heading);
  return [
    "Drive the next SpecForge parity pass.",
    "",
    `Active backlog phase: ${backlog.activePhase?.heading ?? "None"}`,
    `Delivery target: ${deliveryTarget}`,
    "",
    `Highest-priority unchecked parity item: ${nextItem.text}`,
    "",
    "Required behavior:",
    "- work in the SpecForge MVP worktree",
    "- implement the smallest integrated change that closes this parity gap",
    "- preserve the current runnable product while advancing the delivery target",
    "- update TASKS.md and any affected spec/architecture docs if the shipped surface changes",
    "- run verification before finishing: bun run lint, bun run test, bun run build, bun run test:e2e",
    "- commit with [Agent: GPT-5] and the Chimera co-author trailer if the branch is green",
    "- only stop early if a real blocker appears",
    "",
    "Source-of-truth docs:",
    `- ${paths.specPath}`,
    `- ${paths.architecturePath}`,
    `- ${paths.techStackPath}`,
    `- ${paths.tasksPath}`,
    "",
    "Current remaining backlog:",
    ...backlog.phases.flatMap((phase) => [
      `- ${phase.heading}:`,
      ...phase.items.map((item) => `  - ${item.checked ? "[x]" : "[ ]"} ${item.text}`),
    ]),
  ].join("\n");
}

export function buildReviewPrompt(backlog, paths) {
  const deliveryTarget = getDeliveryTarget(backlog.activePhase?.heading);
  return [
    "Run a SpecForge multipass review and compaction pass.",
    "",
    `Active backlog phase: ${backlog.activePhase?.heading ?? "None"}`,
    `Delivery target: ${deliveryTarget}`,
    "",
    "Required behavior:",
    "- review the current branch against the source-of-truth docs and shipped product flow",
    "- remove dead code, stale assumptions, and low-value duplication if the change is low risk",
    "- keep the product runnable; do not chase broad refactors",
    "- refresh TASKS.md and affected spec/architecture docs if reality changed",
    "- update the runner handoff artifact with the new resume point",
    `- write meta learnings and future-loop guidance to ${paths.metaLearningsPath}`,
    "- run verification before finishing: bun run lint, bun run test, bun run build, bun run test:e2e",
    "- commit with [Agent: GPT-5] and the Chimera co-author trailer if the branch is green",
    "",
    "Review focus:",
    "- user-facing regressions",
    "- orchestration brittleness",
    "- dead code and repeated route logic",
    "- docs/PR/spec drift",
    "",
    "Source-of-truth docs:",
    `- ${paths.specPath}`,
    `- ${paths.architecturePath}`,
    `- ${paths.techStackPath}`,
    `- ${paths.tasksPath}`,
  ].join("\n");
}
