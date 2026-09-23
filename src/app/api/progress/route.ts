import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { evaluateUserAchievements } from "@/lib/db/queries";

// XP and voice counts are applied by /api/chat when a turn is recorded;
// the client can only ask the server to re-check achievements.
export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { action } = (await request.json()) as { action?: string };

    if (action === "evaluateAchievements") {
      const unlocked = await evaluateUserAchievements(authResult.userId);
      return NextResponse.json({ unlocked });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json({ error: "Progress update failed" }, { status: 500 });
  }
}
