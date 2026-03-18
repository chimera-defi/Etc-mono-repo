import Link from "next/link";

import styles from "../marketing.module.css";

export default function PricingPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.brand}>SpecForge</div>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/workspace" className={styles.navLink}>
            Workspace
          </Link>
        </div>
      </nav>

      <section className={styles.section}>
        <p className={styles.eyebrow}>Pricing</p>
        <h1>Start with the spec. Pay for collaboration and delivery depth.</h1>
        <p className={styles.sectionLead}>
          The current price points are positioning defaults for the SaaS motion, not a finished
          billing implementation.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.pricingGrid}>
          <article className={styles.pricingCard}>
            <strong>Local / OSS</strong>
            <p className={styles.price}>Free</p>
            <p>Run the workspace locally or self-host it for internal experimentation.</p>
            <ul>
              <li>Workspace app + collab server</li>
              <li>Local admin tools</li>
              <li>Bring your own operator workflow</li>
            </ul>
          </article>

          <article className={`${styles.pricingCard} ${styles.featured}`}>
            <strong>Team SaaS</strong>
            <p className={styles.price}>
              $40 <span>/ seat / month</span>
            </p>
            <p>For product and engineering pods that want a managed multiplayer spec workspace.</p>
            <ul>
              <li>Hosted collaboration and persistence</li>
              <li>Governed agent review workflow</li>
              <li>Launch packet and starter handoff</li>
            </ul>
          </article>

          <article className={styles.pricingCard}>
            <strong>Enterprise</strong>
            <p className={styles.price}>Custom</p>
            <p>For larger teams that need stronger audit, tenancy, and operational controls.</p>
            <ul>
              <li>Advanced retention and governance</li>
              <li>SSO / compliance roadmap</li>
              <li>Dedicated support and rollout help</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <h2>How agents are billed</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>Seat baseline</strong>
            <p>Humans pay for the collaborative workspace and governance surface.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>Usage overlay</strong>
            <p>
              Agent execution should be metered separately through provider-backed usage credits or
              included quotas.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>Credential model</strong>
            <p>
              Hosted workspaces should store provider keys server-side and issue workspace-scoped
              service identities to agents.
            </p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>
          This page is a product/pricing framing surface for review. Actual billing and plan
          enforcement remain post-parity SaaS work.
        </p>
      </footer>
    </main>
  );
}
