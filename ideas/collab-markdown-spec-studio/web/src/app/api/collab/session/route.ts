import { NextResponse } from "next/server";
import { z } from "zod";

import { createCollabToken } from "@/lib/specforge/collab-auth";

const collabSessionSchema = z.object({
  document_id: z.string().min(1),
  version: z.number().int().min(1),
  actor: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    color: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  try {
    const payload = collabSessionSchema.parse(await request.json());
    const token = createCollabToken({
      documentId: payload.document_id,
      version: payload.version,
      actorId: payload.actor.id,
      actorName: payload.actor.name,
      actorColor: payload.actor.color,
      actorType: "human",
    });

    return NextResponse.json({
      token,
      actor: payload.actor,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create collab session" },
      { status: 400 },
    );
  }
}
