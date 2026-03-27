"use client";

import { useState } from "react";

import styles from "../page.module.css";

type FeedbackSection = "ux-pack" | "design-system" | "general";

type Props = {
  uxPack: string;
  designSystem: string | null;
  reviewChecklist: string[];
  prompt: string;
  documentId: string | null;
  pendingDesignPatches?: number;
};

export function DesignHandoffPanel({ uxPack, designSystem, reviewChecklist, prompt, documentId, pendingDesignPatches = 0 }: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [uxState, setUxState] = useState<"idle" | "copied" | "failed">("idle");
  const [feedback, setFeedback] = useState("");
  const [feedbackSection, setFeedbackSection] = useState<FeedbackSection>("ux-pack");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  async function copyUxPack() {
    try {
      await navigator.clipboard.writeText(uxPack);
      setUxState("copied");
    } catch {
      setUxState("failed");
    }
  }

  async function submitFeedback() {
    if (!documentId || !feedback.trim()) return;

    setSubmitting(true);
    setFeedbackError(null);
    setSubmitted(null);

    try {
      const response = await fetch(`/api/documents/${documentId}/design-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedback.trim(), section: feedbackSection }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedbackError(data.error?.message ?? "Failed to submit feedback");
        return;
      }

      setSubmitted(data.patch_id);
      setFeedback("");
    } catch {
      setFeedbackError("Network error — could not submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  const sectionOptions: { value: FeedbackSection; label: string }[] = [
    { value: "ux-pack", label: "UX Pack" },
    { value: "design-system", label: "Design System" },
    { value: "general", label: "General" },
  ];

  return (
    <div className={styles.disclosureBody}>
      <p className={styles.context}>
        Keep design review in the same canonical document flow. Use the UX Pack below as the
        source of truth, then hand the prompt to a design-focused agent or partner reviewer.
      </p>
      {pendingDesignPatches > 0 ? (
        <p style={{ margin: "0 0 0.5rem" }}>
          <span className={`${styles.badge} ${styles.design}`}>
            {pendingDesignPatches} design review
          </span>
          {" "}patch{pendingDesignPatches === 1 ? "" : "es"} pending decision.
        </p>
      ) : null}
      <div className={styles.shareRow}>
        <button type="button" onClick={copyPrompt} data-testid="copy-design-handoff-prompt">
          {copyState === "copied" ? "Prompt copied" : "Copy design review prompt"}
        </button>
        <button type="button" onClick={copyUxPack} data-testid="copy-ux-pack">
          {uxState === "copied" ? "UX Pack copied" : "Copy UX Pack"}
        </button>
      </div>
      <div className={styles.exportGrid}>
        <article className={styles.exportCard}>
          <h3>UX Pack</h3>
          <pre data-testid="ux-pack-preview">
            {uxPack || "No UX Pack content found in the canonical spec yet."}
          </pre>
        </article>
        <article className={styles.exportCard}>
          <h3>Design review checklist</h3>
          <ul className={styles.readinessList}>
            {reviewChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
      {designSystem ? (
        <article className={styles.exportCard}>
          <h3>Design review outputs</h3>
          <pre data-testid="design-system-preview">{designSystem}</pre>
        </article>
      ) : null}
      <article className={styles.exportCard}>
        <h3>Design review prompt</h3>
        <pre data-testid="design-handoff-prompt-preview">{prompt}</pre>
      </article>
      {copyState === "failed" || uxState === "failed" ? (
        <p className={styles.context}>Clipboard access failed. Copy the text manually.</p>
      ) : null}

      {documentId ? (
        <article className={styles.exportCard} data-testid="design-feedback-section">
          <h3>Submit design feedback</h3>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>
            Send design feedback back as a governed patch proposal.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.5rem" }}>
            {sectionOptions.map((option) => (
              <label
                key={option.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.85rem",
                  color: "var(--foreground)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="feedback-section"
                  value={option.value}
                  checked={feedbackSection === option.value}
                  onChange={() => setFeedbackSection(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. The primary CTA should be more prominent..."
            maxLength={2000}
            rows={3}
            disabled={submitting}
            data-testid="design-feedback-textarea"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--muted)",
              color: "var(--foreground)",
              fontFamily: "inherit",
              fontSize: "0.85rem",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={submitFeedback}
              disabled={submitting || !feedback.trim()}
              data-testid="submit-design-feedback"
            >
              {submitting ? "Submitting..." : "Submit feedback"}
            </button>
            {submitted ? (
              <span
                style={{ color: "var(--foreground)", fontSize: "0.85rem" }}
                data-testid="design-feedback-success"
              >
                Feedback queued for review
              </span>
            ) : null}
            {feedbackError ? (
              <span
                style={{ color: "var(--destructive, #ef4444)", fontSize: "0.85rem" }}
                data-testid="design-feedback-error"
              >
                {feedbackError}
              </span>
            ) : null}
          </div>
        </article>
      ) : null}
    </div>
  );
}
