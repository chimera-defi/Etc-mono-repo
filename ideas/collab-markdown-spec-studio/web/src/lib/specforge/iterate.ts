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

function getAnthropicApiKey(): string | null {
  return process.env.ANTHROPIC_API_KEY?.trim() || null;
}

export type IterationResult = {
  patch_id: string;
  block_id: string;
  proposed_content: string;
  tool: "claude_api" | "claude_cli" | "heuristic";
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

  const apiKey = getAnthropicApiKey();
  try {
    if (apiKey) {
      proposedContent = await runClaudeApiIterate(sectionContext, input.message, apiKey);
      tool = "claude_api";
    } else {
      proposedContent = await runClaudeIterate(sectionContext, input.message);
      tool = "claude_cli";
    }
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
    "You are editing a spec section. Apply the instruction below to the current content.",
    "Return ONLY the updated markdown content — no preamble, no explanation, no wrapping.",
    "Do not add or remove headings. Preserve list formatting (bullets, numbered lists).",
    "If the instruction says to add something, append it in the existing format.",
    "If the instruction says to remove something, delete the matching lines.",
    "If the instruction says to rewrite, replace the content while preserving structure.",
    "",
    "Current section content:",
    sectionContext,
    "",
    `Instruction: ${userMessage.trim()}`,
  ].join("\n");
}

async function runClaudeApiIterate(
  sectionContext: string,
  userMessage: string,
  apiKey: string,
): Promise<string> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      { role: "user", content: buildIteratePrompt(sectionContext, userMessage) },
    ],
  });

  const text = response.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { type: "text"; text: string }).text)
    .join("");

  if (!text.trim()) throw new Error("Claude API returned empty response");
  return text.trim();
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

/**
 * Detect the intent of an iteration instruction and classify it.
 */
function detectIntent(instruction: string): {
  type: "add" | "remove" | "rewrite" | "shorten" | "expand" | "clarify" | "reorder" | "default";
  subject: string;
} {
  const lower = instruction.toLowerCase().trim();

  if (/^(add|append|include|insert)\b/.test(lower)) {
    return { type: "add", subject: instruction.replace(/^(add|append|include|insert)\s+/i, "").trim() };
  }
  if (/^(remove|delete|drop|cut)\b/.test(lower)) {
    return { type: "remove", subject: instruction.replace(/^(remove|delete|drop|cut)\s+/i, "").trim() };
  }
  if (/^(rewrite|change|replace|rephrase)\b/.test(lower)) {
    return { type: "rewrite", subject: instruction.replace(/^(rewrite|change|replace|rephrase)\s+(as\s+|to\s+)?/i, "").trim() };
  }
  if (/\b(shorten|simplify|trim|condense|reduce)\b/.test(lower)) {
    return { type: "shorten", subject: "" };
  }
  if (/\b(expand|elaborate|add detail|more detail|flesh out)\b/.test(lower)) {
    return { type: "expand", subject: "" };
  }
  if (/^(clarify|explain|note)\b/.test(lower)) {
    return { type: "clarify", subject: instruction.replace(/^(clarify|explain|note)\s+/i, "").trim() };
  }
  if (/\b(reorder|move|swap|rearrange)\b/.test(lower)) {
    return { type: "reorder", subject: instruction.replace(/^(reorder|move|swap|rearrange)\s+/i, "").trim() };
  }

  return { type: "default", subject: instruction.trim() };
}

/**
 * Production heuristic that actually modifies content based on parsed instruction intent.
 * Output goes through the governed patch review flow, so imperfect edits are acceptable
 * as long as they represent a genuine attempt at the requested change.
 */
function buildHeuristicIteration(currentContent: string, userMessage: string): string {
  const { type, subject } = detectIntent(userMessage);
  const lines = currentContent.split("\n");
  const contentLines = lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith("#");
  });

  switch (type) {
    case "add": {
      // Detect if content uses bullet lists and match format
      const hasBullets = lines.some((l) => /^\s*[-*]\s/.test(l));
      const addition = subject || userMessage.trim();
      const newItem = hasBullets ? `- ${addition}` : addition;
      return [...lines, "", newItem].join("\n");
    }

    case "remove": {
      const subjectLower = subject.toLowerCase();
      const subjectTerms = subjectLower.split(/\s+/).filter((t) => t.length > 2);
      const filtered = lines.filter((line) => {
        const lineLower = line.toLowerCase();
        // Remove lines where most subject terms appear
        const matchCount = subjectTerms.filter((t) => lineLower.includes(t)).length;
        return subjectTerms.length === 0 || matchCount < subjectTerms.length * 0.6;
      });
      if (filtered.length === lines.length) {
        // Nothing matched — remove lines containing any subject term as a softer match
        const softFiltered = lines.filter((line) => {
          const lineLower = line.toLowerCase();
          return !subjectTerms.some((t) => lineLower.includes(t));
        });
        return softFiltered.length > 0 ? softFiltered.join("\n") : currentContent;
      }
      return filtered.join("\n");
    }

    case "rewrite": {
      if (!subject) return currentContent;
      const replacementIndex = lines.findIndex((line) => {
        const trimmed = line.trim();
        return trimmed.length > 0 && !trimmed.startsWith("#");
      });
      if (replacementIndex === -1) {
        return subject;
      }
      const replacementPrefix = /^(\s*[-*]\s+|\s*\d+\.\s+)/.exec(lines[replacementIndex])?.[0] ?? "";
      const rewritten = [...lines];
      rewritten[replacementIndex] = `${replacementPrefix}${subject}`;
      return rewritten.join("\n");
    }

    case "shorten": {
      const shortened = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.length <= 140) {
          return line;
        }
        const firstSentence = trimmed.split(/(?<=[.!?])\s+/)[0] ?? trimmed;
        return line.replace(trimmed, firstSentence);
      });
      return shortened.join("\n");
    }

    case "expand": {
      const hasBullets = lines.some((l) => /^\s*[-*]\s/.test(l));
      return [
        currentContent,
        "",
        hasBullets
          ? "- Add specific implementation notes, edge cases, and review criteria for this section."
          : "Add specific implementation notes, edge cases, and review criteria for this section.",
      ].join("\n");
    }

    case "clarify": {
      return [
        currentContent,
        "",
        `> **Clarification:** ${subject || userMessage.trim()}`,
      ].join("\n");
    }

    case "reorder": {
      const bulletLines: string[] = [];
      const headLines: string[] = [];
      for (const line of lines) {
        if (/^\s*[-*]\s/.test(line) || /^\s*\d+\.\s/.test(line)) {
          bulletLines.push(line);
        } else {
          headLines.push(line);
        }
      }
      if (bulletLines.length > 1) {
        bulletLines.reverse();
        return [...headLines, ...bulletLines].join("\n");
      }
      return currentContent;
    }

    default: {
      if (contentLines.length === 0) {
        return userMessage.trim();
      }
      const hasBullets = lines.some((l) => /^\s*[-*]\s/.test(l));
      return [
        currentContent,
        "",
        hasBullets
          ? `- ${subject || userMessage.trim()}`
          : `${subject || userMessage.trim()}`,
      ].join("\n");
    }
  }
}
