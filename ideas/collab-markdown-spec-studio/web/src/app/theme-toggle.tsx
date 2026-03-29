"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem("sf-theme");
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

function getSystemTheme(): Theme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("sf-theme", theme);
  } catch {}
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = getStoredTheme();
    const active = stored ?? getSystemTheme();
    setTheme(active);
    // Ensure the attribute matches (anti-flash script may have already set it)
    document.documentElement.setAttribute("data-theme", active);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2.25rem",
        height: "2.25rem",
        borderRadius: "999px",
        border: "1px solid var(--sf-border-mid)",
        background: "var(--sf-surface-card)",
        color: "var(--sf-ink)",
        cursor: "pointer",
        fontSize: "1rem",
        transition: "background 0.15s ease, border-color 0.15s ease",
        flexShrink: 0,
      }}
    >
      {theme === "dark" ? "☀" : "◑"}
    </button>
  );
}
