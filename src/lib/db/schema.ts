import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { AchievementId } from "@/lib/types";
import type { MessageFeedback } from "@/lib/types";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    level: integer("level").notNull().default(1),
    xp: integer("xp").notNull().default(0),
    streak: integer("streak").notNull().default(0),
    lastStudyDate: varchar("last_study_date", { length: 10 }),
    voiceMessageCount: integer("voice_message_count").notNull().default(0),
    completedScenarioIds: jsonb("completed_scenario_ids").$type<string[]>().notNull().default([]),
    unlockedAchievements: jsonb("unlocked_achievements")
      .$type<AchievementId[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("users_xp_idx").on(t.xp.desc(), t.level.desc())],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scenarioId: varchar("scenario_id", { length: 100 }).notNull(),
    scenarioTitle: varchar("scenario_title", { length: 255 }).notNull(),
    overallScore: integer("overall_score"),
    /** Uploaded from a guest's local history; excluded from achievement checks. */
    imported: boolean("imported").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("conversations_user_updated_idx").on(t.userId, t.updatedAt.desc())],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).notNull(),
    content: text("content").notNull(),
    translations: jsonb("translations").$type<{ en?: string; vi?: string }>(),
    feedback: jsonb("feedback").$type<MessageFeedback>(),
    isVoice: boolean("is_voice").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("messages_conversation_created_idx").on(t.conversationId, t.createdAt)],
);

export type DbUser = typeof users.$inferSelect;
export type DbConversation = typeof conversations.$inferSelect;
export type DbMessage = typeof messages.$inferSelect;

export const reviewCards = pgTable(
  "review_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** The scored reply this card came from; one card per reply. */
    messageId: uuid("message_id")
      .notNull()
      .unique()
      .references(() => messages.id, { onDelete: "cascade" }),
    scenarioId: varchar("scenario_id", { length: 100 }).notNull(),
    prompt: text("prompt").notNull(),
    answer: text("answer").notNull(),
    note: text("note").notNull().default(""),
    box: integer("box").notNull().default(0),
    /** YYYY-MM-DD in the learner's time zone. */
    dueDate: varchar("due_date", { length: 10 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("review_cards_user_due_idx").on(t.userId, t.dueDate)],
);

export type DbReviewCard = typeof reviewCards.$inferSelect;
