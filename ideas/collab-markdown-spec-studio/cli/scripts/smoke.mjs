#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const cliEntry = path.resolve(scriptDir, "..", "src", "index.mjs");

const result = spawnSync(
  process.execPath,
  [
    cliEntry,
    "init",
    "--json",
    "--title",
    "Smoke Spec",
    "--problem",
    "Catch regressions",
    "--goals",
    "Ship",
    "--users",
    "Team",
    "--scope",
    "Wizard",
    "--requirements",
    "Fields",
    "--constraints",
    "None",
    "--success-signals",
    "Green tests",
    "--tasks",
    "Run smoke",
    "--non-goals",
    "None",
  ],
  { encoding: "utf8" },
);

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

const parsed = JSON.parse(result.stdout);

if (!parsed.markdown.includes("# Smoke Spec") || parsed.metadata.creation_mode !== "guided") {
  throw new Error("SpecForge CLI smoke test failed.");
}

const statusResult = spawnSync(process.execPath, [cliEntry, "status", "--json"], {
  encoding: "utf8",
});

if (statusResult.status !== 0) {
  process.stderr.write(statusResult.stderr);
  process.exit(statusResult.status ?? 1);
}

const status = JSON.parse(statusResult.stdout);

if (typeof status.remaining_count !== "number" || !("delivery_target" in status)) {
  throw new Error("SpecForge CLI status command failed.");
}
