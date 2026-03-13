import { NextResponse } from "next/server";

import { buildStarterTemplate } from "@/lib/specforge/handoff";
import { evaluateReadiness } from "@/lib/specforge/readiness";
import { exportDocument, getDocument, listCommentThreads, listPatches } from "@/lib/specforge/store";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const document = await getDocument(id);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const [patches, comments, exportBundle] = await Promise.all([
    listPatches(id),
    listCommentThreads(id),
    exportDocument(id),
  ]);
  const readiness = evaluateReadiness({
    document,
    patches,
    comments,
  });

  return NextResponse.json(buildStarterTemplate(document, exportBundle, readiness));
}
