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
          These anchors are benchmarked against public pricing from Notion, Linear, and
          Confluence, then adjusted for the extra governance and launch-packet workflow that
          SpecForge adds on top.
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
        <h2>How agents are billed</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>Seat baseline</strong>
            <p>
              Pilot workspaces are modeled at $24 per member per month right now, matching the
              current workspace billing preview in-product.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>Usage overlay</strong>
            <p>
              SpecForge now records assist requests plus handoff, execution, and launch-packet
              views. Demo workspaces use a small included assist quota today, while pilot workspaces
              stay effectively unlimited during validation.
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
        <p>SpecForge &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
