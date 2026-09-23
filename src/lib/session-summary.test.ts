import { describe, expect, it } from "vitest";
import { summarizeSession } from "./session-summary";
import type { ChatMessage, MessageFeedback } from "./types";

function fb(overall: number, b: [number, number, number, number], correction?: string, alternative?: string): MessageFeedback {
  return {
    grammar: { score: 0, comment: "", correction },
    vocabulary: { score: 0, comment: "" },
    naturalness: { score: 0, comment: "", alternative },
    politeness: { score: 0, comment: "" },
    overall,
    breakdown: { grammar: b[0], vocabulary: b[1], naturalness: b[2], politeness: b[3] },
  };
}

let n = 0;
const user = (content: string, feedback?: MessageFeedback, extra: Partial<ChatMessage> = {}): ChatMessage => ({
  id: String(n++),
  role: "user",
  content,
  feedback,
  createdAt: "2026-01-01T00:00:00Z",
  ...extra,
});
const ai = (content: string): ChatMessage => ({ id: String(n++), role: "assistant", content, createdAt: "2026-01-01T00:00:00Z" });

describe("summarizeSession", () => {
  it("returns null when nothing was scored", () => {
    expect(summarizeSession([ai("いらっしゃいませ")])).toBeNull();
  });

  it("averages scores and skills as percentages of their maxima", () => {
    const s = summarizeSession([
      ai("hi"),
      user("a", fb(80, [30, 20, 20, 10])),
      ai("ok"),
      user("b", fb(60, [15, 20, 10, 10])),
    ])!;
    expect(s.turns).toBe(2);
    expect(s.averageScore).toBe(70);
    expect(s.bestScore).toBe(80);
    expect(s.skills).toEqual({ grammar: 75, vocabulary: 80, naturalness: 60, politeness: 50 });
    expect(s.weakestSkill).toBe("politeness");
  });

  it("lists corrections from the weakest turns first, skipping duplicates and no-ops", () => {
    const s = summarizeSession([
      user("すしをたべる", fb(90, [27, 23, 22, 18], "すしを食べます")),
      user("みずください", fb(40, [10, 10, 10, 10], undefined, "お水をください")),
      user("same", fb(50, [10, 10, 10, 10], "same")),
      user("dup", fb(60, [10, 10, 10, 10], "お水をください")),
    ])!;
    expect(s.corrections).toEqual([
      { said: "みずください", better: "お水をください" },
      { said: "すしをたべる", better: "すしを食べます" },
    ]);
  });

  it("ignores failed turns", () => {
    const s = summarizeSession([user("x", fb(100, [30, 25, 25, 20]), { failed: true }), user("y", fb(50, [15, 12, 13, 10]))])!;
    expect(s.turns).toBe(1);
    expect(s.bestScore).toBe(50);
  });
});
