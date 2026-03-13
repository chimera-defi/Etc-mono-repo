import { NextResponse } from "next/server";

import { createDocument, listDocuments } from "@/lib/specforge/store";

export async function GET() {
  const documents = await listDocuments();
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const body = await request.json();
  const document = await createDocument(body);
  return NextResponse.json({ document }, { status: 201 });
}
