import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { agentSpecExportSchema } from "./contracts";
import {
  createCommentThread,
  createDocument,
  decidePatch,
  createPatchProposal,
  exportDocument,
  getDocument,
  listAuditEvents,
  listCommentThreads,
  listDocuments,
  listPatches,
  resolveCommentThread,
  updateDocument,
} from "./store";

async function makeOptions() {
  const baseDir = await mkdtemp(path.join(os.tmpdir(), "specforge-store-"));

  return {
    dbPath: path.join(baseDir, "specforge-db"),
    fixturesDir: path.resolve(process.cwd(), "..", "fixtures"),
  };
}

describe("specforge store", () => {
  it("seeds the initial document from fixtures", async () => {
    const options = await makeOptions();
    const documents = await listDocuments(options);

    expect(documents).toHaveLength(1);
    expect(documents[0]?.title).toBe("SpecForge MVP");
    expect(documents[0]?.blocks[0]?.block_id).toBe("blk_goals_1");
  }, 20000);

  it("creates a new document and can read it back", async () => {
    const options = await makeOptions();
    const created = await createDocument(
      {
        workspace_id: "ws_02",
        title: "Roadmap Draft",
        initial_markdown: "# PRD\n\n## Problem\nMessy planning.\n\n## Goals\nShip faster.\n",
      },
      options,
    );

    const loaded = await getDocument(created.document_id, options);
    expect(loaded?.title).toBe("Roadmap Draft");
    expect(loaded?.sections).toHaveLength(2);
  });

  it("marks a patch stale when the fingerprint does not match", async () => {
    const options = await makeOptions();
    const [document] = await listDocuments(options);

    expect(document).toBeTruthy();

    const patch = await createPatchProposal(
      {
        document_id: document!.document_id,
        block_id: document!.blocks[0]!.block_id,
        section_id: document!.blocks[0]!.section_id,
        operation: "replace",
        patch_type: "requirement_change",
        content: "## Goals\n1. New goal.",
        rationale: "Test patch.",
        proposed_by: { actor_type: "agent", actor_id: "tester" },
        base_version: document!.version,
        target_fingerprint: "sha256:bad",
        confidence: 0.9,
      },
      options,
    );

    expect(patch.status).toBe("stale");
  });

  it("updates a document, derives new blocks, and increments the version", async () => {
    const options = await makeOptions();
    const [document] = await listDocuments(options);

    const updated = await updateDocument(
      document!.document_id,
      {
        markdown: "# PRD\n\n## Problem\nConfusing reviews.\n\n## Goals\n- Shorten loops.\n",
        editor_json: {
          type: "doc",
          content: [
            { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "PRD" }] },
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Problem" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Confusing reviews." }],
            },
          ],
        },
      },
      options,
    );

    expect(updated.version).toBe(document!.version + 1);
    expect(updated.blocks[0]?.block_id).toBe("blk_problem_1");
    expect(updated.editor_json).toBeTruthy();
  });

  it("exports a deterministic bundle for a document", async () => {
    const options = await makeOptions();
    const [document] = await listDocuments(options);

    const bundle = await exportDocument(document!.document_id, options);
    const agentSpec = agentSpecExportSchema.parse(
      JSON.parse(bundle.files["agent_spec.json"] ?? "{}"),
    );

    expect(bundle.files["PRD.md"]).toContain("# PRD");
    expect(bundle.files["SPEC.md"]).toContain("## Patch Queue");
    expect(bundle.files["TASKS.md"]).toContain("Review Goals");
    expect(agentSpec.document_id).toBe(document!.document_id);
    expect(agentSpec.sections.length).toBeGreaterThan(0);
  });

  it("lists patches for the active document", async () => {
    const options = await makeOptions();
    const [document] = await listDocuments(options);
    const patches = await listPatches(document!.document_id, options);

    expect(patches.length).toBeGreaterThan(0);
  });

  it("accepts a patch, updates the document, and writes audit events", async () => {
    const options = await makeOptions();
    const [document] = await listDocuments(options);
    const createdPatch = await createPatchProposal(
      {
        document_id: document!.document_id,
        block_id: document!.blocks[0]!.block_id,
        section_id: document!.blocks[0]!.section_id,
        operation: "replace",
        patch_type: "requirement_change",
        content: "## Goals\n- Ship patch review.\n- Keep attribution.\n",
        rationale: "Acceptable change.",
        proposed_by: { actor_type: "agent", actor_id: "review-bot" },
        base_version: document!.version,
        target_fingerprint: document!.blocks[0]!.target_fingerprint,
        confidence: 0.92,
      },
      options,
    );

    const decided = await decidePatch(
      {
        document_id: document!.document_id,
        patch_id: createdPatch.patch_id,
        decision: "accept",
        decided_by: { actor_type: "human", actor_id: "reviewer" },
      },
      options,
    );
    const updatedDocument = await getDocument(document!.document_id, options);
    const auditEvents = await listAuditEvents(document!.document_id, options);

    expect(decided.status).toBe("accepted");
    expect(updatedDocument?.version).toBe(document!.version + 1);
    expect(updatedDocument?.markdown).toContain("Ship patch review.");
    expect(auditEvents.some((event) => event.event_type === "patch.decided")).toBe(true);
  });

  it("creates and resolves anchored comment threads", async () => {
    const options = await makeOptions();
    const [document] = await listDocuments(options);
    const created = await createCommentThread(
      {
        document_id: document!.document_id,
        block_id: document!.blocks[0]!.block_id,
        body: "Clarify the rollout constraints.",
        created_by: { actor_type: "human", actor_id: "reviewer" },
      },
      options,
    );

    expect(created.status).toBe("open");

    const resolved = await resolveCommentThread(
      {
        document_id: document!.document_id,
        thread_id: created.thread_id,
        resolved_by: { actor_type: "human", actor_id: "reviewer" },
      },
      options,
    );
    const threads = await listCommentThreads(document!.document_id, options);

    expect(resolved.status).toBe("resolved");
    expect(threads[0]?.thread_id).toBe(created.thread_id);
  });
});
