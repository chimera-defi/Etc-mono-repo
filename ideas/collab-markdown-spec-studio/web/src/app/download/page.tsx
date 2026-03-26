import type { Metadata } from "next";
import Link from "next/link";

import styles from "../marketing.module.css";

export const metadata: Metadata = {
  title: "Download SpecForge",
  description: "Run SpecForge locally — no account required.",
};

const channels = [
  {
    title: "Run it locally today",
    summary:
      "Best for design partners and power users who want multiplayer plus local Codex or Claude assist right now.",
    bullets: [
      "Works with the current Bun-based local stack",
      "Supports local Codex CLI and Claude Code CLI reuse",
      "Matches the current verified alpha path",
    ],
  },
  {
    title: "Desktop app next",
    summary:
      "Tauri packaging is the next distribution track so people can install SpecForge as a desktop product instead of manually starting services.",
    bullets: [
      "Tauri shell around the existing local product",
      "Supervised local web and collab sidecars",
      "Same local assist model, cleaner onboarding",
    ],
  },
  {
    title: "Hosted pilot after that",
    summary:
      "Hosted SaaS stays on the roadmap for teams that want shared workspaces without running anything locally.",
    bullets: [
      "Remote collaboration and persistence",
      "Workspace-managed credentials or hosted assist",
      "Hybrid local bridge possible later for CLI reuse",
    ],
  },
];

export default function DownloadPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.brand}>SpecForge</div>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/workspace" className={styles.navLink}>
            Open workspace
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Get SpecForge</p>
          <h1>Run SpecForge locally</h1>
          <p className={styles.subhead}>
            No account. No cloud. Your specs stay on your machine. The fastest way to try
            SpecForge is the local Bun path below; a Tauri desktop app that wraps the same
            working core is coming next.
          </p>
          <div className={styles.heroActions}>
            <Link href="/workspace" className={styles.primaryCta}>
              Open workspace
            </Link>
            <a href="#quick-start" className={styles.secondaryCta}>
              Quick start
            </a>
          </div>
        </div>

        <aside className={styles.heroPanel}>
          <h2>Distribution plan</h2>
          <div className={styles.metricRow}>
            <div className={styles.metric}>
              <strong>Now</strong>
              <span>Local Bun alpha</span>
            </div>
            <div className={styles.metric}>
              <strong>Next</strong>
              <span>Tauri desktop shell</span>
            </div>
            <div className={styles.metric}>
              <strong>Later</strong>
              <span>Hosted pilot</span>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.section} id="quick-start">
        <h2>Quick start</h2>
        <p className={styles.sectionLead}>
          Clone, install, and open the workspace in under a minute.
        </p>
        <div className={styles.codeBlock}>
          <pre>{`# 1. Clone and install
git clone https://github.com/chimera-defi/Etc-mono-repo
cd Etc-mono-repo/ideas/collab-markdown-spec-studio/web
bun install

# 2. Start the web app
bun run dev

# 3. Open the workspace
open http://localhost:3000/workspace`}</pre>
        </div>
        <p className={styles.sectionLead}>
          Requires{" "}
          <a href="https://bun.sh" target="_blank" rel="noreferrer">
            Bun
          </a>
          . No database setup needed — SpecForge uses embedded PGlite.
        </p>
      </section>

      <section className={styles.section}>
        <h2>With multiplayer</h2>
        <p className={styles.sectionLead}>
          Start the collab server alongside the web app for live collaboration via WebSocket.
        </p>
        <div className={styles.codeBlock}>
          <pre>{`# In a second terminal
cd ../collab-server && bun run dev
# Opens a WebSocket room at ws://localhost:4321`}</pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>AI assist (optional)</h2>
        <p className={styles.sectionLead}>
          SpecForge uses your local Claude Code CLI or Codex CLI for guided spec suggestions.
          Install either one to enable AI-powered field population.
        </p>
        <div className={styles.codeBlock}>
          <pre>{`# Claude Code
npm install -g @anthropic-ai/claude-code

# Or Codex
npm install -g @openai/codex`}</pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>How we will distribute it</h2>
        <div className={styles.sectionGrid}>
          {channels.map((channel) => (
            <article className={styles.featureCard} key={channel.title}>
              <strong>{channel.title}</strong>
              <p>{channel.summary}</p>
              <ul className={styles.cardList}>
                {channel.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.callout}>
          <strong>Desktop app — coming soon</strong>
          <p>
            A Tauri-based desktop app that starts all services automatically is in early
            development. No terminal required. Star the repo to follow progress.
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>SpecForge &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
