import { NextResponse } from "next/server";

import { getGitHubAuthorizationUrl, isGitHubAuthConfigured } from "@/lib/specforge/session";

export async function GET(request: Request) {
  if (!isGitHubAuthConfigured()) {
    return NextResponse.redirect(new URL("/?auth=local", request.url));
  }

  return NextResponse.redirect(getGitHubAuthorizationUrl());
}
