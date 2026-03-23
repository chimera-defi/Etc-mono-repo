import { NextResponse } from "next/server";

import {
  isGitHubAuthConfigured,
  setGitHubWorkspaceSession,
  verifyGitHubOAuthState,
} from "@/lib/specforge/session";
import {
  listUserWorkspaces,
  upsertUserFromGitHub,
} from "@/lib/specforge/store";

type GitHubTokenResponse = {
  access_token?: string;
  error?: string;
};

type GitHubUserResponse = {
  id: number;
  login: string;
  html_url?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!isGitHubAuthConfigured() || !code) {
    return NextResponse.redirect(new URL("/?auth=local", request.url));
  }

  try {
    await verifyGitHubOAuthState(state);
  } catch {
    return NextResponse.redirect(new URL("/?auth=error", request.url));
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.SPECFORGE_GITHUB_REDIRECT_URI,
    }),
  });

  const tokenPayload = (await tokenResponse.json()) as GitHubTokenResponse;

  if (!tokenResponse.ok || !tokenPayload.access_token) {
    return NextResponse.redirect(new URL("/?auth=error", request.url));
  }

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenPayload.access_token}`,
      "User-Agent": "SpecForge",
    },
  });
  const user = (await userResponse.json()) as GitHubUserResponse;

  if (!userResponse.ok || !user.login) {
    return NextResponse.redirect(new URL("/?auth=error", request.url));
  }

  // Persist user in database
  await upsertUserFromGitHub({
    github_id: String(user.id),
    github_login: user.login,
    email: user.email,
    display_name: user.name ?? user.login,
    avatar_url: user.avatar_url,
  });

  // Find the user's workspaces to set workspace_id on the session
  const userWorkspaces = await listUserWorkspaces(user.login);
  const defaultWorkspace = userWorkspaces[0];

  if (!defaultWorkspace) {
    return NextResponse.redirect(new URL("/?auth=denied", request.url));
  }

  await setGitHubWorkspaceSession({
    githubLogin: user.login,
    githubUrl: user.html_url,
    workspace_id: defaultWorkspace.workspace_id,
    role: undefined, // resolved from membership data
  });

  return NextResponse.redirect(new URL("/", request.url));
}
