export type Difficulty = "beginner" | "intermediate" | "advanced";

export type ScenarioCategory =
  | "daily-life"
  | "workplace"
  | "study-abroad"
  | "job-interviews"
  | "customer-service"
  | "business-japanese";

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  titleJa: string;
  category: ScenarioCategory;
  difficulty: Difficulty;
  description: string;
  aiRole: string;
  openingMessage: string;
  openingTranslation: string;
  suggestedResponses?: string[];
}

export interface ScoreBreakdown {
  grammar: number;
  vocabulary: number;
  naturalness: number;
  politeness: number;
}

export interface VoiceFeedback {
  pronunciation: number;
  fluency: number;
  speed: number;
  comment: string;
}

export interface MessageFeedback {
  grammar: { score: number; comment: string; correction?: string };
  vocabulary: { score: number; comment: string };
  naturalness: { score: number; comment: string; alternative?: string };
  politeness: { score: number; comment: string };
  voice?: VoiceFeedback;
  overall: number;
  breakdown: ScoreBreakdown;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** @deprecated Use translations instead */
  translation?: string;
  translations?: { en?: string; vi?: string };
  feedback?: MessageFeedback;
  isVoice?: boolean;
  createdAt: string;
}

export function getMessageTranslation(
  msg: ChatMessage,
  locale: "en" | "vi"
): string | undefined {
  return msg.translations?.[locale] ?? msg.translation;
}

export interface Conversation {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  messages: ChatMessage[];
  overallScore?: number;
  createdAt: string;
  updatedAt: string;
}

export type AchievementId =
  | "first_conversation"
  | "ten_conversations"
  | "high_scorer"
  | "seven_day_streak"
  | "voice_pioneer"
  | "daily_life_explorer"
  | "business_master";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  lastStudyDate?: string;
  unlockedAchievements: AchievementId[];
  voiceMessageCount: number;
  completedScenarioIds: string[];
}

export interface DashboardStats {
  totalConversations: number;
  averageScore: number;
  streak: number;
  strongestCategory: string;
  weakestCategory: string;
  recentScores: number[];
  unlockedAchievements: number;
  totalAchievements: number;
}
