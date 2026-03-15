import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  getWorkspaceMembershipForUser,
  listUserWorkspaces,
  listWorkspaceMemberships,
  upsertUserFromGitHub,
} from "./store";

async function makeOptions() {
  const baseDir = await mkdtemp(path.join(os.tmpdir(), "specforge-access-"));

  return {
    dbPath: path.join(baseDir, "specforge-db"),
    fixturesDir: path.resolve(process.cwd(), "..", "fixtures"),
  };
}

describe("workspace membership validation", () => {
  it("finds workspace membership by github_login", async () => {
    const options = await makeOptions();
    const membership = await getWorkspaceMembershipForUser(
      "chimera-defi",
      "ws_demo",
      options,
    );

    expect(membership).toBeTruthy();
    expect(membership?.actor_id).toBe("workspace_owner");
    expect(membership?.role).toBe("Workspace owner");
  });

  it("returns null for non-member github_login", async () => {
    const options = await makeOptions();
    const membership = await getWorkspaceMembershipForUser(
      "unknown-user",
      "ws_demo",
      options,
    );

    expect(membership).toBeNull();
  });

  it("returns null for valid user in wrong workspace", async () => {
    const options = await makeOptions();
    const membership = await getWorkspaceMembershipForUser(
      "chimera-defi",
      "ws_nonexistent",
      options,
    );

    expect(membership).toBeNull();
  });

  it("lists workspaces for a given github_login", async () => {
    const options = await makeOptions();
    const workspaces = await listUserWorkspaces("chimera-defi", options);

    expect(workspaces).toHaveLength(1);
    expect(workspaces[0]?.workspace_id).toBe("ws_demo");
  });

  it("returns empty list for unknown github_login", async () => {
    const options = await makeOptions();
    const workspaces = await listUserWorkspaces("nobody", options);

    expect(workspaces).toHaveLength(0);
  });

  it("upserts a GitHub user and retrieves them", async () => {
    const options = await makeOptions();
    const user = await upsertUserFromGitHub(
      {
        github_id: "12345",
        github_login: "test-user",
        email: "test@example.com",
        display_name: "Test User",
        avatar_url: "https://avatars.example.com/test",
      },
      options,
    );

    expect(user.user_id).toBeTruthy();
    expect(user.github_login).toBe("test-user");
    expect(user.display_name).toBe("Test User");

    // Upsert again with updated info
    const updated = await upsertUserFromGitHub(
      {
        github_id: "12345",
        github_login: "test-user-renamed",
        email: "new@example.com",
        display_name: "Test User Updated",
      },
      options,
    );

    expect(updated.user_id).toBe(user.user_id);
    expect(updated.github_login).toBe("test-user-renamed");
    expect(updated.display_name).toBe("Test User Updated");
  });

  it("seeds workspace members with github_login for owner", async () => {
    const options = await makeOptions();
    const members = await listWorkspaceMemberships("ws_demo", options);
    const owner = members.find((m) => m.actor_id === "workspace_owner");

    expect(owner?.github_login).toBe("chimera-defi");
  });
});
