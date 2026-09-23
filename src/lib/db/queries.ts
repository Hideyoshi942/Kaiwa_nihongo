import { and, count, desc, eq, inArray, lte, sql, type SQL } from "drizzle-orm";
import {
  ACHIEVEMENTS,
  checkNewAchievements,
  getAchievementDef,
} from "@/lib/achievements";
import { getScenarioById, SCENARIOS } from "@/lib/scenarios";
import type {
  AchievementId,
  MessageFeedback,
  Conversation,
  DashboardStats,
  LeaderboardEntry,
  UserProfile,
} from "@/lib/types";
import { conversations, messages, reviewCards, users, type DbUser } from "./schema";
import { getDb } from "./index";
import { previousDateKey } from "@/lib/dates";
import { cardFromFeedback, scheduleReview, type ReviewCard, type ReviewGrade } from "@/lib/srs";

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
  if (convs.length === 0) return [];

  // One query for all messages instead of one per conversation.
  const msgs = await db
    .select()
    .from(messages)
    .where(
      inArray(
        messages.conversationId,
        convs.map((c) => c.id)
      )
    )
    .orderBy(messages.createdAt);

  const byConversation = new Map<string, Conversation["messages"]>();
  for (const m of msgs) {
    const list = byConversation.get(m.conversationId) ?? [];
    list.push({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      translations: m.translations ?? undefined,
      translation: m.translations?.en,
      feedback: m.feedback ?? undefined,
      isVoice: m.isVoice,
      createdAt: m.createdAt.toISOString(),
    });
    byConversation.set(m.conversationId, list);
  }

  return convs.map((conv) => ({
    id: conv.id,
    scenarioId: conv.scenarioId,
    scenarioTitle: conv.scenarioTitle,
    overallScore: conv.overallScore ?? undefined,
    imported: conv.imported || undefined,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
    messages: byConversation.get(conv.id) ?? [],
  }));
}

const XP_PER_LEVEL = 100;
const MAX_LEVEL = 100;

/** SQL expression for the level that corresponds to `xpExpr`. */
function levelFor(xpExpr: SQL) {
  return sql<number>`least(${MAX_LEVEL}, (${xpExpr}) / ${XP_PER_LEVEL} + 1)`;
}

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

export class ConversationOwnershipError extends Error {}

export async function getConversationOwner(conversationId: string): Promise<string | null> {
  const db = getDb();
  const [row] = await db
    .select({ userId: conversations.userId })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  return row?.userId ?? null;
}

export interface ChatTurnInput {
  conversationId: string;
  scenarioId: string;
  scenarioTitle: string;
  opening: { content: string; translations: { en: string; vi: string } };
  userMessage: string;
  isVoice: boolean;
  reply: string;
  translations: { en: string; vi: string };
  feedback: MessageFeedback;
  /** False for demo-mode (canned) replies, which must not earn XP. */
  awardXp: boolean;
  /** Local calendar date (YYYY-MM-DD) of the learner, used for the streak. */
  today: string;
}

export interface ChatTurnResult {
  userMessageId: string;
  assistantMessageId: string;
  xpGained: number;
  user: UserProfile | null;
  unlocked: AchievementId[];
}

/**
 * Stores one chat turn and applies all of its rewards on the server, so scores
 * and XP never come from the client. Everything runs in one transaction.
 */
export async function recordChatTurn(userId: string, input: ChatTurnInput): Promise<ChatTurnResult> {
  const db = getDb();
  const overall = input.feedback.overall;
  const xpGained = input.awardXp ? Math.round(overall / 10) : 0;

  const result = await db.transaction(async (tx) => {
    const now = new Date();
    const [existing] = await tx
      .select({ userId: conversations.userId })
      .from(conversations)
      .where(eq(conversations.id, input.conversationId))
      .limit(1);

    if (existing && existing.userId !== userId) {
      throw new ConversationOwnershipError("Conversation belongs to another user");
    }

    if (existing) {
      await tx
        .update(conversations)
        .set({ overallScore: overall, updatedAt: now })
        .where(eq(conversations.id, input.conversationId));
    } else {
      await tx.insert(conversations).values({
        id: input.conversationId,
        userId,
        scenarioId: input.scenarioId,
        scenarioTitle: input.scenarioTitle,
        overallScore: overall,
        createdAt: now,
        updatedAt: now,
      });
      await tx.insert(messages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: input.opening.content,
        translations: input.opening.translations,
        createdAt: new Date(now.getTime() - 2),
      });
    }

    const [userMsg, assistantMsg] = await tx
      .insert(messages)
      .values([
        {
          conversationId: input.conversationId,
          role: "user",
          content: input.userMessage,
          feedback: input.feedback,
          isVoice: input.isVoice,
          createdAt: new Date(now.getTime() - 1),
        },
        {
          conversationId: input.conversationId,
          role: "assistant",
          content: input.reply,
          translations: input.translations,
          createdAt: now,
        },
      ])
      .returning({ id: messages.id });

    // Demo replies use canned feedback, so only real evaluations become review cards.
    const card = input.awardXp ? cardFromFeedback(input.userMessage, input.feedback) : null;
    if (card) {
      await tx.insert(reviewCards).values({
        userId,
        messageId: userMsg.id,
        scenarioId: input.scenarioId,
        ...card,
        dueDate: input.today,
      });
    }

    await markScenarioCompleted(tx, userId, input.scenarioId);
    if (input.isVoice) await recordUserVoiceMessage(tx, userId);
    await addUserXp(tx, userId, xpGained, input.today);

    return { userMessageId: userMsg.id, assistantMessageId: assistantMsg.id };
  });

  const unlocked = await evaluateUserAchievements(userId);
  const user = await getUserById(userId);

  return {
    ...result,
    xpGained,
    user: user ? dbUserToProfile(user) : null,
    unlocked,
  };
}

async function markScenarioCompleted(tx: Tx, userId: string, scenarioId: string) {
  // Append only if absent, in a single statement so concurrent turns can't drop entries.
  await tx
    .update(users)
    .set({
      completedScenarioIds: sql`${users.completedScenarioIds} || ${JSON.stringify([scenarioId])}::jsonb`,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, userId), sql`not (${users.completedScenarioIds} ? ${scenarioId})`));
}

async function addUserXp(tx: Tx, userId: string, amount: number, today: string) {
  const yesterday = previousDateKey(today);
  const newXp = sql`${users.xp} + ${amount}`;

  // Increment in SQL (not read-then-write) so concurrent requests can't overwrite each other.
  await tx
    .update(users)
    .set({
      xp: newXp,
      level: levelFor(newXp),
      streak: sql`case
        when ${users.lastStudyDate} = ${today} then ${users.streak}
        when ${users.lastStudyDate} = ${yesterday} then ${users.streak} + 1
        else 1
      end`,
      lastStudyDate: today,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

async function recordUserVoiceMessage(tx: Tx, userId: string) {
  await tx
    .update(users)
    .set({
      voiceMessageCount: sql`${users.voiceMessageCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/**
 * Stores a guest's local conversations after they sign in. They are marked
 * `imported` and grant no XP, streak or achievements. Re-sending the same
 * conversation id is a no-op, so retries are safe.
 */
export async function importGuestConversations(
  userId: string,
  convs: Conversation[]
): Promise<number> {
  const db = getDb();
  let imported = 0;

  for (const conv of convs) {
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(conversations)
        .values({
          id: conv.id,
          userId,
          scenarioId: conv.scenarioId,
          scenarioTitle: conv.scenarioTitle,
          overallScore: conv.overallScore ?? null,
          imported: true,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
        })
        .onConflictDoNothing({ target: conversations.id })
        .returning({ id: conversations.id });
      if (inserted.length === 0 || conv.messages.length === 0) return;

      await tx.insert(messages).values(
        conv.messages.map((m) => ({
          conversationId: conv.id,
          role: m.role,
          content: m.content,
          translations: m.translations ?? null,
          feedback: m.feedback ?? null,
          isVoice: m.isVoice ?? false,
          createdAt: new Date(m.createdAt),
        }))
      );
      imported++;
    });
  }
  return imported;
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

  // Imported guest history is display-only: its scores were produced client-side.
  const convs = (await getUserConversations(userId)).filter((c) => !c.imported);
  const scores = convs.map((c) => c.overallScore).filter((s): s is number => s !== undefined);

  const candidates = checkNewAchievements({
    unlocked: user.unlockedAchievements ?? [],
    totalConversations: convs.length,
    streak: user.streak,
    highestScore: scores.length > 0 ? Math.max(...scores) : 0,
    voiceMessageCount: user.voiceMessageCount,
    completedScenarioIds: user.completedScenarioIds ?? [],
    completedCategories: getCompletedCategories(user.completedScenarioIds ?? []) as never[],
  });

  const db = getDb();
  const newlyUnlocked: AchievementId[] = [];
  for (const id of candidates) {
    const reward = getAchievementDef(id)?.xpReward ?? 0;
    const newXp = sql`${users.xp} + ${reward}`;
    // The `not ... ?` guard makes each award happen at most once, even when
    // two evaluations race.
    const awarded = await db
      .update(users)
      .set({
        xp: newXp,
        level: levelFor(newXp),
        unlockedAchievements: sql`${users.unlockedAchievements} || ${JSON.stringify([id])}::jsonb`,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, userId), sql`not (${users.unlockedAchievements} ? ${id})`))
      .returning({ id: users.id });
    if (awarded.length > 0) newlyUnlocked.push(id);
  }

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

function toReviewCard(row: typeof reviewCards.$inferSelect): ReviewCard {
  return {
    id: row.id,
    scenarioId: row.scenarioId,
    prompt: row.prompt,
    answer: row.answer,
    note: row.note,
    box: row.box,
    dueDate: row.dueDate,
  };
}

export async function getDueReviewCards(userId: string, today: string, limit = 20) {
  const db = getDb();
  const due = and(eq(reviewCards.userId, userId), lte(reviewCards.dueDate, today));
  const [rows, [{ dueCount }], [{ total }]] = await Promise.all([
    db.select().from(reviewCards).where(due).orderBy(reviewCards.dueDate, reviewCards.box).limit(limit),
    db.select({ dueCount: count() }).from(reviewCards).where(due),
    db.select({ total: count() }).from(reviewCards).where(eq(reviewCards.userId, userId)),
  ]);
  return { cards: rows.map(toReviewCard), dueCount, total };
}

/** Applies a review grade. Returns null if the card does not belong to the user. */
export async function gradeReviewCard(
  userId: string,
  cardId: string,
  grade: ReviewGrade,
  today: string
): Promise<ReviewCard | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(reviewCards)
    .where(and(eq(reviewCards.id, cardId), eq(reviewCards.userId, userId)))
    .limit(1);
  if (!row) return null;

  const next = scheduleReview(row.box, grade, today);
  // Conditional on the box we read, so a double-submitted grade is applied once.
  const [updated] = await db
    .update(reviewCards)
    .set({ box: next.box, dueDate: next.dueDate, updatedAt: new Date() })
    .where(and(eq(reviewCards.id, cardId), eq(reviewCards.box, row.box), eq(reviewCards.dueDate, row.dueDate)))
    .returning();
  return toReviewCard(updated ?? row);
}
