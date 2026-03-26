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
      if (cliData?.data) setCli(cliData.data);
      setHealth({
        web: healthData?.status === "ok",
        collab: !!collabOk,
      });
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  const dot = (ok: boolean) => (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-1.5 ${ok ? "bg-green-500" : "bg-red-400"}`}
    />
  );

  return (
    <div className="border border-border rounded-lg p-3 text-xs space-y-2 bg-muted/40">
      <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px]">
        Runtime
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Web app</span>
          <span className="flex items-center">
            {dot(health?.web ?? false)}
            {health?.web ? "running" : "offline"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Collab server</span>
          <span className="flex items-center">
            {dot(health?.collab ?? false)}
            {health?.collab ? "running" : "offline"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">AI assist</span>
          <span className="flex items-center">
            {dot(cli?.preferredTool !== "heuristic")}
            {cli?.preferredTool === "heuristic"
              ? "heuristic only"
              : cli?.preferredTool ?? "detecting\u2026"}
          </span>
        </div>
      </div>
      {cli?.preferredTool === "heuristic" && (
        <p className="text-amber-600 dark:text-amber-400 text-[10px] leading-snug">
          {cli.reason}
        </p>
      )}
    </div>
  );
}
