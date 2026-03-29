/**
 * Tests for acceptance test CRUD helpers.
 */
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it, expect } from "vitest";

import {
  getTestMatrix,
  createAcceptanceTest,
  updateAcceptanceTest,
  deleteAcceptanceTest,
  getAcceptanceTest,
} from "./acceptance-tests";
import { getDatabase, listDocuments } from "./store";

async function makeOptions() {
  const baseDir = await mkdtemp(path.join(os.tmpdir(), "specforge-at-"));
  return {
    dbPath: path.join(baseDir, "specforge-db"),
    fixturesDir: path.resolve(process.cwd(), "..", "fixtures"),
  };
}

describe("acceptance-tests CRUD", () => {
  it("returns an empty matrix for a document with no tests", async () => {
    const options = await makeOptions();
    const db = await getDatabase(options);
    const matrix = await getTestMatrix(db, `nonexistent-${Date.now()}`);
    expect(matrix.tests).toHaveLength(0);
  });

  it("creates a test and retrieves it", async () => {
    const options = await makeOptions();
    const db = await getDatabase(options);
    const [document] = await listDocuments(options);
    expect(document).toBeTruthy();

    const created = await createAcceptanceTest(db, document!.document_id, {
      feature: "Login",
      test_case: "Valid credentials",
      expected_result: "User is redirected to dashboard",
    });

    expect(created.test_id).toBeTruthy();
    expect(created.feature).toBe("Login");
    expect(created.status).toBe("pending");

    const fetched = await getAcceptanceTest(db, created.test_id);
    expect(fetched).not.toBeNull();
    expect(fetched?.test_case).toBe("Valid credentials");
  });

  it("returns all tests for a document", async () => {
    const options = await makeOptions();
    const db = await getDatabase(options);
    const [document] = await listDocuments(options);
    expect(document).toBeTruthy();
    const docId = document!.document_id;

    await createAcceptanceTest(db, docId, { feature: "A", test_case: "first", expected_result: "ok" });
    await createAcceptanceTest(db, docId, { feature: "A", test_case: "second", expected_result: "ok" });

    const matrix = await getTestMatrix(db, docId);
    expect(matrix.tests.length).toBeGreaterThanOrEqual(2);
  });

  it("updates test status and notes", async () => {
    const options = await makeOptions();
    const db = await getDatabase(options);
    const [document] = await listDocuments(options);
    const docId = document!.document_id;

    const test = await createAcceptanceTest(db, docId, {
      feature: "Export",
      test_case: "Download zip",
      expected_result: "ZIP file downloaded",
    });

    await updateAcceptanceTest(db, test.test_id, { status: "pass", notes: "Auto-evaluated" });

    const updated = await getAcceptanceTest(db, test.test_id);
    expect(updated?.status).toBe("pass");
    expect(updated?.notes).toBe("Auto-evaluated");
  });

  it("deletes a test", async () => {
    const options = await makeOptions();
    const db = await getDatabase(options);
    const [document] = await listDocuments(options);
    const docId = document!.document_id;

    const test = await createAcceptanceTest(db, docId, {
      feature: "Delete me",
      test_case: "should be gone",
      expected_result: "gone",
    });

    await deleteAcceptanceTest(db, test.test_id);
    const fetched = await getAcceptanceTest(db, test.test_id);
    expect(fetched).toBeNull();
  });
}, 60000);
