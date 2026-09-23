import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDbEnabled } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const RATE_WINDOW_MS = 60_000;
const USER_LIMIT = 10;
const GUEST_LIMIT = 4;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 503 });
  }

  const session = isDbEnabled() ? await auth() : null;
  const userId = session?.user?.id;
  const limit = userId
    ? rateLimit(`transcribe:user:${userId}`, USER_LIMIT, RATE_WINDOW_MS)
    : rateLimit(`transcribe:ip:${clientIp(request)}`, GUEST_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  // Reject oversized uploads before buffering the body.
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_AUDIO_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "Audio too large" }, { status: 413 });
  }

  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Audio too large" }, { status: 413 });
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const file = new File([audio], "audio.webm", { type: audio.type || "audio/webm" });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "ja",
      response_format: "json",
    });

    return NextResponse.json({
      text: transcription.text.trim(),
      provider: "whisper",
    });
  } catch (error) {
    console.error("Whisper transcription error:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    available: !!process.env.OPENAI_API_KEY,
  });
}
