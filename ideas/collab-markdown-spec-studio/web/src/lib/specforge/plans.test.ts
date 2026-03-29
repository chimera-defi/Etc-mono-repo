import { describe, expect, it } from "vitest";

import {
  formatWorkspacePlanSeatPrice,
  getAssistQuotaState,
  getWorkspaceBillingStatus,
  listWorkspacePlans,
  getMemberQuotaState,
  getWorkspaceBillingPreview,
  getWorkspacePlanPolicy,
} from "./plans";

describe("plans", () => {
  it("returns a finite assist quota for demo workspaces", () => {
    const quota = getAssistQuotaState(
      { plan: "demo" },
      { assist_request_count: 3 },
    );

    expect(getWorkspacePlanPolicy("demo").assistRequestLimit).toBe(5);
    expect(quota.limit).toBe(5);
    expect(quota.remaining).toBe(2);
    expect(quota.blocked).toBe(false);
  });

  it("blocks assist when the demo quota is exhausted", () => {
    const quota = getAssistQuotaState(
      { plan: "demo" },
      { assist_request_count: 5 },
    );

    expect(quota.remaining).toBe(0);
    expect(quota.blocked).toBe(true);
  });

  it("keeps pilot workspaces unbounded", () => {
    const quota = getAssistQuotaState(
      { plan: "pilot" },
      { assist_request_count: 42 },
    );

    expect(quota.limit).toBeNull();
    expect(quota.remaining).toBeNull();
    expect(quota.blocked).toBe(false);
  });

  it("enforces a finite member quota for demo workspaces", () => {
    const quota = getMemberQuotaState({ plan: "demo" }, 8);

    expect(quota.limit).toBe(8);
    expect(quota.remaining).toBe(0);
    expect(quota.blocked).toBe(true);
  });

  it("builds a monthly billing preview for pilot workspaces", () => {
    const preview = getWorkspaceBillingPreview({ plan: "pilot" }, 3);

    expect(preview.seatPriceMonthlyUsd).toBe(24);
    expect(preview.billableSeats).toBe(3);
    expect(preview.estimatedMonthlyUsd).toBe(72);
  });

  it("flags when a demo workspace needs an upgrade", () => {
    const status = getWorkspaceBillingStatus(
      { plan: "demo" },
      { assist_request_count: 5 },
      8,
    );

    expect(status.upgradeRequired).toBe(true);
    expect(status.recommendedPlan).toBe("pilot");
    expect(status.reasons).toEqual(
      expect.arrayContaining(["Assist quota exhausted", "Member limit reached"]),
    );
  });

  it("lists the shared workspace plan catalog", () => {
    const plans = listWorkspacePlans();

    expect(plans.map((plan) => plan.plan)).toEqual(["demo", "pilot", "enterprise"]);
  });

  it("formats seat prices consistently for pricing surfaces", () => {
    expect(formatWorkspacePlanSeatPrice({ plan: "demo", seatPriceMonthlyUsd: null })).toBe(
      "Free",
    );
    expect(formatWorkspacePlanSeatPrice({ plan: "enterprise", seatPriceMonthlyUsd: null })).toBe(
      "Custom",
    );
    expect(formatWorkspacePlanSeatPrice({ plan: "pilot", seatPriceMonthlyUsd: 24 })).toBe(
      "$24",
    );
  });
});
