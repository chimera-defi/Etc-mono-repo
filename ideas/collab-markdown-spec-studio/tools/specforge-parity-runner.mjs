#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const toolDir = path.dirname(new URL(import.meta.url).pathname);
const packRoot = path.resolve(toolDir, "..");
const worktreeRoot = path.resolve(packRoot, "..", "..");
const tasksPath = path.join(packRoot, "TASKS.md");
const specPath = path.join(packRoot, "SPEC.md");
const architecturePath = path.join(packRoot, "ARCHITECTURE_DECISIONS.md");
const techStackPath = path.join(packRoot, "TECH_STACK.md");
const loopStatePath = path.join(worktreeRoot, ".cursor", "artifacts", "specforge-parity-runner.json");
const handoffPath = path.join(worktreeRoot, ".cursor", "artifacts", "specforge-runner-latest.md");
const backlogSections = [
  "Remaining MVP Build Backlog",
  "Next SaaS Build Backlog",
];

function getDeliveryTarget(heading) {
  if (heading === "Remaining MVP Build Backlog") {
    return "minimum_extensible_product";
  }

  return "scoped_saas_parity";
}

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
    }
  }

  return options;
}

function sectionSlice(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^## ${escaped}\\n([\\s\\S]*?)(?=^## |\\Z)`, "m"));
  return match?.[1] ?? "";
}

function parseChecklist(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^- \[[ x]\]/.test(line))
    .map((line) => ({
      checked: line.startsWith("- [x]"),
      text: line.replace(/^- \[[ x]\]\s*/, ""),
    }));
}

function toIntentId(phaseHeading, itemText) {
  return `${phaseHeading}:${itemText}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function loadBacklog() {
  const markdown = await readFile(tasksPath, "utf8");
  const recommendedSection = sectionSlice(markdown, "Recommended Parallel Execution Now");
  const implementationSection = sectionSlice(markdown, "Current Implementation Status");
  const phases = backlogSections.map((heading) => ({
    heading,
    items: parseChecklist(sectionSlice(markdown, heading)),
  }));
  const activePhase = phases.find((phase) => phase.items.some((item) => !item.checked)) ?? null;

  return {
    phases,
    activePhase,
    remaining: phases.flatMap((phase) => phase.items),
    current: parseChecklist(implementationSection),
    recommended: recommendedSection
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^\d+\./.test(line)),
  };
}

function buildPrompt(nextItem, backlog) {
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
    "- run verification before finishing: npm run lint, npm run test, npm run build, npm run test:e2e",
    "- commit with [Agent: GPT-5] and the Chimera co-author trailer if the branch is green",
    "- only stop early if a real blocker appears",
    "",
    "Source-of-truth docs:",
    `- ${specPath}`,
    `- ${architecturePath}`,
    `- ${techStackPath}`,
    `- ${tasksPath}`,
    "",
    "Current remaining backlog:",
    ...backlog.phases.flatMap((phase) => [
      `- ${phase.heading}:`,
      ...phase.items.map((item) => `  - ${item.checked ? "[x]" : "[ ]"} ${item.text}`),
    ]),
  ].join("\n");
}

async function readLoopState() {
  try {
    const raw = await readFile(loopStatePath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      updated_at: parsed.updated_at ?? null,
      intents: Array.isArray(parsed.intents) ? parsed.intents : [],
      claims: Array.isArray(parsed.claims) ? parsed.claims : [],
      signals: Array.isArray(parsed.signals) ? parsed.signals : [],
      passes: Array.isArray(parsed.passes) ? parsed.passes : [],
    };
  } catch {
    return {
      updated_at: null,
      intents: [],
      claims: [],
      signals: [],
      passes: [],
    };
  }
}

async function writeLoopState(state) {
  await mkdir(path.dirname(loopStatePath), { recursive: true });
  await writeFile(loopStatePath, JSON.stringify(state, null, 2));
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

async function runStatus() {
  const backlog = await loadBacklog();
  const remaining = backlog.remaining.filter((item) => !item.checked);
  const loopState = await readLoopState();
  const deliveryTarget = getDeliveryTarget(backlog.activePhase?.heading);
  const nextIntentId =
    backlog.activePhase && remaining[0]
      ? toIntentId(backlog.activePhase.heading, remaining[0].text)
      : null;
  const activeClaim = loopState.claims
    .filter((claim) => claim.state === "claimed")
    .slice(-1)[0] ?? null;

  console.log(JSON.stringify({
    remaining_count: remaining.length,
    active_phase: backlog.activePhase?.heading ?? null,
    delivery_target: deliveryTarget,
    next_intent_id: nextIntentId,
    active_claim: activeClaim,
    next_item: remaining[0]?.text ?? null,
    remaining_items: remaining.map((item) => item.text),
  }, null, 2));
}

async function runContext() {
  const backlog = await loadBacklog();
  const remaining = backlog.remaining.filter((item) => !item.checked);
  const loopState = await readLoopState();
  const deliveryTarget = getDeliveryTarget(backlog.activePhase?.heading);
  const nextItem = remaining[0] ?? null;
  const nextIntentId =
    backlog.activePhase && nextItem
      ? toIntentId(backlog.activePhase.heading, nextItem.text)
      : null;

  console.log(JSON.stringify({
    delivery_target: deliveryTarget,
    active_phase: backlog.activePhase?.heading ?? null,
    next_item: nextItem?.text ?? null,
    next_intent_id: nextIntentId,
    latest_intent: loopState.intents.at(-1) ?? null,
    latest_claim: loopState.claims.at(-1) ?? null,
    latest_signal: loopState.signals.at(-1) ?? null,
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
  const backlog = await loadBacklog();
  const nextItem = backlog.remaining.find((item) => !item.checked);

  if (!nextItem) {
    console.log("SpecForge parity backlog is clear.");
    return;
  }

  console.log(buildPrompt(nextItem, backlog));
}

async function runLoop(options) {
  const state = await readLoopState();
  let passes = 0;

  while (passes < options.maxPasses) {
    const backlog = await loadBacklog();
    const nextItem = backlog.remaining.find((item) => !item.checked);

    if (!nextItem) {
      console.log("SpecForge parity backlog is clear.");
      break;
    }

    const prompt = buildPrompt(nextItem, backlog);
    const intentId = toIntentId(backlog.activePhase.heading, nextItem.text);
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
      phase: backlog.activePhase.heading,
      next_item: nextItem.text,
      retry_count: state.claims.filter((claim) => claim.intent_id === intentId).length,
      dry_run: options.dryRun,
      command,
    };

    const existingIntent = state.intents.find((intent) => intent.intent_id === intentId);
    if (!existingIntent) {
      state.intents.push({
        intent_id: intentId,
        phase: backlog.activePhase.heading,
        title: nextItem.text,
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
        phase: backlog.activePhase.heading,
        deliveryTarget: getDeliveryTarget(backlog.activePhase?.heading),
        status: "dry_run",
        nextItem: nextItem.text,
        summary: "Prepared the next bounded pass without executing it.",
        resume: "Run the parity runner without --dry-run to execute the prepared intent.",
        prompt,
      });
      return;
    }

    const result = spawnSync(command[0], command.slice(1), {
      cwd: worktreeRoot,
      stdio: "pipe",
      encoding: "utf8",
      env: process.env,
    });

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
      phase: backlog.activePhase.heading,
      deliveryTarget: getDeliveryTarget(backlog.activePhase?.heading),
      status: (result.status ?? 1) === 0 ? "completed" : "blocked",
      nextItem: nextItem.text,
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

    if ((result.status ?? 1) !== 0) {
      process.exit(result.status ?? 1);
    }

    passes += 1;
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
