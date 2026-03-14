import { NextResponse } from "next/server";

import { clearGitHubWorkspaceSession } from "@/lib/specforge/session";

export async function GET(request: Request) {
  await clearGitHubWorkspaceSession();
  return NextResponse.redirect(new URL("/", request.url));
}
