/**
 * SpecForge in-memory engine.
 *
 * Implements the document lifecycle, patch queue, and event stream
 * as defined by the contracts/v1/ schemas, STATE_MODEL.md, and EVENT_MODEL.md.
 *
 * This is the system-under-test for acceptance tests.
 */

import type {
  Document,
  DocumentCreateRequest,
  DocumentEvent,
  EventType,
  PatchDecisionRequest,
  PatchProposal,
  PatchProposalRequest,
} from "./types.js";

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_${counter}`;
}

/** Reset ID counter (for test isolation). */
export function resetIdCounter(): void {
  counter = 0;
}

export class SpecForgeEngine {
  private documents: Map<string, Document> = new Map();
  private patches: Map<string, PatchProposal> = new Map();
  private events: DocumentEvent[] = [];

  // --- Document operations ---

  createDocument(req: DocumentCreateRequest): Document {
    const docId = nextId("doc");
    const doc: Document = {
      workspace_id: req.workspace_id,
      document_id: docId,
      title: req.title,
      version: 1,
      markdown: req.initial_markdown,
      blocks: [],
      sections: [],
    };

    // Parse sections and blocks from markdown
    const sectionRegex = /^## (.+)$/gm;
    let match: RegExpExecArray | null;
    while ((match = sectionRegex.exec(req.initial_markdown)) !== null) {
      const heading = match[1];
      const sectionId = `sec_${heading.toLowerCase().replace(/\s+/g, "_")}`;
      const blockId = `blk_${heading.toLowerCase().replace(/\s+/g, "_")}_1`;
      doc.sections.push({ section_id: sectionId, heading });
      doc.blocks.push({ block_id: blockId, section_id: sectionId, heading });
    }

    this.documents.set(docId, doc);
    this.emitEvent(docId, "document.created", doc.version, {
      workspace_id: req.workspace_id,
      title: req.title,
    });

    return doc;
  }

  /**
   * Load a document directly from seed data (bypasses normal creation flow).
   * Used in tests to hydrate from workspace.seed.json fixtures.
   */
  loadDocument(doc: Document): Document {
    this.documents.set(doc.document_id, { ...doc });
    this.emitEvent(doc.document_id, "document.created", doc.version, {
      workspace_id: doc.workspace_id,
      title: doc.title,
    });
    return this.documents.get(doc.document_id)!;
  }

  getDocument(documentId: string): Document | undefined {
    return this.documents.get(documentId);
  }

  // --- Patch operations ---

  proposePatch(req: PatchProposalRequest): PatchProposal {
    const doc = this.documents.get(req.document_id);
    if (!doc) {
      throw new Error(`Document not found: ${req.document_id}`);
    }

    const patchId = nextId("patch");
    const proposal: PatchProposal = {
      patch_id: patchId,
      document_id: req.document_id,
      block_id: req.block_id,
      section_id: req.section_id,
      operation: req.operation,
      patch_type: req.patch_type,
      content: req.content,
      target_fingerprint: req.target_fingerprint,
      base_version: req.base_version,
      proposed_by: req.proposed_by,
      proposed_at: new Date().toISOString(),
      status: "proposed",
      confidence: req.confidence,
      rationale: req.rationale,
    };

    this.patches.set(patchId, proposal);
    this.emitEvent(req.document_id, "patch.proposed", doc.version, {
      patch_id: patchId,
      block_id: req.block_id,
      section_id: req.section_id,
      operation: req.operation,
      patch_type: req.patch_type,
      proposed_by: req.proposed_by,
    });

    return proposal;
  }

  /**
   * Propose a patch with a pre-assigned patch_id (from fixture data).
   */
  proposePatchWithId(
    patchId: string,
    req: PatchProposalRequest
  ): PatchProposal {
    const doc = this.documents.get(req.document_id);
    if (!doc) {
      throw new Error(`Document not found: ${req.document_id}`);
    }

    const proposal: PatchProposal = {
      patch_id: patchId,
      document_id: req.document_id,
      block_id: req.block_id,
      section_id: req.section_id,
      operation: req.operation,
      patch_type: req.patch_type,
      content: req.content,
      target_fingerprint: req.target_fingerprint,
      base_version: req.base_version,
      proposed_by: req.proposed_by,
      proposed_at: new Date().toISOString(),
      status: "proposed",
      confidence: req.confidence,
      rationale: req.rationale,
    };

    this.patches.set(patchId, proposal);
    this.emitEvent(req.document_id, "patch.proposed", doc.version, {
      patch_id: patchId,
      block_id: req.block_id,
      section_id: req.section_id,
      operation: req.operation,
      patch_type: req.patch_type,
      proposed_by: req.proposed_by,
    });

    return proposal;
  }

  decidePatch(req: PatchDecisionRequest): PatchProposal {
    const patch = this.patches.get(req.patch_id);
    if (!patch) {
      throw new Error(`Patch not found: ${req.patch_id}`);
    }
    if (patch.status !== "proposed") {
      throw new Error(
        `Patch ${req.patch_id} is already ${patch.status}, cannot decide`
      );
    }

    const doc = this.documents.get(patch.document_id);
    if (!doc) {
      throw new Error(`Document not found: ${patch.document_id}`);
    }

    if (req.decision === "accept") {
      patch.status = "accepted";

      // Apply the patch to the document's canonical markdown
      if (patch.operation === "replace" && patch.content) {
        this.applyReplacePatch(doc, patch);
      }

      // Increment document version
      doc.version += 1;

      this.emitEvent(patch.document_id, "patch.accepted", doc.version, {
        patch_id: req.patch_id,
        block_id: patch.block_id,
        section_id: patch.section_id,
        reviewer_id: req.reviewer_id,
        reason: req.reason,
      });
    } else if (req.decision === "reject") {
      patch.status = "rejected";
      this.emitEvent(patch.document_id, "patch.rejected", doc.version, {
        patch_id: req.patch_id,
        reviewer_id: req.reviewer_id,
        reason: req.reason,
      });
    }

    return patch;
  }

  getPatch(patchId: string): PatchProposal | undefined {
    return this.patches.get(patchId);
  }

  getPatchQueue(documentId: string): PatchProposal[] {
    return Array.from(this.patches.values()).filter(
      (p) => p.document_id === documentId && p.status === "proposed"
    );
  }

  // --- Event operations ---

  getEvents(documentId?: string): DocumentEvent[] {
    if (documentId) {
      return this.events.filter((e) => e.document_id === documentId);
    }
    return [...this.events];
  }

  // --- Export ---

  exportMarkdown(documentId: string): string {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }
    return doc.markdown;
  }

  // --- Internal ---

  private applyReplacePatch(doc: Document, patch: PatchProposal): void {
    if (!patch.content) return;

    // Find the block's section heading in the markdown and replace its content.
    // Preserve the blank-line separator before the next section or trailing newline.
    const block = doc.blocks.find((b) => b.block_id === patch.block_id);
    if (!block) return;

    const heading = block.heading;
    // Match "## Heading\n<body>" up to (but not including) "\n\n## " or end of string.
    const headingPattern = new RegExp(
      `## ${escapeRegExp(heading)}\\n[\\s\\S]*?(?=\\n\\n## |\\n$|$)`,
      "g"
    );

    doc.markdown = doc.markdown.replace(headingPattern, patch.content);
  }

  private emitEvent(
    documentId: string,
    eventType: EventType,
    version: number,
    payload: Record<string, unknown>
  ): void {
    const event: DocumentEvent = {
      event_id: nextId("evt"),
      document_id: documentId,
      event_type: eventType,
      version,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.events.push(event);
  }
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
