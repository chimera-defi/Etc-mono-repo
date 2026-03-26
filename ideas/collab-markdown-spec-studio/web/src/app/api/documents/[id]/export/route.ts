import { NextResponse } from "next/server";

import { error } from "@/lib/specforge/api-response";
import {
  exportDocument,
  getDocument,
  listClarifications,
  listCommentThreads,
  listPatches,
} from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

async function buildResponse(
  id: string,
  workspaceId: string,
  force: boolean,
) {
  const document = await getDocument(id, { workspaceId });
  if (!document) {
    return error("Document not found", "DOCUMENT_NOT_FOUND", 404);
  }

  const [patches, clarifications] = await Promise.all([
    listPatches(id, { workspaceId }),
    listClarifications(id, { workspaceId }),
  ]);

  // Evaluate readiness-derived depth gates
  const { evaluateReadiness } = await import("@/lib/specforge/readiness");
  const comments = await listCommentThreads(id, { workspaceId });
  const readiness = evaluateReadiness({ document, patches, comments, clarifications });
  const gateReport = readiness.gates;

  // If gates fail and force is not set, block export
  if (gateReport && !gateReport.passed && !force) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: "Export blocked: depth gates failed",
          code: "DEPTH_GATES_FAILED",
        },
        gates: gateReport.gates,
        blockers: gateReport.blockers,
      },
      { status: 422 },
    );
  }

  const bundle = await exportDocument(id, { workspaceId });

  // Include gate results in the response
  const response = {
    ...bundle,
    gates: gateReport
      ? { passed: gateReport.passed, results: gateReport.gates }
      : undefined,
  };

  return NextResponse.json(response, {
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
