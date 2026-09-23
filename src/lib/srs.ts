import type { MessageFeedback } from "./types";

// Leitner-style spaced repetition: each correct review moves a card to a
// higher box with a longer gap before it is due again.
export const BOX_INTERVAL_DAYS = [1, 2, 4, 8, 16, 32] as const;
export const MAX_BOX = BOX_INTERVAL_DAYS.length - 1;

export type ReviewGrade = "again" | "good" | "easy";

export interface ReviewCard {
  id: string;
  scenarioId: string;
  /** What the learner said. */
  prompt: string;
  /** The corrected or more natural version. */
  answer: string;
  /** Short explanation from the evaluator, in the learner's UI language. */
  note: string;
  box: number;
  /** YYYY-MM-DD in the learner's time zone. */
  dueDate: string;
}

// Placeholder suggestions from the demo evaluator; not worth reviewing.
const GENERIC_SUGGESTIONS = new Set([
  "もう少し自然な言い方も試してみましょう。",
  "例: はい、お願いします。",
]);

/** Builds card content from a scored reply, or null when there is nothing to learn. */
export function cardFromFeedback(
  said: string,
  feedback: MessageFeedback
): Pick<ReviewCard, "prompt" | "answer" | "note"> | null {
  const candidates = [
    { answer: feedback.grammar.correction, note: feedback.grammar.comment },
    { answer: feedback.naturalness.alternative, note: feedback.naturalness.comment },
  ];
  for (const c of candidates) {
    const answer = c.answer?.trim();
    if (answer && answer !== said.trim() && !GENERIC_SUGGESTIONS.has(answer)) {
      return { prompt: said.trim(), answer, note: c.note ?? "" };
    }
  }
  return null;
}

export function addDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Next box and due date after a review on `today`.
 * "again" sends the card back to box 0 and keeps it due today.
 */
export function scheduleReview(
  box: number,
  grade: ReviewGrade,
  today: string
): { box: number; dueDate: string } {
  if (grade === "again") return { box: 0, dueDate: today };
  const next = Math.min(MAX_BOX, box + (grade === "easy" ? 2 : 1));
  return { box: next, dueDate: addDays(today, BOX_INTERVAL_DAYS[next]) };
}
