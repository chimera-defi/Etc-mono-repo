import { NextResponse } from "next/server";

import { exportDocument } from "@/lib/specforge/store";

type Params = {
  params: Promise<{ id: string }>;
};

async function buildResponse(id: string) {
  const bundle = await exportDocument(id);
  return NextResponse.json(bundle, {
    headers: {
      "Content-Disposition": `inline; filename="${id}-export.json"`,
    },
  });
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  return buildResponse(id);
}

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return buildResponse(id);
}
