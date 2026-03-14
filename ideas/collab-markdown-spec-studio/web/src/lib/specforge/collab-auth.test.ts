import { describe, expect, it } from "vitest";

import {
  buildRoomName,
  createCollabToken,
  verifyCollabToken,
} from "./collab-auth";

describe("collab auth", () => {
  it("creates and verifies a room-scoped token", () => {
    const token = createCollabToken({
      documentId: "doc_123",
      version: 4,
      actorId: "reviewer_1",
      actorName: "Reviewer 1",
      actorColor: "#0f766e",
    });

    const claims = verifyCollabToken(token, {
      expectedRoomName: buildRoomName("doc_123", 4),
    });

    expect(claims.sub).toBe("reviewer_1");
    expect(claims.document_id).toBe("doc_123");
    expect(claims.room).toBe("doc_123:v4");
  });

  it("rejects tokens for a different room", () => {
    const token = createCollabToken({
      documentId: "doc_abc",
      version: 2,
      actorId: "reviewer_2",
      actorName: "Reviewer 2",
    });

    expect(() =>
      verifyCollabToken(token, {
        expectedRoomName: "doc_abc:v3",
      }),
    ).toThrow("Token room mismatch");
  });
});
