CREATE TABLE "review_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"scenario_id" varchar(100) NOT NULL,
	"prompt" text NOT NULL,
	"answer" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"box" integer DEFAULT 0 NOT NULL,
	"due_date" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_cards_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
ALTER TABLE "review_cards" ADD CONSTRAINT "review_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_cards" ADD CONSTRAINT "review_cards_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "review_cards_user_due_idx" ON "review_cards" USING btree ("user_id","due_date");--> statement-breakpoint
-- Backfill cards from past scored replies (same rules as cardFromFeedback in src/lib/srs.ts).
-- Imported guest history is skipped because its feedback was produced client-side.
INSERT INTO "review_cards" ("user_id", "message_id", "scenario_id", "prompt", "answer", "note", "due_date")
SELECT c."user_id", m."id", c."scenario_id", btrim(m."content"), x.answer, x.note,
       to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD')
FROM "messages" m
JOIN "conversations" c ON c."id" = m."conversation_id"
CROSS JOIN LATERAL (
  SELECT v.answer, v.note
  FROM (VALUES
    (1, btrim(m."feedback"->'grammar'->>'correction'), coalesce(m."feedback"->'grammar'->>'comment', '')),
    (2, btrim(m."feedback"->'naturalness'->>'alternative'), coalesce(m."feedback"->'naturalness'->>'comment', ''))
  ) AS v(ord, answer, note)
  WHERE v.answer IS NOT NULL AND v.answer <> '' AND v.answer <> btrim(m."content")
    AND v.answer NOT IN ('もう少し自然な言い方も試してみましょう。', '例: はい、お願いします。')
  ORDER BY v.ord
  LIMIT 1
) x
WHERE m."role" = 'user' AND m."feedback" IS NOT NULL AND NOT c."imported"
ON CONFLICT ("message_id") DO NOTHING;
