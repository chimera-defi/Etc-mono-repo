import { describe, expect, it } from "vitest";

import {
  createWorkspaceSessionToken,
  getGitHubAuthorizationUrl,
  resolveWorkspaceActor,
  resolveWorkspaceMemberForGitHubLogin,
  verifyWorkspaceSessionToken,
} from "./session";

describe("workspace session helpers", () => {
  it("maps configured GitHub logins to workspace members", () => {
    const actor = resolveWorkspaceMemberForGitHubLogin("chimera-defi");
    expect(actor?.actor_id).toBe("workspace_owner");
  });

  it("falls back to the default actor when the id is unknown", () => {
    expect(resolveWorkspaceActor("missing_actor").actor_id).toBe("workspace_owner");
  });

  it("signs and verifies workspace sessions", () => {
    const token = createWorkspaceSessionToken({
      actor_id: "workspace_owner",
      workspace_id: "ws_demo",
      role: "Workspace owner",
      githubLogin: "chimera-defi",
      githubUrl: "https://github.com/chimera-defi",
      issuedAt: 123,
    });

    expect(verifyWorkspaceSessionToken(token)).toMatchObject({
      actor_id: "workspace_owner",
      workspace_id: "ws_demo",
      role: "Workspace owner",
      githubLogin: "chimera-defi",
    });
  });

  it("builds a GitHub authorization URL when configured", () => {
    process.env.GITHUB_CLIENT_ID = "demo-client";
    process.env.SPECFORGE_GITHUB_REDIRECT_URI = "http://localhost:3000/api/auth/callback";

    const url = new URL(getGitHubAuthorizationUrl());
    expect(url.hostname).toBe("github.com");
    expect(url.searchParams.get("client_id")).toBe("demo-client");
  });
});
