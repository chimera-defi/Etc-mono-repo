"use client";

/**
 * IterateWithAI
 *
 * Inline "Iterate with AI" button for any document block.
 * When expanded, lets the user type a message that is sent to the
 * section-level iterate API. The API calls Claude CLI (or heuristic
 * fallback) and creates a governed PatchProposal automatically.
 *
 * The user can then review/accept the patch in the decision queue.
 */

import { useCallback, useState } from "react";

type Props = {
  documentId: string;
  blockId: string;
  blockHeading: string;
  actorId: string;
  /** Link to the decision queue for this document */
  decideHref: string;
};

type IterationResult = {
  patch_id: string;
  block_id: string;
  proposed_content: string;
  tool: "claude_cli" | "heuristic";
};

export function IterateWithAI({
  documentId,
  blockId,
  blockHeading,
  actorId,
  decideHref,
}: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IterationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/documents/${documentId}/sections/${blockId}/iterate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            actor_id: actorId,
            actor_type: "human",
          }),
        },
      );

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data.result ?? data);
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [documentId, blockId, actorId, message, loading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      style={{
        marginTop: "0.5rem",
        borderTop: open ? "1px solid rgba(28,26,23,0.08)" : "none",
        paddingTop: open ? "0.75rem" : 0,
      }}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setResult(null);
          setError(null);
        }}
        style={{
          padding: "0.3rem 0.75rem",
          borderRadius: "999px",
          background: open ? "rgba(28,26,23,0.08)" : "transparent",
          color: "#1c1a17",
          border: "1px solid rgba(28,26,23,0.15)",
          cursor: "pointer",
          fontSize: "0.78rem",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
        }}
        title={`Iterate on section: ${blockHeading}`}
      >
        <span style={{ opacity: 0.7 }}>✦</span> Iterate with AI
      </button>

      {open ? (
        <div
          style={{
            marginTop: "0.65rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.78rem",
              opacity: 0.6,
            }}
          >
            Describe what to change in <strong>{blockHeading}</strong>. Claude will
            propose a patch — you review it in the decision queue.
          </p>

          {/* Chat input */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
            <textarea
              rows={3}
              placeholder="Make the success criteria more specific... (⌘↵ to send)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                flex: 1,
                resize: "vertical",
                padding: "0.55rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(28,26,23,0.15)",
                background: "rgba(255,251,246,0.9)",
                fontSize: "0.82rem",
                fontFamily: "inherit",
                minWidth: 0,
              }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !message.trim()}
              style={{
                padding: "0.55rem 0.9rem",
                borderRadius: "999px",
                background: loading || !message.trim() ? "rgba(28,26,23,0.15)" : "#1c1a17",
                color: loading || !message.trim() ? "#6b7280" : "#fffbf6",
                border: "none",
                cursor: loading || !message.trim() ? "not-allowed" : "pointer",
                fontSize: "0.82rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {loading ? "Thinking…" : "Send"}
            </button>
          </div>

          {/* Error */}
          {error ? (
            <p
              style={{
                margin: 0,
                fontSize: "0.8rem",
                color: "#dc2626",
                padding: "0.4rem 0.65rem",
                background: "rgba(220,38,38,0.06)",
                borderRadius: "6px",
              }}
            >
              {error}
            </p>
          ) : null}

          {/* Result */}
          {result ? (
            <div
              style={{
                padding: "0.75rem 0.9rem",
                background: "rgba(34,197,94,0.05)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong style={{ fontSize: "0.82rem" }}>Patch queued</strong>
                <span
                  style={{
                    fontSize: "0.72rem",
                    opacity: 0.55,
                    padding: "0.15rem 0.5rem",
                    border: "1px solid rgba(28,26,23,0.1)",
                    borderRadius: "999px",
                  }}
                >
                  {result.tool === "claude_cli" ? "Claude CLI" : "Heuristic"}
                </span>
              </div>
              <code
                style={{
                  fontSize: "0.72rem",
                  opacity: 0.6,
                  display: "block",
                }}
              >
                {result.patch_id}
              </code>
              <details>
                <summary
                  style={{
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    opacity: 0.7,
                    userSelect: "none",
                  }}
                >
                  Preview proposed content
                </summary>
                <pre
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.65rem",
                    background: "rgba(255,251,246,0.9)",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: "200px",
                    overflow: "auto",
                  }}
                >
                  {result.proposed_content}
                </pre>
              </details>
              <a
                href={decideHref}
                style={{
                  fontSize: "0.8rem",
                  color: "#1c1a17",
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                Review in decision queue →
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
