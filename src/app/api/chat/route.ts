import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { AdaptiveLevel } from "@/lib/adaptive-difficulty";
import type { Locale } from "@/lib/i18n";
import { getScenarioById } from "@/lib/scenarios";
import { getLocalizedScenario, getOpeningTranslation } from "@/lib/scenario-i18n";
import { AiUnavailableError, streamChatResponse, type ChatStreamEvent } from "@/lib/ai";
import { isDbEnabled } from "@/lib/db";
import {
  ConversationOwnershipError,
  getConversationOwner,
  recordChatTurn,
} from "@/lib/db/queries";
import { dateKey, resolveTimeZone } from "@/lib/dates";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY_MESSAGES = 30;
const MAX_HISTORY_CHARS = 1000;
const RATE_WINDOW_MS = 60_000;
const USER_LIMIT = 20;
const GUEST_LIMIT = 8;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type HistoryItem = { role: "user" | "assistant"; content: string };

function parseHistory(raw: unknown): HistoryItem[] | null {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) return null;
  const items: HistoryItem[] = [];
  for (const item of raw) {
    if (
      !item ||
      (item.role !== "user" && item.role !== "assistant") ||
      typeof item.content !== "string"
    ) {
      return null;
    }
    items.push({ role: item.role, content: item.content.slice(0, MAX_HISTORY_CHARS) });
  }
  // Only the most recent turns are sent to the model to bound cost.
  return items.slice(-MAX_HISTORY_MESSAGES);
}

export async function POST(request: Request) {
  const session = isDbEnabled() ? await auth() : null;
  const userId = session?.user?.id;

  const limit = userId
    ? rateLimit(`chat:user:${userId}`, USER_LIMIT, RATE_WINDOW_MS)
    : rateLimit(`chat:ip:${clientIp(request)}`, GUEST_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { scenarioId, conversationId, locale, voiceMode, adaptiveLevel, timeZone } = body;
  const userMessage = typeof body.userMessage === "string" ? body.userMessage.trim() : "";
  const history = parseHistory(body.history);
  const resolvedLocale: Locale = locale === "vi" ? "vi" : "en";

  if (typeof scenarioId !== "string" || !userMessage || history === null) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  if (userMessage.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ error: "Message too long" }, { status: 413 });
  }
  if (userId && (typeof conversationId !== "string" || !UUID_RE.test(conversationId))) {
    return NextResponse.json({ error: "Invalid conversationId" }, { status: 400 });
  }

  const scenario = getScenarioById(scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  // Fail fast before spending an AI call; recordChatTurn re-checks inside its transaction.
  if (userId) {
    const owner = await getConversationOwner(conversationId as string);
    if (owner && owner !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const events = streamChatResponse({
    scenario,
    userMessage,
    history,
    locale: resolvedLocale,
    voiceMode: !!voiceMode,
    adaptiveLevel: (["N5", "N4", "N3", "N2", "N1"].includes(adaptiveLevel as string)
      ? adaptiveLevel
      : "N4") as AdaptiveLevel,
  });

  // Newline-delimited JSON: {type:"delta"}* then one {type:"done"} or {type:"error"}.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        let final: Extract<ChatStreamEvent, { type: "done" }> | null = null;
        for await (const event of events) {
          if (event.type === "delta") send(event);
          else final = event;
        }
        if (!final) throw new AiUnavailableError("AI stream ended without a result");
        const { response, mock } = final;

        // Guests keep their progress in localStorage on the client.
        if (!userId) {
          send({ type: "done", ...response, mock, persisted: false });
          return;
        }

        const turn = await recordChatTurn(userId, {
          conversationId: conversationId as string,
          scenarioId: scenario.id,
          scenarioTitle: getLocalizedScenario(scenario, resolvedLocale).title,
          opening: {
            content: scenario.openingMessage,
            translations: {
              en: getOpeningTranslation(scenario, "en"),
              vi: getOpeningTranslation(scenario, "vi"),
            },
          },
          userMessage,
          isVoice: !!voiceMode,
          reply: response.reply,
          translations: response.translations,
          feedback: response.feedback,
          awardXp: !mock,
          today: dateKey(new Date(), resolveTimeZone(timeZone)),
        });
        send({ type: "done", ...response, mock, persisted: true, ...turn });
      } catch (error) {
        const code =
          error instanceof AiUnavailableError
            ? "ai_unavailable"
            : error instanceof ConversationOwnershipError
              ? "forbidden"
              : "internal";
        console.error("Chat API error:", error);
        send({ type: "error", code });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
