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

function titleCase(raw: string) {
  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

/**
 * Extract sentences that express goals or intent from a brief.
 */
function extractGoalSentences(sentences: string[]): string[] {
  const goalPatterns = [
    /want\s+to\b/,
    /need\s+to\b/,
    /\bshould\b/,
    /\bmust\b/,
    /\ballow\s+users?\s+to\b/,
    /\benable\b/,
    /\bprovide\b/,
    /\bgoal\b/,
    /\bobjective\b/,
  ];
  const matched = sentences.filter((s) =>
    goalPatterns.some((p) => p.test(s.toLowerCase())),
  );
  return matched.slice(0, 3);
}

/**
 * Extract feature-like noun phrases from a brief.
 */
function extractFeatureTerms(text: string): string[] {
  const featurePatterns = [
    "real-time", "collaborative", "export", "review", "search",
    "authentication", "auth", "dashboard", "notification", "analytics",
    "import", "sync", "webhook", "api", "integration", "editor",
    "workflow", "pipeline", "template", "marketplace", "chat",
    "upload", "download", "sharing", "permission", "role",
    "monitoring", "logging", "billing", "payment", "subscription",
  ];
  const lower = text.toLowerCase();
  return featurePatterns.filter((f) => lower.includes(f));
}

/**
 * Detect user roles mentioned in text.
 */
function extractRoles(text: string): string[] {
  const roleMap: Record<string, string> = {
    user: "End user interacting with the product",
    customer: "Customer evaluating or purchasing the product",
    admin: "Administrator managing configuration and access",
    developer: "Developer integrating or extending the system",
    engineer: "Engineer implementing and maintaining the codebase",
    team: "Team member collaborating on shared workflows",
    operator: "Operator managing day-to-day system operations",
    agent: "AI agent executing automated tasks within the system",
    manager: "Manager overseeing team output and approvals",
    designer: "Designer defining UX patterns and visual language",
    founder: "Founder shaping product direction and priorities",
    pm: "Product manager aligning scope and stakeholder needs",
  };

  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [keyword, description] of Object.entries(roleMap)) {
    if (lower.includes(keyword)) {
      found.push(description);
    }
  }
  return found;
}

/**
 * Infer domain from brief for fallback user/scope generation.
 */
function inferDomain(lower: string): { users: string[]; outOfScope: string[] } {
  if (lower.includes("spec") || lower.includes("document") || lower.includes("requirement")) {
    return {
      users: ["Product teams writing and reviewing specifications", "Engineering leads planning implementation"],
      outOfScope: ["Native mobile app", "Third-party marketplace integrations"],
    };
  }
  if (lower.includes("code") || lower.includes("develop") || lower.includes("build")) {
    return {
      users: ["Developers writing and shipping code", "Tech leads reviewing architecture decisions"],
      outOfScope: ["No-code builder for non-technical users", "Offline-first desktop client"],
    };
  }
  if (lower.includes("data") || lower.includes("analytics") || lower.includes("dashboard")) {
    return {
      users: ["Data analysts querying and visualizing metrics", "Business stakeholders reviewing reports"],
      outOfScope: ["Raw data lake management", "Custom ML model training pipeline"],
    };
  }
  return {
    users: ["Primary end user of the described system", "Team lead or operator managing the workflow"],
    outOfScope: ["Native mobile app", "Multi-tenant enterprise administration"],
  };
}

export function buildHeuristicSuggestion(brief: string): AgentAssistSuggestion {
  const normalizedBrief = brief.trim();
  const sentences = normalizedBrief
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const lower = normalizedBrief.toLowerCase();

  // 1. Title extraction: clean, Title Case, max 60 chars
  const rawTitle = (sentences[0]?.replace(/[.!?]+$/, "") ?? DEFAULT_GUIDED_SPEC_INPUT.title)
    .replace(/[^\w\s-]/g, "")
    .trim();
  const title = rawTitle.length > 60 ? rawTitle.slice(0, 57).trim() + "..." : rawTitle;

  // 2. Goals: extract intent sentences, fallback to 2 derived goals
  const goalSentences = extractGoalSentences(sentences);
  const goals = goalSentences.length > 0
    ? goalSentences
    : [
        `Define and validate the core ${rawTitle.toLowerCase().split(/\s+/).slice(0, 3).join(" ")} workflow`,
        "Produce a reviewable spec that bridges idea to implementation",
      ];

  // 3. Users: detect roles, fallback to domain inference
  const detectedRoles = extractRoles(normalizedBrief);
  const domainInfo = inferDomain(lower);
  const users = detectedRoles.length > 0 ? detectedRoles.slice(0, 3) : domainInfo.users;

  // 4. Scope (in): extract feature noun phrases from brief
  const featureTerms = extractFeatureTerms(normalizedBrief);
  const scopeIn = featureTerms.length > 0
    ? featureTerms.slice(0, 4).map((f) => `${titleCase(f)} functionality as described in the brief`)
    : sentences.slice(0, 3).map((s) => s.replace(/[.!?]+$/, ""));
  if (scopeIn.length === 0) {
    scopeIn.push("Core workflow described in the brief");
  }

  // 5. Scope (out): infer from what the brief does NOT mention
  const mentionsMobile = lower.includes("mobile") || lower.includes("ios") || lower.includes("android");
  const mentionsAuth = lower.includes("auth") || lower.includes("login") || lower.includes("sso");
  const mentionsBilling = lower.includes("billing") || lower.includes("payment") || lower.includes("subscription");
  const outOfScope: string[] = [];
  if (!mentionsMobile) outOfScope.push("Native mobile application");
  if (!mentionsAuth) outOfScope.push("Custom authentication or SSO integration");
  if (!mentionsBilling) outOfScope.push("Billing, payments, or subscription management");
  const nonGoals = outOfScope.length > 0
    ? outOfScope.slice(0, 2)
    : domainInfo.outOfScope;

  // 6. Requirements: concrete but non-fabricated product expectations
  const requirements = [
    "The core workflow must stay reviewable in a single canonical spec",
    "User-facing actions must provide clear success, failure, or blocked-state feedback",
  ];
  if (lower.includes("collaborat") || lower.includes("real-time") || lower.includes("multiplayer")) {
    requirements.push("Collaboration state should stay synchronized across active participants");
  } else if (lower.includes("export") || lower.includes("handoff") || lower.includes("bundle")) {
    requirements.push("Export outputs must be deterministic and reproducible across runs");
  } else if (lower.includes("search") || lower.includes("query")) {
    requirements.push("Search results should stay understandable and easy to refine");
  } else {
    requirements.push("The first release should make the primary workflow executable without external clarification");
  }

  // 7. Constraints
  const constraints = [
    "Prefer established libraries over custom implementations",
    "Keep the first version narrow enough to validate in 2-4 weeks",
    "No secrets or credentials stored client-side",
  ];

  // 8. UX Pack: generate if brief mentions any UI concept
  const mentionsUi = /\b(ui|ux|screen|page|dashboard|interface|frontend|web|app|button|form|modal|panel|view)\b/i.test(normalizedBrief);
  const mentionsApiOnly = /\b(api[\s-]only|cli[\s-]only|headless|backend[\s-]only)\b/i.test(normalizedBrief);
  let uxPack: string[];
  if (mentionsApiOnly) {
    uxPack = ["This product is API-only or CLI-only — no GUI required"];
  } else if (mentionsUi || !mentionsApiOnly) {
    const featureScreens = featureTerms.slice(0, 3).map((f) => `${titleCase(f)} view`);
    const screens = featureScreens.length >= 2
      ? featureScreens
      : ["Overview dashboard", "Detail/edit view", "Settings and configuration"];
    uxPack = [
      `Primary surface: web-based workspace`,
      `Key screens: ${screens.join(", ")}`,
      `Failure states: loading errors with retry, validation warnings inline, empty states with onboarding prompts`,
      `Responsive: desktop-first for primary workflows, mobile-friendly for review and status checks`,
    ];
  } else {
    uxPack = [
      "Primary surface: browser workspace",
      "Key screens: intake, editor, review queue, export",
      "Failure states: validation errors, blocked readiness, stale data warnings",
      "Responsive: desktop-primary, mobile supports read and review",
    ];
  }

  // 9. Success signals: measurable, derived from brief topic
  const successSignals = [
    `Users can complete the core ${rawTitle.toLowerCase().split(/\s+/).slice(0, 2).join(" ")} workflow end-to-end without external help`,
    "Reviewers can approve the spec without clarification churn on the core path",
  ];
  if (lower.includes("collaborat") || lower.includes("team")) {
    successSignals.push("Multiple team members can contribute without merge conflicts or lost context");
  } else {
    successSignals.push("The resulting output is concrete enough to hand off directly into implementation");
  }

  // 10. Tasks: derive from brief features
  const tasks = [
    `Set up project scaffolding and core data model for ${rawTitle.toLowerCase().split(/\s+/).slice(0, 3).join(" ")}`,
  ];
  if (featureTerms.length > 0) {
    for (const feature of featureTerms.slice(0, 2)) {
      tasks.push(`Implement ${feature} feature with basic validation and error handling`);
    }
  }
  tasks.push("Wire up end-to-end workflow and integration tests");
  tasks.push("Polish UX, add empty states, and prepare for first user test");

  return {
    tool: "heuristic",
    fields: normalizeGuidedSpecInput({
      title: titleCase(title),
      problem: sentences.length > 1
        ? sentences.slice(0, 2).join(" ")
        : normalizedBrief,
      goals: goals.join("\n"),
      users: users.join("\n"),
      scope: scopeIn.join("\n"),
      requirements: requirements.join("\n"),
      constraints: constraints.join("\n"),
      uxPack: uxPack.join("\n"),
      successSignals: successSignals.join("\n"),
      tasks: tasks.join("\n"),
      nonGoals: nonGoals.join("\n"),
    }),
    notes: [
      "Used the local deterministic fallback — fields were derived from brief content analysis.",
      "Goals, users, scope, and requirements are inferred from your brief. Review and adjust before creating the draft.",
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

export type CliEnvironment = {
  codexAvailable: boolean;
  claudeAvailable: boolean;
  preferredTool: "codex" | "claude" | "heuristic";
  reason: string;
};

/**
 * Detect which CLI tools are available in the runtime and which one
 * SpecForge will prefer for agent-assisted operations.
 */
export async function detectCliEnvironment(): Promise<CliEnvironment> {
  const [codexResult, claudeResult] = await Promise.all([
    checkCommand("codex"),
    checkCommand("claude"),
  ]);

  const codexAvailable = codexResult.available;
  const claudeAvailable = claudeResult.available;
  const preferCodex = process.env.PREFER_CODEX_CLI === "true";

  const preferredTool: CliEnvironment["preferredTool"] =
    preferCodex && codexAvailable
      ? "codex"
      : claudeAvailable
        ? "claude"
        : codexAvailable
          ? "codex"
          : "heuristic";

  const reason =
    preferredTool === "heuristic"
      ? "Neither codex nor claude CLI found. Install one for AI-powered suggestions."
      : `Using ${preferredTool} CLI (${preferredTool === "codex" ? "Codex" : "Claude Code"} detected)`;

  return { codexAvailable, claudeAvailable, preferredTool, reason };
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
