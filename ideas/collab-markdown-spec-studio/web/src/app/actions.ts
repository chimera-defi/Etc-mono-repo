"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  answerClarification,
  createCommentThread,
  createClarification,
  createDocument,
  createWorkspaceMembership,
  getDocument,
  createPatchProposal,
  decidePatch,
  listPatches,
  listWorkspaceMemberships,
  listWorkspaceRecords,
  resetWorkspaceDocuments,
  resolveCommentThread,
  updateWorkspacePlan,
} from "@/lib/specforge/store";
import {
  buildGuidedSpecMarkdown,
  buildGuidedSpecMetadata,
  inferClarificationQuestions,
} from "@/lib/specforge/guided";
import { getMemberQuotaState } from "@/lib/specforge/plans";
import {
  getCurrentWorkspaceActor,
  setCurrentWorkspaceActor,
  setPreferredAssistTool,
  type PreferredAssistTool,
} from "@/lib/specforge/session";
import { getShowcaseExample } from "@/lib/specforge/showcase";

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

export async function createDocumentAction(formData: FormData) {
  const { currentActor } = await getActionActorRef();
  const title = String(formData.get("title") ?? "Untitled SpecForge Doc");
  const mode = String(formData.get("mode") ?? "guided");
  const exampleId = String(formData.get("example_id") ?? "");
  const guidedInput = {
    title,
    problem: String(formData.get("problem") ?? ""),
    goals: String(formData.get("goals") ?? ""),
    users: String(formData.get("users") ?? ""),
    scope: String(formData.get("scope") ?? ""),
    requirements: String(formData.get("requirements") ?? ""),
    constraints: String(formData.get("constraints") ?? ""),
    uxPack: String(formData.get("ux_pack") ?? ""),
    successSignals: String(formData.get("success_signals") ?? ""),
    tasks: String(formData.get("tasks") ?? ""),
    nonGoals: String(formData.get("non_goals") ?? ""),
  };
  const showcaseExample = mode === "example" ? await getShowcaseExample(exampleId) : null;
  const initial_markdown =
    mode === "guided"
      ? buildGuidedSpecMarkdown(guidedInput)
      : mode === "example" && showcaseExample
        ? showcaseExample.draft.markdown
        : String(
            formData.get("initial_markdown") ??
              "# PRD\n\n## Problem\nClarify the user problem before implementation begins.\n\n## Goals\n- Capture the first shippable workflow.\n- Produce a reviewable build handoff.\n",
          );
  const metadata =
    mode === "guided"
      ? buildGuidedSpecMetadata(guidedInput)
      : mode === "example" && showcaseExample
        ? showcaseExample.draft.metadata
        : undefined;
  const resolvedTitle = mode === "example" && showcaseExample ? showcaseExample.draft.title : title;

  const created = await createDocument({
    workspace_id: currentActor.workspace_id,
    title: resolvedTitle,
    initial_markdown,
    metadata,
  });

  if (mode === "guided") {
    const { actorRef } = await getActionActorRef();
    const clarificationQuestions = inferClarificationQuestions(guidedInput);
    for (const item of clarificationQuestions) {
      await createClarification({
        document_id: created.document_id,
        section_heading: item.section_heading,
        question: item.question,
        priority: item.priority,
        created_by: actorRef,
      });
    }
  }

  revalidatePath("/workspace");
  redirect(`/workspace?document=${created.document_id}&stage=draft`);
}

export async function createPatchAction(formData: FormData) {
  const [block_id = "", section_id = "", target_fingerprint = ""] = String(
    formData.get("target_descriptor") ?? "",
  ).split("||");

  await createPatchProposal({
    document_id: String(formData.get("document_id")),
    block_id,
    section_id,
    operation: "replace",
    patch_type: String(formData.get("patch_type") ?? "requirement_change") as
      | "wording_formatting"
      | "structural_edit"
      | "requirement_change"
      | "task_export_change",
    content: String(formData.get("content") ?? ""),
    rationale: "Queued from the SpecForge review workspace.",
    proposed_by: {
      actor_type: "agent",
      actor_id: "specforge_agent",
    },
    base_version: Number(formData.get("base_version") ?? 1),
    target_fingerprint,
    confidence: 0.82,
  });

  revalidatePath("/workspace");
}

export async function acceptAllPatchesAction(formData: FormData) {
  const { actorRef, currentActor } = await getActionActorRef();
  const documentId = String(formData.get("document_id") ?? "");
  const patches = await listPatches(documentId, { workspaceId: currentActor.workspace_id });
  const actionable = patches.filter((p) => p.status === "proposed" || p.status === "stale");

  for (const patch of actionable) {
    await decidePatch({
      document_id: documentId,
      patch_id: patch.patch_id,
      decision: "accept",
      resolved_content: patch.content ?? "",
      decided_by: actorRef,
    });
  }

  revalidatePath("/workspace");
}

export async function decidePatchAction(formData: FormData) {
  const { actorRef } = await getActionActorRef();
  await decidePatch({
    document_id: String(formData.get("document_id")),
    patch_id: String(formData.get("patch_id")),
    decision:
      (String(formData.get("decision") ?? "reject") as "accept" | "reject" | "cherry_pick"),
    resolved_content: String(formData.get("resolved_content") ?? ""),
    decided_by: actorRef,
  });

  revalidatePath("/workspace");
}

export async function createCommentThreadAction(formData: FormData) {
  const { actorRef } = await getActionActorRef();
  await createCommentThread({
    document_id: String(formData.get("document_id")),
    block_id: String(formData.get("block_id")),
    body: String(formData.get("body") ?? ""),
    created_by: actorRef,
  });

  revalidatePath("/workspace");
}

export async function resolveCommentThreadAction(formData: FormData) {
  const { actorRef } = await getActionActorRef();
  await resolveCommentThread({
    document_id: String(formData.get("document_id")),
    thread_id: String(formData.get("thread_id")),
    resolved_by: actorRef,
  });

  revalidatePath("/workspace");
}

export async function createClarificationAction(formData: FormData) {
  const { actorRef } = await getActionActorRef();
  await createClarification({
    document_id: String(formData.get("document_id")),
    section_heading: String(formData.get("section_heading")),
    question: String(formData.get("question") ?? ""),
    created_by: actorRef,
  });

  revalidatePath("/workspace");
}

export async function answerClarificationAction(formData: FormData) {
  const { actorRef } = await getActionActorRef();
  await answerClarification({
    document_id: String(formData.get("document_id")),
    clarification_id: String(formData.get("clarification_id")),
    answer: String(formData.get("answer") ?? ""),
    answered_by: actorRef,
  });

  revalidatePath("/workspace");
}

export async function resetWorkspaceDocumentsAction(formData: FormData) {
  const { currentActor } = await getActionActorRef();
  const returnTo = String(formData.get("return_to") ?? "/workspace?stage=start");

  await resetWorkspaceDocuments(currentActor.workspace_id);

  revalidatePath("/workspace");
  redirect(returnTo || "/workspace?stage=start");
}

export async function seedReviewDemoAction(formData: FormData) {
  const { currentActor, actorRef } = await getActionActorRef();
  const documentId = String(formData.get("document_id") ?? "");

  if (!documentId) {
    return;
  }

  const document = await getDocument(documentId, {
    workspaceId: currentActor.workspace_id,
  });
  const targetBlock = document?.blocks[0];

  if (!document || !targetBlock) {
    return;
  }

  await createPatchProposal({
    document_id: document.document_id,
    block_id: targetBlock.block_id,
    section_id: targetBlock.section_id,
    operation: "replace",
    patch_type: "structural_edit",
    content: `## ${targetBlock.heading}\n\n- Review seeded from local admin controls.\n- Verify patch decisions before launch.`,
    rationale: "Seed local review activity for MVP testing.",
    proposed_by: {
      actor_type: "agent",
      actor_id: "specforge_agent",
    },
    base_version: document.version,
    target_fingerprint: targetBlock.target_fingerprint,
    confidence: 0.76,
  });

  await createCommentThread({
    document_id: document.document_id,
    block_id: targetBlock.block_id,
    body: "Local admin seeded this review thread so the queue can be exercised quickly.",
    created_by: actorRef,
  });

  await createClarification({
    document_id: document.document_id,
    section_heading: targetBlock.heading,
    question: `What is the launch-critical expectation for ${targetBlock.heading}?`,
    created_by: actorRef,
  });

  revalidatePath("/workspace");
  redirect(`/workspace?document=${document.document_id}&stage=review`);
}

export async function switchWorkspaceActorAction(formData: FormData) {
  const actorId = String(formData.get("actor_id") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/workspace");

  await setCurrentWorkspaceActor(actorId);
  redirect(returnTo || "/workspace");
}

export async function setAssistRuntimePreferenceAction(formData: FormData) {
  const selectedTool = String(formData.get("assist_tool") ?? "auto") as PreferredAssistTool;
  const returnTo = String(formData.get("return_to") ?? "/workspace?stage=start");

  await setPreferredAssistTool(selectedTool);
  redirect(returnTo || "/workspace?stage=start");
}

export async function setWorkspacePlanAction(formData: FormData) {
  const { currentActor } = await getActionActorRef();
  const returnTo = String(formData.get("return_to") ?? "/workspace");
  const selectedPlan = String(formData.get("plan") ?? "demo");

  await updateWorkspacePlan(
    currentActor.workspace_id,
    selectedPlan === "pilot" ? "pilot" : "demo",
  );

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
    const blockedUrl = new URL(returnTo, "http://specforge.local");
    blockedUrl.searchParams.set("membership_error", "limit");
    redirect(`${blockedUrl.pathname}${blockedUrl.search}`);
  }

  await createWorkspaceMembership({
    workspace_id: currentActor.workspace_id,
    name: String(formData.get("name") ?? "New member"),
    role: String(formData.get("role") ?? "Contributor"),
    color: String(formData.get("color") ?? "#475569"),
    github_login: String(formData.get("github_login") ?? ""),
  });

  revalidatePath("/workspace");
  redirect(returnTo || "/workspace");
}
