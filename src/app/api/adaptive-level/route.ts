import { NextResponse } from "next/server";
import { computeAdaptiveLevel } from "@/lib/adaptive-difficulty";
import { requireAuth } from "@/lib/api-auth";
import { getUserConversations } from "@/lib/db/queries";
import { isDbEnabled } from "@/lib/db";

export async function GET() {
  try {
    if (!isDbEnabled()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;

    const convs = await getUserConversations(authResult.userId);
    const scores = convs
      .map((c) => c.overallScore)
      .filter((s): s is number => s !== undefined);

    const level = computeAdaptiveLevel(scores);

    return NextResponse.json({
      level,
      recentScores: scores.slice(0, 8),
      averageScore:
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
      conversationCount: scores.length,
    });
  } catch (error) {
    console.error("Adaptive level error:", error);
    return NextResponse.json({ error: "Failed to compute adaptive level" }, { status: 500 });
  }
}
