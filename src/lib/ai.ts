import type { AdaptiveLevel } from "@/lib/adaptive-difficulty";
import { adjustScenarioDifficulty, getAdaptiveInstructions } from "@/lib/adaptive-difficulty";
import type { Locale } from "@/lib/i18n";
import type { MessageFeedback, Scenario, ScoreBreakdown } from "./types";

interface ChatRequest {
  scenario: Scenario;
  userMessage: string;
  history: { role: "user" | "assistant"; content: string }[];
  locale: Locale;
  voiceMode?: boolean;
  adaptiveLevel?: AdaptiveLevel;
}

interface ChatResponse {
  reply: string;
  translations: { en: string; vi: string };
  feedback: MessageFeedback;
}

const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  vi: "Vietnamese",
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function scoreFromLength(text: string): number {
  const len = text.trim().length;
  if (len < 3) return 40;
  if (len < 10) return 60;
  if (len < 30) return 75;
  return 85;
}

function hasJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(text);
}

function mockVoiceEvaluate(userMessage: string, locale: Locale) {
  const hasJa = hasJapanese(userMessage);
  const base = hasJa ? 72 : 45;
  const comments =
    locale === "vi"
      ? {
          good: "Phát âm rõ ràng. Tiếp tục luyện nói tự nhiên hơn.",
          fair: "Nghe được nhưng cần luyện thêm phát âm tiếng Nhật.",
          bad: "Hãy nói bằng tiếng Nhật để nhận đánh giá phát âm.",
        }
      : {
          good: "Clear pronunciation. Keep practicing for more natural flow.",
          fair: "Understandable but practice Japanese pronunciation more.",
          bad: "Speak in Japanese to receive pronunciation feedback.",
        };

  return {
    pronunciation: clamp(base + 8, 0, 100),
    fluency: clamp(base, 0, 100),
    speed: clamp(base - 5, 0, 100),
    comment: hasJa ? (base >= 70 ? comments.good : comments.fair) : comments.bad,
  };
}

function mockEvaluate(userMessage: string, locale: Locale, voiceMode?: boolean): MessageFeedback {
  const hasJa = hasJapanese(userMessage);
  const base = hasJa ? scoreFromLength(userMessage) : 35;

  const grammar = clamp(base + (userMessage.endsWith("。") || userMessage.endsWith("です") ? 10 : 0), 0, 100);
  const vocabulary = clamp(base + (userMessage.length > 15 ? 8 : 0), 0, 100);
  const naturalness = clamp(base - (userMessage.includes("ですます") ? 0 : 5), 0, 100);
  const politeness = clamp(
    base + (userMessage.includes("お願い") || userMessage.includes("ください") ? 12 : 0),
    0,
    100
  );

  const breakdown: ScoreBreakdown = {
    grammar: Math.round((grammar / 100) * 30),
    vocabulary: Math.round((vocabulary / 100) * 25),
    naturalness: Math.round((naturalness / 100) * 25),
    politeness: Math.round((politeness / 100) * 20),
  };

  const overall = breakdown.grammar + breakdown.vocabulary + breakdown.naturalness + breakdown.politeness;

  const comments = locale === "vi"
    ? {
        grammarGood: "Ngữ pháp ổn. Tiếp tục dùng đúng dạng động từ.",
        grammarBad: "Kiểm tra thì động từ và trợ từ.",
        grammarNoJa: "Hãy trả lời bằng tiếng Nhật để luyện tập đầy đủ.",
        vocabGood: "Chọn từ phù hợp với ngữ cảnh.",
        vocabBad: "Hãy dùng thêm từ vựng theo chủ đề kịch bản.",
        naturalGood: "Nghe tự nhiên trong hội thoại hàng ngày.",
        naturalBad: "Câu hiểu được nhưng có thể tự nhiên hơn.",
        politeGood: "Mức độ lịch sự phù hợp với kịch bản.",
        politeBad: "Hãy dùng dạng です・ます hoặc お願いします cho lịch sự.",
      }
    : {
        grammarGood: "Grammar looks solid. Keep using appropriate verb forms.",
        grammarBad: "Check verb tense and particle usage.",
        grammarNoJa: "Try responding in Japanese for full practice.",
        vocabGood: "Good word choice for this context.",
        vocabBad: "Consider using more scenario-specific vocabulary.",
        naturalGood: "Sounds natural for everyday conversation.",
        naturalBad: "Your sentence is understandable but could sound more native.",
        politeGood: "Appropriate politeness level for this scenario.",
        politeBad: "Consider using です・ます form or お願いします for politeness.",
      };

  const feedback: MessageFeedback = {
    grammar: {
      score: grammar,
      comment: hasJa
        ? grammar >= 70
          ? comments.grammarGood
          : comments.grammarBad
        : comments.grammarNoJa,
      correction: hasJa ? undefined : "例: はい、お願いします。",
    },
    vocabulary: {
      score: vocabulary,
      comment: vocabulary >= 70 ? comments.vocabGood : comments.vocabBad,
    },
    naturalness: {
      score: naturalness,
      comment: naturalness >= 70 ? comments.naturalGood : comments.naturalBad,
      alternative: hasJa ? "もう少し自然な言い方も試してみましょう。" : undefined,
    },
    politeness: {
      score: politeness,
      comment: politeness >= 70 ? comments.politeGood : comments.politeBad,
    },
    overall,
    breakdown,
  };

  if (voiceMode) {
    feedback.voice = mockVoiceEvaluate(userMessage, locale);
  }

  return feedback;
}

const MOCK_REPLIES: Record<string, string[]> = {
  restaurant: [
    "かしこまりました。少々お待ちください。",
    "ご注文ありがとうございます。他にご注文はございますか。",
    "お会計は800円になります。",
  ],
  "convenience-store": [
    "かしこまりました。温めますね。",
    "レシートはご入用ですか。",
    "ありがとうございました。またお越しください。",
  ],
  default: [
    "なるほど、分かりました。",
    "ありがとうございます。それでは続けましょう。",
    "はい、承知いたしました。",
  ],
};

const MOCK_TRANSLATIONS: Record<string, { en: string; vi: string }> = {
  "かしこまりました。少々お待ちください。": {
    en: "Certainly. Please wait a moment.",
    vi: "Vâng ạ. Xin chờ một chút.",
  },
  "ご注文ありがとうございます。他にご注文はございますか。": {
    en: "Thank you for your order. Would you like anything else?",
    vi: "Cảm ơn đơn hàng của bạn. Bạn còn gọi thêm gì không?",
  },
  "お会計は800円になります。": {
    en: "Your total is 800 yen.",
    vi: "Tổng cộng là 800 yên.",
  },
  "かしこまりました。温めますね。": {
    en: "Certainly. I'll heat that for you.",
    vi: "Vâng ạ. Tôi sẽ hâm nóng cho bạn.",
  },
  "レシートはご入用ですか。": {
    en: "Would you like a receipt?",
    vi: "Bạn có cần hóa đơn không?",
  },
  "ありがとうございました。またお越しください。": {
    en: "Thank you. Please come again.",
    vi: "Cảm ơn bạn. Hẹn gặp lại.",
  },
  "なるほど、分かりました。": {
    en: "I see, understood.",
    vi: "Ra vậy, tôi hiểu rồi.",
  },
  "ありがとうございます。それでは続けましょう。": {
    en: "Thank you. Let's continue.",
    vi: "Cảm ơn bạn. Hãy tiếp tục.",
  },
  "はい、承知いたしました。": {
    en: "Yes, understood.",
    vi: "Vâng, tôi đã hiểu.",
  },
};

function mockReply(scenarioId: string, turn: number): { reply: string; translations: { en: string; vi: string } } {
  const pool = MOCK_REPLIES[scenarioId] ?? MOCK_REPLIES.default;
  const reply = pool[turn % pool.length];
  const translations = MOCK_TRANSLATIONS[reply] ?? {
    en: "Thank you for your response.",
    vi: "Cảm ơn câu trả lời của bạn.",
  };
  return { reply, translations };
}

export async function generateChatResponse(req: ChatRequest): Promise<ChatResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  const feedbackLang = LOCALE_NAMES[req.locale];

  if (apiKey) {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey });

      const adaptiveLevel = req.adaptiveLevel ?? "N4";
      const adaptiveNote = getAdaptiveInstructions(adaptiveLevel);
      const difficultyNote = adjustScenarioDifficulty(req.scenario.difficulty, adaptiveLevel);

      const systemPrompt = `You are a Japanese conversation practice partner playing the role of: ${req.scenario.aiRole}.
Scenario: ${req.scenario.title} - ${req.scenario.description}
${difficultyNote}
Learner adaptive level: ${adaptiveLevel}
Adaptive instructions: ${adaptiveNote}
User interface language: ${feedbackLang}

Rules:
1. Respond ONLY in natural Japanese calibrated to the learner's adaptive level (${adaptiveLevel}).
2. If the user's responses are weak (score < 60), simplify your Japanese and be more supportive.
3. If the user's responses are strong (score > 80), gradually increase complexity.
4. Keep responses concise (1-3 sentences).
5. Stay in character and advance the conversation naturally.
6. After responding, evaluate the user's latest message.
7. Write all feedback comments in ${feedbackLang}.
${req.voiceMode ? `8. The user spoke via voice input — include a "voice" object with pronunciation, fluency, and speed scores (0-100) plus a comment in ${feedbackLang}.` : ""}

Return JSON with this exact structure:
{
  "reply": "your Japanese response",
  "translations": {
    "en": "English translation of your Japanese response",
    "vi": "Vietnamese translation of your Japanese response"
  },
  "feedback": {
    "grammar": { "score": 0-100, "comment": "in ${feedbackLang}", "correction": "optional corrected version in Japanese" },
    "vocabulary": { "score": 0-100, "comment": "in ${feedbackLang}" },
    "naturalness": { "score": 0-100, "comment": "in ${feedbackLang}", "alternative": "optional natural alternative in Japanese" },
    "politeness": { "score": 0-100, "comment": "in ${feedbackLang}" },
    ${req.voiceMode ? `"voice": { "pronunciation": 0-100, "fluency": 0-100, "speed": 0-100, "comment": "in ${feedbackLang}" },` : ""}
    "overall": 0-100,
    "breakdown": { "grammar": 0-30, "vocabulary": 0-25, "naturalness": 0-25, "politeness": 0-20 }
  }
}`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...req.history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: req.userMessage },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content) as ChatResponse;
        return parsed;
      }
    } catch (e) {
      console.error("OpenAI error, falling back to mock:", e);
    }
  }

  const feedback = mockEvaluate(req.userMessage, req.locale, req.voiceMode);
  const turn = req.history.filter((m) => m.role === "user").length;
  const { reply, translations } = mockReply(req.scenario.id, turn);

  return { reply, translations, feedback };
}
