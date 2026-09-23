import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { importGuestConversations } from "@/lib/db/queries";
import { parseChatResponse } from "@/lib/ai-response";
import { getScenarioById } from "@/lib/scenarios";
import { rateLimit } from "@/lib/rate-limit";
import type { ChatMessage, Conversation } from "@/lib/types";

const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES = 200;
const MAX_CONTENT = 2000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validDate(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime()) || d.getTime() > Date.now() + 60_000) return null;
  return d.toISOString();
}

function sanitizeMessage(raw: unknown): ChatMessage | null {
  if (typeof raw !== "object" || raw === null) return null;
  const m = raw as Record<string, unknown>;
  if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
  if (m.failed) return null;
  const createdAt = validDate(m.createdAt);
  if (!createdAt) return null;

  // Reuse the AI response validator for feedback so imported rows have the
  // same shape the analytics code expects.
  const feedback =
    m.role === "user" && m.feedback
      ? parseChatResponse({ reply: "-", feedback: m.feedback }, !!m.isVoice)?.feedback
      : undefined;
  const t = m.translations as Record<string, unknown> | undefined;

  return {
    id: "",
    role: m.role,
    content: m.content.slice(0, MAX_CONTENT),
    translations:
      t && typeof t === "object"
        ? {
            en: typeof t.en === "string" ? t.en.slice(0, MAX_CONTENT) : undefined,
            vi: typeof t.vi === "string" ? t.vi.slice(0, MAX_CONTENT) : undefined,
          }
        : undefined,
    feedback,
    isVoice: !!m.isVoice,
    createdAt,
  };
}

function sanitizeConversation(raw: unknown): Conversation | null {
  if (typeof raw !== "object" || raw === null) return null;
  const c = raw as Record<string, unknown>;
  if (typeof c.id !== "string" || !UUID_RE.test(c.id)) return null;
  if (typeof c.scenarioId !== "string" || !getScenarioById(c.scenarioId)) return null;
  const createdAt = validDate(c.createdAt);
  const updatedAt = validDate(c.updatedAt) ?? createdAt;
  if (!createdAt || !updatedAt || !Array.isArray(c.messages)) return null;

  const msgs = c.messages
    .slice(0, MAX_MESSAGES)
    .map(sanitizeMessage)
    .filter((m): m is ChatMessage => m !== null);
  if (!msgs.some((m) => m.role === "user")) return null;

  const score = typeof c.overallScore === "number" ? c.overallScore : NaN;
  return {
    id: c.id,
    scenarioId: c.scenarioId,
    scenarioTitle: typeof c.scenarioTitle === "string" ? c.scenarioTitle.slice(0, 255) : c.scenarioId,
    overallScore: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : undefined,
    messages: msgs,
    createdAt,
    updatedAt,
  };
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  if (!rateLimit(`import:${authResult.userId}`, 5, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = (await request.json()) as { conversations?: unknown };
    if (!Array.isArray(body.conversations)) {
      return NextResponse.json({ error: "conversations must be an array" }, { status: 400 });
    }

    const convs = body.conversations
      .slice(0, MAX_CONVERSATIONS)
      .map(sanitizeConversation)
      .filter((c): c is Conversation => c !== null);

    const imported = await importGuestConversations(authResult.userId, convs);
    return NextResponse.json({ imported, skipped: body.conversations.length - imported });
  } catch (error) {
    console.error("Import guest data error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
