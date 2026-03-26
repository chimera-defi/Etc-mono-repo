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

      {/* Role table — alternating label / description rows, not a card grid */}
      <section className={styles.section}>
        <h2>Safe multiplayer, not collaborative chaos</h2>
        <p className={styles.sectionLead}>
          Every editor sees changes in real time. Agent suggestions arrive as patch proposals —
          not direct edits. You stay in control of what makes it into the canonical spec.
        </p>
        <ol className={styles.roleList}>
          <li className={styles.roleRow}>
            <span className={styles.roleLabel}>Human editing</span>
            <p>Humans edit the shared document directly with realtime presence and recovery.</p>
          </li>
          <li className={styles.roleRow}>
            <span className={styles.roleLabel}>Agent coauthoring</span>
            <p>Agents propose structural or requirement changes against stable blocks and versions.</p>
          </li>
          <li className={styles.roleRow}>
            <span className={styles.roleLabel}>Review gates</span>
            <p>Humans accept, reject, or cherry-pick patches before the canonical spec changes.</p>
          </li>
        </ol>
      </section>

      {/* Agent connection — plain-English modes, not jargon */}
      <section className={`${styles.section} ${styles.sectionDark}`}>
        <h2>Connect your AI agent</h2>
        <div className={styles.sectionGrid}>
          <div className={styles.featureCard}>
            <strong>Your own keys</strong>
            <p>
              Bring your Claude or Codex API key. Credentials stay server-side — never exposed
              to the browser.
            </p>
          </div>
          <div className={styles.featureCard}>
            <strong>Managed credentials</strong>
            <p>
              On hosted plans, agent credentials are stored encrypted and scoped to your
              workspace — no sharing tokens across teams.
            </p>
          </div>
          <div className={styles.featureCard}>
            <strong>Agents can only propose</strong>
            <p>
              No agent can rewrite the spec directly. Every suggestion goes through the patch
              queue — you accept, reject, or cherry-pick.
            </p>
          </div>
        </div>
      </section>

      {/* Numbered step list — horizontal with large step numbers, not cards */}
      <section className={styles.section}>
        <h2>Start with the product that ships</h2>
        <ol className={styles.stepList}>
          <li className={styles.stepItem}>
            <span className={styles.stepNum}>01</span>
            <strong>Shape the spec</strong>
            <ul>
              <li>Guided creation</li>
              <li>Comments and clarifications</li>
              <li>Readiness scoring</li>
            </ul>
          </li>
          <li className={styles.stepItem}>
            <span className={styles.stepNum}>02</span>
            <strong>Review agent work</strong>
            <ul>
              <li>Patch queue</li>
              <li>Diff and attribution</li>
              <li>Audit trail</li>
            </ul>
          </li>
          <li className={styles.stepItem}>
            <span className={styles.stepNum}>03</span>
            <strong>Launch the handoff</strong>
            <ul>
              <li>Deterministic export bundle</li>
              <li>Starter template output</li>
              <li>Execution brief + launch packet</li>
            </ul>
          </li>
        </ol>
      </section>

      <footer className={styles.footer}>
        <p>SpecForge &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
