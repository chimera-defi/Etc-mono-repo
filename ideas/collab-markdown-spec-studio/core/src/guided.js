export const DEFAULT_GUIDED_SPEC_INPUT = {
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
  uxPack: [
    "Primary surface: collaborative web workspace plus terminal-native CLI/TUI",
    "Key screens: landing page, workspace start state, shared draft editor, review queue, export/handoff stage",
    "Failure states: stale-room reload, quota reached, auth required, offline/reconnect banner",
    "Responsive expectation: mobile can review and guide, desktop is primary for long-form drafting",
    "If no GUI is required, explicitly say API-only or CLI-only instead of leaving this blank",
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

export function normalizeGuidedSpecInput(input = {}) {
  return {
    title: input.title?.trim() || DEFAULT_GUIDED_SPEC_INPUT.title,
    problem: input.problem?.trim() || DEFAULT_GUIDED_SPEC_INPUT.problem,
    goals: input.goals?.trim() || DEFAULT_GUIDED_SPEC_INPUT.goals,
    users: input.users?.trim() || DEFAULT_GUIDED_SPEC_INPUT.users,
    scope: input.scope?.trim() || DEFAULT_GUIDED_SPEC_INPUT.scope,
    requirements: input.requirements?.trim() || DEFAULT_GUIDED_SPEC_INPUT.requirements,
    constraints: input.constraints?.trim() || DEFAULT_GUIDED_SPEC_INPUT.constraints,
    uxPack: input.uxPack?.trim() || DEFAULT_GUIDED_SPEC_INPUT.uxPack,
    successSignals: input.successSignals?.trim() || DEFAULT_GUIDED_SPEC_INPUT.successSignals,
    tasks: input.tasks?.trim() || DEFAULT_GUIDED_SPEC_INPUT.tasks,
    nonGoals: input.nonGoals?.trim() || DEFAULT_GUIDED_SPEC_INPUT.nonGoals,
  };
}

function toBulletLines(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `- ${line.replace(/^-+\s*/, "")}`);
}

function toSection(heading, body, fallback) {
  const trimmed = body.trim();
  const lines = trimmed.length > 0 ? toBulletLines(trimmed) : [`- ${fallback}`];
  return [`## ${heading}`, "", ...lines].join("\n");
}

export function buildGuidedSpecMarkdown(input) {
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
      "UX Pack",
      input.uxPack,
      "Describe the primary surfaces, key screens, failure states, and responsive expectations. Use API-only or CLI-only if no GUI is needed.",
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

export function buildGuidedSpecMetadata(input) {
  return {
    creation_mode: "guided",
    problem: input.problem.trim(),
    goals: input.goals.trim(),
    users: input.users.trim(),
    scope: input.scope.trim(),
    requirements: input.requirements.trim(),
    constraints: input.constraints.trim(),
    ux_pack: input.uxPack.trim(),
    success_signals: input.successSignals.trim(),
    tasks: input.tasks.trim(),
    non_goals: input.nonGoals.trim(),
  };
}
