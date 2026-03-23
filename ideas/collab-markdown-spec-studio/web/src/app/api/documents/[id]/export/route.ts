import { NextResponse } from "next/server";

import { error } from "@/lib/specforge/api-response";
import { exportDocument, listClarifications } from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

/**
 * Check for unanswered critical clarifications. If any exist and force
 * is not set, return a 409 blocking response.
 */
async function checkCriticalClarifications(
  documentId: string,
  workspaceId: string,
  force: boolean,
): Promise<NextResponse | null> {
  if (force) return null;

  const clarifications = await listClarifications(documentId, { workspaceId });
  const unansweredCritical = clarifications.filter(
    (c) => c.priority === "critical" && c.status === "open",
  );

  if (unansweredCritical.length > 0) {
    return error(
      "Export blocked: unanswered critical clarifications must be resolved first",
      "CLARIFICATIONS_REQUIRED",
      409,
    );
  }

  return null;
}

async function buildResponse(
  id: string,
  workspaceId: string,
  force: boolean,
) {
  const blocked = await checkCriticalClarifications(id, workspaceId, force);
  if (blocked) return blocked;

  const bundle = await exportDocument(id, { workspaceId });
  return NextResponse.json(bundle, {
    headers: {
      "Content-Disposition": `inline; filename="${id}-export.json"`,
    },
  });
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const { workspaceId } = await getCurrentWorkspaceAccess();
  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "true";
  return buildResponse(id, workspaceId, force);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const { workspaceId } = await getCurrentWorkspaceAccess();
  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "true";
  return buildResponse(id, workspaceId, force);
}
