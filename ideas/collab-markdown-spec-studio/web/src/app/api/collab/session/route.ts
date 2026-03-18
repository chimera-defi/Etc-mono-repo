import { NextResponse } from "next/server";
import { z } from "zod";

import { createCollabToken } from "@/lib/specforge/collab-auth";
import { getRequestId, logServerEvent } from "@/lib/specforge/observability";
import { getCurrentWorkspaceActor } from "@/lib/specforge/session";
import { getDocument } from "@/lib/specforge/store";
import { withErrorHandling } from "@/lib/api-error-handler";

const collabSessionSchema = z.object({
  document_id: z.string().min(1),
  version: z.number().int().min(1),
});

export async function POST(request: Request) {
  return withErrorHandling(
    async () => {
      const requestId = getRequestId(request.headers);
      const payload = collabSessionSchema.parse(await request.json());
      const currentActor = await getCurrentWorkspaceActor();
      const document = await getDocument(payload.document_id, {
        workspaceId: currentActor.workspace_id,
      });

      if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      if (document.version !== payload.version) {
        return NextResponse.json(
          { error: "Document version mismatch", latest_version: document.version },
          { status: 409 },
        );
      }

      const token = createCollabToken({
        documentId: payload.document_id,
        version: payload.version,
        actorId: currentActor.actor_id,
        actorName: currentActor.name,
        actorColor: currentActor.color,
        actorType: "human",
      });

      logServerEvent("collab_session_issued", {
        request_id: requestId,
        document_id: payload.document_id,
        document_version: payload.version,
        workspace_id: currentActor.workspace_id,
        actor_id: currentActor.actor_id,
      });

      return NextResponse.json({
        request_id: requestId,
        token,
        actor: {
          id: currentActor.actor_id,
          name: currentActor.name,
          color: currentActor.color,
        },
      });
    },
    { action: "create collab session" }
  );
}
