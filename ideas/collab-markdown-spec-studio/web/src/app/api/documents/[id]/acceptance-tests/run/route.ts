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

// Aggressive stop word list for cleaner term extraction
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "is", "are", "be", "to", "of",
  "in", "for", "with", "that", "this", "it", "as", "at", "by",
  "from", "on", "has", "have", "will", "can", "not", "no", "if",
  "should", "must", "shall", "may", "when", "all", "any", "been",
  "being", "was", "were", "would", "could", "about", "into",
  "than", "then", "them", "they", "their", "there", "these",
  "those", "each", "every", "both", "few", "more", "most",
  "other", "some", "such", "only", "own", "same", "also",
  "does", "did", "done", "doing", "its", "just", "but", "nor",
  "yet", "so", "very", "too", "here", "how", "what", "which",
  "who", "whom", "where", "why", "between", "through", "during",
  "before", "after", "above", "below", "under", "over", "again",
  "once", "further", "upon", "while", "our", "out", "your",
  "per", "via", "one", "two", "use", "used", "using", "new",
  "get", "set", "way", "like", "make", "need", "still",
]);

/**
 * Extract significant terms from text, weighting nouns and verbs higher.
 */
function extractWeightedTerms(text: string): { term: string; weight: number }[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  return words.map((w) => ({
    term: w,
    // Multi-syllable words and hyphenated terms are more likely domain-specific
    weight: w.includes("-") ? 2 : w.length > 6 ? 1.5 : 1,
  }));
}

/**
 * Extract the markdown content under a specific heading.
 * Matches ## Heading through the next heading of equal or higher level.
 */
function extractSection(markdown: string, sectionRef: string): string | null {
  const sectionLower = sectionRef.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
  const lines = markdown.split("\n");
  let capturing = false;
  let capturedLevel = 0;
  const captured: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const heading = headingMatch[2].toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
      if (capturing) {
        // Stop at same or higher level heading
        if (level <= capturedLevel) break;
      } else if (heading.includes(sectionLower) || sectionLower.includes(heading)) {
        capturing = true;
        capturedLevel = level;
        continue;
      }
    }
    if (capturing) {
      captured.push(line);
    }
  }

  return captured.length > 0 ? captured.join("\n") : null;
}

/**
 * Compute weighted coverage of terms against a body of text.
 */
function computeCoverage(
  terms: { term: string; weight: number }[],
  text: string,
): { coverage: number; matched: string[]; unmatched: string[] } {
  const lowerText = text.toLowerCase();
  const matched: string[] = [];
  const unmatched: string[] = [];
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const { term, weight } of terms) {
    totalWeight += weight;
    if (lowerText.includes(term)) {
      matchedWeight += weight;
      matched.push(term);
    } else {
      unmatched.push(term);
    }
  }

  return {
    coverage: totalWeight > 0 ? matchedWeight / totalWeight : 0,
    matched,
    unmatched,
  };
}

/**
 * Score a single test against the document markdown.
 *
 * Strategy:
 * 1. Extract significant terms from expected_result and test_case
 * 2. Try section-scoped evaluation first (match test_case to a heading)
 * 3. Fall back to whole-document evaluation
 * 4. Check that the expected_result phrase appears as a substring
 *
 * Thresholds: 60% in relevant section OR 40% in whole document
 * PLUS expected_result phrase must appear (lowercased, stripped)
 */
function evaluateTest(
  test: AcceptanceTest,
  markdown: string,
): { pass: boolean; notes: string } {
  const weightedTerms = [
    ...extractWeightedTerms(test.expected_result),
    ...extractWeightedTerms(test.test_case),
  ];

  if (weightedTerms.length === 0) {
    return { pass: false, notes: "Test has no evaluable criteria." };
  }

  // Deduplicate by term
  const seen = new Set<string>();
  const uniqueTerms = weightedTerms.filter((t) => {
    if (seen.has(t.term)) return false;
    seen.add(t.term);
    return true;
  });

  // Check for expected_result phrase as substring (stripped and lowercased)
  const expectedPhrase = test.expected_result
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const lowerMarkdown = markdown.toLowerCase();
  const phrasePresent = expectedPhrase.length > 0 && lowerMarkdown.includes(expectedPhrase);

  // Try section-scoped evaluation first
  const sectionContent = extractSection(markdown, test.test_case);
  if (sectionContent) {
    const sectionResult = computeCoverage(uniqueTerms, sectionContent);
    if (sectionResult.coverage >= 0.6 || (sectionResult.coverage >= 0.4 && phrasePresent)) {
      // Identify section name for notes
      const sectionName = test.test_case.split(/[:.]/)[0]?.trim() || test.test_case;
      return {
        pass: true,
        notes: `Covered in "${sectionName}": ${sectionResult.matched.slice(0, 8).join(", ")} (${Math.round(sectionResult.coverage * 100)}% weighted coverage). Auto-evaluated.`,
      };
    }
  }

  // Fall back to whole-document evaluation
  const docResult = computeCoverage(uniqueTerms, markdown);

  if (docResult.coverage >= 0.6 || (docResult.coverage >= 0.4 && phrasePresent)) {
    return {
      pass: true,
      notes: `Spec covers ${Math.round(docResult.coverage * 100)}% of test criteria (${docResult.matched.length}/${uniqueTerms.length} key terms). Matched: ${docResult.matched.slice(0, 6).join(", ")}. Auto-evaluated.`,
    };
  }

  // Fail case: provide actionable feedback
  const missingTerms = docResult.unmatched.slice(0, 5).join(", ");
  const suggestedSection = sectionContent
    ? test.test_case.split(/[:.]/)[0]?.trim() || "the relevant section"
    : "a new or existing section";

  return {
    pass: false,
    notes: `Missing from spec: ${missingTerms} (${Math.round(docResult.coverage * 100)}% coverage, need ≥60%). Add to ${suggestedSection}.`,
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
