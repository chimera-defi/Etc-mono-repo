import { describe, expect, it } from "vitest";

import { loadWorkspaceEntitlements, loadWorkspaceOpsSummary } from "./workspace-summary";

describe("workspace summary", () => {
  it("builds entitlements for the demo workspace", async () => {
    const summary = await loadWorkspaceEntitlements("ws_demo");

    expect(summary.workspace).toMatchObject({
      workspace_id: "ws_demo",
      name: expect.any(String),
      plan: expect.any(String),
    });
    expect(summary.quotas.assist).toMatchObject({
      used: expect.any(Number),
      blocked: expect.any(Boolean),
    });
    expect(summary.billing).toMatchObject({
      plan: expect.any(String),
      billableSeats: expect.any(Number),
    });
  });

  it("builds ops summary for the demo workspace", async () => {
    const summary = await loadWorkspaceOpsSummary("ws_demo");

    expect(summary).toMatchObject({
      workspace: {
        workspace_id: "ws_demo",
      },
      persistence: expect.objectContaining({
        backend: expect.any(String),
      }),
      parity: expect.objectContaining({
        remaining_count: expect.any(Number),
      }),
      counts: expect.objectContaining({
        member_count: expect.any(Number),
        document_count: expect.any(Number),
      }),
    });
  });
});
