import type { AchievementId, ScenarioCategory } from "./types";

export type { AchievementId };

export interface AchievementDef {
  id: AchievementId;
  icon: string;
  xpReward: number;
  category: "milestone" | "skill" | "streak" | "collection";
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_conversation", icon: "🎌", xpReward: 50, category: "milestone" },
  { id: "ten_conversations", icon: "💬", xpReward: 100, category: "milestone" },
  { id: "high_scorer", icon: "⭐", xpReward: 75, category: "skill" },
  { id: "seven_day_streak", icon: "🔥", xpReward: 150, category: "streak" },
  { id: "voice_pioneer", icon: "🎙️", xpReward: 50, category: "skill" },
  { id: "daily_life_explorer", icon: "🏪", xpReward: 100, category: "collection" },
  { id: "business_master", icon: "💼", xpReward: 200, category: "collection" },
];

export interface AchievementCheckInput {
  unlocked: AchievementId[];
  totalConversations: number;
  streak: number;
  highestScore: number;
  voiceMessageCount: number;
  completedScenarioIds: string[];
  completedCategories: ScenarioCategory[];
}

const BUSINESS_CATEGORIES: ScenarioCategory[] = [
  "workplace",
  "job-interviews",
  "customer-service",
  "business-japanese",
];

export function checkNewAchievements(input: AchievementCheckInput): AchievementId[] {
  const unlocked = new Set(input.unlocked);
  const candidates: AchievementId[] = [];

  if (input.totalConversations >= 1) candidates.push("first_conversation");
  if (input.totalConversations >= 10) candidates.push("ten_conversations");
  if (input.highestScore >= 90) candidates.push("high_scorer");
  if (input.streak >= 7) candidates.push("seven_day_streak");
  if (input.voiceMessageCount >= 1) candidates.push("voice_pioneer");

  const dailyLifeScenarios = ["restaurant", "convenience-store", "directions", "self-intro"];
  if (dailyLifeScenarios.every((id) => input.completedScenarioIds.includes(id))) {
    candidates.push("daily_life_explorer");
  }

  if (BUSINESS_CATEGORIES.every((cat) => input.completedCategories.includes(cat))) {
    candidates.push("business_master");
  }

  return candidates.filter((id) => !unlocked.has(id));
}

export function getAchievementDef(id: AchievementId): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/** Advanced scenarios unlock at level 5 per product plan */
export const ADVANCED_UNLOCK_LEVEL = 5;
export const INTERMEDIATE_UNLOCK_LEVEL = 2;
