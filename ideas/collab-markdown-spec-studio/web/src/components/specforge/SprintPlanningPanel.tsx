"use client";

/**
 * SprintPlanningPanel
 *
 * Act 1 of the SpecForge two-act model. Walks the user (or team) through
 * 5 optional planning stages inspired by G-Stack:
 *   Discovery → CEO Review → Eng Review → Design Review → Security Review
 *
 * Each stage produces a governed PatchProposal targeting the relevant
 * document section. Stages can be skipped — skips are recorded in the
 * session for handoff.json provenance.
 */

import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Static stage definitions (mirrors STAGE_DEFINITIONS in plan-session.ts)
// ---------------------------------------------------------------------------

type QuestionDef = { key: string; prompt: string };

type StageDef = {
  name: string;
  label: string;
  description: string;
  questions: QuestionDef[];
};

const STAGE_DEFS: StageDef[] = [
  {
    name: "discovery",
    label: "Discovery",
    description: "Problem framing, user segments, and success signals.",
    questions: [
      {
        key: "problem",
        prompt: "What specific problem does this product solve? Be concrete about the pain.",
      },
      {
        key: "users",
        prompt: "Who are the 1-3 primary user segments? What is their job-to-be-done?",
      },
      {
        key: "success_signals",
        prompt:
          "How will you know the product succeeded in 6 months? List 2-3 measurable signals.",
      },
      {
        key: "anti_problems",
        prompt: "What adjacent problems are explicitly NOT in scope?",
      },
    ],
  },
  {
    name: "ceo-review",
    label: "CEO Review",
    description: "10-star product vision, scope hardening, and anti-goals.",
    questions: [
      {
        key: "vision",
        prompt:
          "If this product were a 10/10 experience — what would users say about it? Write the 10-star review.",
      },
      {
        key: "scope_hardening",
        prompt: "What must be true for v1 to ship? List the 3 non-negotiable scope items.",
      },
      {
        key: "anti_goals",
        prompt: "What are we explicitly NOT building? List 3-5 anti-goals to guard the team.",
      },
      {
        key: "competitive_insight",
        prompt: "What does this product do that no existing solution does well?",
      },
    ],
  },
  {
    name: "eng-review",
    label: "Engineering Review",
    description: "Architecture decisions, data flow, tech stack, and failure modes.",
    questions: [
      {
        key: "architecture",
        prompt:
          "Describe the high-level architecture in 3-5 sentences. What are the main components?",
      },
      {
        key: "data_flow",
        prompt: "Walk through the critical data flow for the primary user action.",
      },
      {
        key: "tech_stack",
        prompt:
          "What is the proposed tech stack and why? Call out any non-obvious choices.",
      },
      {
        key: "failure_modes",
        prompt:
          "What are the top 3 failure modes and how will the system handle each?",
      },
      {
        key: "test_matrix",
        prompt: "What are the must-have test scenarios? List 3-5 acceptance criteria.",
      },
    ],
  },
  {
    name: "design-review",
    label: "Design Review",
    description: "Design system constraints, interaction model, and accessibility.",
    questions: [
      {
        key: "design_principles",
        prompt: "What are the 2-3 core design principles for this product?",
      },
      {
        key: "interaction_model",
        prompt:
          "Describe the primary interaction pattern. How does the user move through the core flow?",
      },
      {
        key: "accessibility",
        prompt:
          "What accessibility requirements apply? (WCAG level, keyboard nav, screen reader support)",
      },
      {
        key: "design_constraints",
        prompt:
          "What existing design system, brand, or platform constraints must be respected?",
      },
    ],
  },
  {
    name: "security-review",
    label: "Security Review",
    description: "OWASP threat model, trust boundaries, and security requirements.",
    questions: [
      {
        key: "trust_boundaries",
        prompt: "Where are the trust boundaries? What data crosses them?",
      },
      {
        key: "threat_model",
        prompt: "List the top 3 threats (OWASP-aligned) relevant to this product.",
      },
      {
        key: "auth_model",
        prompt: "Describe the authentication and authorization model.",
      },
      {
        key: "sensitive_data",
        prompt:
          "What sensitive data is stored or processed? How is it protected?",
      },
      {
        key: "security_requirements",
        prompt:
          "List 3-5 non-functional security requirements (e.g., rate limiting, audit logging).",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Types (mirrors contracts.ts — kept lean to avoid server imports on client)
// ---------------------------------------------------------------------------

type StageStatus = "pending" | "completed" | "skipped";

type PlanStage = {
  stage_id: string;
  name: string;
  status: StageStatus;
  patch_id: string | null;
};

type PlanSession = {
  session_id: string;
  document_id: string;
  status: string;
  stages: PlanStage[];
};

type Props = {
  documentId: string;
  actorId: string;
  specWizardHref: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SprintPlanningPanel({ documentId, actorId, specWizardHref }: Props) {
  const [session, setSession] = useState<PlanSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Answers keyed by stage name → question key → answer text
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  // Which question we're on within the current stage (0-indexed)
  const [questionIdx, setQuestionIdx] = useState(0);
  // Patch IDs created during this session (to show a breadcrumb)
  const [createdPatches, setCreatedPatches] = useState<string[]>([]);

  // Load most recent session for this document on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/documents/${documentId}/plan-sessions`);
        if (!res.ok) return;
        const data = await res.json();
        const sessions: PlanSession[] = data.sessions ?? [];
        if (sessions.length > 0) {
          setSession(sessions[0]);
        }
      } catch {
        // Silently ignore — user can create a new session
      }
    }
    void load();
  }, [documentId]);

  // Derive active stage (first pending stage) from current session
  const activeStage = session?.stages.find((s) => s.status === "pending") ?? null;
  const activeStageDef = activeStage
    ? STAGE_DEFS.find((d) => d.name === activeStage.name)
    : null;
  const currentQuestion = activeStageDef?.questions[questionIdx] ?? null;
  const isLastQuestion =
    activeStageDef ? questionIdx === activeStageDef.questions.length - 1 : false;
  const allDone =
    session !== null &&
    session.stages.every((s) => s.status === "completed" || s.status === "skipped");

  const createSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/plan-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor_id: actorId, actor_type: "human" }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to create planning session");
      }
      const data = await res.json();
      setSession(data.session);
      setQuestionIdx(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [documentId, actorId]);

  const handleAnswer = useCallback(
    (stageName: string, questionKey: string, value: string) => {
      setAnswers((prev) => ({
        ...prev,
        [stageName]: { ...(prev[stageName] ?? {}), [questionKey]: value },
      }));
    },
    [],
  );

  const advanceQuestion = useCallback(() => {
    setQuestionIdx((i) => i + 1);
  }, []);

  const completeStage = useCallback(async () => {
    if (!session || !activeStage || !activeStageDef) return;
    setLoading(true);
    setError(null);
    try {
      const stageAnswers = answers[activeStage.name] ?? {};
      const res = await fetch(
        `/api/documents/${documentId}/plan-sessions/${session.session_id}/advance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage_name: activeStage.name,
            answers: stageAnswers,
            actor_id: actorId,
            actor_type: "human",
          }),
        },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to complete stage");
      }
      const data = await res.json();
      setSession(data.session);
      if (data.patchId) {
        setCreatedPatches((prev) => [...prev, data.patchId]);
      }
      setQuestionIdx(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [session, activeStage, activeStageDef, answers, documentId, actorId]);

  const skipStage = useCallback(async () => {
    if (!session || !activeStage) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/documents/${documentId}/plan-sessions/${session.session_id}/skip-stage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage_name: activeStage.name, actor_id: actorId }),
        },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to skip stage");
      }
      const data = await res.json();
      setSession(data.session);
      setQuestionIdx(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [session, activeStage, documentId, actorId]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function stageStatusIcon(status: StageStatus) {
    if (status === "completed") return "✓";
    if (status === "skipped") return "⊘";
    return "○";
  }

  function stageStatusColor(status: StageStatus) {
    if (status === "completed") return "#22c55e";
    if (status === "skipped") return "#94a3b8";
    return "#94a3b8";
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Stage tracker */}
      {session ? (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {session.stages.map((stage, idx) => {
            const def = STAGE_DEFS[idx];
            const isActive = stage.name === activeStage?.name;
            return (
              <div
                key={stage.stage_id || stage.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.3rem 0.65rem",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? "rgba(28,26,23,0.08)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(28,26,23,0.2)" : "rgba(28,26,23,0.08)"}`,
                  color: isActive ? "#1c1a17" : "#6b7280",
                }}
              >
                <span style={{ color: stageStatusColor(stage.status) }}>
                  {stageStatusIcon(stage.status)}
                </span>
                {def?.label ?? stage.name}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* No session yet */}
      {!session && !loading ? (
        <div
          style={{
            padding: "1.5rem",
            background: "rgba(239,228,213,0.4)",
            borderRadius: "12px",
            border: "1px solid rgba(28,26,23,0.08)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.9rem",
              opacity: 0.75,
            }}
          >
            Run through 5 optional planning stages before writing the spec — or skip straight
            to the spec wizard below.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              type="button"
              onClick={createSession}
              style={{
                padding: "0.55rem 1.2rem",
                borderRadius: "999px",
                background: "#1c1a17",
                color: "#fffbf6",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Start Sprint Planning
            </button>
            <a
              href={specWizardHref}
              style={{
                padding: "0.55rem 1.2rem",
                borderRadius: "999px",
                background: "transparent",
                color: "#1c1a17",
                border: "1px solid rgba(28,26,23,0.2)",
                cursor: "pointer",
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              Skip to Spec Wizard
            </a>
          </div>
        </div>
      ) : null}

      {/* Loading */}
      {loading ? (
        <p style={{ opacity: 0.6, fontSize: "0.875rem" }}>Working...</p>
      ) : null}

      {/* Error */}
      {error ? (
        <p
          style={{
            color: "#dc2626",
            fontSize: "0.875rem",
            padding: "0.5rem 0.75rem",
            background: "rgba(220,38,38,0.06)",
            borderRadius: "8px",
          }}
        >
          {error}
        </p>
      ) : null}

      {/* All done */}
      {allDone && session ? (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "12px",
          }}
        >
          <p
            style={{
              margin: "0 0 0.75rem",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Planning complete!
          </p>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", opacity: 0.75 }}>
            {session.stages.filter((s) => s.status === "completed").length} stages completed,{" "}
            {session.stages.filter((s) => s.status === "skipped").length} skipped.{" "}
            {createdPatches.length > 0 ? (
              <>
                {createdPatches.length} patch proposal
                {createdPatches.length === 1 ? "" : "s"} queued in the decision queue.
              </>
            ) : null}
          </p>
          <a
            href={specWizardHref}
            style={{
              display: "inline-block",
              padding: "0.55rem 1.2rem",
              borderRadius: "999px",
              background: "#1c1a17",
              color: "#fffbf6",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Continue to Spec Wizard
          </a>
        </div>
      ) : null}

      {/* Active stage Q&A */}
      {session && activeStage && activeStageDef && currentQuestion && !loading ? (
        <div
          style={{
            border: "1px solid rgba(28,26,23,0.12)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Stage header */}
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "rgba(239,228,213,0.5)",
              borderBottom: "1px solid rgba(28,26,23,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <strong style={{ fontSize: "0.95rem" }}>{activeStageDef.label}</strong>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.8rem", opacity: 0.7 }}>
                  {activeStageDef.description}
                </p>
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.55,
                  whiteSpace: "nowrap",
                  marginLeft: "1rem",
                }}
              >
                {questionIdx + 1} / {activeStageDef.questions.length}
              </span>
            </div>
          </div>

          {/* Question body */}
          <div style={{ padding: "1.25rem" }}>
            <label
              htmlFor={`q-${currentQuestion.key}`}
              style={{
                display: "block",
                fontWeight: 500,
                fontSize: "0.9rem",
                marginBottom: "0.65rem",
                lineHeight: 1.4,
              }}
            >
              {currentQuestion.prompt}
            </label>
            <textarea
              id={`q-${currentQuestion.key}`}
              rows={4}
              placeholder="Your answer..."
              value={answers[activeStage.name]?.[currentQuestion.key] ?? ""}
              onChange={(e) =>
                handleAnswer(activeStage.name, currentQuestion.key, e.target.value)
              }
              style={{
                width: "100%",
                resize: "vertical",
                padding: "0.65rem 0.85rem",
                borderRadius: "8px",
                border: "1px solid rgba(28,26,23,0.15)",
                background: "rgba(255,251,246,0.9)",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "0.65rem",
                marginTop: "0.85rem",
                flexWrap: "wrap",
              }}
            >
              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={completeStage}
                  disabled={loading}
                  style={{
                    padding: "0.5rem 1.1rem",
                    borderRadius: "999px",
                    background: "#1c1a17",
                    color: "#fffbf6",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  Complete {activeStageDef.label}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={advanceQuestion}
                  style={{
                    padding: "0.5rem 1.1rem",
                    borderRadius: "999px",
                    background: "#1c1a17",
                    color: "#fffbf6",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  Next Question
                </button>
              )}
              <button
                type="button"
                onClick={skipStage}
                disabled={loading}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "999px",
                  background: "transparent",
                  color: "#6b7280",
                  border: "1px solid rgba(28,26,23,0.12)",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Skip this stage
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Patches created breadcrumb */}
      {createdPatches.length > 0 ? (
        <p
          style={{
            fontSize: "0.78rem",
            opacity: 0.6,
            margin: 0,
          }}
        >
          Patch proposals queued:{" "}
          {createdPatches.map((id) => (
            <code key={id} style={{ marginRight: "0.35rem" }}>
              {id.slice(0, 12)}…
            </code>
          ))}
          — review them in the{" "}
          <a href="?stage=decide" style={{ color: "inherit" }}>
            decision queue
          </a>
          .
        </p>
      ) : null}
    </div>
  );
}
