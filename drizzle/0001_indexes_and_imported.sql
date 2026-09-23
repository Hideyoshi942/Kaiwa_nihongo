ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "imported" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_user_updated_idx" ON "conversations" USING btree ("user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_conversation_created_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_xp_idx" ON "users" USING btree ("xp" DESC NULLS LAST,"level" DESC NULLS LAST);