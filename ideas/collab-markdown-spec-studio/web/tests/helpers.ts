/**
 * Shared test helpers for SpecForge acceptance tests.
 *
 * Provides fixture loading utilities and a fresh engine factory
 * so each test runs in isolation.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SpecForgeEngine,
  resetIdCounter,
  type WorkspaceSeed,
  type PatchSeedLine,
  type Document,
} from "../src/engine/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, "fixtures");

/** Load workspace.seed.json fixture. */
export function loadWorkspaceSeed(): WorkspaceSeed {
  const raw = readFileSync(resolve(FIXTURES_DIR, "workspace.seed.json"), "utf8");
  return JSON.parse(raw) as WorkspaceSeed;
}

/** Load patches.seed.jsonl fixture as an array of patch seed lines. */
export function loadPatchSeeds(): PatchSeedLine[] {
  const raw = readFileSync(resolve(FIXTURES_DIR, "patches.seed.jsonl"), "utf8");
  return raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as PatchSeedLine);
}

/** Load expected.final.md fixture as a string. */
export function loadExpectedFinalMarkdown(): string {
  return readFileSync(resolve(FIXTURES_DIR, "expected.final.md"), "utf8");
}

/**
 * Create a fresh SpecForgeEngine with reset ID counters.
 * Guarantees test isolation.
 */
export function createFreshEngine(): SpecForgeEngine {
  resetIdCounter();
  return new SpecForgeEngine();
}

/**
 * Convert a WorkspaceSeed into a Document for loading into the engine.
 */
export function seedToDocument(seed: WorkspaceSeed): Document {
  return {
    workspace_id: seed.workspace_id,
    document_id: seed.document_id,
    title: seed.title,
    version: seed.version,
    markdown: seed.markdown,
    blocks: seed.blocks,
    sections: seed.sections,
  };
}

/** Default test agent identity. */
export const TEST_AGENT = {
  actor_type: "agent" as const,
  actor_id: "test-agent-001",
};

/** Default test reviewer ID. */
export const TEST_REVIEWER = "reviewer-001";

/**
 * Run the full seed-to-final workflow:
 * 1. Load document
 * 2. Propose ALL patches concurrently (at their base_version snapshots)
 * 3. Decide on patches in order
 *
 * Stale-patch detection works by checking if base_version matches current doc version.
 * Patches 1 & 2 are concurrent (both base_version=1), patch_3 becomes stale after 1&2
 * are accepted, patch_4 is at a different base_version (2) so needs proper sequencing.
 *
 * Returns the engine for further assertions.
 */
export function runFullWorkflow(): {
  engine: SpecForgeEngine;
  documentId: string;
} {
  const engine = createFreshEngine();
  const seed = loadWorkspaceSeed();
  const patchSeeds = loadPatchSeeds();

  const doc = engine.loadDocument(seedToDocument(seed));
  const documentId = doc.document_id;

  // Step 1: Propose all patches concurrently (using fixture base_version values)
  for (const ps of patchSeeds) {
    engine.proposePatchWithId(ps.patch_id, {
      document_id: documentId,
      block_id: ps.block_id,
      section_id: ps.section_id,
      operation: ps.operation,
      patch_type: ps.patch_type,
      content: ps.content,
      proposed_by: TEST_AGENT,
      base_version: ps.base_version,
      target_fingerprint: ps.target_fingerprint,
    });
  }

  // Step 2: Decide on patches in order
  // Stale-patch detection triggers when patch.base_version != current doc.version
  for (const ps of patchSeeds) {
    // Always try to accept; the engine will auto-reject if stale
    engine.decidePatch({
      patch_id: ps.patch_id,
      decision: "accept",
      reviewer_id: TEST_REVIEWER,
    });
  }

  return { engine, documentId };
}
