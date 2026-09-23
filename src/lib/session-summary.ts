import { cardFromFeedback } from "./srs";
import type { ChatMessage, ScoreBreakdown } from "./types";

export type Skill = keyof ScoreBreakdown;

const SKILL_MAX: ScoreBreakdown = { grammar: 30, vocabulary: 25, naturalness: 25, politeness: 20 };

export interface SessionCorrection {
  said: string;
  better: string;
}

export interface SessionSummary {
  turns: number;
  averageScore: number;
  bestScore: number;
  /** Average of each skill as a percentage of its maximum (0–100). */
  skills: Record<Skill, number>;
  weakestSkill: Skill;
  /** Up to `limit` suggested rewrites from the lowest-scoring turns first. */
  corrections: SessionCorrection[];
}

/** Summarises the scored turns of one conversation. Returns null if none were scored. */
export function summarizeSession(messages: ChatMessage[], limit = 3): SessionSummary | null {
  const scored = messages.filter((m) => m.role === "user" && !m.failed && m.feedback);
  if (scored.length === 0) return null;

  const totals: ScoreBreakdown = { grammar: 0, vocabulary: 0, naturalness: 0, politeness: 0 };
  let scoreSum = 0;
  let best = 0;
  for (const m of scored) {
    const fb = m.feedback!;
    scoreSum += fb.overall;
    best = Math.max(best, fb.overall);
    for (const skill of Object.keys(totals) as Skill[]) totals[skill] += fb.breakdown[skill];
  }

  const skills = Object.fromEntries(
    (Object.keys(totals) as Skill[]).map((s) => [
      s,
      Math.round((totals[s] / (SKILL_MAX[s] * scored.length)) * 100),
    ])
  ) as Record<Skill, number>;
  const weakestSkill = (Object.keys(skills) as Skill[]).reduce((a, b) =>
    skills[b] < skills[a] ? b : a
  );

  const corrections: SessionCorrection[] = [];
  const seen = new Set<string>();
  for (const m of [...scored].sort((a, b) => a.feedback!.overall - b.feedback!.overall)) {
    // Same rules as the review deck, so every listed phrase is also a card.
    const card = cardFromFeedback(m.content, m.feedback!);
    if (!card || seen.has(card.answer)) continue;
    seen.add(card.answer);
    corrections.push({ said: card.prompt, better: card.answer });
    if (corrections.length >= limit) break;
  }

  return {
    turns: scored.length,
    averageScore: Math.round(scoreSum / scored.length),
    bestScore: best,
    skills,
    weakestSkill,
    corrections,
  };
}
