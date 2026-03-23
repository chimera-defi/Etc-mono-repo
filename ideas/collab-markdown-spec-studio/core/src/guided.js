/**
 * Guided spec markdown generation.
 */

function listItems(text) {
  if (!text) return "";
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("-") ? line : `- ${line}`))
    .join("\n");
}

/**
 * @param {Object} input
 * @param {string} input.title
 * @param {string} input.problem
 * @param {string} input.goals
 * @param {string} input.users
 * @param {string} input.scope
 * @param {string} input.requirements
 * @param {string} input.constraints
 * @param {string} input.successSignals
 * @param {string} input.tasks
 * @param {string} input.nonGoals
 */
export function buildGuidedSpecMarkdown(input) {
  const sections = [`# ${input.title}`];

  if (input.problem) {
    sections.push(`\n## Problem\n\n${listItems(input.problem)}`);
  }
  if (input.goals) {
    sections.push(`\n## Goals\n\n${listItems(input.goals)}`);
  }
  if (input.users) {
    sections.push(`\n## Users\n\n${listItems(input.users)}`);
  }
  if (input.scope) {
    sections.push(`\n## Scope\n\n${listItems(input.scope)}`);
  }
  if (input.requirements) {
    sections.push(`\n## Requirements\n\n${listItems(input.requirements)}`);
  }
  if (input.constraints) {
    sections.push(`\n## Constraints\n\n${listItems(input.constraints)}`);
  }
  if (input.successSignals) {
    sections.push(`\n## Success Signals\n\n${listItems(input.successSignals)}`);
  }
  if (input.tasks) {
    sections.push(`\n## Tasks\n\n${listItems(input.tasks)}`);
  }
  if (input.nonGoals) {
    sections.push(`\n## Non-Goals\n\n${listItems(input.nonGoals)}`);
  }

  return sections.join("\n");
}

export const DEFAULT_GUIDED_SPEC_INPUT = {
  title: "",
  problem: "",
  goals: "",
  users: "",
  scope: "",
  requirements: "",
  constraints: "",
  successSignals: "",
  tasks: "",
  nonGoals: "",
};

export function normalizeGuidedSpecInput(raw) {
  return {
    title: raw.title ?? "",
    problem: raw.problem ?? "",
    goals: raw.goals ?? "",
    users: raw.users ?? "",
    scope: raw.scope ?? "",
    requirements: raw.requirements ?? "",
    constraints: raw.constraints ?? "",
    successSignals: raw.successSignals ?? raw.success_signals ?? "",
    tasks: raw.tasks ?? "",
    nonGoals: raw.nonGoals ?? raw.non_goals ?? "",
  };
}

/**
 * @param {Object} input
 * @returns {Record<string, string>}
 */
export function buildGuidedSpecMetadata(input) {
  /** @type {Record<string, string>} */
  const metadata = {};

  if (input.goals) metadata.goals = input.goals;
  if (input.tasks) metadata.tasks = input.tasks;
  if (input.constraints) metadata.constraints = input.constraints;
  if (input.successSignals) metadata.success_signals = input.successSignals;
  if (input.users) metadata.users = input.users;
  if (input.scope) metadata.scope = input.scope;
  if (input.nonGoals) metadata.non_goals = input.nonGoals;
  metadata.creation_mode = "guided";

  return metadata;
}
