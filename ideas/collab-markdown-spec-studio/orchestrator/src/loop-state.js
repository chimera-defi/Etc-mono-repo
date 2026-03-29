export function createEmptyLoopState() {
  return {
    updated_at: null,
    intents: [],
    claims: [],
    signals: [],
    passes: [],
    verifications: [],
    review_every: 3,
  };
}

export function normalizeLoopState(parsed) {
  return {
    updated_at: parsed?.updated_at ?? null,
    intents: Array.isArray(parsed?.intents) ? parsed.intents : [],
    claims: Array.isArray(parsed?.claims) ? parsed.claims : [],
    signals: Array.isArray(parsed?.signals) ? parsed.signals : [],
    passes: Array.isArray(parsed?.passes) ? parsed.passes : [],
    verifications: Array.isArray(parsed?.verifications) ? parsed.verifications : [],
    review_every: parsed?.review_every ?? 3,
  };
}

export function collectIntentIds(sections, toIntentId) {
  return new Set(
    sections.flatMap((section) =>
      section.items
        .filter((item) => !item.checked)
        .map((item) => toIntentId(section.heading, item.text)),
    ),
  );
}

export function findLatestRelevantIntent(state, validIntentIds) {
  return [...state.intents]
    .reverse()
    .find((intent) => validIntentIds.has(intent.intent_id)) ?? null;
}

export function findLatestRelevantClaim(state, validIntentIds) {
  return [...state.claims]
    .reverse()
    .find((claim) => validIntentIds.has(claim.intent_id)) ?? null;
}

export function findLatestRelevantSignal(state, validIntentIds) {
  return [...state.signals]
    .reverse()
    .find((signal) => validIntentIds.has(signal.intent_id)) ?? null;
}

export function findActiveRelevantClaim(state, validIntentIds) {
  return [...state.claims]
    .reverse()
    .find((claim) => claim.state === "claimed" && validIntentIds.has(claim.intent_id)) ?? null;
}

export function findLatestVerification(state) {
  return [...state.verifications].reverse()[0] ?? null;
}
