import { NextResponse } from "next/server";

import { getBillingProvider } from "@/lib/specforge/billing";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";
import { loadWorkspaceBillingSummary } from "@/lib/specforge/workspace-summary";

export async function GET() {
  const { workspaceId } = await getCurrentWorkspaceAccess();
  const [summary, subscription] = await Promise.all([
    loadWorkspaceBillingSummary(workspaceId),
    getBillingProvider().getSubscription(workspaceId),
  ]);

  return NextResponse.json({
    ...summary,
    subscription,
  });
}
