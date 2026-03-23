export type GuidedSpecInput = {
  title: string;
  problem: string;
  goals: string;
  users: string;
  scope: string;
  requirements: string;
  constraints: string;
  successSignals: string;
  tasks: string;
  nonGoals: string;
};

export const DEFAULT_GUIDED_SPEC_INPUT: GuidedSpecInput = {
  title: "SpecForge MVP",
  problem: "Teams lose momentum between idea, spec, review, and build handoff.",
  goals: [
    "Produce a build-ready spec",
    "Support human and agent collaboration",
    "Keep review and attribution explicit",
  ].join("\n"),
  users: ["Product-minded founder", "PM + engineer pair", "Coding agent operator"].join("\n"),
  scope: [
    "Guided spec creation",
    "Shared authoring canvas",
    "Patch review and export handoff",
  ].join("\n"),
  requirements: [
    "Guided spec wizard with required sections",
    "Shared multiplayer canvas with attribution",
    "Human approval queue for agent patches",
  ].join("\n"),
  constraints: [
    "Use off-the-shelf collaboration libraries where possible",
    "Keep human approval in the loop",
    "Stay inside curated starter handoff paths",
  ].join("\n"),
  successSignals: [
    "Spec reaches readiness without unresolved review work",
    "Handoff bundle is deterministic",
    "Starter output is runnable",
  ].join("\n"),
  tasks: [
    "Collect core requirements",
    "Draft the canonical spec",
    "Review agent patches",
    "Export the handoff bundle",
    "Generate the starter app",
  ].join("\n"),
  nonGoals: [
    "General-purpose project management",
    "Full autonomous delivery platform",
  ].join("\n"),
};

export function normalizeGuidedSpecInput(input: Partial<GuidedSpecInput>): GuidedSpecInput {
  return {
    title: input.title?.trim() || DEFAULT_GUIDED_SPEC_INPUT.title,
    problem: input.problem?.trim() || DEFAULT_GUIDED_SPEC_INPUT.problem,
    goals: input.goals?.trim() || DEFAULT_GUIDED_SPEC_INPUT.goals,
    users: input.users?.trim() || DEFAULT_GUIDED_SPEC_INPUT.users,
    scope: input.scope?.trim() || DEFAULT_GUIDED_SPEC_INPUT.scope,
    requirements: input.requirements?.trim() || DEFAULT_GUIDED_SPEC_INPUT.requirements,
    constraints: input.constraints?.trim() || DEFAULT_GUIDED_SPEC_INPUT.constraints,
    successSignals:
      input.successSignals?.trim() || DEFAULT_GUIDED_SPEC_INPUT.successSignals,
    tasks: input.tasks?.trim() || DEFAULT_GUIDED_SPEC_INPUT.tasks,
    nonGoals: input.nonGoals?.trim() || DEFAULT_GUIDED_SPEC_INPUT.nonGoals,
  };
}

function toBulletLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `- ${line.replace(/^-+\s*/, "")}`);
}

function toSection(heading: string, body: string, fallback: string) {
  const trimmed = body.trim();
  const lines = trimmed.length > 0 ? toBulletLines(trimmed) : [`- ${fallback}`];

  return [`## ${heading}`, "", ...lines].join("\n");
}

export function buildGuidedSpecMarkdown(input: GuidedSpecInput) {
  const title = input.title.trim() || "Untitled SpecForge Draft";

  return [
    `# ${title}`,
    "",
    toSection("Problem", input.problem, "Clarify the problem this spec is solving."),
    "",
    toSection("Goals", input.goals, "List the outcomes this build should achieve."),
    "",
    toSection("Users", input.users, "Describe the primary user or operator."),
    "",
    toSection("Scope", input.scope, "Define what the first build includes."),
    "",
    toSection(
      "Requirements",
      input.requirements,
      "Describe the product and workflow requirements that must ship.",
    ),
    "",
    toSection(
      "Non-Goals",
      input.nonGoals,
      "Call out adjacent work that is intentionally excluded.",
    ),
    "",
    toSection(
      "Constraints",
      input.constraints,
      "Document tech, team, or delivery constraints that shape the build.",
    ),
    "",
    toSection(
      "Success Signals",
      input.successSignals,
      "List the observable signs that this build is working.",
    ),
    "",
    toSection("Tasks", input.tasks, "Break the work into implementation-sized tasks."),
  ].join("\n");
}

export function inferClarificationQuestions(
  input: GuidedSpecInput,
): Array<{
  section_heading: string;
  question: string;
  priority: "critical" | "normal" | "optional";
}> {
  const SPARSE_THRESHOLD = 30;

  function isSparse(value: string | undefined): boolean {
    return !value || value.trim().length < SPARSE_THRESHOLD;
  }

  const checks: Array<{
    field: keyof GuidedSpecInput;
    section_heading: string;
    question: string;
    priority: "critical" | "normal" | "optional";
  }> = [
    {
      field: "problem",
      section_heading: "Problem",
      question:
        "What specific problem does this solve, and for whom? Include the pain point and why existing solutions fail.",
      priority: "critical",
    },
    {
      field: "goals",
      section_heading: "Goals",
      question:
        "What are the 2-3 measurable outcomes that would make this a success? Each goal should be verifiable.",
      priority: "critical",
    },
    {
      field: "users",
      section_heading: "Users",
      question:
        "Who are the primary users or operators? Describe their technical level and what job they are trying to do.",
      priority: "normal",
    },
    {
      field: "scope",
      section_heading: "Scope",
      question:
        "What is explicitly in scope for the first version? What can be shipped in 4-6 weeks?",
      priority: "critical",
    },
    {
      field: "requirements",
      section_heading: "Requirements",
      question:
        "What must the system do? List the 3-5 minimum features needed before the first user can get value.",
      priority: "critical",
    },
    {
      field: "constraints",
      section_heading: "Constraints",
      question:
        "What constraints shape the build? (tech stack, timeline, team size, budget, API limits)",
      priority: "normal",
    },
    {
      field: "successSignals",
      section_heading: "Success Signals",
      question:
        "How will you know the first version worked? Give 2-3 measurable signals with thresholds.",
      priority: "critical",
    },
    {
      field: "tasks",
      section_heading: "Tasks",
      question: "What are the top 5 implementation tasks in order of dependency?",
      priority: "optional",
    },
    {
      field: "nonGoals",
      section_heading: "Non-Goals",
      question:
        "What is explicitly out of scope? Name 2-3 things you are intentionally not building.",
      priority: "optional",
    },
  ];

  const results = checks
    .filter((check) => isSparse(input[check.field]))
    .map(({ section_heading, question, priority }) => ({ section_heading, question, priority }));

  const priorityOrder: Record<string, number> = { critical: 0, normal: 1, optional: 2 };
  return results.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function buildGuidedSpecMetadata(input: GuidedSpecInput) {
  return {
    creation_mode: "guided",
    problem: input.problem.trim(),
    goals: input.goals.trim(),
    users: input.users.trim(),
    scope: input.scope.trim(),
    requirements: input.requirements.trim(),
    constraints: input.constraints.trim(),
    success_signals: input.successSignals.trim(),
    tasks: input.tasks.trim(),
    non_goals: input.nonGoals.trim(),
  };
}
