import { NextResponse } from "next/server";

import { decidePatch } from "@/lib/specforge/store";

type Params = {
  params: Promise<{ id: string; patchId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { id, patchId } = await params;
  const body = await request.json();

  try {
    const patch = await decidePatch({
      ...body,
      document_id: id,
      patch_id: patchId,
    });

    return NextResponse.json({ patch });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to decide patch" },
      { status: 400 },
    );
  }
}
