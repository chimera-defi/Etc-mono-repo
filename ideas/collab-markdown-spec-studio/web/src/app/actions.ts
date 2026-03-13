"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCommentThread,
  createDocument,
  createPatchProposal,
  decidePatch,
  resolveCommentThread,
} from "@/lib/specforge/store";

export async function createDocumentAction(formData: FormData) {
  const title = String(formData.get("title") ?? "Untitled SpecForge Doc");
  const initial_markdown = String(
    formData.get("initial_markdown") ??
      "# PRD\n\n## Problem\nTBD\n\n## Goals\nTBD\n",
  );

  const created = await createDocument({
    workspace_id: "ws_demo",
    title,
    initial_markdown,
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
    rationale: "Created from the local MVP dashboard.",
    proposed_by: {
      actor_type: "agent",
      actor_id: "dashboard_agent",
    },
    base_version: Number(formData.get("base_version") ?? 1),
    target_fingerprint,
    confidence: 0.82,
  });

  revalidatePath("/");
}

export async function decidePatchAction(formData: FormData) {
  await decidePatch({
    document_id: String(formData.get("document_id")),
    patch_id: String(formData.get("patch_id")),
    decision:
      (String(formData.get("decision") ?? "reject") as "accept" | "reject" | "cherry_pick"),
    resolved_content: String(formData.get("resolved_content") ?? ""),
    decided_by: {
      actor_type: "human",
      actor_id: "dashboard_reviewer",
    },
  });

  revalidatePath("/");
}

export async function createCommentThreadAction(formData: FormData) {
  await createCommentThread({
    document_id: String(formData.get("document_id")),
    block_id: String(formData.get("block_id")),
    body: String(formData.get("body") ?? ""),
    created_by: {
      actor_type: "human",
      actor_id: "dashboard_commenter",
    },
  });

  revalidatePath("/");
}

export async function resolveCommentThreadAction(formData: FormData) {
  await resolveCommentThread({
    document_id: String(formData.get("document_id")),
    thread_id: String(formData.get("thread_id")),
    resolved_by: {
      actor_type: "human",
      actor_id: "dashboard_commenter",
    },
  });

  revalidatePath("/");
}
