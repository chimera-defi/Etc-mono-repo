"use client";

import { useEffect, useState } from "react";

interface OpsIncident {
  type: string;
  message: string;
  severity: "warning" | "error" | "info";
}

interface BackupEntry {
  id: string;
  created_at: string;
  size_kb?: number;
}

export function OpsStatusPanel() {
  const [incidents, setIncidents] = useState<OpsIncident[]>([]);
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/ops/incidents")
        .then((r) => r.json())
        .catch(() => ({ data: { incidents: [] } })),
      fetch("/api/ops/backups")
        .then((r) => r.json())
        .catch(() => ({ data: { backups: [] } })),
    ]).then(([incData, backData]) => {
      setIncidents(incData?.data?.incidents ?? []);
      setBackups(backData?.data?.backups ?? []);
    });
  }, []);

  const hasIssues = incidents.some(
    (i) => i.severity === "error" || i.severity === "warning",
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium bg-muted/40 hover:bg-muted transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {hasIssues && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          )}
          Ops
        </span>
        <span className="text-muted-foreground">{open ? "\u25B2" : "\u25BC"}</span>
      </button>
      {open && (
        <div className="p-3 space-y-3 text-xs">
          {incidents.length === 0 ? (
            <p className="text-muted-foreground">No active incidents</p>
          ) : (
            incidents.map((inc, i) => (
              <div
                key={i}
                className={`p-2 rounded text-xs ${
                  inc.severity === "error"
                    ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
                    : inc.severity === "warning"
                      ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {inc.message}
              </div>
            ))
          )}
          <div className="border-t border-border pt-2">
            <p className="text-muted-foreground mb-1">
              Backups ({backups.length})
            </p>
            {backups.slice(0, 3).map((b, i) => (
              <div
                key={i}
                className="flex justify-between text-muted-foreground"
              >
                <span>{new Date(b.created_at).toLocaleDateString()}</span>
                {b.size_kb && <span>{b.size_kb}KB</span>}
              </div>
            ))}
            {backups.length === 0 && (
              <p className="text-muted-foreground">No backups yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
