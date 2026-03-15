import { NextResponse } from "next/server";

import { createPatchProposal, listPatches } from "@/lib/specforge/store";
import { withErrorHandling } from "@/lib/api-error-handler";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { id } = await params;
      const patches = await listPatches(id);
      return NextResponse.json({ patches });
    },
    { action: "list patches" }
  );
}

export async function POST(request: Request, { params }: Params) {
  return withErrorHandling(
    async () => {
      const { id } = await params;
      const body = await request.json();
      const patch = await createPatchProposal({ ...body, document_id: id });
      return NextResponse.json({ patch }, { status: 201 });
    },
    { action: "create patch", resourceId: (await params).id }
  );
}
