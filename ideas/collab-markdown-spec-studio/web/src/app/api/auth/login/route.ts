import { NextResponse } from "next/server";

import {
  createGitHubOAuthState,
  getGitHubAuthorizationUrl,
  isGitHubAuthConfigured,
} from "@/lib/specforge/session";

export async function GET(request: Request) {
  if (!isGitHubAuthConfigured()) {
    return NextResponse.redirect(new URL("/?auth=local", request.url));
  }

  const state = await createGitHubOAuthState();
  return NextResponse.redirect(getGitHubAuthorizationUrl(state));
}
