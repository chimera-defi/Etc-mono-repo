"use client";

import { useState } from "react";

import styles from "./page.module.css";

type Props = {
  shareUrl: string;
  documentTitle?: string | null;
  workspaceName?: string | null;
  requiresMembership: boolean;
};

function buildInviteNote({
  shareUrl,
  documentTitle,
  workspaceName,
  requiresMembership,
}: Props) {
  const target = documentTitle ? `"${documentTitle}"` : "this spec";
  const workspaceLabel = workspaceName ? ` in ${workspaceName}` : "";
  const accessNote = requiresMembership
    ? "You will need GitHub sign-in and workspace membership before the link opens."
    : "Local demo access still uses the current workspace actor/session.";

  return [
    `Join me in SpecForge${workspaceLabel}.`,
    `I am sharing ${target} so you can review the same multiplayer spec state.`,
    shareUrl,
    accessNote,
  ].join("\n");
}

export function ShareDocumentPanel({
  shareUrl,
  documentTitle,
  workspaceName,
  requiresMembership,
}: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [inviteState, setInviteState] = useState<"idle" | "copied" | "failed">("idle");

  async function copyShareUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  async function copyInviteNote() {
    try {
      await navigator.clipboard.writeText(
        buildInviteNote({ shareUrl, documentTitle, workspaceName, requiresMembership }),
      );
      setInviteState("copied");
    } catch {
      setInviteState("failed");
    }
  }

  return (
    <div className={styles.disclosureBody}>
      <p className={styles.context}>
        Share the canonical workspace URL for {documentTitle ? <strong>{documentTitle}</strong> : "the active spec"}.
        Recipients will land on the same multiplayer document state you are reviewing.
      </p>
      <div className={styles.shareRow}>
        <input
          readOnly
          value={shareUrl}
          className={styles.shareInput}
          aria-label="Share URL"
          data-testid="share-url-input"
        />
        <button type="button" onClick={copyShareUrl}>
          {copyState === "copied" ? "Copied" : "Copy share URL"}
        </button>
      </div>
      <div className={styles.shareRow}>
        <button type="button" onClick={copyInviteNote} data-testid="copy-invite-note">
          {inviteState === "copied" ? "Invite copied" : "Copy invite note"}
        </button>
      </div>
      <div className={styles.actorCard} data-testid="share-access-note">
        <strong>{requiresMembership ? "Access is membership-gated" : "Local demo access"}</strong>
        <span>
          {requiresMembership
            ? "Team members still need GitHub sign-in and workspace membership. Add them below, then send this link."
            : "Local demo mode keeps the same URL shape, but access is controlled by the local workspace actor/session."}
        </span>
      </div>
      {copyState === "failed" || inviteState === "failed" ? (
        <p className={styles.context}>
          Clipboard access failed. Copy the share URL manually from the field above.
        </p>
      ) : null}
    </div>
  );
}
