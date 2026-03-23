import { z } from "zod";

export const documentCreateSchema = z.object({
  workspace_id: z.string().min(1),
  title: z.string().min(1).max(200),
  initial_markdown: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const documentUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  markdown: z.string().min(1),
  editor_json: z.unknown().optional(),
});

export const patchProposalSchema = z.object({
  document_id: z.string().min(1),
  block_id: z.string().min(1),
  section_id: z.string().min(1).optional(),
  operation: z.enum(["insert", "replace", "delete"]),
  content: z.string().optional(),
  patch_type: z.enum([
    "wording_formatting",
    "structural_edit",
    "requirement_change",
    "task_export_change",
  ]),
  rationale: z.string().max(1000).optional(),
  proposed_by: z.object({
    actor_type: z.enum(["human", "agent"]),
    actor_id: z.string().min(1),
  }),
  base_version: z.number().int().min(1),
  target_fingerprint: z.string().min(1),
  confidence: z.number().min(0).max(1).optional(),
});

export const patchDecisionSchema = z.object({
  document_id: z.string().min(1),
  patch_id: z.string().min(1),
  decision: z.enum(["accept", "reject", "cherry_pick"]),
  resolved_content: z.string().optional(),
  decided_by: z.object({
    actor_type: z.enum(["human", "agent"]),
    actor_id: z.string().min(1),
  }),
});

export const commentThreadCreateSchema = z.object({
  document_id: z.string().min(1),
  block_id: z.string().min(1),
  body: z.string().min(1).max(2000),
  created_by: z.object({
    actor_type: z.enum(["human", "agent"]),
    actor_id: z.string().min(1),
  }),
});

export const commentThreadResolveSchema = z.object({
  document_id: z.string().min(1),
  thread_id: z.string().min(1),
  resolved_by: z.object({
    actor_type: z.enum(["human", "agent"]),
    actor_id: z.string().min(1),
  }),
});

export const clarificationCreateSchema = z.object({
  document_id: z.string().min(1),
  section_heading: z.string().min(1),
  question: z.string().min(1).max(500),
  priority: z.enum(["critical", "normal", "optional"]).optional().default("normal"),
  created_by: z.object({
    actor_type: z.enum(["human", "agent"]),
    actor_id: z.string().min(1),
  }),
});

export const clarificationAnswerSchema = z.object({
  document_id: z.string().min(1),
  clarification_id: z.string().min(1),
  answer: z.string().min(1).max(2000),
  answered_by: z.object({
    actor_type: z.enum(["human", "agent"]),
    actor_id: z.string().min(1),
  }),
});

export const blockSchema = z.object({
  block_id: z.string().min(1),
  section_id: z.string().min(1),
  heading: z.string().min(1),
  content: z.string(),
  target_fingerprint: z.string().min(1),
});

export const sectionSchema = z.object({
  section_id: z.string().min(1),
  heading: z.string().min(1),
});

export const documentRecordSchema = z.object({
  document_id: z.string().min(1),
  workspace_id: z.string().min(1),
  title: z.string().min(1),
  version: z.number().int().min(1),
  markdown: z.string(),
  editor_json: z.unknown().optional(),
  sections: z.array(sectionSchema),
  blocks: z.array(blockSchema),
  metadata: z.record(z.string(), z.string()).default({}),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

export const storedPatchSchema = patchProposalSchema.extend({
  patch_id: z.string().min(1),
  status: z.enum(["proposed", "stale", "accepted", "rejected", "cherry_picked"]),
  created_at: z.string().min(1),
});

export const agentSpecExportSchema = z.object({
  document_id: z.string().min(1),
  title: z.string().min(1),
  version: z.number().int().min(1),
  sections: z.array(sectionSchema),
  patch_queue: z.array(
    z.object({
      patch_id: z.string().min(1),
      block_id: z.string().min(1),
      patch_type: patchProposalSchema.shape.patch_type,
      status: storedPatchSchema.shape.status,
    }),
  ),
});

export const storeSchema = z.object({
  documents: z.array(documentRecordSchema),
  patches: z.array(storedPatchSchema),
});

export type DocumentCreateInput = z.infer<typeof documentCreateSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;
export type PatchProposalInput = z.infer<typeof patchProposalSchema>;
export type PatchDecisionInput = z.infer<typeof patchDecisionSchema>;
export type CommentThreadCreateInput = z.infer<typeof commentThreadCreateSchema>;
export type CommentThreadResolveInput = z.infer<typeof commentThreadResolveSchema>;
export type ClarificationCreateInput = z.input<typeof clarificationCreateSchema>;
export type ClarificationAnswerInput = z.infer<typeof clarificationAnswerSchema>;
export type DocumentRecord = z.infer<typeof documentRecordSchema>;
export type StoredPatch = z.infer<typeof storedPatchSchema>;
export type StoreData = z.infer<typeof storeSchema>;
export type AgentSpecExport = z.infer<typeof agentSpecExportSchema>;
