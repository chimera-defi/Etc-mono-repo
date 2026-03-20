#!/usr/bin/env node

import { cp, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const packRoot = path.resolve(toolDir, "..");
const worktreeRoot = path.resolve(packRoot, "..", "..");
const backupBase = path.join(worktreeRoot, ".backups", "specforge");

const targets = [
  {
    label: "web_state",
    source: "web-data",
    destination: path.join(packRoot, "web", ".data"),
  },
  {
    label: "collab_state",
    source: "collab-data",
    destination: path.join(packRoot, "collab-server", ".data"),
  },
  {
    label: "runner_artifacts",
    source: "runner-artifacts",
    destination: path.join(worktreeRoot, ".cursor", "artifacts"),
  },
];

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolveBackupRoot(inputPath) {
  if (inputPath) {
    return path.resolve(process.cwd(), inputPath);
  }

  const entries = await readdir(backupBase, { withFileTypes: true }).catch(() => []);
  const latest = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .at(-1);

  if (!latest) {
    throw new Error(`No SpecForge backups found under ${backupBase}`);
  }

  return path.join(backupBase, latest);
}

async function restoreDirectory(source, destination) {
  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, { recursive: true });
}

async function main() {
  const requestedPath = process.argv[2];
  const backupRoot = await resolveBackupRoot(requestedPath);
  const restored = [];
  const skipped = [];

  for (const target of targets) {
    const source = path.join(backupRoot, target.source);
    if (!(await exists(source))) {
      skipped.push(target.label);
      continue;
    }

    await restoreDirectory(source, target.destination);
    restored.push({
      label: target.label,
      source,
      destination: target.destination,
    });
  }

  const report = {
    restored_at: new Date().toISOString(),
    backup_root: backupRoot,
    restored,
    skipped,
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
