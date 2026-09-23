import { describe, expect, it } from "vitest";
import { checkNewAchievements } from "./achievements";
import { computeAdaptiveLevel } from "./adaptive-difficulty";

const base = {
  unlocked: [],
  totalConversations: 0,
  streak: 0,
  highestScore: 0,
  voiceMessageCount: 0,
  completedScenarioIds: [],
  completedCategories: [],
};

describe("checkNewAchievements", () => {
  it("unlocks nothing for a new learner", () => {
    expect(checkNewAchievements(base)).toEqual([]);
  });

  it("unlocks by thresholds", () => {
    const ids = checkNewAchievements({
      ...base,
      totalConversations: 10,
      highestScore: 90,
      streak: 7,
      voiceMessageCount: 1,
    });
    expect(ids).toEqual(
      expect.arrayContaining([
        "first_conversation",
        "ten_conversations",
        "high_scorer",
        "seven_day_streak",
        "voice_pioneer",
      ])
    );
  });

  it("does not return achievements that are already unlocked", () => {
    expect(
      checkNewAchievements({ ...base, unlocked: ["first_conversation"], totalConversations: 1 })
    ).toEqual([]);
  });

  it("stays locked just below thresholds", () => {
    expect(checkNewAchievements({ ...base, highestScore: 89, streak: 6 })).toEqual([]);
  });
});

describe("computeAdaptiveLevel", () => {
  it("defaults to N4 with no history", () => {
    expect(computeAdaptiveLevel([])).toBe("N4");
  });

  it.each([
    [[95, 90, 92], "N1"],
    [[80, 80, 80], "N2"],
    [[70, 70, 70], "N3"],
    [[55, 55, 55], "N4"],
    [[30, 30, 30], "N5"],
  ])("%j -> %s", (scores, level) => {
    expect(computeAdaptiveLevel(scores as number[])).toBe(level);
  });

  it("moves up a level on a strong recent upward trend", () => {
    // Newest first: 90 now vs 60 two sessions ago; average 75 alone would be N3.
    expect(computeAdaptiveLevel([90, 75, 60])).toBe("N2");
  });
});
