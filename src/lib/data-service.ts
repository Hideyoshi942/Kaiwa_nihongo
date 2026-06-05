import type { AdaptiveLevel } from "@/lib/adaptive-difficulty";
import { computeAdaptiveLevel } from "@/lib/adaptive-difficulty";
import { analyzeConversations, type LearningAnalytics } from "@/lib/learning-insights";
import type {
  AchievementId,
  Conversation,
  DashboardStats,
  LeaderboardEntry,
  UserProfile,
} from "./types";
import * as local from "./storage";

export type { LearningAnalytics };

export interface AdaptiveLevelInfo {
  level: AdaptiveLevel;
  recentScores: number[];
  averageScore: number;
  conversationCount: number;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    if (res.status === 401 || res.status === 503) return null;
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function fetchUser(): Promise<UserProfile | null> {
  const remote = await apiFetch<UserProfile>("/api/user");
  if (remote) return remote;
  return local.getUser();
}

export async function fetchConversations(): Promise<Conversation[]> {
  const remote = await apiFetch<Conversation[]>("/api/conversations");
  if (remote) return remote;
  return local.getConversations();
}

export async function persistConversation(conversation: Conversation): Promise<void> {
  const saved = await apiFetch<Conversation>("/api/conversations", {
    method: "POST",
    body: JSON.stringify(conversation),
  });
  if (!saved) {
    local.saveConversation(conversation);
  }
}

export async function grantXp(amount: number): Promise<UserProfile | null> {
  const result = await apiFetch<{ user: UserProfile }>("/api/progress", {
    method: "POST",
    body: JSON.stringify({ action: "addXp", amount }),
  });
  if (result?.user) return result.user;
  return local.addXp(amount);
}

export async function trackVoiceMessage(): Promise<void> {
  const ok = await apiFetch<{ ok: boolean }>("/api/progress", {
    method: "POST",
    body: JSON.stringify({ action: "recordVoice" }),
  });
  if (!ok) local.recordVoiceMessage();
}

export async function checkAchievements(): Promise<AchievementId[]> {
  const result = await apiFetch<{ unlocked: AchievementId[] }>("/api/progress", {
    method: "POST",
    body: JSON.stringify({ action: "evaluateAchievements" }),
  });
  if (result) return result.unlocked;
  return local.evaluateAchievements();
}

export async function fetchDashboard(): Promise<{
  user: UserProfile | null;
  stats: DashboardStats;
} | null> {
  const remote = await apiFetch<{ user: UserProfile; stats: DashboardStats }>("/api/dashboard");
  if (remote) return remote;

  const user = local.getUser();
  return {
    user,
    stats: local.computeDashboardStats(),
  };
}

export interface Recommendation {
  type: "scenario" | "category" | "skill" | "speaking";
  id: string;
  reason: string;
  priority: number;
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const remote = await apiFetch<Recommendation[]>("/api/recommendations");
  return remote ?? [];
}

export async function fetchAnalytics(): Promise<LearningAnalytics> {
  const remote = await apiFetch<LearningAnalytics>("/api/analytics");
  if (remote) return remote;

  const convs = await fetchConversations();
  return analyzeConversations(convs);
}

export async function fetchAdaptiveLevel(): Promise<AdaptiveLevelInfo> {
  const remote = await apiFetch<AdaptiveLevelInfo>("/api/adaptive-level");
  if (remote) return remote;

  const convs = local.getConversations();
  const scores = convs
    .map((c) => c.overallScore)
    .filter((s): s is number => s !== undefined);

  return {
    level: computeAdaptiveLevel(scores),
    recentScores: scores.slice(0, 8),
    averageScore:
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
    conversationCount: scores.length,
  };
}

export async function fetchLeaderboard(): Promise<{
  entries: LeaderboardEntry[];
  dbEnabled: boolean;
}> {
  const remote = await apiFetch<{ entries: LeaderboardEntry[]; dbEnabled: boolean }>(
    "/api/leaderboard"
  );
  if (remote) return remote;
  return { entries: [], dbEnabled: false };
}

export { isScenarioUnlocked } from "./storage";
