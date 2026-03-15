/**
 * Acceptance Test: Repository Generation from SpecBundle
 *
 * Validates repository scaffold generation from SpecBundle with:
 * - Multiple template types (nextjs-typescript, nextjs-python, docs-only)
 * - All required files present
 * - Traceability mapping correct
 * - Metadata properly embedded
 * - Unique repo IDs
 * - Valid timestamps
 */

import { describe, it, expect } from "vitest";
import type { GeneratedRepo } from "../../src/engine/index.js";
import {
  loadWorkspaceSeed,
  loadPatchSeeds,
  runFullWorkflow,
  seedToDocument,
  createFreshEngine,
  TEST_AGENT,
  TEST_REVIEWER,
} from "../helpers.js";

describe("Repository Generation", () => {
  it("should generate docs-only repo from spec bundle", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "docs-only");

    expect(repo).toBeDefined();
    expect(repo.repo_id).toMatch(/^repo_\d+$/);
    expect(repo.template_name).toBe("docs-only");
    expect(repo.spec_bundle_id).toBe(documentId);
  });

  it("should generate nextjs-typescript repo from spec bundle", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "nextjs-typescript");

    expect(repo).toBeDefined();
    expect(repo.template_name).toBe("nextjs-typescript");
    expect(repo.generated_files.length).toBeGreaterThan(0);
  });

  it("should generate nextjs-python repo from spec bundle", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "nextjs-python");

    expect(repo).toBeDefined();
    expect(repo.template_name).toBe("nextjs-python");
    expect(repo.generated_files.length).toBeGreaterThan(0);
  });

  it("should include all required files for docs-only template", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "docs-only");

    const filePaths = repo.generated_files.map((f) => f.path);

    // Required files for docs-only
    expect(filePaths).toContain("README.md");
    expect(filePaths).toContain("docs/SPEC.md");
    expect(filePaths).toContain("docs/ARCHITECTURE.md");
    expect(filePaths).toContain("docs/TASKS.md");
  });

  it("should include all required files for nextjs-typescript template", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "nextjs-typescript");

    const filePaths = repo.generated_files.map((f) => f.path);

    // Required files for Next.js TypeScript
    expect(filePaths).toContain("package.json");
    expect(filePaths).toContain("tsconfig.json");
    expect(filePaths).toContain("src/pages/index.tsx");
    expect(filePaths).toContain("README.md");
    expect(filePaths).toContain("docs/SPEC.md");
    expect(filePaths).toContain("docs/ARCHITECTURE.md");
    expect(filePaths).toContain("tests/example.test.ts");
  });

  it("should include all required files for nextjs-python template", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "nextjs-python");

    const filePaths = repo.generated_files.map((f) => f.path);

    // Required files for Next.js + Python
    expect(filePaths).toContain("frontend/package.json");
    expect(filePaths).toContain("backend/requirements.txt");
    expect(filePaths).toContain("backend/main.py");
    expect(filePaths).toContain("README.md");
    expect(filePaths).toContain("docs/SPEC.md");
  });

  it("should have correct file types", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "nextjs-typescript");

    const fileTypes = new Map<string, string>();
    for (const file of repo.generated_files) {
      fileTypes.set(file.path, file.file_type);
    }

    expect(fileTypes.get("package.json")).toBe("config");
    expect(fileTypes.get("tsconfig.json")).toBe("config");
    expect(fileTypes.get("src/pages/index.tsx")).toBe("code");
    expect(fileTypes.get("README.md")).toBe("docs");
    expect(fileTypes.get("docs/SPEC.md")).toBe("docs");
    expect(fileTypes.get("tests/example.test.ts")).toBe("test");
  });

  it("should have traceability mapping for all files", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "docs-only");

    expect(repo.traceability).toBeDefined();
    expect(Object.keys(repo.traceability).length).toBeGreaterThan(0);

    // Each file should have traceability data
    for (const file of repo.generated_files) {
      expect(repo.traceability[file.path]).toBeDefined();
      expect(repo.traceability[file.path]).toHaveProperty("source_block_ids");
      expect(repo.traceability[file.path]).toHaveProperty("source_sections");
      expect(Array.isArray(repo.traceability[file.path].source_block_ids)).toBe(
        true
      );
      expect(Array.isArray(repo.traceability[file.path].source_sections)).toBe(
        true
      );
    }
  });

  it("should map SPEC.md to all source blocks", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "docs-only");
    const bundle = engine.exportBundle(documentId);

    const specTraceability = repo.traceability["docs/SPEC.md"];
    expect(specTraceability).toBeDefined();

    // SPEC.md should include all blocks from the bundle
    expect(specTraceability.source_block_ids.length).toBeGreaterThan(0);
    expect(specTraceability.source_sections.length).toBeGreaterThan(0);

    // All block IDs from bundle should be in SPEC.md traceability
    const bundleBlockIds = bundle.agent_spec.sections.map((s) => s.block_id);
    for (const blockId of bundleBlockIds) {
      expect(specTraceability.source_block_ids).toContain(blockId);
    }
  });

  it("should embed spec metadata in package.json", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "nextjs-typescript");
    const bundle = engine.exportBundle(documentId);

    const packageJsonFile = repo.generated_files.find(
      (f) => f.path === "package.json"
    );
    expect(packageJsonFile).toBeDefined();

    const packageJson = JSON.parse(packageJsonFile!.content);

    // Verify metadata section
    expect(packageJson.metadata).toBeDefined();
    expect(packageJson.metadata.spec_version).toBe(bundle.spec_version);
    expect(packageJson.metadata.spec_title).toBe(bundle.agent_spec.document_title);
    expect(packageJson.metadata.authors).toEqual(bundle.agent_spec.authors);
  });

  it("should include document title in README", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "docs-only");
    const bundle = engine.exportBundle(documentId);

    const readmeFile = repo.generated_files.find((f) => f.path === "README.md");
    expect(readmeFile).toBeDefined();

    const readmeContent = readmeFile!.content;
    expect(readmeContent).toContain(bundle.agent_spec.document_title);
  });

  it("should match SPEC.md content with bundle markdown", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "docs-only");
    const bundle = engine.exportBundle(documentId);

    const specFile = repo.generated_files.find((f) => f.path === "docs/SPEC.md");
    expect(specFile).toBeDefined();

    // SPEC.md should contain the exact markdown from bundle
    expect(specFile!.content).toBe(bundle.document_markdown);
  });

  it("should assign unique repo IDs", () => {
    const { engine, documentId } = runFullWorkflow();

    const repo1 = engine.generateRepository(documentId, "docs-only");
    const repo2 = engine.generateRepository(documentId, "nextjs-typescript");

    expect(repo1.repo_id).not.toBe(repo2.repo_id);
  });

  it("should have valid generated_at timestamp", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "docs-only");

    expect(repo.generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    // Timestamp should be ISO 8601 format
    const timestamp = new Date(repo.generated_at);
    expect(timestamp.getTime()).toBeGreaterThan(0);
  });

  it("should set correct spec_version in repo", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "docs-only");
    const bundle = engine.exportBundle(documentId);

    expect(repo.spec_version).toBe(parseInt(bundle.spec_version.split(".")[0], 10));
  });

  it("should retrieve generated repo by ID", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "docs-only");

    const retrieved = engine.getGeneratedRepo(repo.repo_id);
    expect(retrieved).toBeDefined();
    expect(retrieved).toEqual(repo);
  });

  it("should retrieve all repos for a document", () => {
    const { engine, documentId } = runFullWorkflow();

    const repo1 = engine.generateRepository(documentId, "docs-only");
    const repo2 = engine.generateRepository(documentId, "nextjs-typescript");

    const allRepos = engine.getGeneratedRepos(documentId);
    expect(allRepos.length).toBe(2);
    expect(allRepos.map((r) => r.repo_id)).toContain(repo1.repo_id);
    expect(allRepos.map((r) => r.repo_id)).toContain(repo2.repo_id);
  });

  it("should emit repo.generated event", () => {
    const { engine, documentId } = runFullWorkflow();

    const repo = engine.generateRepository(documentId, "docs-only");
    const events = engine.getEvents(documentId);

    const repoEvent = events.find((e) => e.event_type === "repo.generated");
    expect(repoEvent).toBeDefined();
    expect(repoEvent!.payload.repo_id).toBe(repo.repo_id);
    expect(repoEvent!.payload.template_name).toBe("docs-only");
    expect(repoEvent!.payload.file_count).toBe(repo.generated_files.length);
  });

  it("should include patch statistics in docs-only TASKS.md", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "docs-only");
    const bundle = engine.exportBundle(documentId);

    const tasksFile = repo.generated_files.find((f) => f.path === "docs/TASKS.md");
    expect(tasksFile).toBeDefined();

    const tasksContent = tasksFile!.content;
    expect(tasksContent).toContain(
      `${bundle.agent_spec.total_patches_proposed}`
    );
    expect(tasksContent).toContain(
      `${bundle.agent_spec.total_patches_accepted}`
    );
    expect(tasksContent).toContain(
      `${bundle.agent_spec.total_patches_rejected}`
    );
  });

  it("should include all patch IDs in TASKS.md", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "docs-only");
    const bundle = engine.exportBundle(documentId);

    const tasksFile = repo.generated_files.find((f) => f.path === "docs/TASKS.md");
    expect(tasksFile).toBeDefined();

    const tasksContent = tasksFile!.content;
    for (const patch of bundle.patch_summary) {
      expect(tasksContent).toContain(patch.patch_id);
    }
  });

  it("should generate non-empty content for all files", () => {
    const { engine, documentId } = runFullWorkflow();
    const repo = engine.generateRepository(documentId, "nextjs-typescript");

    for (const file of repo.generated_files) {
      expect(file.content).toBeDefined();
      expect(file.content.length).toBeGreaterThan(0);
    }
  });

  it("should handle multiple template generations correctly", () => {
    const { engine, documentId } = runFullWorkflow();

    const docsRepo = engine.generateRepository(documentId, "docs-only");
    const tsRepo = engine.generateRepository(documentId, "nextjs-typescript");
    const pyRepo = engine.generateRepository(documentId, "nextjs-python");

    // Each template should have different file counts
    expect(docsRepo.generated_files.length).toBeLessThan(
      tsRepo.generated_files.length
    );
    expect(tsRepo.generated_files.length).not.toBe(pyRepo.generated_files.length);

    // All should have unique IDs
    const repoIds = [docsRepo.repo_id, tsRepo.repo_id, pyRepo.repo_id];
    expect(new Set(repoIds).size).toBe(3);
  });
});
