/**
 * Billing provider abstraction.
 *
 * Local stub for MVP; real provider switchable via BILLING_PROVIDER env.
 * This module decouples workspace billing queries from the data source
 * so Stripe (or another provider) can be wired in without touching routes.
 */

export type BillingProviderName = "local" | "stripe";

export type PlanSubscription = {
  workspaceId: string;
  planId: string;
  status: "active" | "past_due" | "canceled" | "trialing";
  currentPeriodEnd: Date | null;
};

export interface BillingProviderInterface {
  getSubscription(workspaceId: string): Promise<PlanSubscription | null>;
  createCheckoutUrl(workspaceId: string, planId: string): Promise<string>;
  cancelSubscription(workspaceId: string): Promise<void>;
}

/**
 * Local stub -- always returns an active demo subscription.
 * Suitable for local-first dev and design-partner testing.
 */
class LocalBillingProvider implements BillingProviderInterface {
  async getSubscription(workspaceId: string): Promise<PlanSubscription> {
    return {
      workspaceId,
      planId: "demo",
      status: "active",
      currentPeriodEnd: null,
    };
  }

  async createCheckoutUrl(
    _workspaceId: string,
    _planId: string,
  ): Promise<string> {
    return "/pricing?mode=local";
  }

  async cancelSubscription(_workspaceId: string): Promise<void> {
    // No-op in local mode
  }
}

/**
 * Resolve the billing provider based on the BILLING_PROVIDER env var.
 *
 * When "stripe" is requested but not yet configured, throws with a
 * helpful message so operators know what to set.
 */
export function getBillingProvider(): BillingProviderInterface {
  const provider = (process.env.BILLING_PROVIDER ?? "local") as BillingProviderName;

  if (provider === "stripe") {
    // Stripe integration: set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET
    // Dynamic import avoids bundling Stripe SDK in local mode.
    throw new Error(
      "Stripe provider not yet configured. Set STRIPE_SECRET_KEY in .env",
    );
  }

  return new LocalBillingProvider();
}
