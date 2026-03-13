export type GuidedSpecInput = {
  title: string;
  problem: string;
  goals: string;
  users: string;
  scope: string;
  constraints: string;
  successSignals: string;
  tasks: string;
  nonGoals: string;
};

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

export function buildGuidedSpecMetadata(input: GuidedSpecInput) {
  return {
    creation_mode: "guided",
    problem: input.problem.trim(),
    goals: input.goals.trim(),
    users: input.users.trim(),
    scope: input.scope.trim(),
    constraints: input.constraints.trim(),
    success_signals: input.successSignals.trim(),
    tasks: input.tasks.trim(),
    non_goals: input.nonGoals.trim(),
  };
}
