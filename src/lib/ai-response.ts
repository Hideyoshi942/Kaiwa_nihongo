import type { MessageFeedback, VoiceFeedback } from "./types";

export interface ChatResponse {
  reply: string;
  translations: { en: string; vi: string };
  feedback: MessageFeedback;
}

const MAX_TEXT = 2000;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function num(v: unknown, max: number): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(max, Math.round(n)));
}

function str(v: unknown): string {
  return typeof v === "string" ? v.slice(0, MAX_TEXT) : "";
}

function optStr(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.slice(0, MAX_TEXT) : undefined;
}

function skill(v: unknown) {
  if (!isObject(v)) return null;
  const score = num(v.score, 100);
  if (score === null) return null;
  return { score, comment: str(v.comment), raw: v };
}

/**
 * Validates and normalises the model's JSON. Returns null when a field the UI
 * or scoring depends on is missing, so callers never trust a partial answer.
 */
export function parseChatResponse(raw: unknown, voiceMode: boolean): ChatResponse | null {
  if (!isObject(raw) || typeof raw.reply !== "string" || !raw.reply.trim()) return null;
  const fb = raw.feedback;
  if (!isObject(fb)) return null;

  const grammar = skill(fb.grammar);
  const vocabulary = skill(fb.vocabulary);
  const naturalness = skill(fb.naturalness);
  const politeness = skill(fb.politeness);
  if (!grammar || !vocabulary || !naturalness || !politeness) return null;

  // Breakdown weights are 30/25/25/20; derive them from the skill scores when
  // the model omits or garbles them.
  const b = isObject(fb.breakdown) ? fb.breakdown : {};
  const breakdown = {
    grammar: num(b.grammar, 30) ?? Math.round((grammar.score * 30) / 100),
    vocabulary: num(b.vocabulary, 25) ?? Math.round((vocabulary.score * 25) / 100),
    naturalness: num(b.naturalness, 25) ?? Math.round((naturalness.score * 25) / 100),
    politeness: num(b.politeness, 20) ?? Math.round((politeness.score * 20) / 100),
  };
  const overall =
    num(fb.overall, 100) ??
    breakdown.grammar + breakdown.vocabulary + breakdown.naturalness + breakdown.politeness;

  const feedback: MessageFeedback = {
    grammar: { score: grammar.score, comment: grammar.comment, correction: optStr(grammar.raw.correction) },
    vocabulary: { score: vocabulary.score, comment: vocabulary.comment },
    naturalness: {
      score: naturalness.score,
      comment: naturalness.comment,
      alternative: optStr(naturalness.raw.alternative),
    },
    politeness: { score: politeness.score, comment: politeness.comment },
    overall,
    breakdown,
  };

  if (voiceMode && isObject(fb.voice)) {
    const v = fb.voice;
    const voice: VoiceFeedback = {
      pronunciation: num(v.pronunciation, 100) ?? 0,
      fluency: num(v.fluency, 100) ?? 0,
      speed: num(v.speed, 100) ?? 0,
      comment: str(v.comment),
    };
    feedback.voice = voice;
  }

  const t = isObject(raw.translations) ? raw.translations : {};
  return {
    reply: raw.reply.trim().slice(0, MAX_TEXT),
    translations: { en: str(t.en), vi: str(t.vi) },
    feedback,
  };
}

/**
 * Decodes as much of the `"reply"` string as has arrived in a partial JSON
 * document, so the reply can be shown while the rest is still streaming.
 * Returns "" until the reply value starts.
 */
export function extractPartialReply(partialJson: string): string {
  const key = /"reply"\s*:\s*"/.exec(partialJson);
  if (!key) return "";

  let out = "";
  for (let i = key.index + key[0].length; i < partialJson.length; i++) {
    const ch = partialJson[i];
    if (ch === '"') break;
    if (ch !== "\\") {
      out += ch;
      continue;
    }
    const next = partialJson[i + 1];
    if (next === undefined) break; // escape split across chunks
    if (next === "u") {
      const hex = partialJson.slice(i + 2, i + 6);
      if (hex.length < 4) break;
      out += String.fromCharCode(parseInt(hex, 16));
      i += 5;
      continue;
    }
    const map: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f" };
    out += map[next] ?? next;
    i += 1;
  }
  return out;
}
