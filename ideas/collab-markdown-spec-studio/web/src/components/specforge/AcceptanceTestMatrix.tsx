"use client";

/**
 * AcceptanceTestMatrix
 *
 * Renders a table of acceptance tests with inline add, edit, delete, and
 * batch-run controls. Pure presentation component -- all mutations are
 * handled via callback props provided by AcceptanceTestSection.
 */

import { useCallback, useState } from "react";

import type { AcceptanceTest } from "@/lib/specforge/acceptance-tests";

export type AcceptanceTestDraft = {
  feature: string;
  test_case: string;
  expected_result: string;
};

type AcceptanceTestMatrixProps = {
  tests: AcceptanceTest[];
  documentId: string;
  onAddTest: (draft: AcceptanceTestDraft) => Promise<void>;
  onUpdateTest: (testId: string, updates: Partial<AcceptanceTestDraft>) => Promise<void>;
  onDeleteTest: (testId: string) => Promise<void>;
  onRunTests: () => Promise<void>;
};

const EMPTY_DRAFT: AcceptanceTestDraft = {
  feature: "",
  test_case: "",
  expected_result: "",
};

const statusColors: Record<AcceptanceTest["status"], string> = {
  pending: "#6b7280",
  pass: "#16a34a",
  fail: "#dc2626",
  skip: "#9ca3af",
};

export function AcceptanceTestMatrix({
  tests,
  onAddTest,
  // onUpdateTest — reserved for future inline-edit UI
  onDeleteTest,
  onRunTests,
}: AcceptanceTestMatrixProps) {
  const [draft, setDraft] = useState<AcceptanceTestDraft>(EMPTY_DRAFT);
  const [adding, setAdding] = useState(false);
  const [running, setRunning] = useState(false);

  const handleAdd = useCallback(async () => {
    if (!draft.feature.trim() || !draft.test_case.trim()) return;
    setAdding(true);
    try {
      await onAddTest(draft);
      setDraft(EMPTY_DRAFT);
    } finally {
      setAdding(false);
    }
  }, [draft, onAddTest]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    try {
      await onRunTests();
    } finally {
      setRunning(false);
    }
  }, [onRunTests]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>
          Acceptance Tests ({tests.length})
        </h3>
        <button
          onClick={handleRun}
          disabled={running || tests.length === 0}
          style={{
            padding: "6px 14px",
            fontSize: "13px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: running ? "#f3f4f6" : "#fff",
            cursor: running ? "wait" : "pointer",
          }}
        >
          {running ? "Running..." : "Run Tests"}
        </button>
      </div>

      {tests.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          <thead>
            <tr>
              {["Feature", "Test Case", "Expected Result", "Status", ""].map(
                (header) => (
                  <th
                    key={header || "actions"}
                    style={{
                      textAlign: "left",
                      padding: "6px 8px",
                      borderBottom: "1px solid #e5e7eb",
                      fontWeight: 500,
                      color: "#6b7280",
                    }}
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr key={test.test_id}>
                <td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>
                  {test.feature}
                </td>
                <td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>
                  {test.test_case}
                </td>
                <td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>
                  {test.expected_result}
                </td>
                <td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>
                  <span
                    style={{
                      color: statusColors[test.status],
                      fontWeight: 500,
                    }}
                  >
                    {test.status}
                  </span>
                </td>
                <td style={{ padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>
                  <button
                    onClick={() => onDeleteTest(test.test_id)}
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr auto",
          gap: "8px",
          alignItems: "end",
        }}
      >
        <input
          placeholder="Feature"
          value={draft.feature}
          onChange={(e) => setDraft({ ...draft, feature: e.target.value })}
          style={{
            padding: "6px 10px",
            fontSize: "13px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
          }}
        />
        <input
          placeholder="Test case"
          value={draft.test_case}
          onChange={(e) => setDraft({ ...draft, test_case: e.target.value })}
          style={{
            padding: "6px 10px",
            fontSize: "13px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
          }}
        />
        <input
          placeholder="Expected result"
          value={draft.expected_result}
          onChange={(e) =>
            setDraft({ ...draft, expected_result: e.target.value })
          }
          style={{
            padding: "6px 10px",
            fontSize: "13px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
          }}
        />
        <button
          onClick={handleAdd}
          disabled={adding}
          style={{
            padding: "6px 14px",
            fontSize: "13px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: adding ? "#f3f4f6" : "#fff",
            cursor: adding ? "wait" : "pointer",
          }}
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}
