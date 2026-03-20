#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_GUIDED_SPEC_INPUT,
  buildGuidedSpecMarkdown,
  buildGuidedSpecMetadata,
  normalizeGuidedSpecInput,
} from "../../core/src/guided.js";
import { getDeliveryTarget } from "../../orchestrator/src/backlog.js";
import { loadBacklog, toIntentId } from "../../orchestrator/src/context.js";
import {
  collectIntentIds,
  createEmptyLoopState,
  findActiveRelevantClaim,
  findLatestRelevantClaim,
  findLatestRelevantIntent,
  findLatestRelevantSignal,
  normalizeLoopState,
} from "../../orchestrator/src/loop-state.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packRoot = path.resolve(scriptDir, "..", "..");
const worktreeRoot = path.resolve(packRoot, "..", "..");
const tasksPath = path.join(packRoot, "TASKS.md");
const loopStatePath = path.join(worktreeRoot, ".cursor", "artifacts", "specforge-parity-runner.json");

const fieldOrder = [
  ["title", "Title"],
  ["problem", "Problem"],
  ["goals", "Goals"],
  ["users", "Users"],
  ["scope", "Scope"],
  ["requirements", "Requirements"],
  ["constraints", "Constraints"],
  ["successSignals", "Success signals"],
  ["tasks", "Tasks"],
  ["nonGoals", "Non-goals"],
];

function parseArgs(argv) {
  const normalizedArgv =
    argv[0] === "/specforge"
      ? argv[1] && !argv[1].startsWith("--")
        ? argv.slice(1)
        : ["init", ...argv.slice(1)]
      : argv;
  const [command = "init", ...rest] = normalizedArgv;
  const options = { command, json: false, output: null, values: {}, help: false };

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (token === "--json") {
      options.json = true;
      continue;
    }

    if (token === "--help" || token === "-h") {
      options.help = true;
      continue;
    }

    if (token === "--output") {
      options.output = rest[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (token.startsWith("--")) {
      const key = token.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      options.values[key] = rest[index + 1] ?? "";
      index += 1;
    }
  }

  return options;
}

function buildOutput(input) {
  return {
    input,
    metadata: buildGuidedSpecMetadata(input),
    markdown: buildGuidedSpecMarkdown(input),
  };
}

async function promptForInput(seed) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const values = {};
    for (const [key, label] of fieldOrder) {
      const currentValue = seed[key] ?? DEFAULT_GUIDED_SPEC_INPUT[key] ?? "";
      const answer = await rl.question(`${label} [${currentValue}]: `);
      values[key] = answer.trim().length > 0 ? answer : currentValue;
    }

    return normalizeGuidedSpecInput(values);
  } finally {
    rl.close();
  }
}

async function readLoopState() {
  try {
    const raw = await readFile(loopStatePath, "utf8");
    return normalizeLoopState(JSON.parse(raw));
  } catch {
    return createEmptyLoopState();
  }
}

function buildStatusPayload(backlog, loopState) {
  const remaining = backlog.remaining.filter((item) => !item.checked);
  const validIntentIds = collectIntentIds(backlog.phases, toIntentId);
  const nextItem = remaining[0] ?? null;
  const nextIntentId =
    backlog.activePhase && nextItem
      ? toIntentId(backlog.activePhase.heading, nextItem.text)
      : null;

  return {
    delivery_target: getDeliveryTarget(backlog.activePhase?.heading),
    active_phase: backlog.activePhase?.heading ?? null,
    next_item: nextItem?.text ?? null,
    next_intent_id: nextIntentId,
    remaining_count: remaining.length,
    remaining_items: remaining.map((item) => item.text),
    active_claim: findActiveRelevantClaim(loopState, validIntentIds),
    latest_intent: findLatestRelevantIntent(loopState, validIntentIds),
    latest_claim: findLatestRelevantClaim(loopState, validIntentIds),
    latest_signal: findLatestRelevantSignal(loopState, validIntentIds),
  };
}

function printHelp() {
  process.stdout.write(
    [
      "SpecForge CLI",
      "",
      "Usage:",
      "  specforge init [--json] [--output FILE] [--title VALUE ...]",
      "  specforge status [--json]",
      "  specforge context [--json]",
      "  specforge backlog [--json]",
      "  /specforge [same flags as init]",
      "",
      "Examples:",
      "  specforge init --json --title \"Server Manager\" --problem \"Teams lose infra context\"",
      "  specforge status --json",
      "  specforge context",
      "  specforge backlog --json",
    ].join("\n"),
  );
}

function printBacklog(backlog) {
  process.stdout.write(
    [
      `Active phase: ${backlog.activePhase?.heading ?? "None"}`,
      "",
      ...backlog.phases.flatMap((phase) => [
        `${phase.heading}:`,
        ...phase.items.map((item) => `- ${item.checked ? "[x]" : "[ ]"} ${item.text}`),
        "",
      ]),
    ].join("\n"),
  );
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (options.command === "status" || options.command === "context" || options.command === "backlog") {
    const backlog = await loadBacklog(tasksPath);
    const loopState = await readLoopState();
    const statusPayload = buildStatusPayload(backlog, loopState);

    if (options.command === "backlog") {
      if (options.json) {
        process.stdout.write(`${JSON.stringify(backlog, null, 2)}\n`);
        return;
      }
      printBacklog(backlog);
      return;
    }

    if (options.command === "status") {
      process.stdout.write(
        `${options.json ? JSON.stringify(statusPayload, null, 2) : [
          `Delivery target: ${statusPayload.delivery_target}`,
          `Active phase: ${statusPayload.active_phase ?? "None"}`,
          `Next item: ${statusPayload.next_item ?? "None"}`,
          `Remaining items: ${statusPayload.remaining_count}`,
        ].join("\n")}\n`,
      );
      return;
    }

    const contextPayload = {
      ...statusPayload,
      tasks_path: tasksPath,
      loop_state_path: loopStatePath,
    };
    process.stdout.write(
      `${options.json ? JSON.stringify(contextPayload, null, 2) : [
        "SpecForge Context",
        "",
        `Tasks: ${tasksPath}`,
        `Loop state: ${loopStatePath}`,
        `Delivery target: ${contextPayload.delivery_target}`,
        `Next item: ${contextPayload.next_item ?? "None"}`,
        "",
        "Remaining items:",
        ...contextPayload.remaining_items.map((item) => `- ${item}`),
      ].join("\n")}\n`,
    );
    return;
  }

  if (options.command !== "init") {
    throw new Error(`Unsupported command: ${options.command}`);
  }

  const normalizedSeed = normalizeGuidedSpecInput(options.values);
  const guidedInput =
    process.stdin.isTTY && Object.keys(options.values).length === 0
      ? await promptForInput(normalizedSeed)
      : normalizedSeed;
  const output = buildOutput(guidedInput);

  if (options.output) {
    await writeFile(options.output, options.json ? JSON.stringify(output, null, 2) : output.markdown);
  }

  if (options.json) {
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${output.markdown}\n`);
}

run().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
