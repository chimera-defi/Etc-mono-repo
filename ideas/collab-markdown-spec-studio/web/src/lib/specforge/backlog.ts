import { readFile } from "node:fs/promises";
import path from "node:path";

const tasksPath = path.resolve(process.cwd(), "..", "TASKS.md");
const specPath = path.resolve(process.cwd(), "..", "SPEC.md");
const architecturePath = path.resolve(process.cwd(), "..", "ARCHITECTURE_DECISIONS.md");
const techStackPath = path.resolve(process.cwd(), "..", "TECH_STACK.md");
const loopStatePath = path.resolve(
  process.cwd(),
  "..",
  "..",
  "..",
  ".cursor",
  "artifacts",
  "specforge-parity-runner.json",
);

const backlogSections = [
  "Remaining MVP Build Backlog",
  "Next SaaS Build Backlog",
] as const;

type BacklogItem = {
  checked: boolean;
  text: string;
};

function getDeliveryTarget(heading: string | null) {
  if (heading === "Remaining MVP Build Backlog") {
    return "minimum_extensible_product";
  }

  return heading ? "scoped_saas_parity" : "clear";
}

function sectionSlice(markdown: string, heading: string) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^## ${escaped}\\n([\\s\\S]*?)(?=^## |\\Z)`, "m"));
  return match?.[1] ?? "";
}

function parseChecklist(section: string): BacklogItem[] {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^- \[[ x]\]/.test(line))
    .map((line) => ({
      checked: line.startsWith("- [x]"),
      text: line.replace(/^- \[[ x]\]\s*/, ""),
    }));
}

export async function readBacklogState() {
  const markdown = await readFile(tasksPath, "utf8");
  const sections = backlogSections.map((heading) => ({
    heading,
    items: parseChecklist(sectionSlice(markdown, heading)),
  }));
  const activeSection = sections.find((section) => section.items.some((item) => !item.checked)) ?? null;
  const nextItem = activeSection?.items.find((item) => !item.checked) ?? null;
  let loopState: {
    intents?: Array<{ intent_id: string; title: string; status: string; updated_at: string }>;
    claims?: Array<{ claim_id: string; intent_id: string; state: string; heartbeat_at: string }>;
    signals?: Array<{ at: string; type: string; intent_id: string }>;
  } | null = null;

  try {
    loopState = JSON.parse(await readFile(loopStatePath, "utf8"));
  } catch {
    loopState = null;
  }

  return {
    sections,
    activeSection: activeSection?.heading ?? null,
    deliveryTarget: getDeliveryTarget(activeSection?.heading ?? null),
    nextItem: nextItem?.text ?? null,
    latestIntent:
      loopState?.intents && loopState.intents.length > 0
        ? loopState.intents[loopState.intents.length - 1]
        : null,
    latestClaim:
      loopState?.claims && loopState.claims.length > 0
        ? loopState.claims[loopState.claims.length - 1]
        : null,
    latestSignal:
      loopState?.signals && loopState.signals.length > 0
        ? loopState.signals[loopState.signals.length - 1]
        : null,
    remainingCount: sections.reduce(
      (total, section) => total + section.items.filter((item) => !item.checked).length,
      0,
    ),
  };
}

export async function buildBacklogBrief() {
  const backlog = await readBacklogState();

  if (!backlog.activeSection || !backlog.nextItem) {
    return "SpecForge parity backlog is clear.";
  }

  return [
    "Drive the next SpecForge parity pass.",
    "",
    `Active backlog phase: ${backlog.activeSection}`,
    `Delivery target: ${backlog.deliveryTarget}`,
    `Highest-priority unchecked item: ${backlog.nextItem}`,
    "",
    "Required behavior:",
    "- work in the SpecForge MVP worktree",
    "- implement the smallest integrated change that closes this backlog item",
    "- update TASKS.md and any affected spec/architecture docs if the shipped surface changes",
    "- run verification before finishing: npm run lint, npm run test, npm run build, npm run test:e2e",
    "- commit with [Agent: GPT-5] and the Chimera co-author trailer if the branch is green",
    "",
    "Source-of-truth docs:",
    `- ${specPath}`,
    `- ${architecturePath}`,
    `- ${techStackPath}`,
    `- ${tasksPath}`,
  ].join("\n");
}

export async function buildBacklogContext() {
  const backlog = await readBacklogState();

  return {
    delivery_target: backlog.deliveryTarget,
    active_phase: backlog.activeSection,
    next_item: backlog.nextItem,
    latest_intent: backlog.latestIntent,
    latest_claim: backlog.latestClaim,
    latest_signal: backlog.latestSignal,
    remaining_count: backlog.remainingCount,
    remaining_sections: backlog.sections.map((section) => ({
      heading: section.heading,
      unchecked_items: section.items.filter((item) => !item.checked).map((item) => item.text),
    })),
    source_of_truth: {
      spec: specPath,
      architecture: architecturePath,
      tech_stack: techStackPath,
      tasks: tasksPath,
    },
  };
}
