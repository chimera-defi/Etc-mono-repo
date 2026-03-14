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
const backlogSections = [
  "Remaining MVP Build Backlog",
  "Next SaaS Build Backlog",
];

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
  return [
    "Drive the next SpecForge parity pass.",
    "",
    `Active backlog phase: ${backlog.activePhase?.heading ?? "None"}`,
    "",
    `Highest-priority unchecked parity item: ${nextItem.text}`,
    "",
    "Required behavior:",
    "- work in the SpecForge MVP worktree",
    "- implement the smallest integrated change that closes this parity gap",
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
    return JSON.parse(raw);
  } catch {
    return {
      updated_at: null,
      passes: [],
    };
  }
}

async function writeLoopState(state) {
  await mkdir(path.dirname(loopStatePath), { recursive: true });
  await writeFile(loopStatePath, JSON.stringify(state, null, 2));
}

async function runStatus() {
  const backlog = await loadBacklog();
  const remaining = backlog.remaining.filter((item) => !item.checked);

  console.log(JSON.stringify({
    remaining_count: remaining.length,
    active_phase: backlog.activePhase?.heading ?? null,
    next_item: remaining[0]?.text ?? null,
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
    const command = [
      "codex",
      "exec",
      "--cd",
      worktreeRoot,
      "--sandbox",
      "workspace-write",
      "--ask-for-approval",
      "never",
      prompt,
    ];

    const passRecord = {
      started_at: new Date().toISOString(),
      next_item: nextItem.text,
      dry_run: options.dryRun,
      command,
    };

    if (options.dryRun) {
      console.log(JSON.stringify(passRecord, null, 2));
      console.log("\nPrompt:\n");
      console.log(prompt);
      state.updated_at = new Date().toISOString();
      state.passes.push(passRecord);
      await writeLoopState(state);
      return;
    }

    const result = spawnSync(command[0], command.slice(1), {
      cwd: worktreeRoot,
      stdio: "inherit",
      env: process.env,
    });

    passRecord.exit_code = result.status ?? 1;
    passRecord.finished_at = new Date().toISOString();
    state.updated_at = passRecord.finished_at;
    state.passes.push(passRecord);
    await writeLoopState(state);

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

  if (options.command === "run") {
    await runLoop(options);
    return;
  }

  console.error(`Unknown command: ${options.command}`);
  process.exit(1);
}

await main();
