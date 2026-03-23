import { NextResponse } from "next/server";
import { z } from "zod";

import { createCollabToken } from "@/lib/specforge/collab-auth";
import { getRequestId, logServerEvent } from "@/lib/specforge/observability";
import { getCurrentWorkspaceActor } from "@/lib/specforge/session";
import { getDocument } from "@/lib/specforge/store";
import { withErrorHandling } from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";

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

      // Log a warning when the client's version differs from the stored version
      // (e.g. a guest opening a share URL after the doc has been updated), but
      // do NOT block them — the room is keyed by document_id only so they will
      // still join the correct collaborative session.
      if (document.version !== payload.version) {
        logger.warn("Collab session version drift", {
          document_id: payload.document_id,
          requested_version: payload.version,
          latest_version: document.version,
        });
      }

      const token = createCollabToken({
        documentId: payload.document_id,
        version: document.version,
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
