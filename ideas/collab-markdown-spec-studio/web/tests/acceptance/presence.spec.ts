/**
 * Acceptance Test: Cursor Presence Tracking
 *
 * Validates real-time cursor position tracking, user state management,
 * and presence lifecycle events in collaborative environments.
 *
 * Tests cover:
 * - Multiple users' cursor positions tracked independently
 * - Cursor position updates as users type
 * - User state transitions (active -> idle -> disconnected)
 * - Inactive user cleanup after timeout
 * - Active users list retrieval
 * - Presence events emitted correctly (updated, joined, left)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createFreshEngine } from "../helpers.js";

describe("Cursor presence tracking", () => {
  let engine = createFreshEngine();

  beforeEach(() => {
    engine = createFreshEngine();
  });

  it("should track cursor position for a single user", () => {
    const userId = "user_1";
    const userName = "Alice";
    const color = "#ff0000";

    engine.updateUserPresence(userId, userName, color, {
      line: 5,
      column: 10,
    });

    const presence = engine.getUserPresence(userId);
    expect(presence).toBeDefined();
    expect(presence!.user_id).toBe(userId);
    expect(presence!.user_name).toBe(userName);
    expect(presence!.color).toBe(color);
    expect(presence!.cursor_position).toEqual({ line: 5, column: 10 });
    expect(presence!.state).toBe("active");
  });

  it("should track multiple users' cursor positions independently", () => {
    const user1 = {
      user_id: "user_1",
      user_name: "Alice",
      color: "#ff0000",
      cursor: { line: 5, column: 10 },
    };
    const user2 = {
      user_id: "user_2",
      user_name: "Bob",
      color: "#00ff00",
      cursor: { line: 8, column: 25 },
    };

    engine.updateUserPresence(
      user1.user_id,
      user1.user_name,
      user1.color,
      user1.cursor
    );
    engine.updateUserPresence(
      user2.user_id,
      user2.user_name,
      user2.color,
      user2.cursor
    );

    const presence1 = engine.getUserPresence(user1.user_id);
    const presence2 = engine.getUserPresence(user2.user_id);

    expect(presence1!.cursor_position).toEqual(user1.cursor);
    expect(presence2!.cursor_position).toEqual(user2.cursor);
    expect(presence1!.color).toBe(user1.color);
    expect(presence2!.color).toBe(user2.color);
  });

  it("should update cursor position as user types", () => {
    const userId = "user_1";
    const userName = "Alice";
    const color = "#ff0000";

    // Initial position
    engine.updateUserPresence(userId, userName, color, {
      line: 1,
      column: 0,
    });

    let presence = engine.getUserPresence(userId);
    expect(presence!.cursor_position).toEqual({ line: 1, column: 0 });

    // After typing a few characters
    engine.updateUserPresence(userId, userName, color, {
      line: 1,
      column: 5,
    });

    presence = engine.getUserPresence(userId);
    expect(presence!.cursor_position).toEqual({ line: 1, column: 5 });

    // After pressing enter and continuing
    engine.updateUserPresence(userId, userName, color, {
      line: 2,
      column: 3,
    });

    presence = engine.getUserPresence(userId);
    expect(presence!.cursor_position).toEqual({ line: 2, column: 3 });
  });

  it("should mark user as idle after state change", () => {
    const userId = "user_1";
    const userName = "Alice";
    const color = "#ff0000";

    engine.updateUserPresence(userId, userName, color, {
      line: 5,
      column: 10,
    });

    let presence = engine.getUserPresence(userId);
    expect(presence!.state).toBe("active");

    // Mark as idle
    engine.setUserState(userId, "idle");

    presence = engine.getUserPresence(userId);
    expect(presence!.state).toBe("idle");
  });

  it("should mark user as disconnected", () => {
    const userId = "user_1";
    const userName = "Alice";
    const color = "#ff0000";

    engine.updateUserPresence(userId, userName, color, {
      line: 5,
      column: 10,
    });

    engine.setUserState(userId, "disconnected");

    const presence = engine.getUserPresence(userId);
    expect(presence!.state).toBe("disconnected");
  });

  it("should throw error when setting state for non-existent user", () => {
    expect(() => {
      engine.setUserState("non_existent_user", "idle");
    }).toThrow("User not found in presence state");
  });

  it("should remove inactive users after timeout", () => {
    const user1 = {
      user_id: "user_1",
      user_name: "Alice",
      color: "#ff0000",
    };
    const user2 = {
      user_id: "user_2",
      user_name: "Bob",
      color: "#00ff00",
    };

    engine.updateUserPresence(user1.user_id, user1.user_name, user1.color, {
      line: 5,
      column: 10,
    });

    // Simulate delay by manually adjusting last_activity (not ideal in production)
    // For this test, we'll verify the cleanup logic works
    const presence1 = engine.getUserPresence(user1.user_id);
    expect(presence1).toBeDefined();

    engine.updateUserPresence(user2.user_id, user2.user_name, user2.color, {
      line: 8,
      column: 15,
    });

    // Verify both users exist
    let activeUsers = engine.getActiveUsers();
    expect(activeUsers.length).toBe(2);

    // Create a timeout scenario: manually set old timestamp
    if (presence1) {
      // Directly modify the last_activity to simulate inactivity
      presence1.last_activity = new Date(
        Date.now() - 10000
      ).toISOString();
    }

    // Clean up inactive users (timeout = 5000ms)
    engine.cleanupInactiveUsers(5000);

    // After cleanup, only active (non-stale) users remain
    activeUsers = engine.getActiveUsers();
    expect(activeUsers.length).toBe(1);
    expect(activeUsers[0].user_id).toBe(user2.user_id);
  });

  it("should return empty list of active users when all are disconnected", () => {
    engine.updateUserPresence("user_1", "Alice", "#ff0000", {
      line: 5,
      column: 10,
    });
    engine.updateUserPresence("user_2", "Bob", "#00ff00", {
      line: 8,
      column: 15,
    });

    let activeUsers = engine.getActiveUsers();
    expect(activeUsers.length).toBe(2);

    engine.setUserState("user_1", "disconnected");
    engine.setUserState("user_2", "disconnected");

    activeUsers = engine.getActiveUsers();
    expect(activeUsers.length).toBe(0);
  });

  it("should include idle users in active users list", () => {
    engine.updateUserPresence("user_1", "Alice", "#ff0000", {
      line: 5,
      column: 10,
    });

    let activeUsers = engine.getActiveUsers();
    expect(activeUsers.length).toBe(1);

    engine.setUserState("user_1", "idle");

    activeUsers = engine.getActiveUsers();
    expect(activeUsers.length).toBe(1);
    expect(activeUsers[0].state).toBe("idle");
  });

  it("should emit presence.updated event when user cursor updates", () => {
    const userId = "user_1";

    engine.updateUserPresence(userId, "Alice", "#ff0000", {
      line: 5,
      column: 10,
    });

    const events = engine.getEvents();
    const presenceEvent = events.find(
      (e) => e.event_type === "presence.updated"
    );

    expect(presenceEvent).toBeDefined();
    expect(presenceEvent!.payload.user_id).toBe(userId);
    expect(presenceEvent!.payload.cursor_position).toEqual({
      line: 5,
      column: 10,
    });
  });

  it("should emit presence.updated event on state change (active to idle)", () => {
    const userId = "user_1";

    engine.updateUserPresence(userId, "Alice", "#ff0000", {
      line: 5,
      column: 10,
    });

    // Clear events to focus on the state change event
    const eventsBefore = engine.getEvents().length;

    engine.setUserState(userId, "idle");

    const events = engine.getEvents();
    expect(events.length).toBeGreaterThan(eventsBefore);

    const stateChangeEvent = events[events.length - 1];
    expect(stateChangeEvent.event_type).toBe("presence.updated");
    expect(stateChangeEvent.payload.user_id).toBe(userId);
    expect(stateChangeEvent.payload.state).toBe("idle");
  });

  it("should emit presence.left event when user disconnects", () => {
    const userId = "user_1";

    engine.updateUserPresence(userId, "Alice", "#ff0000", {
      line: 5,
      column: 10,
    });

    const eventsBefore = engine.getEvents().length;

    engine.setUserState(userId, "disconnected");

    const events = engine.getEvents();
    expect(events.length).toBeGreaterThan(eventsBefore);

    const disconnectEvent = events[events.length - 1];
    expect(disconnectEvent.event_type).toBe("presence.left");
    expect(disconnectEvent.payload.user_id).toBe(userId);
  });

  it("should track last_activity timestamp on every update", () => {
    const userId = "user_1";
    const beforeTime = new Date();

    engine.updateUserPresence(userId, "Alice", "#ff0000", {
      line: 5,
      column: 10,
    });

    const presence = engine.getUserPresence(userId);
    const lastActivityTime = new Date(presence!.last_activity);

    expect(lastActivityTime.getTime()).toBeGreaterThanOrEqual(
      beforeTime.getTime()
    );
    expect(lastActivityTime.getTime()).toBeLessThanOrEqual(
      new Date().getTime()
    );
  });

  it("should preserve cursor position when updating user state", () => {
    const userId = "user_1";
    const cursorPos = { line: 5, column: 10 };

    engine.updateUserPresence(userId, "Alice", "#ff0000", cursorPos);

    engine.setUserState(userId, "idle");

    const presence = engine.getUserPresence(userId);
    expect(presence!.cursor_position).toEqual(cursorPos);
  });

  it("should handle user with no cursor position (still in document)", () => {
    const userId = "user_1";

    engine.updateUserPresence(userId, "Alice", "#ff0000");

    const presence = engine.getUserPresence(userId);
    expect(presence).toBeDefined();
    expect(presence!.cursor_position).toBeUndefined();
    expect(presence!.state).toBe("active");
  });
});
