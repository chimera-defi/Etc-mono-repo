/**
 * SpecForge core domain types.
 * Derived from contracts/v1/ JSON schemas and STATE_MODEL.md.
 */

export interface Block {
  block_id: string;
  section_id: string;
  heading: string;
  content?: string;
}

export interface Section {
  section_id: string;
  heading: string;
}

export interface Document {
  workspace_id: string;
  document_id: string;
  title: string;
  version: number;
  markdown: string;
  blocks: Block[];
  sections: Section[];
}

export type PatchOperation = "insert" | "replace" | "delete";
export type PatchType =
  | "wording_formatting"
  | "structural_edit"
  | "requirement_change"
  | "task_export_change";

export type PatchStatus = "proposed" | "accepted" | "rejected";

export interface PatchProposal {
  patch_id: string;
  document_id: string;
  block_id: string;
  section_id?: string;
  operation: PatchOperation;
  patch_type: PatchType;
  content?: string;
  target_fingerprint: string;
  base_version: number;
  proposed_by: { actor_type: "human" | "agent"; actor_id: string };
  proposed_at: string;
  status: PatchStatus;
  confidence?: number;
  rationale?: string;
}

// Comment system types
export interface Comment {
  comment_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface CommentThread {
  thread_id: string;
  block_id: string;
  comments: Comment[];
  status: "open" | "resolved";
  created_at: string;
  resolved_at?: string;
}

export type EventType =
  | "document.created"
  | "patch.proposed"
  | "patch.accepted"
  | "patch.rejected"
  | "snapshot.created"
  | "comment.created"
  | "comment.replied"
  | "comment.resolved";

export interface DocumentEvent {
  event_id: string;
  document_id: string;
  event_type: EventType;
  version: number;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface DocumentCreateRequest {
  workspace_id: string;
  title: string;
  initial_markdown: string;
  metadata?: Record<string, string>;
}

export interface PatchProposalRequest {
  document_id: string;
  block_id: string;
  section_id?: string;
  operation: PatchOperation;
  patch_type: PatchType;
  content?: string;
  proposed_by: { actor_type: "human" | "agent"; actor_id: string };
  base_version: number;
  target_fingerprint: string;
  confidence?: number;
  rationale?: string;
}

export interface PatchDecisionRequest {
  patch_id: string;
  decision: "accept" | "reject" | "cherry_pick";
  reviewer_id: string;
  reason?: string;
}

/** Seed fixture shape from workspace.seed.json */
export interface WorkspaceSeed {
  workspace_id: string;
  document_id: string;
  title: string;
  version: number;
  markdown: string;
  blocks: Block[];
  sections: Section[];
}

/** Patch seed line shape from patches.seed.jsonl */
export interface PatchSeedLine {
  patch_id: string;
  block_id: string;
  section_id: string;
  operation: PatchOperation;
  patch_type: PatchType;
  target_fingerprint: string;
  content: string;
}

/** Block inventory for AgentSpec export */
export interface BlockInventory {
  block_id: string;
  heading: string;
  content_length: number;
  modified_by: string[];
  patch_count: number;
}

/** Agent specification metadata for export bundle */
export interface AgentSpec {
  document_id: string;
  document_version: number;
  document_title: string;
  created_at: string;
  last_modified: string;
  total_patches_proposed: number;
  total_patches_accepted: number;
  total_patches_rejected: number;
  authors: string[];
  sections: BlockInventory[];
}

/** Patch summary for audit trail */
export interface PatchSummaryItem {
  patch_id: string;
  operation: PatchOperation;
  block_id: string;
  status: PatchStatus;
  accepted_at?: string;
}

/** Complete SpecBundle export containing document, metadata, and audit trail */
export interface SpecBundle {
  spec_version: "1.0";
  agent_spec: AgentSpec;
  document_markdown: string;
  patch_summary: PatchSummaryItem[];
  export_timestamp: string;
}

/** Depth check validation result for required sections */
export interface DepthCheckResult {
  passed: boolean;
  required_sections: {
    section_id: string;
    heading: string;
    required: boolean;
    present: boolean;
    content_length: number;
    min_length: number;
  }[];
  failures: string[];
}

/** Clarification question for document sections */
export interface Clarification {
  clarification_id: string;
  block_id: string;
  question: string;
  answer?: string;
  status: "open" | "answered";
  asked_by_actor_id: string;
  asked_at: string;
  answered_at?: string;
}

/** End-of-iteration summary recap */
export interface Recap {
  recap_id: string;
  document_version: number;
  summary: string;
  created_at: string;
  created_by_actor_id: string;
}
