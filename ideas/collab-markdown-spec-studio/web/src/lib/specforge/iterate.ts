/**
 * Section-level iteration via governed patch.
 *
 * Takes a block_id + user message, injects the current section content + doc
 * context as agent context, calls the local Claude CLI (or falls back to a
 * heuristic), and creates a PatchProposal targeting that block_id.
 */

import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { createPatchProposal, getDocument } from "./store";
import { deriveDocumentShape } from "./markdown";
import type { IterationRequestInput } from "./contracts";

const execFileAsync = promisify(execFile);

export type IterationResult = {
  patch_id: string;
  block_id: string;
  proposed_content: string;
  tool: "claude_cli" | "heuristic";
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function iterateSection(
  documentId: string,
  blockId: string,
  input: IterationRequestInput,
  workspaceId: string,
): Promise<IterationResult> {
  const document = await getDocument(documentId, { workspaceId });
  if (!document) throw new Error(`Document not found: ${documentId}`);
  const { blocks } = deriveDocumentShape(document.markdown);

  const block = blocks.find((b) => b.block_id === blockId);
  if (!block) throw new Error(`Block not found: ${blockId}`);

  // Build richer context: document title + all headings + the target section
  const sectionContext = buildSectionContext(document.title, block, blocks.map((b) => b.heading));

  let proposedContent: string;
  let tool: IterationResult["tool"];

  try {
    proposedContent = await runClaudeIterate(sectionContext, input.message);
    tool = "claude_cli";
  } catch {
    proposedContent = buildHeuristicIteration(block.content, input.message);
    tool = "heuristic";
  }

  const patch = await createPatchProposal(
    {
      document_id: documentId,
      block_id: block.block_id,
      section_id: block.section_id,
      operation: "replace",
      content: proposedContent,
      patch_type: "structural_edit",
      rationale: `Section iteration: "${input.message.slice(0, 200)}"`,
      proposed_by: {
        actor_type: input.actor_type,
        actor_id: input.actor_id,
      },
      base_version: document.version,
      target_fingerprint: block.target_fingerprint,
      confidence: tool === "claude_cli" ? 0.82 : 0.5,
    },
    { workspaceId },
  );

  return {
    patch_id: patch.patch_id,
    block_id: block.block_id,
    proposed_content: proposedContent,
    tool,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildSectionContext(
  documentTitle: string,
  block: { heading: string; content: string },
  allHeadings: string[],
): string {
  return [
    `Document: "${documentTitle}"`,
    `Sections: ${allHeadings.join(", ")}`,
    ``,
    `Current section: ${block.heading}`,
    `---`,
    block.content,
    `---`,
  ].join("\n");
}

function buildIteratePrompt(sectionContext: string, userMessage: string): string {
  return [
    "You are helping a user iterate on a section of a product spec.",
    "Return only the revised section content as markdown — no explanations, no headings added/removed, no preamble.",
    "Preserve the existing structure and level of detail unless the user explicitly asks to change it.",
    "Apply the user's instruction precisely.",
    "",
    "Section context:",
    sectionContext,
    "",
    "User instruction:",
    userMessage.trim(),
  ].join("\n");
}

async function runClaudeIterate(
  sectionContext: string,
  userMessage: string,
): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "specforge-iterate-"));
  const promptPath = path.join(tempDir, "iterate.prompt.txt");

  try {
    const prompt = buildIteratePrompt(sectionContext, userMessage);
    await writeFile(promptPath, prompt);

    const { stdout } = await execFileAsync(
      "bash",
      [
        "-lc",
        'claude -p --output-format text "$(cat "$1")" < /dev/null',
        "specforge-iterate",
        promptPath,
      ],
      {
        timeout: 45_000,
        maxBuffer: 2 * 1024 * 1024,
      },
    );

    const result = stdout.trim();
    if (!result) throw new Error("Claude returned empty output");
    return result;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function buildHeuristicIteration(currentContent: string, userMessage: string): string {
  // Minimal heuristic: prepend a note about the requested change to the existing content.
  // This is intentionally low-quality — it signals the governed patch is a placeholder
  // that the user should refine before accepting.
  return [
    `<!-- Iteration request: ${userMessage.trim()} -->`,
    `<!-- Review and edit before accepting this patch. -->`,
    ``,
    currentContent,
  ].join("\n");
}
