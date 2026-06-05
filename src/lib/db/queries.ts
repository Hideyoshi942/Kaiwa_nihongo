import { and, desc, eq } from "drizzle-orm";
import {
  ACHIEVEMENTS,
  checkNewAchievements,
  getAchievementDef,
} from "@/lib/achievements";
import { getScenarioById, SCENARIOS } from "@/lib/scenarios";
import type {
  AchievementId,
  ChatMessage,
  Conversation,
  DashboardStats,
  LeaderboardEntry,
  UserProfile,
} from "@/lib/types";
import { conversations, messages, users, type DbUser } from "./schema";
import { getDb } from "./index";

export function dbUserToProfile(user: DbUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    level: user.level,
    xp: user.xp,
    streak: user.streak,
    lastStudyDate: user.lastStudyDate ?? undefined,
    voiceMessageCount: user.voiceMessageCount,
    completedScenarioIds: user.completedScenarioIds ?? [],
    unlockedAchievements: user.unlockedAchievements ?? [],
  };
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function getUserById(id: string) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function createUser(data: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  const db = getDb();
  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
    })
    .returning();
  return user;
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const db = getDb();
  const convs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));

  const result: Conversation[] = [];
  for (const conv of convs) {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conv.id))
      .orderBy(messages.createdAt);

    result.push({
      id: conv.id,
      scenarioId: conv.scenarioId,
      scenarioTitle: conv.scenarioTitle,
      overallScore: conv.overallScore ?? undefined,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: msgs.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        translations: m.translations ?? undefined,
        translation: m.translations?.en,
        feedback: m.feedback ?? undefined,
        isVoice: m.isVoice,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  }
  return result;
}

export async function saveUserConversation(
  userId: string,
  conversation: Conversation
): Promise<Conversation> {
  const db = getDb();
  const now = new Date();

  const [existing] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, conversation.id), eq(conversations.userId, userId)))
    .limit(1);

  let convId = conversation.id;

  if (existing) {
    await db
      .update(conversations)
      .set({
        scenarioTitle: conversation.scenarioTitle,
        overallScore: conversation.overallScore ?? null,
        updatedAt: now,
      })
      .where(eq(conversations.id, convId));
    await db.delete(messages).where(eq(messages.conversationId, convId));
  } else {
    const [created] = await db
      .insert(conversations)
      .values({
        id: conversation.id,
        userId,
        scenarioId: conversation.scenarioId,
        scenarioTitle: conversation.scenarioTitle,
        overallScore: conversation.overallScore ?? null,
        createdAt: new Date(conversation.createdAt),
        updatedAt: now,
      })
      .returning();
    convId = created.id;
  }

  if (conversation.messages.length > 0) {
    await db.insert(messages).values(
      conversation.messages.map((m) => ({
        id: m.id,
        conversationId: convId,
        role: m.role,
        content: m.content,
        translations: m.translations ?? null,
        feedback: m.feedback ?? null,
        isVoice: m.isVoice ?? false,
        createdAt: new Date(m.createdAt),
      }))
    );
  }

  const userMessages = conversation.messages.filter((m) => m.role === "user");
  if (userMessages.length > 0) {
    await markScenarioCompleted(userId, conversation.scenarioId);
  }

  return { ...conversation, id: convId };
}

async function markScenarioCompleted(userId: string, scenarioId: string) {
  const user = await getUserById(userId);
  if (!user) return;
  const completed = user.completedScenarioIds ?? [];
  if (completed.includes(scenarioId)) return;
  const db = getDb();
  await db
    .update(users)
    .set({
      completedScenarioIds: [...completed, scenarioId],
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function addUserXp(userId: string, amount: number): Promise<UserProfile | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const today = new Date().toISOString().split("T")[0];
  let streak = user.streak;
  let lastStudyDate = user.lastStudyDate;

  if (lastStudyDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    streak = lastStudyDate === yesterdayStr ? user.streak + 1 : 1;
    lastStudyDate = today;
  }

  const xp = user.xp + amount;
  const level = Math.min(100, Math.floor(xp / 100) + 1);
  const db = getDb();

  const [updated] = await db
    .update(users)
    .set({ xp, level, streak, lastStudyDate, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return dbUserToProfile(updated);
}

export async function recordUserVoiceMessage(userId: string) {
  const user = await getUserById(userId);
  if (!user) return;
  const db = getDb();
  await db
    .update(users)
    .set({
      voiceMessageCount: user.voiceMessageCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

function getCompletedCategories(scenarioIds: string[]) {
  const cats = new Set<string>();
  for (const id of scenarioIds) {
    const scenario = getScenarioById(id);
    if (scenario) cats.add(scenario.category);
  }
  return [...cats];
}

export async function evaluateUserAchievements(userId: string): Promise<AchievementId[]> {
  const user = await getUserById(userId);
  if (!user) return [];

  const convs = await getUserConversations(userId);
  const scores = convs.map((c) => c.overallScore).filter((s): s is number => s !== undefined);

  const newlyUnlocked = checkNewAchievements({
    unlocked: user.unlockedAchievements ?? [],
    totalConversations: convs.length,
    streak: user.streak,
    highestScore: scores.length > 0 ? Math.max(...scores) : 0,
    voiceMessageCount: user.voiceMessageCount,
    completedScenarioIds: user.completedScenarioIds ?? [],
    completedCategories: getCompletedCategories(user.completedScenarioIds ?? []) as never[],
  });

  if (newlyUnlocked.length === 0) return [];

  let xp = user.xp;
  const unlocked = [...(user.unlockedAchievements ?? [])];
  for (const id of newlyUnlocked) {
    const def = getAchievementDef(id);
    if (def) xp += def.xpReward;
    unlocked.push(id);
  }

  const level = Math.min(100, Math.floor(xp / 100) + 1);
  const db = getDb();
  await db
    .update(users)
    .set({ xp, level, unlockedAchievements: unlocked, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return newlyUnlocked;
}

export async function computeUserDashboardStats(userId: string): Promise<DashboardStats> {
  const user = await getUserById(userId);
  const convs = await getUserConversations(userId);
  const scored = convs.filter((c) => c.overallScore !== undefined);
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

  return {
    totalConversations: convs.length,
    averageScore,
    streak: user?.streak ?? 0,
    strongestCategory,
    weakestCategory,
    recentScores: scores.slice(0, 7),
    unlockedAchievements: user?.unlockedAchievements?.length ?? 0,
    totalAchievements: ACHIEVEMENTS.length,
  };
}

export function getFeedbackWeaknesses(convs: Conversation[]) {
  const totals = { grammar: 0, vocabulary: 0, naturalness: 0, politeness: 0 };
  let count = 0;

  for (const conv of convs) {
    for (const msg of conv.messages) {
      if (msg.feedback?.breakdown) {
        totals.grammar += msg.feedback.breakdown.grammar;
        totals.vocabulary += msg.feedback.breakdown.vocabulary;
        totals.naturalness += msg.feedback.breakdown.naturalness;
        totals.politeness += msg.feedback.breakdown.politeness;
        count++;
      }
    }
  }

  if (count === 0) return null;

  const avgs = {
    grammar: totals.grammar / count,
    vocabulary: totals.vocabulary / count,
    naturalness: totals.naturalness / count,
    politeness: totals.politeness / count,
  };

  const sorted = Object.entries(avgs).sort((a, b) => a[1] - b[1]);
  return { weakest: sorted[0][0], averages: avgs, sampleCount: count };
}

export async function getUserRecommendations(userId: string) {
  const user = await getUserById(userId);
  const convs = await getUserConversations(userId);
  const completed = new Set(user?.completedScenarioIds ?? []);
  const weaknesses = getFeedbackWeaknesses(convs);

  const recommendations: {
    type: "scenario" | "category" | "skill" | "speaking";
    id: string;
    reason: string;
    priority: number;
  }[] = [];

  if (!weaknesses) {
    const first = SCENARIOS.find((s) => !completed.has(s.id));
    if (first) {
      recommendations.push({
        type: "scenario",
        id: first.id,
        reason: "start_practice",
        priority: 1,
      });
    }
    return recommendations;
  }

  const { weakest } = weaknesses;

  const skillReasonMap: Record<string, string> = {
    grammar: "weak_grammar",
    vocabulary: "weak_vocabulary",
    naturalness: "weak_naturalness",
    politeness: "weak_politeness",
  };

  recommendations.push({
    type: "skill",
    id: weakest,
    reason: skillReasonMap[weakest] ?? "weak_grammar",
    priority: 1,
  });

  if ((user?.voiceMessageCount ?? 0) < 3) {
    recommendations.push({
      type: "speaking",
      id: "voice_practice",
      reason: "try_voice",
      priority: 2,
    });
  }

  const categoryScores: Record<string, number[]> = {};
  for (const conv of convs) {
    const scenario = getScenarioById(conv.scenarioId);
    if (!scenario || conv.overallScore === undefined) continue;
    if (!categoryScores[scenario.category]) categoryScores[scenario.category] = [];
    categoryScores[scenario.category].push(conv.overallScore);
  }

  let weakestCat: string | null = null;
  let worstAvg = 101;
  for (const [cat, scores] of Object.entries(categoryScores)) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg < worstAvg) {
      worstAvg = avg;
      weakestCat = cat;
    }
  }

  if (weakestCat) {
    recommendations.push({
      type: "category",
      id: weakestCat,
      reason: "weak_category",
      priority: 3,
    });
  }

  const unplayed = SCENARIOS.filter((s) => !completed.has(s.id));
  if (unplayed.length > 0) {
    const match = weakestCat
      ? unplayed.find((s) => s.category === weakestCat) ?? unplayed[0]
      : unplayed[0];
    recommendations.push({
      type: "scenario",
      id: match.id,
      reason: "new_scenario",
      priority: 4,
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

export async function getLeaderboard(
  currentUserId?: string,
  limit = 20
): Promise<LeaderboardEntry[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      level: users.level,
      xp: users.xp,
      streak: users.streak,
    })
    .from(users)
    .orderBy(desc(users.xp), desc(users.level))
    .limit(limit);

  return rows.map((row, i) => ({
    rank: i + 1,
    id: row.id,
    name: row.name ?? "Learner",
    level: row.level,
    xp: row.xp,
    streak: row.streak,
    isCurrentUser: currentUserId ? row.id === currentUserId : false,
  }));
}
