import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { cache } from "react";
import { z } from "zod";

import {
  DEFAULT_GUIDED_SPEC_INPUT,
  normalizeGuidedSpecInput,
  type GuidedSpecInput,
} from "./guided";
import { getCurrentWorkspaceSession } from "./session";

const execFileAsync = promisify(execFile);

const assistSchema = z.object({
  title: z.string().min(1),
  problem: z.string().min(1),
  goals: z.string().min(1),
  users: z.string().min(1),
  scope: z.string().min(1),
  requirements: z.string().min(1),
  constraints: z.string().min(1),
  uxPack: z.string().min(1),
  successSignals: z.string().min(1),
  tasks: z.string().min(1),
  nonGoals: z.string().min(1),
});

const assistJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "problem",
    "goals",
    "users",
    "scope",
    "requirements",
    "constraints",
    "uxPack",
    "successSignals",
    "tasks",
    "nonGoals",
  ],
  properties: {
    title: { type: "string" },
    problem: { type: "string" },
    goals: { type: "string" },
    users: { type: "string" },
    scope: { type: "string" },
    requirements: { type: "string" },
    constraints: { type: "string" },
    uxPack: { type: "string" },
    successSignals: { type: "string" },
    tasks: { type: "string" },
    nonGoals: { type: "string" },
  },
} as const;

export type AgentAssistToolId = "auto" | "codex_cli" | "claude_cli" | "heuristic";

export type AgentAssistToolStatus = {
  id: Exclude<AgentAssistToolId, "auto">;
  label: string;
  available: boolean;
  detail: string;
};

export type AgentAssistSuggestion = {
  tool: Exclude<AgentAssistToolId, "auto">;
  fields: GuidedSpecInput;
  notes: string[];
};

function compactLines(value: string, fallback: string) {
  const lines = value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length > 0 ? lines.slice(0, 6).join("\n") : fallback;
}

function titleCase(raw: string) {
  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export function buildHeuristicSuggestion(brief: string): AgentAssistSuggestion {
  const normalizedBrief = brief.trim();
  const sentences = normalizedBrief
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const keywords = normalizedBrief.toLowerCase();
  const rawTitle = sentences[0]?.replace(/[.!?]+$/, "") ?? DEFAULT_GUIDED_SPEC_INPUT.title;
  const title = rawTitle.length > 60 ? rawTitle.slice(0, 60).trim() : rawTitle;
  const users = [];

  if (keywords.includes("founder") || keywords.includes("startup")) {
    users.push("Founder or operator shaping the initial product thesis");
  }
  if (keywords.includes("pm") || keywords.includes("product")) {
    users.push("PM or product lead aligning scope and tradeoffs");
  }
  if (keywords.includes("agent") || keywords.includes("ai")) {
    users.push("Agent operator reviewing generated changes before handoff");
  }
  if (keywords.includes("engineer") || keywords.includes("developer")) {
    users.push("Engineer turning the approved launch packet into working code");
  }

  const defaultGoals = [
    "Clarify the problem and expected outcome",
    "Turn the idea into a reviewable build spec",
    "Keep implementation handoff explicit and attributable",
  ];

  const defaultScope = [
    "Document the first shippable workflow",
    "Capture the critical interfaces and review loop",
    "Export a bundle that an implementation agent can execute from",
  ];

  const defaultRequirements = [
    "Keep one canonical spec instead of scattered context",
    "Make risky changes reviewable before they land",
    "Produce deterministic handoff artifacts for implementation",
  ];

  const defaultConstraints = [
    "Prefer off-the-shelf libraries and low-ceremony integrations",
    "Do not put secrets in the browser",
    "Keep the first version narrow enough to validate quickly",
  ];

  const defaultSignals = [
    "The spec reaches readiness without unresolved blockers",
    "Export artifacts stay deterministic across reruns",
    "A coding agent or engineer can continue from the launch packet without clarification churn",
  ];

  const defaultUxPack = [
    "Primary surface: browser workspace with explicit review stages",
    "Key screens: guided intake, shared draft, review queue, export handoff",
    "Failure states: ambiguous scope, blocked readiness, stale collaboration room",
    "Responsive rule: mobile supports review and intake, desktop is primary for deep editing",
  ];

  const defaultTasks = [
    "Capture the problem and operator goals",
    "Draft the first buildable workflow",
    "Resolve review comments and clarifications",
    "Generate the handoff bundle and starter output",
  ];

  const defaultNonGoals = [
    "Solving every adjacent workflow in the first release",
    "Replacing general project management tools",
  ];

  return {
    tool: "heuristic",
    fields: normalizeGuidedSpecInput({
      title: titleCase(title),
      problem: sentences[0] ?? normalizedBrief,
      goals: compactLines(sentences.slice(1, 4).join("\n"), defaultGoals.join("\n")),
      users: compactLines(users.join("\n"), DEFAULT_GUIDED_SPEC_INPUT.users),
      scope: compactLines(sentences.slice(0, 3).join("\n"), defaultScope.join("\n")),
      requirements: compactLines(normalizedBrief, defaultRequirements.join("\n")),
      constraints: compactLines("", defaultConstraints.join("\n")),
      uxPack: compactLines("", defaultUxPack.join("\n")),
      successSignals: compactLines("", defaultSignals.join("\n")),
      tasks: compactLines("", defaultTasks.join("\n")),
      nonGoals: compactLines("", defaultNonGoals.join("\n")),
    }),
    notes: [
      "Used the local deterministic fallback instead of an external agent runtime.",
      "Review and tighten any generated field before creating the draft.",
    ],
  };
}

async function checkCommand(command: string, versionArg = "--version") {
  try {
    const { stdout, stderr } = await execFileAsync(command, [versionArg], {
      timeout: 2_500,
      maxBuffer: 256 * 1024,
    });
    const detail = `${stdout || stderr}`.trim().split("\n")[0] ?? `${command} detected`;
    return { available: true, detail };
  } catch {
    return { available: false, detail: `${command} not available in this runtime` };
  }
}

export const getAgentAssistToolStatuses = cache(async (): Promise<AgentAssistToolStatus[]> => {
  const [codex, claude] = await Promise.all([checkCommand("codex"), checkCommand("claude")]);

  return [
    {
      id: "codex_cli",
      label: "Codex CLI",
      available: codex.available,
      detail: codex.detail,
    },
    {
      id: "claude_cli",
      label: "Claude Code CLI",
      available: claude.available,
      detail: claude.detail,
    },
    {
      id: "heuristic",
      label: "Built-in fallback",
      available: true,
      detail: "Always available without external credentials.",
    },
  ];
});

function buildAssistPrompt(brief: string) {
  return [
    "You are filling structured guided-spec fields for SpecForge.",
    "Return concise plain text values for each field.",
    "Use newline-separated bullets without markdown prefixes inside each string.",
    "Ground the output in the user's idea brief instead of generic startup filler.",
    "Prefer practical constraints, explicit requirements, and reviewable tasks.",
    "Always include a UX Pack covering primary surface, key screens, failure states, and responsive expectations.",
    "If the product has no GUI, say so explicitly in UX Pack instead of leaving it blank.",
    "",
    "Idea brief:",
    brief.trim(),
  ].join("\n");
}

async function runCodexAssist(brief: string) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "specforge-assist-"));
  const schemaPath = path.join(tempDir, "guided-spec.schema.json");
  const outputPath = path.join(tempDir, "guided-spec.output.json");

  try {
    await writeFile(schemaPath, JSON.stringify(assistJsonSchema, null, 2));
    await execFileAsync(
      "codex",
      [
        "exec",
        "--skip-git-repo-check",
        "--sandbox",
        "read-only",
        "--output-schema",
        schemaPath,
        "-o",
        outputPath,
        buildAssistPrompt(brief),
      ],
      {
        timeout: 60_000,
        maxBuffer: 2 * 1024 * 1024,
      },
    );

    const parsed = assistSchema.parse(JSON.parse(await readFile(outputPath, "utf8")));

    return {
      tool: "codex_cli" as const,
      fields: normalizeGuidedSpecInput(parsed),
      notes: [
        "Populated fields using the locally installed Codex CLI.",
        "This reuses the operator's existing Codex login instead of browser-stored API keys.",
      ],
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function runClaudeAssist(brief: string) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "specforge-claude-assist-"));
  const schemaPath = path.join(tempDir, "guided-spec.schema.json");
  const promptPath = path.join(tempDir, "guided-spec.prompt.txt");

  try {
    await writeFile(schemaPath, JSON.stringify(assistJsonSchema, null, 2));
    await writeFile(promptPath, buildAssistPrompt(brief));

    const { stdout } = await execFileAsync(
      "bash",
      [
        "-lc",
        'claude -p --output-format json --json-schema "$(cat "$1")" "$(cat "$2")" < /dev/null',
        "specforge-claude-assist",
        schemaPath,
        promptPath,
      ],
      {
        timeout: 45_000,
        maxBuffer: 2 * 1024 * 1024,
      },
    );

    const raw = JSON.parse(stdout) as { structured_output?: unknown } | Record<string, unknown>;
    const parsed = assistSchema.parse(
      raw && typeof raw === "object" && "structured_output" in raw
        ? raw.structured_output
        : raw,
    );

    return {
      tool: "claude_cli" as const,
      fields: normalizeGuidedSpecInput(parsed),
      notes: [
        "Populated fields using the locally installed Claude Code CLI.",
        "This reuses the operator's existing Claude Code login instead of browser-stored API keys.",
      ],
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function resolveRequestedTool(
  requestedTool: AgentAssistToolId,
  statuses: AgentAssistToolStatus[],
  allowCli: boolean,
) {
  if (!allowCli) {
    return "heuristic";
  }

  if (requestedTool !== "auto") {
    return requestedTool;
  }

  if (statuses.find((tool) => tool.id === "codex_cli" && tool.available)) {
    return "codex_cli";
  }

  if (statuses.find((tool) => tool.id === "claude_cli" && tool.available)) {
    return "claude_cli";
  }

  return "heuristic";
}

export async function suggestGuidedSpecInput(input: {
  brief: string;
  requestedTool?: AgentAssistToolId;
}) {
  const session = await getCurrentWorkspaceSession();
  const statuses = await getAgentAssistToolStatuses();
  const allowCli =
    process.env.SPECFORGE_ALLOW_LOCAL_AGENT_ASSIST === "true" ||
    session.authMode === "local";
  const requestedTool = resolveRequestedTool(input.requestedTool ?? "auto", statuses, allowCli);
  const notes: string[] = [];

  if (!allowCli && requestedTool !== "heuristic") {
    notes.push("CLI-backed assist is disabled outside local mode.");
  }

  try {
    if (requestedTool === "codex_cli") {
      return { statuses, ...(await runCodexAssist(input.brief)) };
    }

    if (requestedTool === "claude_cli") {
      return { statuses, ...(await runClaudeAssist(input.brief)) };
    }
  } catch (error) {
    notes.push(
      `Fell back to built-in assist after ${requestedTool.replaceAll("_", " ")} failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  const heuristic = buildHeuristicSuggestion(input.brief);
  return {
    statuses,
    tool: heuristic.tool,
    fields: heuristic.fields,
    notes: [...heuristic.notes, ...notes],
  };
}
