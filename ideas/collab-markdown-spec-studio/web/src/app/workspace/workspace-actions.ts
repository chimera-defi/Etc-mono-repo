"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createWorkspaceMembership,
  deleteWorkspaceMembership,
  listWorkspaceMemberships,
  listWorkspaceRecords,
  updateWorkspaceMembershipRole,
  updateWorkspacePlan,
} from "@/lib/specforge/store";
import { getMemberQuotaState } from "@/lib/specforge/plans";
import {
  getCurrentWorkspaceActor,
  setCurrentWorkspace,
  setCurrentWorkspaceActor,
  setPreferredAssistTool,
  type PreferredAssistTool,
} from "@/lib/specforge/session";

async function getActionActorRef() {
  const currentActor = await getCurrentWorkspaceActor();

  return {
    currentActor,
    actorRef: {
      actor_type: currentActor.actor_type,
      actor_id: currentActor.actor_id,
    },
  };
}

async function recordWorkspaceActionEvent(
  currentActor: Awaited<ReturnType<typeof getCurrentWorkspaceActor>>,
  eventType: string,
  payload?: Record<string, unknown>,
) {
  await import("@/lib/specforge/store").then(({ recordWorkspaceEvent }) =>
    recordWorkspaceEvent({
      workspace_id: currentActor.workspace_id,
      event_type: eventType,
      actor_type: currentActor.actor_type,
      actor_id: currentActor.actor_id,
      payload,
    }),
  );
}

function redirectWithMembershipError(returnTo: string, reason: string) {
  const blockedUrl = new URL(returnTo, "http://specforge.local");
  blockedUrl.searchParams.set("membership_error", reason);
  redirect(`${blockedUrl.pathname}${blockedUrl.search}`);
}

export async function switchWorkspaceActorAction(formData: FormData) {
  const actorId = String(formData.get("actor_id") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/workspace");

  await setCurrentWorkspaceActor(actorId);
  redirect(returnTo || "/workspace");
}

export async function switchWorkspaceAction(formData: FormData) {
  const workspaceId = String(formData.get("workspace_id") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/workspace");

  if (!workspaceId) {
    redirect(returnTo || "/workspace");
  }

  await setCurrentWorkspace(workspaceId);
  redirect(returnTo || "/workspace");
}

export async function setAssistRuntimePreferenceAction(formData: FormData) {
  const currentActor = await getCurrentWorkspaceActor();
  const selectedTool = String(formData.get("assist_tool") ?? "auto") as PreferredAssistTool;
  const returnTo = String(formData.get("return_to") ?? "/workspace?stage=start");

  await setPreferredAssistTool(selectedTool);
  await recordWorkspaceActionEvent(currentActor, "workspace.assist_preference_saved", {
    assist_tool: selectedTool,
  });
  redirect(returnTo || "/workspace?stage=start");
}

export async function setWorkspacePlanAction(formData: FormData) {
  const { currentActor } = await getActionActorRef();
  const returnTo = String(formData.get("return_to") ?? "/workspace");
  const selectedPlan = String(formData.get("plan") ?? "demo");
  const plan = selectedPlan === "pilot" ? "pilot" : "demo";

  await updateWorkspacePlan(currentActor.workspace_id, plan);
  await recordWorkspaceActionEvent(currentActor, "workspace.plan_changed", { plan });

  revalidatePath("/workspace");
  redirect(returnTo || "/workspace");
}

export async function createWorkspaceMemberAction(formData: FormData) {
  const { currentActor } = await getActionActorRef();
  const returnTo = String(formData.get("return_to") ?? "/workspace");
  const [workspaces, members] = await Promise.all([
    listWorkspaceRecords(),
    listWorkspaceMemberships(currentActor.workspace_id),
  ]);
  const workspace =
    workspaces.find((item) => item.workspace_id === currentActor.workspace_id) ?? {
      workspace_id: currentActor.workspace_id,
      name: "SpecForge Demo Workspace",
      plan: "demo" as const,
      created_at: new Date(0).toISOString(),
    };
  const memberQuota = getMemberQuotaState(workspace, members.length);

  if (memberQuota.blocked) {
    redirectWithMembershipError(returnTo, "limit");
  }

  const githubLogin = String(formData.get("github_login") ?? "").trim();
  if (
    githubLogin &&
    members.some((member) => member.github_login?.toLowerCase() === githubLogin.toLowerCase())
  ) {
    redirectWithMembershipError(returnTo, "duplicate");
  }

  if (workspace.plan === "pilot" && !githubLogin) {
    redirectWithMembershipError(returnTo, "github_required");
  }

  await createWorkspaceMembership({
    workspace_id: currentActor.workspace_id,
    name: String(formData.get("name") ?? "New member"),
    role: String(formData.get("role") ?? "Contributor"),
    color: String(formData.get("color") ?? "#475569"),
    github_login: githubLogin,
  });
  await recordWorkspaceActionEvent(currentActor, "workspace.member_added", {
    github_login: githubLogin || null,
  });

  revalidatePath("/workspace");
  redirect(returnTo || "/workspace");
}

export async function updateWorkspaceMemberRoleAction(formData: FormData) {
  const { currentActor } = await getActionActorRef();
  const returnTo = String(formData.get("return_to") ?? "/workspace");
  const membershipId = String(formData.get("membership_id") ?? "");
  const role = String(formData.get("role") ?? "").trim();

  if (!membershipId || !role) {
    redirect(returnTo || "/workspace");
  }

  const updated = await updateWorkspaceMembershipRole(membershipId, role);

  if (updated) {
    await recordWorkspaceActionEvent(currentActor, "workspace.member_role_changed", {
      membership_id: membershipId,
      role,
    });
  }

  revalidatePath("/workspace");
  redirect(returnTo || "/workspace");
}

export async function removeWorkspaceMemberAction(formData: FormData) {
  const { currentActor } = await getActionActorRef();
  const returnTo = String(formData.get("return_to") ?? "/workspace");
  const membershipId = String(formData.get("membership_id") ?? "");

  if (!membershipId) {
    redirect(returnTo || "/workspace");
  }

  const members = await listWorkspaceMemberships(currentActor.workspace_id);
  const targetMember = members.find((member) => member.membership_id === membershipId);

  if (!targetMember) {
    redirect(returnTo || "/workspace");
  }

  if (members.length <= 1) {
    redirectWithMembershipError(returnTo, "last_member");
  }

  if (targetMember.actor_id === currentActor.actor_id) {
    redirectWithMembershipError(returnTo, "self_remove");
  }

  await deleteWorkspaceMembership(membershipId);
  await recordWorkspaceActionEvent(currentActor, "workspace.member_removed", {
    removed_actor_id: targetMember.actor_id,
    removed_github_login: targetMember.github_login ?? null,
  });

  revalidatePath("/workspace");
  redirect(returnTo || "/workspace");
}
