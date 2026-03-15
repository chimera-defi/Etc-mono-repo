/**
 * Acceptance Test: Create Document
 *
 * Matrix row: Create document | fixtures/workspace.seed.json | Document persists with version=1
 *
 * Validates that a document can be created from seed data and persists
 * with correct initial state per contracts/v1/document_create.request.schema.json.
 */

import { describe, it, expect } from "vitest";
import {
  createFreshEngine,
  loadWorkspaceSeed,
  seedToDocument,
} from "../helpers.js";

describe("Create document", () => {
  it("should create a document from seed data with version=1", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    expect(doc).toBeDefined();
    expect(doc.version).toBe(1);
    expect(doc.title).toBe("SpecForge MVP");
    expect(doc.workspace_id).toBe("ws_01");
  });

  it("should persist the document so it can be retrieved by ID", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    const retrieved = engine.getDocument(doc.document_id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.document_id).toBe(doc.document_id);
    expect(retrieved!.version).toBe(1);
  });

  it("should have a stable document ID from seed", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    // The seed specifies doc_123 as the document_id
    expect(doc.document_id).toBe("doc_123");
  });

  it("should preserve blocks and sections from seed", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    const doc = engine.loadDocument(seedToDocument(seed));

    expect(doc.blocks).toHaveLength(2);
    expect(doc.sections).toHaveLength(2);
    expect(doc.blocks[0].block_id).toBe("blk_goals_1");
    expect(doc.blocks[1].block_id).toBe("blk_scope_1");
    expect(doc.sections[0].section_id).toBe("sec_goals");
    expect(doc.sections[1].section_id).toBe("sec_scope");
  });

  it("should create a document via the create API with correct initial version", () => {
    const engine = createFreshEngine();
    const doc = engine.createDocument({
      workspace_id: "ws_test",
      title: "Test Document",
      initial_markdown: "# Test\n\n## Goals\nSome goals\n",
    });

    expect(doc.version).toBe(1);
    expect(doc.title).toBe("Test Document");
    expect(doc.markdown).toContain("# Test");
  });

  it("should emit a document.created event on creation", () => {
    const engine = createFreshEngine();
    const seed = loadWorkspaceSeed();
    engine.loadDocument(seedToDocument(seed));

    const events = engine.getEvents(seed.document_id);
    expect(events).toHaveLength(1);
    expect(events[0].event_type).toBe("document.created");
    expect(events[0].version).toBe(1);
  });
});
