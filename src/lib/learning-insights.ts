import type { Conversation } from "./types";

export interface SkillAverages {
  grammar: number;
  vocabulary: number;
  naturalness: number;
  politeness: number;
}

export interface LearningAnalytics {
  skillAverages: SkillAverages;
  vocabularyLearned: string[];
  grammarPatterns: { pattern: string; count: number }[];
  scoreTrend: { date: string; score: number }[];
  totalMessages: number;
  conversationsAnalyzed: number;
}

const GRAMMAR_PATTERNS = [
  { key: "です", label: "です・ます form" },
  { key: "ました", label: "Past tense (ました)" },
  { key: "ません", label: "Negative form (ません)" },
  { key: "て", label: "て-form" },
  { key: "お願い", label: "お願いします requests" },
  { key: "ください", label: "ください requests" },
  { key: "は", label: "Particle は" },
  { key: "を", label: "Particle を" },
  { key: "に", label: "Particle に" },
  { key: "で", label: "Particle で" },
];

export function analyzeConversations(conversations: Conversation[]): LearningAnalytics {
  const totals: SkillAverages = { grammar: 0, vocabulary: 0, naturalness: 0, politeness: 0 };
  let feedbackCount = 0;
  let totalMessages = 0;
  const vocabSet = new Set<string>();
  const grammarCounts: Record<string, number> = {};

  for (const conv of conversations) {
    totalMessages += conv.messages.length;
    for (const msg of conv.messages) {
      if (msg.role !== "user") continue;

      if (msg.feedback) {
        feedbackCount++;
        totals.grammar += msg.feedback.breakdown.grammar;
        totals.vocabulary += msg.feedback.breakdown.vocabulary;
        totals.naturalness += msg.feedback.breakdown.naturalness;
        totals.politeness += msg.feedback.breakdown.politeness;

        if (msg.feedback.grammar.correction) {
          vocabSet.add(msg.feedback.grammar.correction);
        }
        if (msg.feedback.naturalness.alternative) {
          vocabSet.add(msg.feedback.naturalness.alternative);
        }
      }

      for (const { key, label } of GRAMMAR_PATTERNS) {
        if (msg.content.includes(key)) {
          grammarCounts[label] = (grammarCounts[label] ?? 0) + 1;
        }
      }
    }
  }

  const skillAverages: SkillAverages =
    feedbackCount > 0
      ? {
          grammar: Math.round((totals.grammar / feedbackCount / 30) * 100),
          vocabulary: Math.round((totals.vocabulary / feedbackCount / 25) * 100),
          naturalness: Math.round((totals.naturalness / feedbackCount / 25) * 100),
          politeness: Math.round((totals.politeness / feedbackCount / 20) * 100),
        }
      : { grammar: 0, vocabulary: 0, naturalness: 0, politeness: 0 };

  const grammarPatterns = Object.entries(grammarCounts)
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const scoreTrend = conversations
    .filter((c) => c.overallScore !== undefined)
    .slice(0, 14)
    .reverse()
    .map((c) => ({
      date: new Date(c.updatedAt).toLocaleDateString(),
      score: c.overallScore!,
    }));

  return {
    skillAverages,
    vocabularyLearned: [...vocabSet].slice(0, 20),
    grammarPatterns,
    scoreTrend,
    totalMessages,
    conversationsAnalyzed: conversations.length,
  };
}
