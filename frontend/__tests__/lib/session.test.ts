import { describe, it, expect, beforeEach } from "vitest";
import {
  startSession,
  recordResponse,
  completeSession,
  getSession,
  getUnlockedLevel,
} from "@/lib/session";

describe("session management", () => {
  it("startSession creates a session in localStorage and returns an id", () => {
    const id = startSession("Polity", "Chapter 1", 1, 0, 10);
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);

    const session = getSession(id);
    expect(session).not.toBeNull();
    expect(session!.subject).toBe("Polity");
    expect(session!.chapter).toBe("Chapter 1");
    expect(session!.level).toBe(1);
    expect(session!.offset).toBe(0);
    expect(session!.limit).toBe(10);
    expect(session!.completed_at).toBeNull();
    expect(session!.responses).toHaveLength(0);
  });

  it("startSession stores optional displayName", () => {
    const id = startSession("History", "Ch2", 2, 10, 10, "Level 2");
    const session = getSession(id);
    expect(session!.displayName).toBe("Level 2");
  });

  it("recordResponse appends to session responses", () => {
    const id = startSession("Geography", "Ch1", 1, 0, 5);
    recordResponse(id, "q1", "A", true, 30);
    const session = getSession(id);
    expect(session!.responses).toHaveLength(1);
    expect(session!.responses[0]).toMatchObject({
      question_id: "q1",
      selected_option: "A",
      is_correct: true,
      time_spent_seconds: 30,
    });
  });

  it("recordResponse updates total_questions and correct_count", () => {
    const id = startSession("Science", "Ch1", 1, 0, 3);
    recordResponse(id, "q1", "A", true, 15);
    recordResponse(id, "q2", "B", false, 10);
    recordResponse(id, "q3", "C", true, 20);

    const session = getSession(id);
    expect(session!.total_questions).toBe(3);
    expect(session!.correct_count).toBe(2);
  });

  it("recordResponse does nothing for unknown sessionId", () => {
    recordResponse("non-existent-id", "q1", "A", true, 5);
    expect(getSession("non-existent-id")).toBeNull();
  });

  it("completeSession sets completed_at timestamp", () => {
    const id = startSession("Polity", "Ch3", 1, 0, 10);
    expect(getSession(id)!.completed_at).toBeNull();

    completeSession(id);
    const session = getSession(id);
    expect(session!.completed_at).not.toBeNull();
    expect(new Date(session!.completed_at!).getTime()).toBeGreaterThan(0);
  });

  it("completeSession does nothing for unknown sessionId", () => {
    completeSession("ghost-id");
    expect(getSession("ghost-id")).toBeNull();
  });

  it("getSession returns null for unknown id", () => {
    expect(getSession("does-not-exist")).toBeNull();
  });

  it("multiple sessions coexist independently", () => {
    const id1 = startSession("Polity", "Ch1", 1, 0, 5);
    const id2 = startSession("History", "Ch1", 1, 0, 5);

    recordResponse(id1, "q1", "A", true, 10);

    expect(getSession(id1)!.correct_count).toBe(1);
    expect(getSession(id2)!.correct_count).toBe(0);
  });

  it("getUnlockedLevel always returns Infinity", () => {
    expect(getUnlockedLevel("Polity", "any-chapter")).toBe(Infinity);
    expect(getUnlockedLevel("History", "some-chapter")).toBe(Infinity);
  });
});
