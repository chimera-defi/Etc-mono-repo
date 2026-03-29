import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  getDeliveryTarget,
  parseBacklogMarkdown,
} from "../../../../orchestrator/src/backlog.js";
import {
  collectIntentIds,
  createEmptyLoopState,
  findLatestRelevantClaim as findLatestRelevantClaimFromState,
  findLatestRelevantIntent as findLatestRelevantIntentFromState,
  findLatestRelevantSignal as findLatestRelevantSignalFromState,
  normalizeLoopState,
} from "../../../../orchestrator/src/loop-state.js";

import { logger } from "../logger";

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

type BacklogItem = {
  checked: boolean;
  text: string;
};

type BacklogSection = {
  heading: string;
  items: BacklogItem[];
};

export async function readBacklogState() {
  const markdown = await readFile(tasksPath, "utf8");
  const parsed = parseBacklogMarkdown(markdown) as {
    sections: BacklogSection[];
    activeSection: BacklogSection | null;
    nextItem: BacklogItem | null;
    remainingCount: number;
  };
  const sections = parsed.sections;
  const activeSection = parsed.activeSection;
  const nextItem = parsed.nextItem;
  let loopState: {
    intents?: Array<{ intent_id: string; title: string; status: string; updated_at: string }>;
    claims?: Array<{
      claim_id: string;
      intent_id: string;
      state: string;
      heartbeat_at: string;
      retry_count?: number;
      failure_summary?: string | null;
    }>;
    signals?: Array<{
      at: string;
      type: string;
      intent_id: string;
      failure_summary?: string | null;
    }>;
    passes?: Array<{
      started_at: string;
      dry_run?: boolean;
      mode?: string;
    }>;
    review_every?: number;
  } | null = null;

  try {
    loopState = normalizeLoopState(JSON.parse(await readFile(loopStatePath, "utf8")));
  } catch (error) {
    // Expected when parity runner state file doesn't exist or contains invalid JSON
    // This is not an error condition - we just won't have parity loop metadata
    logger.debug(
      "Failed to load parity runner state",
      { path: loopStatePath, reason: error instanceof Error ? error.message : "Unknown error" }
    );
    loopState = createEmptyLoopState();
  }
  const validIntentIds = collectIntentIds(sections, (heading: string, text: string) =>
    `${heading}:${text}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  );

  const reviewEvery = loopState?.review_every ?? 3;
  const passes = loopState?.passes ?? [];
  const lastReview = [...passes]
    .reverse()
    .find((pass) => pass.mode === "review" && !pass.dry_run);
  const reviewDue =
    reviewEvery > 0 &&
    passes.filter(
      (pass) =>
        !pass.dry_run &&
        pass.mode !== "review" &&
        (!lastReview ||
          new Date(pass.started_at).getTime() > new Date(lastReview.started_at).getTime()),
    ).length >= reviewEvery;

  return {
    sections,
    activeSection: activeSection?.heading ?? null,
    deliveryTarget: getDeliveryTarget(activeSection?.heading ?? null),
    nextItem: nextItem?.text ?? null,
    latestIntent:
      loopState
        ? findLatestRelevantIntentFromState(loopState, validIntentIds)
        : null,
    latestClaim:
      loopState
        ? findLatestRelevantClaimFromState(loopState, validIntentIds)
        : null,
    latestSignal:
      loopState
        ? findLatestRelevantSignalFromState(loopState, validIntentIds)
        : null,
    reviewEvery,
    reviewDue,
    remainingCount: parsed.remainingCount,
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
    "- run verification before finishing: bun run lint, bun run test, bun run build, bun run test:e2e",
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
