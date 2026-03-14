import { NextResponse } from "next/server";

import { buildExecutionBrief } from "@/lib/specforge/execution";
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
  const starterBundle = buildStarterTemplate(document, exportBundle, readiness);
  const executionBrief = buildExecutionBrief({
    document,
    exportBundle,
    starterBundle,
    readiness,
    patches,
    comments,
  });

  return NextResponse.json({
    packet_id: `launch_${document.document_id}_v${document.version}`,
    document: {
      document_id: document.document_id,
      title: document.title,
      version: document.version,
    },
    readiness,
    export_bundle: exportBundle,
    starter_bundle: starterBundle,
    execution_brief: executionBrief,
  });
}
