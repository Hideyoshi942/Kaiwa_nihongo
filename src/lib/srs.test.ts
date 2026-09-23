import { describe, expect, it } from "vitest";
import { addDays, cardFromFeedback, MAX_BOX, scheduleReview } from "./srs";
import type { MessageFeedback } from "./types";

function fb(correction?: string, alternative?: string): MessageFeedback {
  return {
    grammar: { score: 50, comment: "particle", correction },
    vocabulary: { score: 50, comment: "" },
    naturalness: { score: 50, comment: "tone", alternative },
    politeness: { score: 50, comment: "" },
    overall: 50,
    breakdown: { grammar: 15, vocabulary: 12, naturalness: 13, politeness: 10 },
  };
}

describe("cardFromFeedback", () => {
  it("prefers the grammar correction", () => {
    expect(cardFromFeedback("みずください", fb("お水をください", "お水をお願いします"))).toEqual({
      prompt: "みずください",
      answer: "お水をください",
      note: "particle",
    });
  });

  it("falls back to the naturalness alternative", () => {
    expect(cardFromFeedback("x", fb(undefined, "y"))?.note).toBe("tone");
  });

  it("returns null when there is nothing new to learn", () => {
    expect(cardFromFeedback("same", fb("same"))).toBeNull();
    expect(cardFromFeedback("x", fb())).toBeNull();
    expect(cardFromFeedback("x", fb(undefined, "もう少し自然な言い方も試してみましょう。"))).toBeNull();
  });
});

describe("scheduleReview", () => {
  it("again resets to box 0, due today", () => {
    expect(scheduleReview(3, "again", "2026-09-23")).toEqual({ box: 0, dueDate: "2026-09-23" });
  });

  it("good moves up one box", () => {
    expect(scheduleReview(0, "good", "2026-09-23")).toEqual({ box: 1, dueDate: "2026-09-25" });
  });

  it("easy moves up two boxes", () => {
    expect(scheduleReview(0, "easy", "2026-09-23")).toEqual({ box: 2, dueDate: "2026-09-27" });
  });

  it("caps at the last box", () => {
    expect(scheduleReview(MAX_BOX, "easy", "2026-09-23")).toEqual({ box: MAX_BOX, dueDate: "2026-10-25" });
  });
});

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
});
