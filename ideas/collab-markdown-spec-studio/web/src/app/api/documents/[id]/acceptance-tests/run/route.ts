/**
 * Acceptance Test Execution Route
 *
 * POST /documents/:id/acceptance-tests/run
 *
 * Evaluates all pending acceptance tests against the current spec content.
 * This performs spec-coverage evaluation: each test criterion is checked
 * against what the document actually specifies.
 *
 * Pass criteria: the document's relevant section contains the key concepts
 * described in the test's expected_result.
 *
 * Returns updated test statuses with evaluation notes.
 */

import {
  getTestMatrix,
  updateAcceptanceTest,
  type AcceptanceTest,
} from "@/lib/specforge/acceptance-tests";
import { getAcceptanceTestDb } from "@/lib/specforge/acceptance-test-db";
import { getCurrentWorkspaceDocument } from "@/lib/specforge/workspace-access";
import { success, error } from "@/lib/specforge/api-response";

type Params = {
  params: Promise<{ id: string }>;
};

type EvaluationResult = {
  test_id: string;
  feature: string;
  test_case: string;
  previous_status: AcceptanceTest["status"];
  new_status: AcceptanceTest["status"];
  notes: string;
};

/**
 * Score a single test against the document markdown.
 * Returns { pass, notes }.
 *
 * Heuristic: tokenise the expected_result into significant terms,
 * then check how many appear in the document markdown (case-insensitive).
 * Threshold: ≥60% of terms present → pass.
 */
function evaluateTest(
  test: AcceptanceTest,
  markdown: string,
): { pass: boolean; notes: string } {
  const lowerMarkdown = markdown.toLowerCase();

  // Strip common stop words for cleaner term extraction
  const STOP = new Set([
    "a", "an", "the", "and", "or", "is", "are", "be", "to", "of",
    "in", "for", "with", "that", "this", "it", "as", "at", "by",
    "from", "on", "has", "have", "will", "can", "not", "no", "if",
    "should", "must", "shall", "may", "when", "all", "any",
  ]);

  const extractTerms = (text: string): string[] =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w));

  const terms = [
    ...extractTerms(test.expected_result),
    ...extractTerms(test.test_case),
  ];

  if (terms.length === 0) {
    return { pass: false, notes: "Test has no evaluable criteria." };
  }

  const uniqueTerms = [...new Set(terms)];
  const matched = uniqueTerms.filter((t) => lowerMarkdown.includes(t));
  const coverage = matched.length / uniqueTerms.length;

  if (coverage >= 0.6) {
    return {
      pass: true,
      notes: `Spec covers ${Math.round(coverage * 100)}% of test criteria (${matched.length}/${uniqueTerms.length} key terms present). Auto-evaluated.`,
    };
  }

  const missing = uniqueTerms
    .filter((t) => !lowerMarkdown.includes(t))
    .slice(0, 5)
    .join(", ");

  return {
    pass: false,
    notes: `Spec covers only ${Math.round(coverage * 100)}% of test criteria. Key terms missing from spec: ${missing}. Consider expanding relevant sections.`,
  };
}

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { document } = await getCurrentWorkspaceDocument(id);

    if (!document) {
      return error("Document not found", "DOCUMENT_NOT_FOUND", 404);
    }

    const db = await getAcceptanceTestDb();
    const matrix = await getTestMatrix(db, id);
    const pendingTests = matrix.tests.filter((t) => t.status === "pending");

    if (pendingTests.length === 0) {
      return success({
        evaluated: 0,
        results: [] as EvaluationResult[],
        matrix,
        message: "No pending tests to evaluate.",
      });
    }

    const markdown = document.markdown ?? "";
    const results: EvaluationResult[] = [];

    for (const test of pendingTests) {
      const { pass, notes } = evaluateTest(test, markdown);
      const newStatus = pass ? "pass" : "fail";

      await updateAcceptanceTest(db, test.test_id, {
        status: newStatus,
        notes: test.notes
          ? `${test.notes}\n[Auto-eval] ${notes}`
          : `[Auto-eval] ${notes}`,
        changed_by: "system:auto-eval",
      });

      results.push({
        test_id: test.test_id,
        feature: test.feature,
        test_case: test.test_case,
        previous_status: test.status,
        new_status: newStatus,
        notes,
      });
    }

    const updatedMatrix = await getTestMatrix(db, id);

    return success({
      evaluated: results.length,
      passed: results.filter((r) => r.new_status === "pass").length,
      failed: results.filter((r) => r.new_status === "fail").length,
      results,
      matrix: updatedMatrix,
    });
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Unknown error",
      "ACCEPTANCE_TEST_RUN_FAILED",
      500,
    );
  }
}
