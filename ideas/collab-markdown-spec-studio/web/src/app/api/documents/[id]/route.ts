import { NextResponse } from "next/server";

import { getDocument, listPatches } from "@/lib/specforge/store";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const document = await getDocument(id);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const patches = await listPatches(id);
  return NextResponse.json({ document, patches });
}
