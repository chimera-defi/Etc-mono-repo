"use client";

/**
 * AcceptanceTestSection
 *
 * Client wrapper that manages acceptance test state and wires CRUD + run
 * callbacks for the AcceptanceTestMatrix component.
 *
 * Receives initial tests as a server-side prop; subsequent mutations call
 * the API and refresh local state so the page doesn't need a full reload.
 */

import { useCallback, useState } from "react";

import type { AcceptanceTest } from "@/lib/specforge/acceptance-tests";
import {
  AcceptanceTestMatrix,
  type AcceptanceTestDraft,
} from "./AcceptanceTestMatrix";

type RunResult = {
  evaluated: number;
  passed: number;
  failed: number;
};

type AcceptanceTestSectionProps = {
  documentId: string;
  initialTests: AcceptanceTest[];
};

export function AcceptanceTestSection({
  documentId,
  initialTests,
}: AcceptanceTestSectionProps) {
  const [tests, setTests] = useState<AcceptanceTest[]>(initialTests);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  const base = `/api/documents/${documentId}/acceptance-tests`;

  const handleAddTest = useCallback(
    async (draft: AcceptanceTestDraft) => {
      const res = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) return;
      const { data } = await res.json() as { data: { matrix: { tests: AcceptanceTest[] } } };
      setTests(data.matrix.tests);
    },
    [base],
  );

  const handleUpdateTest = useCallback(
    async (testId: string, updates: Partial<AcceptanceTestDraft>) => {
      const res = await fetch(`${base}/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) return;
      const { data } = await res.json() as { data: { test: AcceptanceTest } };
      setTests((prev) => prev.map((t) => (t.test_id === testId ? data.test : t)));
    },
    [base],
  );

  const handleDeleteTest = useCallback(
    async (testId: string) => {
      const res = await fetch(`${base}/${testId}`, { method: "DELETE" });
      if (!res.ok) return;
      setTests((prev) => prev.filter((t) => t.test_id !== testId));
    },
    [base],
  );

  const handleRunTests = useCallback(async () => {
    setRunResult(null);
    const res = await fetch(`${base}/run`, { method: "POST" });
    if (!res.ok) return;
    const { data } = await res.json() as { data: RunResult & { matrix: { tests: AcceptanceTest[] } } };
    setTests(data.matrix.tests);
    setRunResult({ evaluated: data.evaluated, passed: data.passed, failed: data.failed });
  }, [base]);

  return (
    <div>
      {runResult && runResult.evaluated > 0 && (
        <div
          style={{
            marginBottom: "12px",
            padding: "8px 14px",
            borderRadius: "6px",
            background: runResult.failed === 0 ? "#f0fdf4" : "#fef9c3",
            border: `1px solid ${runResult.failed === 0 ? "#86efac" : "#fde047"}`,
            fontSize: "13px",
            color: "#374151",
          }}
        >
          Evaluated {runResult.evaluated} pending tests — {runResult.passed} passed, {runResult.failed} need spec expansion.
        </div>
      )}
      <AcceptanceTestMatrix
        tests={tests}
        documentId={documentId}
        onAddTest={handleAddTest}
        onUpdateTest={handleUpdateTest}
        onDeleteTest={handleDeleteTest}
        onRunTests={handleRunTests}
      />
    </div>
  );
}
