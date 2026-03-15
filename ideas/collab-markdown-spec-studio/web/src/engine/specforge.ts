/**
 * SpecForge in-memory engine.
 *
 * Implements the document lifecycle, patch queue, and event stream
 * as defined by the contracts/v1/ schemas, STATE_MODEL.md, and EVENT_MODEL.md.
 *
 * This is the system-under-test for acceptance tests.
 */

import type {
  AgentSpec,
  BlockInventory,
  Clarification,
  CommentThread,
  CursorPosition,
  DepthCheckResult,
  Document,
  DocumentCreateRequest,
  DocumentEvent,
  EventType,
  GeneratedRepo,
  PatchDecisionRequest,
  PatchProposal,
  PatchProposalRequest,
  PresenceState,
  Recap,
  RepoScaffoldTemplate,
  SpecBundle,
  UserPresence,
} from "./types.js";
import { generateRepository } from "./repo-generator.js";
import { escapeRegExp } from "./utils.js";

let globalCounter = 0;
function nextId(prefix: string): string {
  globalCounter += 1;
  return `${prefix}_${globalCounter}`;
}

/** Reset global ID counter (for test isolation). */
export function resetIdCounter(): void {
  globalCounter = 0;
}

export class SpecForgeEngine {
  private idCounter = 0;
  private readonly documents: Map<string, Document> = new Map();
  private readonly patches: Map<string, PatchProposal> = new Map();
  private readonly commentThreads: Map<string, CommentThread> = new Map();
  private readonly clarifications: Map<string, Clarification> = new Map();
  private readonly recaps: Recap[] = [];
  private readonly events: DocumentEvent[] = [];
  private readonly generatedRepos: Map<string, GeneratedRepo> = new Map();
  private presenceState: PresenceState = {
    users: new Map(),
    last_updated: new Date().toISOString(),
  };

  private nextInstanceId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}_${this.idCounter}`;
  }

  // --- Document operations ---

  createDocument(req: DocumentCreateRequest): Document {
    const docId = this.nextInstanceId("doc");
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

  /**
   * Propose a patch. If patchId is provided, uses that ID; otherwise generates a new one.
   */
  proposePatch(req: PatchProposalRequest, patchId?: string): PatchProposal {
    const doc = this.documents.get(req.document_id);
    if (!doc) {
      throw new Error(`Document not found: ${req.document_id}`);
    }

    const finalPatchId = patchId ?? this.nextInstanceId("patch");
    const proposal: PatchProposal = {
      patch_id: finalPatchId,
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

    this.patches.set(finalPatchId, proposal);
    this.emitEvent(req.document_id, "patch.proposed", doc.version, {
      patch_id: finalPatchId,
      block_id: req.block_id,
      section_id: req.section_id,
      operation: req.operation,
      patch_type: req.patch_type,
      proposed_by: req.proposed_by,
    });

    return proposal;
  }

  /**
   * @deprecated Use proposePatch(req, patchId) instead.
   */
  proposePatchWithId(
    patchId: string,
    req: PatchProposalRequest
  ): PatchProposal {
    return this.proposePatch(req, patchId);
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

    // Check for stale patches: base_version mismatch indicates document evolved
    // Only apply stale-patch detection to REPLACE operations (INSERT/DELETE don't conflict as easily)
    // Allow patches if: doc.version == base_version, OR
    // All patches from the same base_version haven't been decided yet (concurrent proposals)
    let isStale = false;
    if (patch.operation === "replace" && patch.base_version < doc.version) {
      // Check if there are other proposed patches with the same base_version that haven't been decided yet
      const concurrentPatches = Array.from(this.patches.values()).filter(
        (p) =>
          p.document_id === patch.document_id &&
          p.base_version === patch.base_version &&
          p.status === "proposed" &&
          p.patch_id !== patch.patch_id
      );
      // If all concurrent patches have been decided, this one is stale
      isStale = concurrentPatches.length === 0;
    }

    if (req.decision === "accept") {
      // Reject stale patches automatically
      if (isStale) {
        patch.status = "rejected";
        this.emitEvent(patch.document_id, "patch.rejected", doc.version, {
          patch_id: req.patch_id,
          reviewer_id: req.reviewer_id,
          reason: "stale-patch",
        });
        return patch;
      }

      patch.status = "accepted";

      // Apply the patch to the document's canonical markdown
      if (patch.operation === "replace" && patch.content) {
        this.applyReplacePatch(doc, patch);
      } else if (patch.operation === "insert" && patch.content) {
        this.applyInsertPatch(doc, patch);
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

  // --- Comment operations ---

  addCommentThread(
    blockId: string,
    initialBody: string,
    authorId: string,
    authorName: string
  ): CommentThread {
    const threadId = this.nextInstanceId("thread");
    const commentId = this.nextInstanceId("comment");
    const now = new Date().toISOString();

    const thread: CommentThread = {
      thread_id: threadId,
      block_id: blockId,
      comments: [
        {
          comment_id: commentId,
          author_id: authorId,
          author_name: authorName,
          body: initialBody,
          created_at: now,
        },
      ],
      status: "open",
      created_at: now,
    };

    this.commentThreads.set(threadId, thread);

    // Emit event (we don't have document_id here, but we can use empty string for comment events)
    this.emitEvent("", "comment.created", 0, {
      thread_id: threadId,
      block_id: blockId,
      author_id: authorId,
      author_name: authorName,
    });

    return thread;
  }

  addCommentToThread(
    threadId: string,
    body: string,
    authorId: string,
    authorName: string
  ): void {
    const thread = this.commentThreads.get(threadId);
    if (!thread) {
      throw new Error(`Comment thread not found: ${threadId}`);
    }

    if (thread.status === "resolved") {
      throw new Error(
        `Cannot reply to resolved thread: ${threadId}`
      );
    }

    const commentId = this.nextInstanceId("comment");
    const now = new Date().toISOString();

    thread.comments.push({
      comment_id: commentId,
      author_id: authorId,
      author_name: authorName,
      body,
      created_at: now,
    });

    this.emitEvent("", "comment.replied", 0, {
      thread_id: threadId,
      comment_id: commentId,
      author_id: authorId,
      author_name: authorName,
    });
  }

  resolveCommentThread(threadId: string): void {
    const thread = this.commentThreads.get(threadId);
    if (!thread) {
      throw new Error(`Comment thread not found: ${threadId}`);
    }

    thread.status = "resolved";
    thread.resolved_at = new Date().toISOString();

    this.emitEvent("", "comment.resolved", 0, {
      thread_id: threadId,
      resolved_at: thread.resolved_at,
    });
  }

  getCommentThread(threadId: string): CommentThread | undefined {
    return this.commentThreads.get(threadId);
  }

  getCommentsForBlock(blockId: string): CommentThread[] {
    return Array.from(this.commentThreads.values()).filter(
      (t) => t.block_id === blockId
    );
  }

  // --- Clarification operations ---

  addClarification(
    blockId: string,
    question: string,
    actorId: string
  ): Clarification {
    const clarificationId = this.nextInstanceId("clarif");
    const now = new Date().toISOString();

    const clarification: Clarification = {
      clarification_id: clarificationId,
      block_id: blockId,
      question,
      status: "open",
      asked_by_actor_id: actorId,
      asked_at: now,
    };

    this.clarifications.set(clarificationId, clarification);
    return clarification;
  }

  answerClarification(clarificationId: string, answer: string): void {
    const clarification = this.clarifications.get(clarificationId);
    if (!clarification) {
      throw new Error(`Clarification not found: ${clarificationId}`);
    }
    if (clarification.status === "answered") {
      throw new Error(`Clarification ${clarificationId} is already answered`);
    }

    clarification.answer = answer;
    clarification.status = "answered";
    clarification.answered_at = new Date().toISOString();
  }

  getClarification(clarificationId: string): Clarification | undefined {
    return this.clarifications.get(clarificationId);
  }

  getClarificationsForBlock(blockId: string): Clarification[] {
    return Array.from(this.clarifications.values()).filter(
      (c) => c.block_id === blockId
    );
  }

  getOpenClarifications(documentId: string): Clarification[] {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    const docBlockIds = new Set(doc.blocks.map((b) => b.block_id));
    return Array.from(this.clarifications.values()).filter(
      (c) => c.status === "open" && docBlockIds.has(c.block_id)
    );
  }

  // --- Depth check operations ---

  depthCheck(
    documentId: string,
    requiredSections: { section_id: string; heading: string; min_length: number }[]
  ): DepthCheckResult {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    const failures: string[] = [];
    const requiredSectionsResult = requiredSections.map((req) => {
      const section = doc.sections.find((s) => s.section_id === req.section_id);
      const block = doc.blocks.find(
        (b) => b.section_id === req.section_id && b.heading === req.heading
      );

      const present = !!section && !!block;

      // Extract content for the section from markdown
      let contentLength = 0;
      if (present && block) {
        const content = this.extractSectionContent(doc.markdown, block.heading);
        contentLength = content.length;
      }

      const failed = !present || contentLength < req.min_length;
      if (failed) {
        if (!present) {
          failures.push(`Required section "${req.heading}" is missing`);
        } else if (contentLength < req.min_length) {
          failures.push(
            `Section "${req.heading}" content (${contentLength} chars) is below minimum (${req.min_length} chars)`
          );
        }
      }

      return {
        section_id: req.section_id,
        heading: req.heading,
        required: true,
        present,
        content_length: contentLength,
        min_length: req.min_length,
      };
    });

    return {
      passed: failures.length === 0,
      required_sections: requiredSectionsResult,
      failures,
    };
  }

  // --- Readiness operations ---

  validateExportReadiness(documentId: string): {
    ready: boolean;
    blockers: string[];
  } {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    const blockers: string[] = [];

    // Check 1: All clarifications must be answered
    const openClarifications = this.getOpenClarifications(documentId);
    if (openClarifications.length > 0) {
      blockers.push(
        `${openClarifications.length} unanswered clarification(s) must be resolved before export`
      );
    }

    // Check 2: Document must have at least one block
    if (doc.blocks.length === 0) {
      blockers.push("Document must have at least one section block");
    }

    return {
      ready: blockers.length === 0,
      blockers,
    };
  }

  // --- Recap operations ---

  createRecap(documentId: string, summary: string, actorId: string): Recap {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    const recapId = this.nextInstanceId("recap");
    const recap: Recap = {
      recap_id: recapId,
      document_version: doc.version,
      summary,
      created_at: new Date().toISOString(),
      created_by_actor_id: actorId,
    };

    this.recaps.push(recap);
    return recap;
  }

  getRecaps(): Recap[] {
    // Return all recaps
    // In a full implementation, could track document_id per recap
    return [...this.recaps];
  }

  // --- Presence tracking operations ---

  updateUserPresence(
    userId: string,
    userName: string,
    color: string,
    cursorPosition?: CursorPosition
  ): UserPresence {
    const now = new Date().toISOString();
    const existingUser = this.presenceState.users.get(userId);

    const userPresence: UserPresence = {
      user_id: userId,
      user_name: userName,
      color,
      cursor_position: cursorPosition,
      last_activity: now,
      state: "active",
    };

    this.presenceState.users.set(userId, userPresence);
    this.presenceState.last_updated = now;

    // Emit presence.updated event
    this.emitEvent("", "presence.updated", 0, {
      user_id: userId,
      user_name: userName,
      cursor_position: cursorPosition,
      is_new_user: !existingUser,
    });

    return userPresence;
  }

  setUserState(
    userId: string,
    state: "active" | "idle" | "disconnected"
  ): void {
    const user = this.presenceState.users.get(userId);
    if (!user) {
      throw new Error(`User not found in presence state: ${userId}`);
    }

    user.state = state;
    user.last_activity = new Date().toISOString();
    this.presenceState.last_updated = user.last_activity;

    // Emit state change event
    this.emitEvent("", state === "disconnected" ? "presence.left" : "presence.updated", 0, {
      user_id: userId,
      state,
    });
  }

  getActiveUsers(): UserPresence[] {
    return Array.from(this.presenceState.users.values()).filter(
      (u) => u.state === "active" || u.state === "idle"
    );
  }

  getUserPresence(userId: string): UserPresence | undefined {
    return this.presenceState.users.get(userId);
  }

  cleanupInactiveUsers(timeoutMs: number): void {
    const now = new Date().getTime();
    const usersToRemove: string[] = [];

    for (const [userId, user] of this.presenceState.users) {
      const lastActivityTime = new Date(user.last_activity).getTime();
      const timeSinceActivity = now - lastActivityTime;

      if (timeSinceActivity > timeoutMs) {
        usersToRemove.push(userId);
      }
    }

    for (const userId of usersToRemove) {
      const user = this.presenceState.users.get(userId)!;
      this.presenceState.users.delete(userId);
      this.presenceState.last_updated = new Date().toISOString();

      // Emit presence.left event for removed users
      this.emitEvent("", "presence.left", 0, {
        user_id: userId,
        reason: "timeout",
      });
    }
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

  /**
   * Export a complete SpecBundle containing document metadata, markdown, and audit trail.
   * Includes:
   * - agent_spec: Document metadata with block inventory and patch statistics
   * - document_markdown: Current state of the document
   * - patch_summary: Audit trail of all patch decisions
   * - export_timestamp: When the bundle was created
   */
  exportBundle(documentId: string): SpecBundle {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Collect all patches for this document (proposed, accepted, rejected)
    const docPatches = Array.from(this.patches.values()).filter(
      (p) => p.document_id === documentId
    );

    // Count patches by status
    const totalProposed = docPatches.length;
    const totalAccepted = docPatches.filter((p) => p.status === "accepted")
      .length;
    const totalRejected = docPatches.filter((p) => p.status === "rejected")
      .length;

    // Collect unique authors (proposed_by and reviewers from events)
    const authorsSet = new Set<string>();
    for (const patch of docPatches) {
      authorsSet.add(patch.proposed_by.actor_id);
    }
    // Extract reviewer IDs from patch.accepted and patch.rejected events
    const docEvents = this.events.filter(
      (e) => e.document_id === documentId &&
             (e.event_type === "patch.accepted" || e.event_type === "patch.rejected")
    );
    for (const event of docEvents) {
      const reviewerId = event.payload.reviewer_id;
      if (typeof reviewerId === "string") {
        authorsSet.add(reviewerId);
      }
    }

    // Build block inventory (including all blocks, even if no patches)
    const blockInventory: BlockInventory[] = doc.blocks.map((block) => {
      const blockPatches = docPatches.filter((p) => p.block_id === block.block_id);
      const modifiedBySet = new Set<string>();

      for (const patch of blockPatches) {
        modifiedBySet.add(patch.proposed_by.actor_id);
      }

      // Extract content length from markdown for this block
      const content = this.extractSectionContent(doc.markdown, block.heading);
      const contentLength = content.length;

      return {
        block_id: block.block_id,
        heading: block.heading,
        content_length: contentLength,
        modified_by: Array.from(modifiedBySet),
        patch_count: blockPatches.length,
      };
    });

    // Get earliest and latest event timestamps
    const allDocEvents = this.events.filter((e) => e.document_id === documentId);
    let createdAt = new Date().toISOString();
    let lastModified = createdAt;

    if (allDocEvents.length > 0) {
      createdAt = allDocEvents[0].timestamp;
      lastModified = allDocEvents[allDocEvents.length - 1].timestamp;
    }

    // Build agent spec
    const agentSpec: AgentSpec = {
      document_id: doc.document_id,
      document_version: doc.version,
      document_title: doc.title,
      created_at: createdAt,
      last_modified: lastModified,
      total_patches_proposed: totalProposed,
      total_patches_accepted: totalAccepted,
      total_patches_rejected: totalRejected,
      authors: Array.from(authorsSet),
      sections: blockInventory,
    };

    // Build patch summary (audit trail)
    const patchSummary = docPatches
      .sort((a, b) => {
        // Sort by decision order: find when each was decided
        const aDecisionEvent = this.events.find(
          (e) =>
            (e.event_type === "patch.accepted" || e.event_type === "patch.rejected") &&
            e.payload.patch_id === a.patch_id
        );
        const bDecisionEvent = this.events.find(
          (e) =>
            (e.event_type === "patch.accepted" || e.event_type === "patch.rejected") &&
            e.payload.patch_id === b.patch_id
        );

        const aTime = aDecisionEvent?.timestamp || "";
        const bTime = bDecisionEvent?.timestamp || "";
        return aTime.localeCompare(bTime);
      })
      .map((patch) => {
        // Find the timestamp when this patch was accepted
        const acceptedEvent = this.events.find(
          (e) =>
            e.event_type === "patch.accepted" && e.payload.patch_id === patch.patch_id
        );

        return {
          patch_id: patch.patch_id,
          operation: patch.operation,
          block_id: patch.block_id,
          status: patch.status,
          accepted_at: acceptedEvent?.timestamp,
        };
      });

    // Build the complete bundle
    const bundle: SpecBundle = {
      spec_version: "1.0",
      agent_spec: agentSpec,
      document_markdown: doc.markdown,
      patch_summary: patchSummary,
      export_timestamp: new Date().toISOString(),
    };

    return bundle;
  }

  /**
   * Generate a repository scaffold from a spec bundle.
   *
   * @param documentId - Document to generate repository from
   * @param template - Repository template ("nextjs-typescript" | "nextjs-python" | "docs-only")
   * @returns GeneratedRepo with all scaffold files and traceability
   */
  generateRepository(
    documentId: string,
    template: RepoScaffoldTemplate
  ): GeneratedRepo {
    const bundle = this.exportBundle(documentId);
    const repo = generateRepository(bundle, template, documentId);

    // Store the generated repo
    this.generatedRepos.set(repo.repo_id, repo);

    // Emit event
    this.emitEvent(documentId, "repo.generated", 1, {
      repo_id: repo.repo_id,
      template_name: template,
      file_count: repo.generated_files.length,
    });

    return repo;
  }

  /**
   * Get a generated repository by ID.
   */
  getGeneratedRepo(repoId: string): GeneratedRepo | undefined {
    return this.generatedRepos.get(repoId);
  }

  /**
   * Get all generated repositories for a document.
   */
  getGeneratedRepos(documentId: string): GeneratedRepo[] {
    return Array.from(this.generatedRepos.values()).filter(
      (repo) => repo.spec_bundle_id === documentId
    );
  }

  // --- Internal ---

  private extractSectionContent(markdown: string, heading: string): string {
    const headingPattern = new RegExp(
      `## ${escapeRegExp(heading)}\\n[\\s\\S]*?(?=\\n\\n## |\\n$|$)`,
      "g"
    );
    const match = headingPattern.exec(markdown);
    return match ? match[0] : "";
  }

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

  private applyInsertPatch(doc: Document, patch: PatchProposal): void {
    if (!patch.content || !patch.section_id) return;

    // Check if section already exists
    const sectionExists = doc.sections.some(
      (s) => s.section_id === patch.section_id
    );
    if (sectionExists) return; // Don't insert duplicate sections

    // Extract heading from content (first line starting with ##)
    const headingMatch = patch.content.match(/^## (.+)$/m);
    if (!headingMatch) return;

    const heading = headingMatch[1];

    // Append to end of document with separator
    if (doc.markdown.endsWith("\n")) {
      doc.markdown += "\n" + patch.content;
    } else {
      doc.markdown += "\n\n" + patch.content;
    }

    // Register new section and block
    doc.sections.push({
      section_id: patch.section_id,
      heading,
    });

    const blockId = `blk_${heading.toLowerCase().replace(/\s+/g, "_")}_1`;
    doc.blocks.push({
      block_id: blockId,
      section_id: patch.section_id,
      heading,
    });
  }

  private emitEvent(
    documentId: string,
    eventType: EventType,
    version: number,
    payload: Record<string, unknown>
  ): void {
    const event: DocumentEvent = {
      event_id: this.nextInstanceId("evt"),
      document_id: documentId,
      event_type: eventType,
      version,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.events.push(event);
  }
}
