import Link from "next/link";

import styles from "./marketing.module.css";
import { ThemeToggle } from "./theme-toggle";
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
          <Link href="/download" className={styles.navLink}>
            Download
          </Link>
          <Link href="/workspace" className={styles.navLink}>
            Open workspace
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{heroCopy.eyebrow}</p>
          <h1>{heroCopy.headline}</h1>
          <p className={styles.subhead}>{heroCopy.subhead}</p>
          <div className={styles.heroPicker}>
            <Link href="/workspace?stage=start" className={styles.pickerCard}>
              <span className={styles.pickerIcon}>✦</span>
              <span className={styles.pickerLabel}>Start new spec</span>
              <span className={styles.pickerDesc}>
                Guided creation — describe your idea and we generate the spec structure
              </span>
            </Link>
            <Link href="/workspace" className={styles.pickerCardSecondary}>
              <span className={styles.pickerIcon}>↗</span>
              <span className={styles.pickerLabel}>Open existing spec</span>
              <span className={styles.pickerDesc}>
                Return to your workspace and pick up where you left off
              </span>
            </Link>
          </div>
          <div className={styles.callout}>
            <strong>Current release candidate</strong>
            <p>
              SpecForge already works as a local multiplayer alpha. Desktop packaging is next,
              pricing comes after distribution and design-partner usage are clearer.
            </p>
          </div>
        </div>

        <aside className={styles.heroPanel}>
          <h2>Why it works</h2>
          <p>
            Agents do not silently edit the canonical spec. They propose patches. Humans review
            them. Accepted changes flow back into the shared document and final launch packet.
          </p>
          <dl className={styles.heroFacts}>
            <div className={styles.heroFact}>
              <dt>Shared canvas</dt>
              <dd>Humans and agents operate in one workflow.</dd>
            </div>
            <div className={styles.heroFact}>
              <dt>Governed patches</dt>
              <dd>No direct agent writes to the approved spec.</dd>
            </div>
            <div className={styles.heroFact}>
              <dt>Launch packet</dt>
              <dd>Export, starter handoff, and execution brief in one bundle.</dd>
            </div>
          </dl>
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

      {/* Agent connection — stacked list, not a card grid */}
      <section className={`${styles.section} ${styles.sectionDark}`}>
        <h2>Connect your AI agent</h2>
        <ol className={styles.roleList}>
          <li className={styles.roleRow}>
            <span className={styles.roleLabel}>Your own keys</span>
            <p>Bring your Claude or Codex API key. Credentials stay server-side — never exposed to the browser.</p>
          </li>
          <li className={styles.roleRow}>
            <span className={styles.roleLabel}>Managed credentials</span>
            <p>On hosted plans, agent credentials are stored encrypted and scoped to your workspace — no sharing tokens across teams.</p>
          </li>
          <li className={styles.roleRow}>
            <span className={styles.roleLabel}>Agents can only propose</span>
            <p>No agent can rewrite the spec directly. Every suggestion goes through the patch queue — you accept, reject, or cherry-pick.</p>
          </li>
        </ol>
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
