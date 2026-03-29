"use client";

/**
 * ClarificationQueue
 *
 * Client component that displays unanswered clarifications grouped by priority
 * and provides inline answer inputs. Answered clarifications are shown collapsed.
 *
 * Uses the clarifications API for CRUD operations.
 */

import { useCallback, useState } from "react";

import type { ClarificationRecord } from "@/lib/specforge/store";

type ClarificationQueueProps = {
  documentId: string;
  initialClarifications: ClarificationRecord[];
};

type Priority = "critical" | "normal" | "optional";

const priorityLabels: Record<Priority, string> = {
  critical: "Critical",
  normal: "Normal",
  optional: "Optional",
};

const priorityOrder: Priority[] = ["critical", "normal", "optional"];

function groupByPriority(
  items: ClarificationRecord[],
): Record<Priority, ClarificationRecord[]> {
  const groups: Record<Priority, ClarificationRecord[]> = {
    critical: [],
    normal: [],
    optional: [],
  };

  for (const item of items) {
    const priority = (item.priority ?? "normal") as Priority;
    groups[priority].push(item);
  }

  return groups;
}

export function ClarificationQueue({
  documentId,
  initialClarifications,
}: ClarificationQueueProps) {
  const [clarifications, setClarifications] =
    useState<ClarificationRecord[]>(initialClarifications);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [showAnswered, setShowAnswered] = useState(false);

  const unanswered = clarifications.filter((c) => c.status === "open");
  const answered = clarifications.filter((c) => c.status === "answered");
  const grouped = groupByPriority(unanswered);

  const handleDraftChange = useCallback(
    (clarificationId: string, value: string) => {
      setAnswerDrafts((prev) => ({ ...prev, [clarificationId]: value }));
    },
    [],
  );

  const handleSubmitAnswer = useCallback(
    async (clarificationId: string) => {
      const answer = answerDrafts[clarificationId]?.trim();
      if (!answer) return;

      setSubmitting(clarificationId);

      try {
        const res = await fetch(
          `/api/documents/${documentId}/clarifications?clarification_id=${clarificationId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answer }),
          },
        );

        if (!res.ok) return;

        // Refresh clarification list
        const listRes = await fetch(
          `/api/documents/${documentId}/clarifications`,
        );
        if (listRes.ok) {
          const data = await listRes.json();
          setClarifications(data.clarifications ?? []);
        }

        setAnswerDrafts((prev) => {
          const next = { ...prev };
          delete next[clarificationId];
          return next;
        });
      } finally {
        setSubmitting(null);
      }
    },
    [documentId, answerDrafts],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>
          Clarifications{" "}
          <span style={{ fontWeight: "normal", opacity: 0.7 }}>
            ({unanswered.length} open)
          </span>
        </h3>
      </div>

      {unanswered.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No unanswered clarifications.</p>
      ) : (
        priorityOrder.map((priority) => {
          const items = grouped[priority];
          if (items.length === 0) return null;

          return (
            <div key={priority}>
              <h4
                style={{
                  margin: "0.5rem 0",
                  color:
                    priority === "critical"
                      ? "var(--color-danger, #dc2626)"
                      : priority === "optional"
                        ? "var(--color-muted, #6b7280)"
                        : "inherit",
                }}
              >
                {priorityLabels[priority]} ({items.length})
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map((item) => (
                  <li
                    key={item.clarification_id}
                    style={{
                      border: "1px solid var(--border-color, #e5e7eb)",
                      borderRadius: "0.375rem",
                      padding: "0.75rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <strong>{item.section_heading}</strong>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          opacity: 0.6,
                        }}
                      >
                        {item.created_by.actor_type}:{item.created_by.actor_id}
                      </span>
                    </div>
                    <p style={{ margin: "0.25rem 0" }}>{item.question}</p>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <textarea
                        rows={2}
                        placeholder="Write the accepted clarification..."
                        value={answerDrafts[item.clarification_id] ?? ""}
                        onChange={(e) =>
                          handleDraftChange(
                            item.clarification_id,
                            e.target.value,
                          )
                        }
                        disabled={submitting === item.clarification_id}
                        style={{ flex: 1, resize: "vertical" }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleSubmitAnswer(item.clarification_id)
                        }
                        disabled={
                          submitting === item.clarification_id ||
                          !answerDrafts[item.clarification_id]?.trim()
                        }
                      >
                        {submitting === item.clarification_id
                          ? "Saving..."
                          : "Answer"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}

      {answered.length > 0 && (
        <details open={showAnswered} onToggle={(e) => setShowAnswered((e.target as HTMLDetailsElement).open)}>
          <summary style={{ cursor: "pointer", opacity: 0.7 }}>
            {answered.length} answered clarification
            {answered.length !== 1 ? "s" : ""}
          </summary>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem" }}>
            {answered.map((item) => (
              <li
                key={item.clarification_id}
                style={{
                  border: "1px solid var(--border-color, #e5e7eb)",
                  borderRadius: "0.375rem",
                  padding: "0.75rem",
                  marginBottom: "0.5rem",
                  opacity: 0.7,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <strong>{item.section_heading}</strong>
                  <span style={{ fontSize: "0.75rem" }}>answered</span>
                </div>
                <p style={{ margin: "0.25rem 0" }}>{item.question}</p>
                {item.answer_text && (
                  <p
                    style={{
                      margin: "0.25rem 0",
                      fontStyle: "italic",
                      borderLeft: "2px solid var(--border-color, #e5e7eb)",
                      paddingLeft: "0.5rem",
                    }}
                  >
                    {item.answer_text}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
