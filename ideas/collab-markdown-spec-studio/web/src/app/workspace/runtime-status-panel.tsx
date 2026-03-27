"use client";

import { useEffect, useState } from "react";

interface RuntimeStatus {
  codexAvailable: boolean;
  claudeAvailable: boolean;
  preferredTool: "codex" | "claude" | "heuristic";
  reason: string;
}

interface ServiceHealth {
  web: boolean;
  collab: boolean;
}

const panelStyle: React.CSSProperties = {
  border: "1px solid var(--sf-border-mid)",
  borderRadius: "0.85rem",
  padding: "0.6rem 0.75rem",
  fontSize: "0.72rem",
  display: "grid",
  gap: "0.5rem",
  background: "var(--sf-surface-panel)",
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "var(--sf-muted-mid)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontSize: "0.66rem",
};

const dlStyle: React.CSSProperties = {
  display: "grid",
  gap: "0.35rem",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const dtStyle: React.CSSProperties = {
  flex: 1,
  color: "var(--sf-muted-warm)",
};

const ddStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontWeight: 600,
  color: "var(--sf-ink-warm)",
};

const hintStyle: React.CSSProperties = {
  fontSize: "0.66rem",
  lineHeight: 1.4,
  color: "var(--sf-amber)",
};

const downloadStyle: React.CSSProperties = {
  display: "block",
  textAlign: "center",
  fontSize: "0.66rem",
  color: "var(--sf-muted-mid)",
  padding: "0.3rem 0",
  border: "1px solid var(--sf-border)",
  borderRadius: "0.5rem",
  textDecoration: "none",
  marginTop: "0.15rem",
  transition: "color 0.15s ease, border-color 0.15s ease",
};

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "0.5rem",
        height: "0.5rem",
        borderRadius: "999px",
        flexShrink: 0,
        background: ok ? "var(--sf-success)" : "var(--sf-danger)",
        boxShadow: ok
          ? "0 0 0 2px var(--sf-success-faint)"
          : "0 0 0 2px var(--sf-danger-faint)",
      }}
    />
  );
}

export function RuntimeStatusPanel() {
  const [cli, setCli] = useState<RuntimeStatus | null>(null);
  const [health, setHealth] = useState<ServiceHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/agent/assist/diagnostics")
        .then((r) => r.json())
        .catch(() => null),
      fetch("/api/health")
        .then((r) => r.json())
        .catch(() => null),
      fetch("http://127.0.0.1:4322/health", {
        signal: AbortSignal.timeout(2000),
      })
        .then((r) => r.ok)
        .catch(() => false),
    ]).then(([cliData, healthData, collabOk]) => {
      if (cliData?.ok) setCli(cliData as RuntimeStatus);
      setHealth({
        web: healthData?.status === "ok",
        collab: !!collabOk,
      });
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return (
    <div style={panelStyle}>
      <p style={labelStyle}>Runtime</p>
      <dl style={dlStyle}>
        <div style={rowStyle}>
          <dt style={dtStyle}>Web app</dt>
          <dd style={ddStyle}>
            <StatusDot ok={health?.web ?? false} />
            {health?.web ? "running" : "offline"}
          </dd>
        </div>
        <div style={rowStyle}>
          <dt style={dtStyle}>Collab server</dt>
          <dd style={ddStyle}>
            <StatusDot ok={health?.collab ?? false} />
            {health?.collab ? "running" : "offline"}
          </dd>
        </div>
        <div style={rowStyle}>
          <dt style={dtStyle}>AI assist</dt>
          <dd style={ddStyle}>
            <StatusDot ok={cli?.preferredTool !== "heuristic"} />
            {cli?.preferredTool === "heuristic"
              ? "heuristic only"
              : cli?.preferredTool ?? "detecting\u2026"}
          </dd>
        </div>
      </dl>
      {cli?.preferredTool === "heuristic" && (
        <p style={hintStyle}>{cli.reason}</p>
      )}
      <a
        href="/api/ops/diagnostics-pack"
        download
        style={downloadStyle}
      >
        Download diagnostics
      </a>
    </div>
  );
}
