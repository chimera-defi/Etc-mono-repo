"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  answerClarification,
  createCommentThread,
  createClarification,
  createDocument,
  createPatchProposal,
  decidePatch,
  resolveCommentThread,
} from "@/lib/specforge/store";
import { buildGuidedSpecMarkdown, buildGuidedSpecMetadata } from "@/lib/specforge/guided";
import { getCurrentWorkspaceActor, setCurrentWorkspaceActor } from "@/lib/specforge/session";
import { getShowcaseExample } from "@/lib/specforge/showcase";

export async function createDocumentAction(formData: FormData) {
  const currentActor = await getCurrentWorkspaceActor();
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
              "# PRD\n\n## Problem\nTBD\n\n## Goals\nTBD\n",
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

  revalidatePath("/");
  redirect(`/?document=${created.document_id}&stage=draft`);
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

  revalidatePath("/");
}

export async function decidePatchAction(formData: FormData) {
  const currentActor = await getCurrentWorkspaceActor();
  await decidePatch({
    document_id: String(formData.get("document_id")),
    patch_id: String(formData.get("patch_id")),
    decision:
      (String(formData.get("decision") ?? "reject") as "accept" | "reject" | "cherry_pick"),
    resolved_content: String(formData.get("resolved_content") ?? ""),
    decided_by: {
      actor_type: currentActor.actor_type,
      actor_id: currentActor.actor_id,
    },
  });

  revalidatePath("/");
}

export async function createCommentThreadAction(formData: FormData) {
  const currentActor = await getCurrentWorkspaceActor();
  await createCommentThread({
    document_id: String(formData.get("document_id")),
    block_id: String(formData.get("block_id")),
    body: String(formData.get("body") ?? ""),
    created_by: {
      actor_type: currentActor.actor_type,
      actor_id: currentActor.actor_id,
    },
  });

  revalidatePath("/");
}

export async function resolveCommentThreadAction(formData: FormData) {
  const currentActor = await getCurrentWorkspaceActor();
  await resolveCommentThread({
    document_id: String(formData.get("document_id")),
    thread_id: String(formData.get("thread_id")),
    resolved_by: {
      actor_type: currentActor.actor_type,
      actor_id: currentActor.actor_id,
    },
  });

  revalidatePath("/");
}

export async function createClarificationAction(formData: FormData) {
  const currentActor = await getCurrentWorkspaceActor();
  await createClarification({
    document_id: String(formData.get("document_id")),
    section_heading: String(formData.get("section_heading")),
    question: String(formData.get("question") ?? ""),
    created_by: {
      actor_type: currentActor.actor_type,
      actor_id: currentActor.actor_id,
    },
  });

  revalidatePath("/");
}

export async function answerClarificationAction(formData: FormData) {
  const currentActor = await getCurrentWorkspaceActor();
  await answerClarification({
    document_id: String(formData.get("document_id")),
    clarification_id: String(formData.get("clarification_id")),
    answer: String(formData.get("answer") ?? ""),
    answered_by: {
      actor_type: currentActor.actor_type,
      actor_id: currentActor.actor_id,
    },
  });

  revalidatePath("/");
}

export async function switchWorkspaceActorAction(formData: FormData) {
  const actorId = String(formData.get("actor_id") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/");

  await setCurrentWorkspaceActor(actorId);
  redirect(returnTo || "/");
}
