import { NextResponse } from "next/server";

import { buildZip } from "@/lib/build-zip";
import { exportDocument } from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const { workspaceId } = await getCurrentWorkspaceAccess();

  const bundle = await exportDocument(id, { workspaceId });
  const zipBytes = buildZip(bundle.files);

  const slugTitle = bundle.document_id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  const buf = Buffer.from(zipBytes);

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slugTitle}-spec-bundle.zip"`,
      "Content-Length": String(buf.length),
    },
  });
}
