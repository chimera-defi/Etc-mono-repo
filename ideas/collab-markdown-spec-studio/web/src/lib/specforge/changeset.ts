/**
 * ChangeSet types and Zod schemas.
 */

import { z } from "zod";

export type ImpactAnalysis = {
  affectedBlocks: string[];
  newBlocks: string[];
  deletedBlocks: string[];
  dependencies: string[];
  riskLevel: "low" | "medium" | "high";
  breakingChanges: string[];
  estimatedReviewTime: number;
};

export type ChangeSet = {
  id: string;
  documentId: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: {
    actor_type: "human" | "agent";
    actor_id: string;
  };
  scope: {
    affectsProposal: boolean;
    affectsDesign: boolean;
    affectsRequirements: boolean;
    affectsAcceptance: boolean;
    affectsTasks: boolean;
  };
  patches: string[];
  impact: ImpactAnalysis;
  status: "draft" | "proposed" | "approved" | "rejected" | "applied";
  reviewedBy?: {
    actor_type: "human" | "agent";
    actor_id: string;
  };
  reviewedAt?: string;
  approvalComment?: string;
  changeabilityScore?: number;
  atomicityCheck?: boolean;
  backwardCompatible?: boolean;
};

export const changeSetCreateInputSchema = z.object({
  documentId: z.string(),
  name: z.string().min(1),
  description: z.string().optional().default(""),
  patchIds: z.array(z.string()).min(1),
  createdBy: z.object({
    actor_type: z.enum(["human", "agent"]),
    actor_id: z.string(),
  }),
});

export type ChangeSetCreateInput = z.infer<typeof changeSetCreateInputSchema>;
