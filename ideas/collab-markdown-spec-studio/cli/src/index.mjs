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
  const normalizedArgv = argv[0] === "/specforge" ? ["init", ...argv.slice(1)] : argv;
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

function printHelp() {
  process.stdout.write(
    [
      "SpecForge CLI",
      "",
      "Usage:",
      "  specforge init [--json] [--output FILE] [--title VALUE ...]",
      "  /specforge [same flags as init]",
      "",
      "Examples:",
      "  node src/index.mjs init --json --title \"Server Manager\" --problem \"Teams lose infra context\"",
      "  node src/index.mjs /specforge --output SPEC.md",
    ].join("\n"),
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
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

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
