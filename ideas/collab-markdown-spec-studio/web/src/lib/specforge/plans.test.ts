import { describe, expect, it } from "vitest";

import { getAssistQuotaState, getWorkspacePlanPolicy } from "./plans";

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
});
