export type HeroVariant = "handoff" | "multiplayer" | "ship";

export const heroVariantOrder: HeroVariant[] = ["handoff", "multiplayer", "ship"];

export const heroVariants: Record<
  HeroVariant,
  {
    eyebrow: string;
    headline: string;
    subhead: string;
    tagline?: string;
  }
> = {
  handoff: {
    eyebrow: "Multiplayer specs for one-shot builds",
    headline: "Write the spec once. Let humans and agents build from the same canvas.",
    subhead:
      "SpecForge is a collaborative spec IDE for teams that want governed agent work, attributable changes, and a cleaner path from idea to runnable product.",
    tagline: "Multiplayer specs for one-shot builds",
  },
  multiplayer: {
    eyebrow: "One canvas for humans and agents",
    headline: "Collaborative spec writing that stays reviewable and build-ready.",
    subhead:
      "Humans edit live, agents propose patches, and the final handoff stays attributable enough to trust.",
    tagline: "Shared specs, shared context, cleaner buildouts",
  },
  ship: {
    eyebrow: "Specs that keep moving",
    headline: "Turn messy planning into a launch packet a coding agent can actually use.",
    subhead:
      "Guide the spec, review agent work, and hand off one coherent bundle instead of a pile of pasted context.",
    tagline: "Specs that move straight into build mode",
  },
};
