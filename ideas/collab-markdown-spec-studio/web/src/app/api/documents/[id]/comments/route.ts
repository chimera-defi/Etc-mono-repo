import { NextResponse } from "next/server";

import { createCommentThread, listCommentThreads } from "@/lib/specforge/store";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const threads = await listCommentThreads(id);
  return NextResponse.json({ threads });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const thread = await createCommentThread({ ...body, document_id: id });
  return NextResponse.json({ thread }, { status: 201 });
}
