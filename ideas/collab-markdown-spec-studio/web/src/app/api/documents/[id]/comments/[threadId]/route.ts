import { NextResponse } from "next/server";

import { resolveCommentThread } from "@/lib/specforge/store";
import { withErrorHandling } from "@/lib/api-error-handler";

type Params = {
  params: Promise<{ id: string; threadId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { id, threadId } = await params;
      const body = await request.json();

      const thread = await resolveCommentThread({
        ...body,
        document_id: id,
        thread_id: threadId,
      });

      return NextResponse.json({ thread });
    },
    { action: "resolve comment" }
  );
}
