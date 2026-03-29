import Link from "next/link";

import styles from "../marketing.module.css";
import {
  formatWorkspacePlanSeatPrice,
  listWorkspacePlans,
} from "@/lib/specforge/plans";

export default function PricingPage() {
  const plans = listWorkspacePlans();

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
          One seat covers real-time collaboration, governed agent patch review, and the full
          launch-packet export — everything from the first draft to the final handoff bundle.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.pricingGrid}>
          {plans.map((plan) => (
            <article
              key={plan.plan}
              className={`${styles.pricingCard} ${plan.plan === "pilot" ? styles.featured : ""}`}
            >
              <strong>{plan.label}</strong>
              <p className={styles.price}>
                {formatWorkspacePlanSeatPrice(plan)}
                {plan.seatPriceMonthlyUsd === null ? null : <span>/ seat / month</span>}
              </p>
              <p>{plan.summary}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>How we compare</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>Notion</strong>
            <p>Public pricing currently lists Plus at $10 and Business at $20 per member.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>Linear</strong>
            <p>Public pricing currently lists Basic at $10 and Business at $16 per user.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>Confluence</strong>
            <p>Public pricing keeps an enterprise sales motion, with Premium listed at $10.44.</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Common questions</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>What counts as a seat?</strong>
            <p>
              One seat = one team member with write access to the workspace. Read-only reviewers
              do not count toward your seat total.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>What are AI assist requests?</strong>
            <p>
              Each time you ask the AI to iterate on a section or run a planning stage, that
              counts as one assist request. Free plans include a generous monthly allowance.
              Team plans have no cap.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>Do you store my API keys?</strong>
            <p>
              On hosted plans, your Claude or Codex keys are encrypted and stored server-side —
              never exposed to the browser. On the free local plan, you manage your own keys.
            </p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>SpecForge &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
