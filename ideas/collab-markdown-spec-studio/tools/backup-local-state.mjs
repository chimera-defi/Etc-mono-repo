#!/usr/bin/env node

import { cp, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const packRoot = path.resolve(toolDir, "..");
const worktreeRoot = path.resolve(packRoot, "..", "..");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupRoot = path.join(worktreeRoot, ".backups", "specforge", timestamp);

const targets = [
  {
    label: "web_state",
    source: path.join(packRoot, "web", ".data"),
    destination: path.join(backupRoot, "web-data"),
  },
  {
    label: "collab_state",
    source: path.join(packRoot, "collab-server", ".data"),
    destination: path.join(backupRoot, "collab-data"),
  },
  {
    label: "runner_artifacts",
    source: path.join(worktreeRoot, ".cursor", "artifacts"),
    destination: path.join(backupRoot, "runner-artifacts"),
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

async function main() {
  await mkdir(backupRoot, { recursive: true });

  const copied = [];
  const skipped = [];

  for (const target of targets) {
    if (!(await exists(target.source))) {
      skipped.push(target.label);
      continue;
    }

    await cp(target.source, target.destination, { recursive: true });
    copied.push({
      label: target.label,
      source: target.source,
      destination: target.destination,
    });
  }

  const manifest = {
    created_at: new Date().toISOString(),
    backup_root: backupRoot,
    copied,
    skipped,
  };

  await writeFile(path.join(backupRoot, "manifest.json"), JSON.stringify(manifest, null, 2));
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
