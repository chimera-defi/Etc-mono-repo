"use client";

import { useState } from "react";

import styles from "../page.module.css";

type Props = {
  uxPack: string;
  designSystem: string | null;
  reviewChecklist: string[];
  prompt: string;
};

export function DesignHandoffPanel({ uxPack, designSystem, reviewChecklist, prompt }: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [uxState, setUxState] = useState<"idle" | "copied" | "failed">("idle");

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

  return (
    <div className={styles.disclosureBody}>
      <p className={styles.context}>
        Keep design review in the same canonical document flow. Use the UX Pack below as the
        source of truth, then hand the prompt to a design-focused agent or partner reviewer.
      </p>
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
    </div>
  );
}
