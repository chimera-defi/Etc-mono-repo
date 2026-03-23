"use strict";

const crypto = require("node:crypto");

const DEFAULT_SECRET = "specforge-local-secret";
const DEFAULT_TTL_SECONDS = 15 * 60;

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function getCollabSecret() {
  const configuredSecret = process.env.SPECFORGE_COLLAB_SECRET?.trim();

  if (process.env.SPECFORGE_REQUIRE_SECURE_SECRETS === "true" && !configuredSecret) {
    throw new Error("SPECFORGE_COLLAB_SECRET must be configured outside local demo mode");
  }

  return configuredSecret || DEFAULT_SECRET;
}

function buildRoomName(documentId, version) {
  return `${documentId}:v${version}`;
}

function signPayload(payload) {
  return base64UrlEncode(
    crypto.createHmac("sha256", getCollabSecret()).update(payload).digest(),
  );
}

function createCollabToken(input) {
  const issuedAt = input.issuedAt ?? Math.floor(Date.now() / 1000);
  const ttlSeconds = input.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const claims = {
    sub: input.actorId,
    actor_name: input.actorName,
    actor_type: input.actorType ?? "human",
    actor_color: input.actorColor ?? "#1d4ed8",
    document_id: input.documentId,
    room: input.roomName ?? buildRoomName(input.documentId, input.version),
    version: input.version,
    iat: issuedAt,
    exp: issuedAt + ttlSeconds,
  };
  const payload = base64UrlEncode(JSON.stringify(claims));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function verifyCollabToken(token, options = {}) {
  const [payload, signature] = String(token ?? "").split(".");

  if (!payload || !signature) {
    throw new Error("Malformed collab token");
  }

  const expectedSignature = signPayload(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid collab token signature");
  }

  const claims = JSON.parse(base64UrlDecode(payload));
  const now = Math.floor(Date.now() / 1000);

  if (typeof claims.exp !== "number" || claims.exp <= now) {
    throw new Error("Expired collab token");
  }

  if (options.expectedDocumentId && claims.document_id !== options.expectedDocumentId) {
    throw new Error("Token document mismatch");
  }

  if (options.expectedRoomName && claims.room !== options.expectedRoomName) {
    throw new Error("Token room mismatch");
  }

  return claims;
}

module.exports = {
  DEFAULT_TTL_SECONDS,
  buildRoomName,
  createCollabToken,
  verifyCollabToken,
};
