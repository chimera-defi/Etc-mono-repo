"use server";

import { revalidatePath } from "next/cache";

import { createDocument, createPatchProposal } from "@/lib/specforge/store";

export async function createDocumentAction(formData: FormData) {
  const title = String(formData.get("title") ?? "Untitled SpecForge Doc");
  const initial_markdown = String(
    formData.get("initial_markdown") ??
      "# PRD\n\n## Problem\nTBD\n\n## Goals\nTBD\n",
  );

  await createDocument({
    workspace_id: "ws_demo",
    title,
    initial_markdown,
  });

  revalidatePath("/");
}

export async function createPatchAction(formData: FormData) {
  await createPatchProposal({
    document_id: String(formData.get("document_id")),
    block_id: String(formData.get("block_id")),
    section_id: String(formData.get("section_id") ?? ""),
    operation: "replace",
    patch_type: "requirement_change",
    content: String(formData.get("content") ?? ""),
    rationale: "Created from the local MVP dashboard.",
    proposed_by: {
      actor_type: "agent",
      actor_id: "dashboard_agent",
    },
    base_version: Number(formData.get("base_version") ?? 1),
    target_fingerprint: String(formData.get("target_fingerprint")),
    confidence: 0.82,
  });

  revalidatePath("/");
}
