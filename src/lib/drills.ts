import type { AdaptiveLevel } from "./adaptive-difficulty";

export type DrillType = "grammar" | "vocabulary" | "politeness";

export interface Drill {
  id: string;
  type: DrillType;
  level: AdaptiveLevel;
  promptJa: string;
  options: string[];
  correctIndex: number;
  questionEn: string;
  questionVi: string;
  explanationEn: string;
  explanationVi: string;
}

export const DRILLS: Drill[] = [
  {
    id: "n5-particle-wa",
    type: "grammar",
    level: "N5",
    promptJa: "私___学生です。",
    options: ["は", "を", "に", "で"],
    correctIndex: 0,
    questionEn: "Choose the correct particle.",
    questionVi: "Chọn trợ từ đúng.",
    explanationEn: "は marks the topic of the sentence.",
    explanationVi: "は đánh dấu chủ đề của câu.",
  },
  {
    id: "n5-particle-wo",
    type: "grammar",
    level: "N5",
    promptJa: "水___飲みます。",
    options: ["は", "を", "が", "の"],
    correctIndex: 1,
    questionEn: "Choose the correct particle for the object.",
    questionVi: "Chọn trợ từ cho tân ngữ.",
    explanationEn: "を marks the direct object of an action verb.",
    explanationVi: "を đánh dấu tân ngữ trực tiếp của động từ.",
  },
  {
    id: "n5-past-tense",
    type: "grammar",
    level: "N5",
    promptJa: "昨日、映画を見___。",
    options: ["ます", "ました", "ません", "ましょう"],
    correctIndex: 1,
    questionEn: "Choose the correct past tense form.",
    questionVi: "Chọn dạng quá khứ đúng.",
    explanationEn: "ました is the past polite form.",
    explanationVi: "ました là dạng lịch sự quá khứ.",
  },
  {
    id: "n5-vocab-greeting",
    type: "vocabulary",
    level: "N5",
    promptJa: "Good morning in Japanese:",
    options: ["こんばんは", "おはようございます", "さようなら", "ありがとう"],
    correctIndex: 1,
    questionEn: "Select the correct greeting.",
    questionVi: "Chọn lời chào đúng.",
    explanationEn: "おはようございます is used in the morning.",
    explanationVi: "おはようございます dùng vào buổi sáng.",
  },
  {
    id: "n5-polite-request",
    type: "politeness",
    level: "N5",
    promptJa: "メニューを見せて___。",
    options: ["ください", "くれる", "あげる", "もらう"],
    correctIndex: 0,
    questionEn: "Choose the polite request form.",
    questionVi: "Chọn dạng yêu cầu lịch sự.",
    explanationEn: "ください is the standard polite request ending.",
    explanationVi: "ください là kết thúc yêu cầu lịch sự tiêu chuẩn.",
  },
  {
    id: "n4-te-form",
    type: "grammar",
    level: "N4",
    promptJa: "食べて___、寝ました。",
    options: ["から", "のに", "ので", "でも"],
    correctIndex: 0,
    questionEn: "Choose the connector meaning 'after doing'.",
    questionVi: "Chọn liên từ nghĩa 'sau khi làm'.",
    explanationEn: "食べてから means 'after eating'.",
    explanationVi: "食べてから nghĩa là 'sau khi ăn'.",
  },
  {
    id: "n4-vocab-hospital",
    type: "vocabulary",
    level: "N4",
    promptJa: "頭が痛い = ?",
    options: ["Stomach hurts", "Head hurts", "Feeling dizzy", "Have a fever"],
    correctIndex: 1,
    questionEn: "What does this phrase mean?",
    questionVi: "Cụm này nghĩa là gì?",
    explanationEn: "頭 (head) + 痛い (painful) = headache.",
    explanationVi: "頭 (đầu) + 痛い (đau) = đau đầu.",
  },
  {
    id: "n4-polite-offer",
    type: "politeness",
    level: "N4",
    promptJa: "お茶を___しましょうか。",
    options: ["入れて", "入れる", "入れた", "入れます"],
    correctIndex: 0,
    questionEn: "Choose the correct offer form.",
    questionVi: "Chọn dạng đề nghị đúng.",
    explanationEn: "て-form + しましょうか offers to do something.",
    explanationVi: "Thể て + しましょうか đề nghị làm gì đó.",
  },
  {
    id: "n3-grammar-cause",
    type: "grammar",
    level: "N3",
    promptJa: "雨___、試合が中止になった。",
    options: ["ので", "のに", "から", "けど"],
    correctIndex: 2,
    questionEn: "Choose the causal connector.",
    questionVi: "Chọn liên từ chỉ nguyên nhân.",
    explanationEn: "から expresses reason/cause in this context.",
    explanationVi: "から diễn tả lý do/nguyên nhân.",
  },
  {
    id: "n3-vocab-workplace",
    type: "vocabulary",
    level: "N3",
    promptJa: "報告書を提出する = ?",
    options: ["Submit a report", "Read a report", "Delete a report", "Print a report"],
    correctIndex: 0,
    questionEn: "Select the correct meaning.",
    questionVi: "Chọn nghĩa đúng.",
    explanationEn: "提出する means to submit/hand in.",
    explanationVi: "提出する nghĩa là nộp/bàn giao.",
  },
  {
    id: "n3-keigo",
    type: "politeness",
    level: "N3",
    promptJa: "社長が___。 (honorific for 'come')",
    options: ["来ます", "いらっしゃいます", "行きます", "来ました"],
    correctIndex: 1,
    questionEn: "Choose the honorific verb form.",
    questionVi: "Chọn dạng động từ kính ngữ.",
    explanationEn: "いらっしゃいます is the honorific form of 来る/行く/いる.",
    explanationVi: "いらっしゃいます là dạng kính ngữ của 来る/行く/いる.",
  },
  {
    id: "n2-grammar-conditional",
    type: "grammar",
    level: "N2",
    promptJa: "時間があれ___、旅行に行きたい。",
    options: ["ば", "たら", "なら", "と"],
    correctIndex: 0,
    questionEn: "Choose the conditional form.",
    questionVi: "Chọn dạng điều kiện.",
    explanationEn: "ば conditional: あれば = if there is.",
    explanationVi: "Điều kiện ば: あれば = nếu có.",
  },
];

export function getDrillsByLevel(level?: AdaptiveLevel | "all"): Drill[] {
  if (!level || level === "all") return DRILLS;
  return DRILLS.filter((d) => d.level === level);
}

export function getDrillsByType(type?: DrillType | "all"): Drill[] {
  if (!type || type === "all") return DRILLS;
  return DRILLS.filter((d) => d.type === type);
}

export function filterDrills(level?: AdaptiveLevel | "all", type?: DrillType | "all"): Drill[] {
  return DRILLS.filter((d) => {
    if (level && level !== "all" && d.level !== level) return false;
    if (type && type !== "all" && d.type !== type) return false;
    return true;
  });
}
