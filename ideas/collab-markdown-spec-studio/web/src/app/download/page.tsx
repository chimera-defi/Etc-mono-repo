import Link from "next/link";

import styles from "../marketing.module.css";

const installSteps = [
  "Install Bun plus either Codex CLI or Claude Code CLI if you want local assist.",
  "Run the SpecForge web app and collab server locally.",
  "Open the workspace, pick your assist runtime, and start drafting with friends.",
];

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
          <h1>Start with the local alpha now. Ship the desktop app next.</h1>
          <p className={styles.subhead}>
            SpecForge already runs as a verified local multiplayer product. The fastest way to try
            it today is the Bun-based local path; the next packaging step is a Tauri desktop app
            that wraps the same working core.
          </p>
          <div className={styles.heroActions}>
            <Link href="/workspace" className={styles.primaryCta}>
              Open workspace
            </Link>
            <a href="#install" className={styles.secondaryCta}>
              Local install steps
            </a>
          </div>
          <div className={styles.callout}>
            <strong>Current alpha truth</strong>
            <p>
              There is not a packaged desktop binary yet. The working release-candidate path is
              local Bun + the collab server, with local Codex or Claude CLI reuse if installed.
            </p>
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

      <section className={styles.section} id="install">
        <h2>Local alpha install</h2>
        <p className={styles.sectionLead}>
          This is the current recommended path for design partners and early users.
        </p>
        <ol className={styles.roleList}>
          {installSteps.map((step, index) => (
            <li className={styles.roleRow} key={step}>
              <span className={styles.roleLabel}>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <div className={styles.codeBlock}>
          <pre>{`bun install\nbun run dev\n# then open http://127.0.0.1:3000/workspace`}</pre>
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

      <footer className={styles.footer}>
        <p>SpecForge &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
