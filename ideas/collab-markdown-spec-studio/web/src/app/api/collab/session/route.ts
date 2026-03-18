import { NextResponse } from "next/server";
import { z } from "zod";

import { createCollabToken } from "@/lib/specforge/collab-auth";
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

      return NextResponse.json({
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
