#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

import {
  getDeliveryTarget,
} from "../orchestrator/src/backlog.js";
import {
  buildFeaturePrompt,
  buildReviewPrompt,
  loadBacklog,
  toIntentId,
} from "../orchestrator/src/context.js";
import {
  collectIntentIds,
  createEmptyLoopState,
  findActiveRelevantClaim,
  findLatestRelevantClaim,
  findLatestRelevantIntent,
  findLatestRelevantSignal,
  normalizeLoopState,
} from "../orchestrator/src/loop-state.js";

const toolDir = path.dirname(new URL(import.meta.url).pathname);
const packRoot = path.resolve(toolDir, "..");
const worktreeRoot = path.resolve(packRoot, "..", "..");
const tasksPath = path.join(packRoot, "TASKS.md");
const specPath = path.join(packRoot, "SPEC.md");
const architecturePath = path.join(packRoot, "ARCHITECTURE_DECISIONS.md");
const techStackPath = path.join(packRoot, "TECH_STACK.md");
const loopStatePath = path.join(worktreeRoot, ".cursor", "artifacts", "specforge-parity-runner.json");
const handoffPath = path.join(worktreeRoot, ".cursor", "artifacts", "specforge-runner-latest.md");
const metaLearningsPath = path.join(
  worktreeRoot,
  ".cursor",
  "artifacts",
  "specforge-meta-learnings.md",
);
function tailOutput(value, length = 4000) {
  if (!value) {
    return "";
  }

  return String(value).slice(-length);
}

function parseArgs(argv) {
  const [command = "status", ...rest] = argv;
  const options = {
    command,
    dryRun: false,
    maxPasses: 1,
    reviewEvery: 3,
    untilClear: false,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (token === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (token === "--max-passes") {
      options.maxPasses = Number(rest[index + 1] ?? "1");
      index += 1;
      continue;
    }

    if (token === "--review-every") {
      options.reviewEvery = Number(rest[index + 1] ?? "3");
      index += 1;
      continue;
    }

    if (token === "--until-clear") {
      options.untilClear = true;
    }
  }

  return options;
}

function countCompletedFeaturePasses(state) {
  return state.passes.filter((pass) => !pass.dry_run && pass.mode !== "review").length;
}

function getLastReviewPass(state) {
  return [...state.passes]
    .reverse()
    .find((pass) => pass.mode === "review" && !pass.dry_run) ?? null;
}

function shouldRunReview(state, reviewEvery) {
  if (reviewEvery <= 0) {
    return false;
  }

  const completedFeaturePasses = countCompletedFeaturePasses(state);
  if (completedFeaturePasses === 0) {
    return false;
  }

  const lastReviewPass = getLastReviewPass(state);
  if (!lastReviewPass) {
    return completedFeaturePasses >= reviewEvery;
  }

  const featurePassesSinceReview = state.passes.filter(
    (pass) =>
      !pass.dry_run &&
      pass.mode !== "review" &&
      new Date(pass.started_at).getTime() > new Date(lastReviewPass.started_at).getTime(),
  ).length;

  return featurePassesSinceReview >= reviewEvery;
}

async function readLoopState() {
  try {
    const raw = await readFile(loopStatePath, "utf8");
    return normalizeLoopState(JSON.parse(raw));
  } catch {
    return createEmptyLoopState();
  }
}

async function writeLoopState(state) {
  await mkdir(path.dirname(loopStatePath), { recursive: true });
  await writeFile(loopStatePath, JSON.stringify(state, null, 2));
}

async function runCodexCommand(command, state, claimId) {
  return await new Promise((resolve) => {
    const child = spawn(command[0], command.slice(1), {
      cwd: worktreeRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const heartbeat = setInterval(async () => {
      const claim = state.claims.find((entry) => entry.claim_id === claimId);
      if (!claim || claim.state !== "claimed") {
        return;
      }

      claim.heartbeat_at = new Date().toISOString();
      state.updated_at = claim.heartbeat_at;
      await writeLoopState(state);
    }, 10_000);

    child.stdout.on("data", (chunk) => {
      const value = String(chunk);
      stdout += value;
      process.stdout.write(value);
    });

    child.stderr.on("data", (chunk) => {
      const value = String(chunk);
      stderr += value;
      process.stderr.write(value);
    });

    const finish = async (status) => {
      if (settled) {
        return;
      }
      settled = true;
      clearInterval(heartbeat);
      resolve({ status, stdout, stderr });
    };

    child.on("error", async (error) => {
      stderr += error instanceof Error ? error.stack ?? error.message : String(error);
      await finish(1);
    });

    child.on("close", async (status) => {
      await finish(status ?? 1);
    });
  });
}

async function writeRunnerHandoff(input) {
  const body = [
    "# SpecForge Runner Handoff",
    "",
    `- Updated at: ${input.updatedAt}`,
    `- Intent: ${input.intentId ?? "none"}`,
    `- Phase: ${input.phase ?? "none"}`,
    `- Delivery target: ${input.deliveryTarget ?? "unknown"}`,
    `- Status: ${input.status}`,
    `- Next item: ${input.nextItem ?? "none"}`,
    "",
    "## Summary",
    input.summary,
    "",
    "## Source Of Truth",
    `- ${specPath}`,
    `- ${architecturePath}`,
    `- ${techStackPath}`,
    `- ${tasksPath}`,
    "",
    "## Resume",
    input.resume,
    "",
    "## Prompt",
    "```text",
    input.prompt ?? "",
    "```",
  ].join("\n");

  await mkdir(path.dirname(handoffPath), { recursive: true });
  await writeFile(handoffPath, body);
}

async function writeMetaLearnings(input) {
  const body = [
    "# SpecForge Runner Meta Learnings",
    "",
    `- Updated at: ${input.updatedAt}`,
    `- Delivery target: ${input.deliveryTarget ?? "unknown"}`,
    `- Mode: ${input.mode}`,
    `- Status: ${input.status}`,
    "",
    "## Current focus",
    `- ${input.nextItem ?? "No remaining backlog item."}`,
    "",
    "## Loop guidance",
    "- Prefer bounded integrated passes over broad speculative rewrites.",
    "- Refresh TASKS.md and source-of-truth docs when the shipped surface changes.",
    "- Use periodic multipass review passes to remove drift, dead code, and stale assumptions.",
    "- Keep context compact by resuming from the latest handoff artifact and this meta-learning note.",
    "",
    "## Latest summary",
    input.summary,
  ].join("\n");

  await mkdir(path.dirname(metaLearningsPath), { recursive: true });
  await writeFile(metaLearningsPath, body);
}

async function runStatus() {
  const backlog = await loadBacklog(tasksPath);
  const remaining = backlog.remaining.filter((item) => !item.checked);
  const loopState = await readLoopState();
  const validIntentIds = collectIntentIds(backlog.phases, toIntentId);
  const deliveryTarget = getDeliveryTarget(backlog.activePhase?.heading);
  const nextIntentId =
    backlog.activePhase && remaining[0]
      ? toIntentId(backlog.activePhase.heading, remaining[0].text)
      : null;
  const activeClaim = findActiveRelevantClaim(loopState, validIntentIds);
  const reviewDue = shouldRunReview(loopState, loopState.review_every ?? 3);

  console.log(JSON.stringify({
    remaining_count: remaining.length,
    active_phase: backlog.activePhase?.heading ?? null,
    delivery_target: deliveryTarget,
    next_intent_id: nextIntentId,
    active_claim: activeClaim,
    review_due: reviewDue,
    review_every: loopState.review_every ?? 3,
    handoff_path: handoffPath,
    meta_learnings_path: metaLearningsPath,
    next_item: remaining[0]?.text ?? null,
    remaining_items: remaining.map((item) => item.text),
  }, null, 2));
}

async function runContext() {
  const backlog = await loadBacklog(tasksPath);
  const remaining = backlog.remaining.filter((item) => !item.checked);
  const loopState = await readLoopState();
  const validIntentIds = collectIntentIds(backlog.phases, toIntentId);
  const deliveryTarget = getDeliveryTarget(backlog.activePhase?.heading);
  const nextItem = remaining[0] ?? null;
  const nextIntentId =
    backlog.activePhase && nextItem
      ? toIntentId(backlog.activePhase.heading, nextItem.text)
      : null;
  const reviewDue = shouldRunReview(loopState, loopState.review_every ?? 3);

  console.log(JSON.stringify({
    delivery_target: deliveryTarget,
    active_phase: backlog.activePhase?.heading ?? null,
    next_item: nextItem?.text ?? null,
    next_intent_id: nextIntentId,
    latest_intent: findLatestRelevantIntent(loopState, validIntentIds),
    latest_claim: findLatestRelevantClaim(loopState, validIntentIds),
    latest_signal: findLatestRelevantSignal(loopState, validIntentIds),
    review_due: reviewDue,
    review_every: loopState.review_every ?? 3,
    handoff_path: handoffPath,
    meta_learnings_path: metaLearningsPath,
    source_of_truth: {
      spec: specPath,
      architecture: architecturePath,
      tech_stack: techStackPath,
      tasks: tasksPath,
    },
    remaining_items: remaining.map((item) => item.text),
  }, null, 2));
}

async function runBrief() {
  const backlog = await loadBacklog(tasksPath);
  const nextItem = backlog.remaining.find((item) => !item.checked);

  if (!nextItem) {
    console.log("SpecForge parity backlog is clear.");
    return;
  }

  console.log(
    buildFeaturePrompt(nextItem, backlog, {
      specPath,
      architecturePath,
      techStackPath,
      tasksPath,
      metaLearningsPath,
    }),
  );
}

async function runLoop(options) {
  const state = await readLoopState();
  state.review_every = options.reviewEvery;
  let passes = 0;
  const passLimit = Math.max(1, options.maxPasses);

  while (passes < passLimit) {
    const backlog = await loadBacklog(tasksPath);
    const nextItem = backlog.remaining.find((item) => !item.checked);
    const reviewMode = shouldRunReview(state, options.reviewEvery);

    if (!nextItem && !reviewMode) {
      console.log("SpecForge parity backlog is clear.");
      break;
    }

    const mode = reviewMode ? "review" : "feature";
    const prompt = reviewMode
      ? buildReviewPrompt(backlog, {
          specPath,
          architecturePath,
          techStackPath,
          tasksPath,
          metaLearningsPath,
        })
      : buildFeaturePrompt(nextItem, backlog, {
          specPath,
          architecturePath,
          techStackPath,
          tasksPath,
          metaLearningsPath,
        });
    const intentId = reviewMode
      ? `review:${Date.now()}`
      : toIntentId(backlog.activePhase.heading, nextItem.text);
    const claimId = `claim_${Date.now()}`;
    const command = [
      "codex",
      "exec",
      "--cd",
      worktreeRoot,
      "--sandbox",
      "workspace-write",
      prompt,
    ];

    const passRecord = {
      started_at: new Date().toISOString(),
      intent_id: intentId,
      claim_id: claimId,
      phase: backlog.activePhase?.heading ?? "None",
      next_item: reviewMode ? "Run multipass review and context compaction." : nextItem.text,
      retry_count: state.claims.filter((claim) => claim.intent_id === intentId).length,
      dry_run: options.dryRun,
      mode,
      command,
    };

    const existingIntent = state.intents.find((intent) => intent.intent_id === intentId);
    if (!existingIntent) {
      state.intents.push({
        intent_id: intentId,
        phase: backlog.activePhase?.heading ?? "Runner review",
        title: reviewMode ? "Multipass review and context compaction" : nextItem.text,
        status: "queued",
        created_at: passRecord.started_at,
        updated_at: passRecord.started_at,
      });
    } else {
      existingIntent.status = options.dryRun ? "dry_run" : "claimed";
      existingIntent.updated_at = passRecord.started_at;
    }

    state.claims.push({
      claim_id: claimId,
      intent_id: intentId,
      state: options.dryRun ? "dry_run" : "claimed",
      retry_count: passRecord.retry_count,
      started_at: passRecord.started_at,
      heartbeat_at: passRecord.started_at,
    });

    if (options.dryRun) {
      const intent = state.intents.find((entry) => entry.intent_id === intentId);
      if (intent) {
        intent.status = "dry_run";
        intent.updated_at = passRecord.started_at;
      }
      state.signals.push({
        at: passRecord.started_at,
        type: "dry_run_prepared",
        intent_id: intentId,
        claim_id: claimId,
      });
      console.log(JSON.stringify(passRecord, null, 2));
      console.log("\nPrompt:\n");
      console.log(prompt);
      state.updated_at = new Date().toISOString();
      state.passes.push(passRecord);
      await writeLoopState(state);
      await writeRunnerHandoff({
        updatedAt: state.updated_at,
        intentId,
        phase: backlog.activePhase?.heading ?? "Runner review",
        deliveryTarget: getDeliveryTarget(backlog.activePhase?.heading),
        status: "dry_run",
        nextItem: passRecord.next_item,
        summary: "Prepared the next bounded pass without executing it.",
        resume: "Run the parity runner without --dry-run to execute the prepared intent.",
        prompt,
      });
      await writeMetaLearnings({
        updatedAt: state.updated_at,
        deliveryTarget: getDeliveryTarget(backlog.activePhase?.heading),
        mode,
        status: "dry_run",
        nextItem: passRecord.next_item,
        summary: "Prepared the next bounded pass without executing it.",
      });
      return;
    }

    const result = await runCodexCommand(command, state, claimId);

    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }

    passRecord.exit_code = result.status ?? 1;
    passRecord.finished_at = new Date().toISOString();
    passRecord.stdout_tail = tailOutput(result.stdout);
    passRecord.stderr_tail = tailOutput(result.stderr);
    state.updated_at = passRecord.finished_at;
    state.passes.push(passRecord);
    const claim = state.claims.find((entry) => entry.claim_id === claimId);
    if (claim) {
      claim.heartbeat_at = passRecord.finished_at;
      claim.state = (result.status ?? 1) === 0 ? "completed" : "failed";
      claim.finished_at = passRecord.finished_at;
      claim.exit_code = result.status ?? 1;
      claim.failure_summary =
        (result.status ?? 1) === 0
          ? null
          : tailOutput(result.stderr || result.stdout, 800);
    }
    const intent = state.intents.find((entry) => entry.intent_id === intentId);
    if (intent) {
      intent.status = (result.status ?? 1) === 0 ? "completed" : "blocked";
      intent.updated_at = passRecord.finished_at;
    }
    state.signals.push({
      at: passRecord.finished_at,
      type: (result.status ?? 1) === 0 ? "intent_completed" : "intent_blocked",
      intent_id: intentId,
      claim_id: claimId,
      exit_code: result.status ?? 1,
      failure_summary:
        (result.status ?? 1) === 0 ? null : tailOutput(result.stderr || result.stdout, 800),
    });
    await writeLoopState(state);
    await writeRunnerHandoff({
        updatedAt: passRecord.finished_at,
        intentId,
        phase: backlog.activePhase?.heading ?? "Runner review",
        deliveryTarget: getDeliveryTarget(backlog.activePhase?.heading),
        status: (result.status ?? 1) === 0 ? "completed" : "blocked",
        nextItem: passRecord.next_item,
        summary:
        (result.status ?? 1) === 0
          ? "Completed the current pass and left the branch at a verified checkpoint."
          : tailOutput(result.stderr || result.stdout, 800) ||
            "The pass blocked without a captured error summary.",
      resume:
        (result.status ?? 1) === 0
          ? "Re-run the parity runner to pick up the next unchecked backlog item."
          : "Inspect the failure summary, fix the blocking issue, then rerun the parity runner.",
      prompt,
    });
    await writeMetaLearnings({
      updatedAt: passRecord.finished_at,
      deliveryTarget: getDeliveryTarget(backlog.activePhase?.heading),
      mode,
      status: (result.status ?? 1) === 0 ? "completed" : "blocked",
      nextItem: passRecord.next_item,
      summary:
        (result.status ?? 1) === 0
          ? "Completed the current pass and left the branch at a verified checkpoint."
          : tailOutput(result.stderr || result.stdout, 800) ||
            "The pass blocked without a captured error summary.",
    });

    if ((result.status ?? 1) !== 0) {
      process.exit(result.status ?? 1);
    }

    passes += 1;

    if (!options.untilClear && passes >= passLimit) {
      break;
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.command === "status") {
    await runStatus();
    return;
  }

  if (options.command === "brief") {
    await runBrief();
    return;
  }

  if (options.command === "context") {
    await runContext();
    return;
  }

  if (options.command === "run") {
    await runLoop(options);
    return;
  }

  console.error(`Unknown command: ${options.command}`);
  process.exit(1);
}

await main();
