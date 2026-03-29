import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { listBackupManifests } from "./backups.js";
import { createEmptyLoopState, normalizeLoopState } from "./loop-state.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

export const packRoot = path.resolve(scriptDir, "..", "..");
export const worktreeRoot = path.resolve(packRoot, "..", "..");
export const tasksPath = path.join(packRoot, "TASKS.md");
export const specPath = path.join(packRoot, "SPEC.md");
export const architecturePath = path.join(packRoot, "ARCHITECTURE_DECISIONS.md");
export const techStackPath = path.join(packRoot, "TECH_STACK.md");
export const loopStatePath = path.join(
  worktreeRoot,
  ".cursor",
  "artifacts",
  "specforge-parity-runner.json",
);
export const handoffPath = path.join(
  worktreeRoot,
  ".cursor",
  "artifacts",
  "specforge-runner-latest.md",
);
export const metaLearningsPath = path.join(
  worktreeRoot,
  ".cursor",
  "artifacts",
  "specforge-meta-learnings.md",
);
export const backupRoot = path.join(worktreeRoot, ".backups", "specforge");

export async function readLoopState() {
  try {
    const raw = await readFile(loopStatePath, "utf8");
    return normalizeLoopState(JSON.parse(raw));
  } catch {
    return createEmptyLoopState();
  }
}

export async function writeLoopState(state) {
  await mkdir(path.dirname(loopStatePath), { recursive: true });
  await writeFile(loopStatePath, JSON.stringify(state, null, 2));
}

export async function readArtifactPreview(filePath, maxLines = 10) {
  try {
    const raw = await readFile(filePath, "utf8");
    return raw.trim().split("\n").slice(0, maxLines).join("\n");
  } catch {
    return null;
  }
}

export async function buildArtifactsPayload(findLatestVerification) {
  const loopState = await readLoopState();

  return {
    handoff: {
      path: handoffPath,
      preview: await readArtifactPreview(handoffPath),
    },
    meta_learnings: {
      path: metaLearningsPath,
      preview: await readArtifactPreview(metaLearningsPath),
    },
    latest_verification: findLatestVerification(loopState),
  };
}

export async function buildBackupsPayload() {
  return {
    backup_root: backupRoot,
    backups: await listBackupManifests(backupRoot),
  };
}
