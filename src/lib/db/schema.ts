import {
  boolean,
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

export const users = pgTable("users", {
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
  completedScenarioIds: jsonb("completed_scenario_ids")
    .$type<string[]>()
    .notNull()
    .default([]),
  unlockedAchievements: jsonb("unlocked_achievements")
    .$type<AchievementId[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scenarioId: varchar("scenario_id", { length: 100 }).notNull(),
  scenarioTitle: varchar("scenario_title", { length: 255 }).notNull(),
  overallScore: integer("overall_score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
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
});

export type DbUser = typeof users.$inferSelect;
export type DbConversation = typeof conversations.$inferSelect;
export type DbMessage = typeof messages.$inferSelect;
