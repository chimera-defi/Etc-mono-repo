/**
 * Core marketing / hero content.
 */

export const HERO_VARIANTS = ["handoff", "multiplayer", "ship"];

export function getHeroVariant(variant) {
  if (HERO_VARIANTS.includes(variant)) return variant;
  return "multiplayer";
}

export const FEATURE_LIST = [
  {
    id: "collab",
    title: "Real-time collaboration",
    description: "Multiple authors edit specs simultaneously with CRDT sync.",
  },
  {
    id: "patches",
    title: "Patch review workflow",
    description: "Propose, review, and accept spec changes with a full audit trail.",
  },
  {
    id: "handoff",
    title: "Agent-ready handoff",
    description: "Export a structured bundle that coding agents can execute directly.",
  },
  {
    id: "guided",
    title: "Guided spec wizard",
    description: "Answer a few questions and get a structured PRD in seconds.",
  },
];

export function getFeatureList() {
  return FEATURE_LIST;
}
