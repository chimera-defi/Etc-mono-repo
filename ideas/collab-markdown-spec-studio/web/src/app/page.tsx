import Link from "next/link";

import styles from "./marketing.module.css";
import { heroVariantOrder, heroVariants, type HeroVariant } from "@/lib/specforge/marketing";

type Props = {
  searchParams?: Promise<{
    variant?: string;
  }>;
};


export default async function LandingPage({ searchParams }: Props) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const heroVariant =
    typeof resolvedSearchParams.variant === "string" &&
    heroVariantOrder.includes(resolvedSearchParams.variant as HeroVariant)
      ? (resolvedSearchParams.variant as HeroVariant)
      : "handoff";
  const heroCopy = heroVariants[heroVariant];

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.brand}>SpecForge</div>
        <div className={styles.navLinks}>
          <Link href="/pricing" className={styles.navLink}>
            Pricing
          </Link>
          <Link href="/workspace" className={styles.navLink}>
            Open workspace
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{heroCopy.eyebrow}</p>
          <h1>{heroCopy.headline}</h1>
          <p className={styles.subhead}>{heroCopy.subhead}</p>
          <div className={styles.heroActions}>
            <Link href="/workspace" className={styles.primaryCta}>
              Launch workspace
            </Link>
            <Link href="/pricing" className={styles.secondaryCta}>
              See pricing
            </Link>
          </div>
        </div>

        <aside className={styles.heroPanel}>
          <h2>Why it works</h2>
          <p>
            Agents do not silently edit the canonical spec. They propose patches. Humans review
            them. Accepted changes flow back into the shared document and final launch packet.
          </p>
          <div className={styles.metricRow}>
            <div className={styles.metric}>
              <strong>Shared canvas</strong>
              <span>Humans and agents operate in one workflow.</span>
            </div>
            <div className={styles.metric}>
              <strong>Governed patches</strong>
              <span>No direct agent writes to the approved spec.</span>
            </div>
            <div className={styles.metric}>
              <strong>Launch packet</strong>
              <span>Export, starter handoff, and execution brief in one bundle.</span>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.section}>
        <h2>Safe multiplayer, not collaborative chaos</h2>
        <p className={styles.sectionLead}>
          Live collaboration is handled with Yjs and Hocuspocus. Agent work is layered on top as
          governed patch proposals, with signed room auth, server-derived identities, and audit
          events for every decision.
        </p>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <strong>Human editing</strong>
            <p>Humans edit the shared document directly with realtime presence and recovery.</p>
          </div>
          <div className={styles.card}>
            <strong>Agent coauthoring</strong>
            <p>Agents propose structural or requirement changes against stable blocks and versions.</p>
          </div>
          <div className={styles.card}>
            <strong>Review gates</strong>
            <p>Humans accept, reject, or cherry-pick patches before the canonical spec changes.</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>How agent configuration works</h2>
        <div className={styles.sectionGrid}>
          <div className={styles.featureCard}>
            <strong>Local mode</strong>
            <p>
              Operators can reuse existing server-side Codex CLI or Claude Code CLI logins for
              guided assist and delivery loops. Raw provider secrets still stay off the browser.
            </p>
          </div>
          <div className={styles.featureCard}>
            <strong>Hosted SaaS mode</strong>
            <p>
              Workspace-scoped provider credentials should live server-side, encrypted at rest, or
              be attached to managed agent identities instead of borrowed human sessions.
            </p>
          </div>
          <div className={styles.featureCard}>
            <strong>Safety model</strong>
            <p>
              Agent credentials enable patch generation and delivery-loop execution, not
              unrestricted document mutation. The review layer stays in front of canonical state.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Start with the product that ships</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <strong>1. Shape the spec</strong>
            <ul>
              <li>Guided creation</li>
              <li>Comments and clarifications</li>
              <li>Readiness scoring</li>
            </ul>
          </div>
          <div className={styles.card}>
            <strong>2. Review agent work</strong>
            <ul>
              <li>Patch queue</li>
              <li>Diff and attribution</li>
              <li>Audit trail</li>
            </ul>
          </div>
          <div className={styles.card}>
            <strong>3. Launch the handoff</strong>
            <ul>
              <li>Deterministic export bundle</li>
              <li>Starter template output</li>
              <li>Execution brief + launch packet</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>SpecForge &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
