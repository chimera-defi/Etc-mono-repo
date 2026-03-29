import { NextResponse } from "next/server";

import { exportDocumentBundle } from "@/lib/specforge/export";
import { listPlanSessions } from "@/lib/specforge/plan-session";
import { getDocument, listPatches } from "@/lib/specforge/store";
import {
  getCurrentWorkspaceAccess,
  getCurrentWorkspaceLaunchResource,
} from "@/lib/specforge/workspace-access";
import { withErrorHandling } from "@/lib/api-error-handler";

type Params = {
  params: Promise<{ id: string }>;
};

/** GET — existing starter-bundle handoff (unchanged) */
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const result = await getCurrentWorkspaceLaunchResource(request, id, {
    eventType: "usage.handoff_viewed",
    select: (context) => context.starterBundle,
  });
  return NextResponse.json(result.body, { status: result.status });
}

/**
 * POST — emit the full handoff.json with export bundle + planning stage provenance.
 * This is the terminal output of the SpecForge workflow as designed in the spec.
 */
export async function POST(_request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { id } = await params;
      const { workspaceId, actor } = await getCurrentWorkspaceAccess();

      const document = await getDocument(id, { workspaceId });
      if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      const patches = await listPatches(id, { workspaceId });
      const bundle = exportDocumentBundle(document, patches);

      // Collect the most recent active plan session (if any)
      const sessions = await listPlanSessions(id, workspaceId);
      const session = sessions[0] ?? null;

      const planningSession = session
        ? {
            session_id: session.session_id,
            stages: session.stages.map((stage) => ({
              name: stage.name,
              status: stage.status,
              patch_id: stage.patch_id ?? null,
              outputs: stage.outputs ?? null,
            })),
          }
        : {
            session_id: null,
            stages: [],
          };

      // Determine whether design/security sections are present based on stage completion
      const designStage = session?.stages.find((s) => s.name === "design-review");
      const securityStage = session?.stages.find((s) => s.name === "security-review");

      const exportBundle: Record<string, unknown> = {
        prd: bundle.files["PRD.md"],
        spec: bundle.files["SPEC.md"],
        tasks: bundle.files["TASKS.md"],
        agentSpec: bundle.files["agent_spec.json"],
      };

      if (designStage?.status === "completed" && designStage.outputs) {
        exportBundle.designSystem = Object.values(designStage.outputs).join("\n\n");
      }

      if (securityStage?.status === "completed" && securityStage.outputs) {
        exportBundle.security = Object.values(securityStage.outputs).join("\n\n");
      }

      const handoff = {
        version: "1",
        documentId: id,
        workspaceId,
        generatedAt: new Date().toISOString(),
        generatedBy: { actor_type: actor.actor_type, actor_id: actor.actor_id },
        planningSession,
        exportBundle,
        executionBrief: bundle.files["AGENT_HANDOFF.md"] ?? null,
        launchPacket: bundle.files["FIRST_60_MINUTES.md"] ?? null,
      };

      return NextResponse.json(handoff, { status: 200 });
    },
    { action: "emit handoff" },
  );
}
