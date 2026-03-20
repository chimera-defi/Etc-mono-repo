#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import readline from "node:readline/promises";
import process from "node:process";

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
  findActiveRelevantClaim,
  findLatestRelevantClaim,
  findLatestRelevantIntent,
  findLatestRelevantSignal,
  findLatestVerification,
} from "../../orchestrator/src/loop-state.js";
import {
  backupRoot,
  buildArtifactsPayload,
  buildBackupsPayload,
  loopStatePath,
  packRoot,
  readLoopState,
  tasksPath,
} from "../../orchestrator/src/runtime.js";
import { runVerificationSuite } from "../../orchestrator/src/verification.js";

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

async function runTui() {
  if (!process.stdin.isTTY) {
    throw new Error("SpecForge TUI requires an interactive terminal.");
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const menu = [
    { id: "1", label: "Guided spec init", action: "init" },
    { id: "2", label: "Backlog status", action: "status" },
    { id: "3", label: "Current context", action: "context" },
    { id: "4", label: "Runner artifacts", action: "artifacts" },
    { id: "5", label: "Run verification", action: "verify" },
    { id: "6", label: "Backup manifests", action: "backups" },
    { id: "7", label: "Remaining backlog", action: "backlog" },
    { id: "8", label: "Exit", action: "exit" },
  ];

  try {
    while (true) {
      process.stdout.write(
        [
          "SpecForge TUI",
          "",
          ...menu.map((item) => `${item.id}. ${item.label}`),
          "",
        ].join("\n"),
      );

      const answer = (await rl.question("Choose an action: ")).trim();
      const selected = menu.find((item) => item.id === answer);

      if (!selected || selected.action === "exit") {
        return;
      }

      if (selected.action === "init") {
        const guidedInput = await promptForInput(DEFAULT_GUIDED_SPEC_INPUT);
        process.stdout.write(`\n${buildGuidedSpecMarkdown(guidedInput)}\n\n`);
        continue;
      }

      const backlog = await loadBacklog(tasksPath);
      const loopState = await readLoopState();
      const statusPayload = buildStatusPayload(backlog, loopState);

      if (selected.action === "status") {
        process.stdout.write(
          [
            "",
            `Delivery target: ${statusPayload.delivery_target}`,
            `Active phase: ${statusPayload.active_phase ?? "None"}`,
            `Next item: ${statusPayload.next_item ?? "None"}`,
            `Remaining items: ${statusPayload.remaining_count}`,
            "",
          ].join("\n"),
        );
        continue;
      }

      if (selected.action === "context") {
        process.stdout.write(
          [
            "",
            "SpecForge Context",
            `Tasks: ${tasksPath}`,
            `Loop state: ${loopStatePath}`,
            `Delivery target: ${statusPayload.delivery_target}`,
            `Next item: ${statusPayload.next_item ?? "None"}`,
            "",
          ].join("\n"),
        );
        continue;
      }

      if (selected.action === "artifacts") {
        const artifactsPayload = await buildArtifactsPayload(findLatestVerification);
        process.stdout.write(
          [
            "",
            "SpecForge Artifacts",
            `Handoff: ${artifactsPayload.handoff.path}`,
            `Meta learnings: ${artifactsPayload.meta_learnings.path}`,
            `Latest verification: ${artifactsPayload.latest_verification ? "recorded" : "unavailable"}`,
            "",
            artifactsPayload.handoff.preview
              ? `Handoff preview:\n${artifactsPayload.handoff.preview}`
              : "Handoff preview: unavailable",
            "",
            artifactsPayload.meta_learnings.preview
              ? `Meta learnings preview:\n${artifactsPayload.meta_learnings.preview}`
              : "Meta learnings preview: unavailable",
            "",
            artifactsPayload.latest_verification
              ? `Latest verification:\n${artifactsPayload.latest_verification.results
                  .map((result) => `- ${result.command}: ${result.status === 0 ? "ok" : "failed"}`)
                  .join("\n")}`
              : "Latest verification: unavailable",
            "",
          ].join("\n"),
        );
        continue;
      }

      if (selected.action === "backups") {
        const backupsPayload = await buildBackupsPayload();
        process.stdout.write(
          [
            "",
            "SpecForge Backups",
            `Backup root: ${backupsPayload.backup_root}`,
            ...backupsPayload.backups.map(
              (backup) => `- ${backup.name} (${backup.created_at ?? "unknown"})`,
            ),
            "",
          ].join("\n"),
        );
        continue;
      }

      if (selected.action === "verify") {
        const verification = await runVerificationSuite(packRoot);
        process.stdout.write(
          [
            "",
            "SpecForge verification",
            ...verification.results.map(
              (result) => `- ${result.command}: ${result.status === 0 ? "ok" : "failed"}`,
            ),
            "",
          ].join("\n"),
        );
        continue;
      }

      process.stdout.write(
        [
          "",
          `Active phase: ${backlog.activePhase?.heading ?? "None"}`,
          ...backlog.phases.flatMap((phase) => [
            "",
            `${phase.heading}:`,
            ...phase.items.map((item) => `- ${item.checked ? "[x]" : "[ ]"} ${item.text}`),
          ]),
          "",
        ].join("\n"),
      );
    }
  } finally {
    rl.close();
  }
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
      "  specforge artifacts [--json]",
      "  specforge backups [--json]",
      "  specforge verify [--json]",
      "  specforge backlog [--json]",
      "  specforge tui",
      "  /specforge [same flags as init]",
      "",
      "Examples:",
      "  specforge init --json --title \"Server Manager\" --problem \"Teams lose infra context\"",
      "  specforge status --json",
      "  specforge context",
      "  specforge artifacts",
      "  specforge backups",
      "  specforge verify",
      "  specforge backlog --json",
      "  specforge tui",
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

  if (
    options.command === "status" ||
    options.command === "context" ||
    options.command === "artifacts" ||
    options.command === "backups" ||
    options.command === "backlog" ||
    options.command === "verify"
  ) {
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

    if (options.command === "artifacts") {
      const artifactsPayload = await buildArtifactsPayload(findLatestVerification);
      process.stdout.write(
        `${
          options.json
            ? JSON.stringify(artifactsPayload, null, 2)
            : [
                `Handoff: ${artifactsPayload.handoff.path}`,
                `Meta learnings: ${artifactsPayload.meta_learnings.path}`,
                `Latest verification: ${artifactsPayload.latest_verification ? "recorded" : "unavailable"}`,
                "",
                artifactsPayload.handoff.preview
                  ? `Handoff preview:\n${artifactsPayload.handoff.preview}`
                  : "Handoff preview: unavailable",
                "",
                artifactsPayload.meta_learnings.preview
                  ? `Meta learnings preview:\n${artifactsPayload.meta_learnings.preview}`
                  : "Meta learnings preview: unavailable",
                "",
                artifactsPayload.latest_verification
                  ? `Latest verification:\n${artifactsPayload.latest_verification.results
                      .map((result) => `- ${result.command}: ${result.status === 0 ? "ok" : "failed"}`)
                      .join("\n")}`
                  : "Latest verification: unavailable",
              ].join("\n")
        }\n`,
      );
      return;
    }

    if (options.command === "backups") {
      const backupsPayload = await buildBackupsPayload();
      process.stdout.write(
        `${options.json ? JSON.stringify(backupsPayload, null, 2) : [
          `Backup root: ${backupsPayload.backup_root}`,
          ...backupsPayload.backups.map(
            (backup) => `- ${backup.name} (${backup.created_at ?? "unknown"})`,
          ),
        ].join("\n")}\n`,
      );
      return;
    }

    if (options.command === "verify") {
      const verification = await runVerificationSuite(packRoot);
      process.stdout.write(
        `${
          options.json
            ? JSON.stringify(verification, null, 2)
            : [
                "SpecForge verification",
                "",
                ...verification.results.map(
                  (result) => `- ${result.command}: ${result.status === 0 ? "ok" : "failed"}`,
                ),
              ].join("\n")
        }\n`,
      );

      process.exit(verification.ok ? 0 : 1);
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

  if (options.command === "tui") {
    await runTui();
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
