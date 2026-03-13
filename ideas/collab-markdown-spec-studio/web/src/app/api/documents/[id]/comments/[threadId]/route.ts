import { NextResponse } from "next/server";

import { resolveCommentThread } from "@/lib/specforge/store";

type Params = {
  params: Promise<{ id: string; threadId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { id, threadId } = await params;
  const body = await request.json();

  try {
    const thread = await resolveCommentThread({
      ...body,
      document_id: id,
      thread_id: threadId,
    });

    return NextResponse.json({ thread });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to resolve comment" },
      { status: 400 },
    );
  }
}
