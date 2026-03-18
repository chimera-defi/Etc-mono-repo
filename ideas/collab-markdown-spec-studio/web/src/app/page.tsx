import Link from "next/link";

import styles from "./marketing.module.css";

type HeroVariant = "handoff" | "multiplayer" | "ship";

type Props = {
  searchParams?: Promise<{
    variant?: string;
  }>;
};

const heroVariantOrder: HeroVariant[] = ["handoff", "multiplayer", "ship"];
const heroVariants: Record<HeroVariant, { eyebrow: string; headline: string; subhead: string }> = {
  handoff: {
    eyebrow: "Multiplayer specs for one-shot builds",
    headline: "Write the spec once. Let humans and agents build from the same canvas.",
    subhead:
      "SpecForge is a collaborative spec IDE for teams that want governed agent work, attributable changes, and a cleaner path from idea to runnable product.",
  },
  multiplayer: {
    eyebrow: "One canvas for humans and agents",
    headline: "Collaborative spec writing that stays reviewable and build-ready.",
    subhead:
      "Humans edit live, agents propose patches, and the final handoff stays attributable enough to trust.",
  },
  ship: {
    eyebrow: "Specs that keep moving",
    headline: "Turn messy planning into a launch packet a coding agent can actually use.",
    subhead:
      "Guide the spec, review agent work, and hand off one coherent bundle instead of a pile of pasted context.",
  },
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
              Operators run SpecForge locally and keep provider/API credentials in server-side env
              config. Nothing sensitive is stored in the browser.
            </p>
          </div>
          <div className={styles.featureCard}>
            <strong>Hosted SaaS mode</strong>
            <p>
              Workspace-scoped provider credentials should live server-side, encrypted at rest,
              with agents represented as service identities instead of borrowed human sessions.
            </p>
          </div>
          <div className={styles.featureCard}>
            <strong>Safety model</strong>
            <p>
              Agent credentials enable patch proposal generation and delivery-loop execution, not
              unrestricted document mutation. The review layer stays in front of the canonical spec.
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
        <p>
          Current home surface: workspace-first product shell. Dedicated marketing landing and
          commercial onboarding remain post-parity SaaS work.
        </p>
      </footer>
    </main>
  );
}
