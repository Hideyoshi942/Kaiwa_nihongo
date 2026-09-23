import type { AdaptiveLevel } from "@/lib/adaptive-difficulty";
import { computeAdaptiveLevel } from "@/lib/adaptive-difficulty";
import { analyzeConversations, type LearningAnalytics } from "@/lib/learning-insights";
import type { ChatResponse } from "@/lib/ai-response";
import type { ReviewCard, ReviewGrade } from "@/lib/srs";
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

export type ChatErrorCode = "rate_limited" | "ai_unavailable" | "forbidden" | "internal";

export class ChatError extends Error {
  constructor(public code: ChatErrorCode) {
    super(code);
  }
}

export interface ChatTurnResult extends ChatResponse {
  /** True when the reply is canned demo text because no AI key is configured. */
  mock: boolean;
  /** True when the server stored the turn (signed-in users). */
  persisted: boolean;
  userMessageId?: string;
  assistantMessageId?: string;
  xpGained?: number;
  user?: UserProfile | null;
  unlocked?: AchievementId[];
}

/**
 * Sends one chat turn and reads the NDJSON stream from /api/chat, calling
 * `onDelta` with the reply text accumulated so far.
 */
export async function sendChatTurn(
  body: Record<string, unknown>,
  onDelta: (replySoFar: string) => void
): Promise<ChatTurnResult> {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ChatError("internal");
  }
  if (res.status === 429) throw new ChatError("rate_limited");
  if (res.status === 403) throw new ChatError("forbidden");
  if (!res.ok || !res.body) throw new ChatError("internal");

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let reply = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.type === "delta") {
        reply += event.text;
        onDelta(reply);
      } else if (event.type === "done") {
        return event as ChatTurnResult;
      } else if (event.type === "error") {
        throw new ChatError(event.code === "ai_unavailable" || event.code === "forbidden" ? event.code : "internal");
      }
    }
  }
  throw new ChatError("internal");
}

/**
 * Uploads conversations a guest saved locally, then clears them. Imported
 * history is display-only on the server (no XP or achievements).
 */
export async function importGuestData(): Promise<number> {
  const convs = local.getConversations();
  if (convs.length === 0) return 0;
  const result = await apiFetch<{ imported: number }>("/api/import-guest", {
    method: "POST",
    body: JSON.stringify({ conversations: convs }),
  });
  if (!result) return 0;
  local.clearConversations();
  return result.imported;
}

// Guest-only progress. Signed-in users' turns, XP and voice counts are
// recorded server-side by /api/chat.
export function saveGuestConversation(conversation: Conversation): void {
  local.saveConversation(conversation);
}

export function grantGuestXp(amount: number): UserProfile | null {
  return local.addXp(amount);
}

export function trackGuestVoiceMessage(): void {
  local.recordVoiceMessage();
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

export interface ReviewDeck {
  cards: ReviewCard[];
  dueCount: number;
  total: number;
  /** Cards are stored on the server (signed in) rather than in this browser. */
  remote: boolean;
}

const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export async function fetchReviewDeck(): Promise<ReviewDeck> {
  const remote = await apiFetch<Omit<ReviewDeck, "remote">>(
    `/api/review?tz=${encodeURIComponent(timeZone())}`
  );
  if (remote) return { ...remote, remote: true };
  return { ...local.getDueReviewCards(), remote: false };
}

export async function gradeReview(cardId: string, grade: ReviewGrade, remote: boolean): Promise<void> {
  if (!remote) {
    local.gradeReviewCard(cardId, grade);
    return;
  }
  await apiFetch("/api/review", {
    method: "POST",
    body: JSON.stringify({ cardId, grade, timeZone: timeZone() }),
  });
}

export function addGuestReviewCard(
  ...args: Parameters<typeof local.addReviewCard>
): void {
  local.addReviewCard(...args);
}

export { isScenarioUnlocked } from "./storage";
