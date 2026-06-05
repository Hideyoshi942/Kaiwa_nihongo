export type AdaptiveLevel = "N5" | "N4" | "N3" | "N2" | "N1";

const LEVEL_ORDER: AdaptiveLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export function computeAdaptiveLevel(recentScores: number[]): AdaptiveLevel {
  if (recentScores.length === 0) return "N4";

  const recent = recentScores.slice(0, 8);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const lastThree = recent.slice(0, 3);
  const recentTrend =
    lastThree.length >= 2
      ? lastThree[0] - lastThree[lastThree.length - 1]
      : 0;

  let level: AdaptiveLevel = "N5";
  if (avg >= 88) level = "N1";
  else if (avg >= 78) level = "N2";
  else if (avg >= 65) level = "N3";
  else if (avg >= 50) level = "N4";

  if (recentTrend > 15 && level !== "N1") {
    const idx = LEVEL_ORDER.indexOf(level);
    if (idx < LEVEL_ORDER.length - 1) level = LEVEL_ORDER[idx + 1];
  } else if (recentTrend < -15 && level !== "N5") {
    const idx = LEVEL_ORDER.indexOf(level);
    if (idx > 0) level = LEVEL_ORDER[idx - 1];
  }

  return level;
}

export function getAdaptiveInstructions(level: AdaptiveLevel): string {
  const instructions: Record<AdaptiveLevel, string> = {
    N5: "Use very simple Japanese (N5): short sentences, basic vocabulary, です/ます only. Speak slowly and clearly. Give gentle hints if the user struggles.",
    N4: "Use N4-level Japanese: everyday vocabulary, simple compound sentences. Keep grammar straightforward.",
    N3: "Use N3-level Japanese: natural daily conversation, some idiomatic expressions, moderate sentence complexity.",
    N2: "Use N2-level Japanese: nuanced expressions, keigo when appropriate, longer natural sentences.",
    N1: "Use N1-level Japanese: advanced vocabulary, formal and casual registers as context requires, native-like complexity.",
  };
  return instructions[level];
}

export function adjustScenarioDifficulty(
  baseDifficulty: "beginner" | "intermediate" | "advanced",
  adaptiveLevel: AdaptiveLevel
): string {
  const map: Record<AdaptiveLevel, string> = {
    N5: "beginner (simplified)",
    N4: "beginner",
    N3: "intermediate",
    N2: "advanced",
    N1: "advanced (challenging)",
  };
  return `Base scenario: ${baseDifficulty}. Adapt to learner level ${adaptiveLevel} — target ${map[adaptiveLevel]}.`;
}
