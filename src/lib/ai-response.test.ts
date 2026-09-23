import { describe, expect, it } from "vitest";
import { extractPartialReply, parseChatResponse } from "./ai-response";

const valid = {
  reply: "かしこまりました。",
  translations: { en: "Certainly.", vi: "Vâng ạ." },
  feedback: {
    grammar: { score: 88, comment: "ok", correction: "ラーメンをください。" },
    vocabulary: { score: 80, comment: "ok" },
    naturalness: { score: 85, comment: "ok", alternative: "" },
    politeness: { score: 90, comment: "ok" },
    overall: 86,
    breakdown: { grammar: 26, vocabulary: 20, naturalness: 21, politeness: 18 },
  },
};

describe("parseChatResponse", () => {
  it("accepts a well-formed response", () => {
    const r = parseChatResponse(valid, false);
    expect(r?.reply).toBe("かしこまりました。");
    expect(r?.feedback.overall).toBe(86);
    expect(r?.feedback.grammar.correction).toBe("ラーメンをください。");
  });

  it("drops empty optional suggestions", () => {
    expect(parseChatResponse(valid, false)?.feedback.naturalness.alternative).toBeUndefined();
  });

  it("clamps out-of-range scores and coerces numeric strings", () => {
    const r = parseChatResponse(
      {
        ...valid,
        feedback: { ...valid.feedback, overall: 150, vocabulary: { score: "80", comment: "" } },
      },
      false
    );
    expect(r?.feedback.overall).toBe(100);
    expect(r?.feedback.vocabulary.score).toBe(80);
  });

  it("derives a missing breakdown from skill scores", () => {
    const r = parseChatResponse({ ...valid, feedback: { ...valid.feedback, breakdown: "?" } }, false);
    expect(r?.feedback.breakdown).toEqual({ grammar: 26, vocabulary: 20, naturalness: 21, politeness: 18 });
  });

  it("derives overall from the breakdown when missing", () => {
    const { overall: _omit, ...rest } = valid.feedback;
    void _omit;
    expect(parseChatResponse({ ...valid, feedback: rest }, false)?.feedback.overall).toBe(85);
  });

  it.each([
    ["no reply", { ...valid, reply: "" }],
    ["no feedback", { ...valid, feedback: undefined }],
    ["missing skill", { ...valid, feedback: { ...valid.feedback, politeness: undefined } }],
    ["non-numeric score", { ...valid, feedback: { ...valid.feedback, grammar: { score: "high" } } }],
    ["not an object", "hello"],
  ])("rejects %s", (_label, input) => {
    expect(parseChatResponse(input, false)).toBeNull();
  });

  it("includes voice feedback only in voice mode", () => {
    const withVoice = {
      ...valid,
      feedback: { ...valid.feedback, voice: { pronunciation: 70, fluency: 60, speed: 65, comment: "" } },
    };
    expect(parseChatResponse(withVoice, true)?.feedback.voice?.pronunciation).toBe(70);
    expect(parseChatResponse(withVoice, false)?.feedback.voice).toBeUndefined();
  });
});

describe("extractPartialReply", () => {
  it("returns nothing before the reply starts", () => {
    expect(extractPartialReply('{"repl')).toBe("");
  });

  it("decodes the reply as it streams in", () => {
    expect(extractPartialReply('{"reply": "かしこ')).toBe("かしこ");
    expect(extractPartialReply('{"reply":"done","feedback":{')).toBe("done");
  });

  it("handles escapes, including ones split across chunks", () => {
    expect(extractPartialReply('{"reply":"a\\"b\\nc')).toBe('a"b\nc');
    expect(extractPartialReply('{"reply":"a\\')).toBe("a");
    expect(extractPartialReply('{"reply":"\\u26')).toBe("");
    expect(extractPartialReply('{"reply":"\\u2615!')).toBe("☕!");
  });

  it("is prefix-stable so deltas can be diffed", () => {
    const full = JSON.stringify({ reply: 'お茶は"熱い"です\n☕', x: 1 });
    let prev = "";
    for (let i = 1; i <= full.length; i++) {
      const cur = extractPartialReply(full.slice(0, i));
      expect(cur.startsWith(prev)).toBe(true);
      prev = cur;
    }
    expect(prev).toBe('お茶は"熱い"です\n☕');
  });
});
