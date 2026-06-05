import {
  ACHIEVEMENTS,
  checkNewAchievements,
  getAchievementDef,
} from "./achievements";
import { getScenarioById, SCENARIOS } from "./scenarios";
import type {
  AchievementId,
  Conversation,
  DashboardStats,
  ScenarioCategory,
  UserProfile,
} from "./types";

const USER_KEY = "kaiwa_user";
const CONVERSATIONS_KEY = "kaiwa_conversations";

function defaultUserFields(): Pick<
  UserProfile,
  "unlockedAchievements" | "voiceMessageCount" | "completedScenarioIds"
> {
  return {
    unlockedAchievements: [],
    voiceMessageCount: 0,
    completedScenarioIds: [],
  };
}

function normalizeUser(raw: UserProfile): UserProfile {
  return { ...defaultUserFields(), ...raw };
}

export function getUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return normalizeUser(JSON.parse(raw) as UserProfile);
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loginUser(name: string, email: string): UserProfile {
  const existing = getUser();
  const user: UserProfile = existing ?? {
    id: crypto.randomUUID(),
    name,
    email,
    level: 1,
    xp: 0,
    streak: 0,
    ...defaultUserFields(),
  };
  user.name = name;
  user.email = email;
  saveUser(user);
  return user;
}

export function logoutUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function getConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CONVERSATIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

export function saveConversation(conversation: Conversation): void {
  const all = getConversations();
  const idx = all.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    all[idx] = conversation;
  } else {
    all.unshift(conversation);
  }
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(all));

  const userMessages = conversation.messages.filter((m) => m.role === "user");
  if (userMessages.length > 0) {
    markScenarioCompleted(conversation.scenarioId);
  }
}

export function getConversation(id: string): Conversation | undefined {
  return getConversations().find((c) => c.id === id);
}

export function addXp(amount: number): UserProfile | null {
  const user = getUser();
  if (!user) return null;
  user.xp += amount;
  user.level = Math.min(100, Math.floor(user.xp / 100) + 1);
  const today = new Date().toISOString().split("T")[0];
  if (user.lastStudyDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    user.streak = user.lastStudyDate === yesterdayStr ? user.streak + 1 : 1;
    user.lastStudyDate = today;
  }
  saveUser(user);
  return user;
}

function markScenarioCompleted(scenarioId: string): void {
  const user = getUser();
  if (!user) return;
  if (!user.completedScenarioIds.includes(scenarioId)) {
    user.completedScenarioIds.push(scenarioId);
    saveUser(user);
  }
}

export function recordVoiceMessage(): void {
  const user = getUser();
  if (!user) return;
  user.voiceMessageCount += 1;
  saveUser(user);
}

function getCompletedCategories(scenarioIds: string[]): ScenarioCategory[] {
  const cats = new Set<ScenarioCategory>();
  for (const id of scenarioIds) {
    const scenario = getScenarioById(id);
    if (scenario) cats.add(scenario.category);
  }
  return [...cats];
}

export function evaluateAchievements(): AchievementId[] {
  const user = getUser();
  if (!user) return [];

  const conversations = getConversations();
  const scores = conversations
    .map((c) => c.overallScore)
    .filter((s): s is number => s !== undefined);

  const newlyUnlocked = checkNewAchievements({
    unlocked: user.unlockedAchievements,
    totalConversations: conversations.length,
    streak: user.streak,
    highestScore: scores.length > 0 ? Math.max(...scores) : 0,
    voiceMessageCount: user.voiceMessageCount,
    completedScenarioIds: user.completedScenarioIds,
    completedCategories: getCompletedCategories(user.completedScenarioIds),
  });

  if (newlyUnlocked.length === 0) return [];

  for (const id of newlyUnlocked) {
    const def = getAchievementDef(id);
    if (def) user.xp += def.xpReward;
    user.unlockedAchievements.push(id);
  }

  user.level = Math.min(100, Math.floor(user.xp / 100) + 1);
  saveUser(user);
  return newlyUnlocked;
}

export function computeDashboardStats(): DashboardStats {
  const conversations = getConversations();
  const scored = conversations.filter((c) => c.overallScore !== undefined);

  const scores = scored.map((c) => c.overallScore!);
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const categoryScores: Record<string, number[]> = {};
  for (const conv of scored) {
    const scenario = getScenarioById(conv.scenarioId);
    const cat = scenario?.category ?? "unknown";
    if (!categoryScores[cat]) categoryScores[cat] = [];
    categoryScores[cat].push(conv.overallScore!);
  }

  let strongestCategory = "—";
  let weakestCategory = "—";
  let bestAvg = -1;
  let worstAvg = 101;

  for (const [cat, vals] of Object.entries(categoryScores)) {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (avg > bestAvg) {
      bestAvg = avg;
      strongestCategory = cat;
    }
    if (avg < worstAvg) {
      worstAvg = avg;
      weakestCategory = cat;
    }
  }

  const user = getUser();

  return {
    totalConversations: conversations.length,
    averageScore,
    streak: user?.streak ?? 0,
    strongestCategory,
    weakestCategory,
    recentScores: scores.slice(0, 7),
    unlockedAchievements: user?.unlockedAchievements.length ?? 0,
    totalAchievements: ACHIEVEMENTS.length,
  };
}

export function isScenarioUnlocked(
  difficulty: "beginner" | "intermediate" | "advanced",
  userLevel: number
): boolean {
  if (difficulty === "beginner") return true;
  if (difficulty === "intermediate") return userLevel >= 2;
  return userLevel >= 5;
}

export function getScenarioCount(): number {
  return SCENARIOS.length;
}
