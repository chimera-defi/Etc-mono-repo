import { NextResponse } from "next/server";

import { buildDocumentLaunchContext } from "@/lib/specforge/workflow";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const context = await buildDocumentLaunchContext(id);

  if (!context) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(context.executionBrief);
}
