import { NextResponse } from "next/server";

import {
  isGitHubAuthConfigured,
  setGitHubWorkspaceSession,
} from "@/lib/specforge/session";

type GitHubTokenResponse = {
  access_token?: string;
  error?: string;
};

type GitHubUserResponse = {
  login: string;
  html_url?: string;
  name?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!isGitHubAuthConfigured() || !code) {
    return NextResponse.redirect(new URL("/?auth=local", request.url));
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

  await setGitHubWorkspaceSession({
    githubLogin: user.login,
    githubUrl: user.html_url,
  });

  return NextResponse.redirect(new URL("/", request.url));
}
