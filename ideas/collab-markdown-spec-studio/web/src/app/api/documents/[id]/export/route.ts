import { NextResponse } from "next/server";

import { exportDocument } from "@/lib/specforge/store";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const bundle = await exportDocument(id);
  return NextResponse.json(bundle);
}
