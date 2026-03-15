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
 * Run the full seed-to-final workflow: load document, propose all patches.
 * Patches 1, 2, 4 are accepted. Patch 3 is stale and rejected.
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

  // Process all patches
  for (const ps of patchSeeds) {
    engine.proposePatchWithId(ps.patch_id, {
      document_id: documentId,
      block_id: ps.block_id,
      section_id: ps.section_id,
      operation: ps.operation,
      patch_type: ps.patch_type,
      content: ps.content,
      proposed_by: TEST_AGENT,
      base_version: doc.version,
      target_fingerprint: ps.target_fingerprint,
    });

    // Patch 3 should be rejected (stale/base_version mismatch)
    // All others should be accepted
    const decision = ps.patch_id === "patch_3" ? "reject" : "accept";

    engine.decidePatch({
      patch_id: ps.patch_id,
      decision,
      reviewer_id: TEST_REVIEWER,
    });
  }

  return { engine, documentId };
}
