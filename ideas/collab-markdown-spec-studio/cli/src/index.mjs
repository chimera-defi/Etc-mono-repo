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

const PLAN_STAGE_NAMES = ["discovery", "ceo-review", "eng-review", "design-review", "security-review"];

const STAGE_QUESTIONS = {
  discovery: [
    { key: "problem", prompt: "What specific problem does this product solve?" },
    { key: "users", prompt: "Who are the 1-3 primary user segments?" },
    { key: "success_signals", prompt: "How will you know the product succeeded? (2-3 measurable signals)" },
    { key: "anti_problems", prompt: "What adjacent problems are explicitly NOT in scope?" },
  ],
  "ceo-review": [
    { key: "vision", prompt: "Write the 10-star product review — what would users say if this were perfect?" },
    { key: "scope_hardening", prompt: "What 3 items are non-negotiable for v1 scope?" },
    { key: "anti_goals", prompt: "List 3-5 explicit non-goals to guard the team." },
    { key: "competitive_insight", prompt: "What does this do that no existing solution does well?" },
  ],
  "eng-review": [
    { key: "architecture", prompt: "Describe the high-level architecture in 3-5 sentences." },
    { key: "data_flow", prompt: "Walk through the critical data flow for the primary user action." },
    { key: "tech_stack", prompt: "Proposed tech stack and rationale?" },
    { key: "failure_modes", prompt: "Top 3 failure modes and how the system handles each?" },
    { key: "test_matrix", prompt: "List 3-5 must-have acceptance criteria." },
  ],
  "design-review": [
    { key: "design_principles", prompt: "2-3 core design principles for this product?" },
    { key: "interaction_model", prompt: "Describe the primary interaction pattern / core flow." },
    { key: "accessibility", prompt: "Accessibility requirements? (WCAG level, keyboard nav, screen reader)" },
    { key: "design_constraints", prompt: "Existing design system or platform constraints?" },
  ],
  "security-review": [
    { key: "trust_boundaries", prompt: "Where are the trust boundaries? What data crosses them?" },
    { key: "threat_model", prompt: "Top 3 threats (OWASP-aligned) for this product?" },
    { key: "auth_model", prompt: "Describe the authentication and authorization model." },
    { key: "sensitive_data", prompt: "What sensitive data is stored/processed and how is it protected?" },
    { key: "security_requirements", prompt: "3-5 non-functional security requirements?" },
  ],
};

function getApiUrl() {
  const base = process.env.SPECFORGE_API_URL;
  if (!base) {
    throw new Error(
      "SPECFORGE_API_URL is not set.\n" +
      "Set it to point to your SpecForge instance, e.g.:\n" +
      "  export SPECFORGE_API_URL=http://localhost:3000\n" +
      "Or run the web app locally: cd web && bun dev",
    );
  }
  return base.replace(/\/$/, "");
}

async function apiFetch(path, options = {}) {
  const url = `${getApiUrl()}${path}`;
  const response = await fetch(url, {
    headers: { "content-type": "application/json", ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return response.json();
}

async function runPlanCommand(options) {
  const rl = options.rl ?? (process.stdin.isTTY
    ? readline.createInterface({ input: process.stdin, output: process.stdout })
    : null);

  const stagesToRun = options.stage
    ? [options.stage]
    : PLAN_STAGE_NAMES.filter((s) => !options.skipStages?.includes(s));

  const documentId = options.values.document ?? options.values.doc;
  if (!documentId) {
    process.stderr.write("Error: --document <id> is required for plan command.\n");
    process.exitCode = 1;
    return;
  }

  // Create a new plan session
  const { session } = await apiFetch(`/api/documents/${documentId}/plan-sessions`, {
    method: "POST",
    body: JSON.stringify({ document_id: documentId }),
  });

  if (options.json) {
    process.stdout.write(`${JSON.stringify({ session_id: session.session_id, stages_to_run: stagesToRun }, null, 2)}\n`);
  } else {
    process.stdout.write(`\nSpecForge Sprint Planning — session: ${session.session_id}\n\n`);
  }

  const results = [];

  for (const stageName of stagesToRun) {
    const questions = STAGE_QUESTIONS[stageName];
    if (!questions) continue;

    if (!options.json) {
      process.stdout.write(`\n--- ${stageName.toUpperCase()} ---\n`);
    }

    const answers = {};

    if (rl && process.stdin.isTTY) {
      for (const { key, prompt } of questions) {
        const answer = (await rl.question(`${prompt}\n> `)).trim();
        answers[key] = answer;
      }
    } else {
      // Non-interactive: use any values passed via --answers-json or skip
      try {
        const answersJson = options.values.answersJson;
        if (answersJson) Object.assign(answers, JSON.parse(answersJson));
      } catch { /* ignore */ }
    }

    const actorId = options.values.actorId ?? "cli_user";

    const { session: updated, patch_id } = await apiFetch(
      `/api/documents/${documentId}/plan-sessions/${session.session_id}/advance`,
      {
        method: "POST",
        body: JSON.stringify({ stage_name: stageName, answers, actor_id: actorId }),
      },
    );

    results.push({ stage: stageName, patch_id, status: "completed" });

    if (!options.json) {
      process.stdout.write(
        patch_id
          ? `  Stage ${stageName} completed — patch proposed: ${patch_id}\n`
          : `  Stage ${stageName} completed (document was empty, no patch created)\n`,
      );
      void updated;
    }
  }

  if (rl && !options.rl) rl.close();

  if (options.json) {
    process.stdout.write(`${JSON.stringify({ session_id: session.session_id, stages: results }, null, 2)}\n`);
  } else {
    process.stdout.write("\nPlanning complete. Run `specforge handoff` when your spec is ready.\n");
  }
}

async function runIterateCommand(options) {
  const blockId = options.values.section;
  const documentId = options.values.document ?? options.values.doc;
  const actorId = options.values.actorId ?? "cli_user";

  if (!documentId || !blockId) {
    process.stderr.write("Error: --document <id> and --section <blockId> are required.\n");
    process.exitCode = 1;
    return;
  }

  let message = options.values.message ?? "";

  if (!message && process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      message = (await rl.question("What should change in this section?\n> ")).trim();
    } finally {
      rl.close();
    }
  }

  if (!message) {
    process.stderr.write("Error: --message is required in non-interactive mode.\n");
    process.exitCode = 1;
    return;
  }

  const result = await apiFetch(
    `/api/documents/${documentId}/sections/${blockId}/iterate`,
    {
      method: "POST",
      body: JSON.stringify({ message, actor_id: actorId }),
    },
  );

  if (options.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(
      [
        "",
        `Iteration patch proposed: ${result.patch_id}`,
        `Block: ${result.block_id}`,
        `Generated by: ${result.tool}`,
        "",
        "Review and accept the patch in the SpecForge workspace.",
        "",
      ].join("\n"),
    );
  }
}

async function runHandoffCommand(options) {
  const documentId = options.values.document ?? options.values.doc;

  if (!documentId) {
    process.stderr.write("Error: --document <id> is required for handoff command.\n");
    process.exitCode = 1;
    return;
  }

  const handoff = await apiFetch(`/api/documents/${documentId}/handoff`, { method: "POST" });

  const outputStr = JSON.stringify(handoff, null, 2);

  if (options.output) {
    await writeFile(options.output, outputStr);
    if (!options.json) {
      process.stdout.write(`Handoff written to ${options.output}\n`);
    }
    return;
  }

  process.stdout.write(`${outputStr}\n`);
}

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
  const options = { command, json: false, output: null, values: {}, help: false, stage: null, skipStages: [] };

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

    if (token === "--stage") {
      options.stage = rest[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (token === "--skip") {
      const stageName = rest[index + 1] ?? null;
      if (stageName) options.skipStages.push(stageName);
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
    { id: "1", label: "Sprint Planning (Act 1)", action: "plan" },
    { id: "2", label: "Guided spec init (Act 2)", action: "init" },
    { id: "3", label: "Emit handoff.json", action: "handoff" },
    { id: "4", label: "Backlog status", action: "status" },
    { id: "5", label: "Current context", action: "context" },
    { id: "6", label: "Runner artifacts", action: "artifacts" },
    { id: "7", label: "Run verification", action: "verify" },
    { id: "8", label: "Backup manifests", action: "backups" },
    { id: "9", label: "Remaining backlog", action: "backlog" },
    { id: "0", label: "Exit", action: "exit" },
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

      if (selected.action === "plan") {
        const docId = (await rl.question("Document ID: ")).trim();
        if (docId) {
          await runPlanCommand({ json: false, values: { document: docId }, skipStages: [], stage: null, rl });
        }
        continue;
      }

      if (selected.action === "handoff") {
        const docId = (await rl.question("Document ID: ")).trim();
        if (docId) {
          await runHandoffCommand({ json: false, output: null, values: { document: docId } });
        }
        continue;
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
      "ACT 1 — Sprint Planning:",
      "  specforge plan --document <id> [--stage <name>] [--skip <stage>] [--json]",
      "  specforge iterate --document <id> --section <blockId> [--message <msg>] [--json]",
      "",
      "Handoff:",
      "  specforge handoff --document <id> [--output FILE] [--json]",
      "",
      "ACT 2 — Spec Generation:",
      "  specforge init [--json] [--output FILE] [--title VALUE ...]",
      "",
      "Delivery loop:",
      "  specforge status [--json]",
      "  specforge context [--json]",
      "  specforge artifacts [--json]",
      "  specforge backups [--json]",
      "  specforge verify [--json]",
      "  specforge backlog [--json]",
      "  specforge tui",
      "",
      "Plan stages: discovery | ceo-review | eng-review | design-review | security-review",
      "",
      "Requires SPECFORGE_API_URL to be set (e.g. http://localhost:3000).",
      "",
      "Examples:",
      "  specforge plan --document doc_abc123 --json",
      "  specforge plan --document doc_abc123 --stage discovery",
      "  specforge plan --document doc_abc123 --skip security-review",
      "  specforge iterate --document doc_abc123 --section blk_problem_1 --message \"make users more specific\"",
      "  specforge handoff --document doc_abc123 --output handoff.json",
      "  specforge init --json --title \"Server Manager\" --problem \"Teams lose infra context\"",
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

  if (options.command === "plan") {
    await runPlanCommand(options);
    return;
  }

  if (options.command === "iterate") {
    await runIterateCommand(options);
    return;
  }

  if (options.command === "handoff") {
    await runHandoffCommand(options);
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
