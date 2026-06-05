import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  addUserXp,
  evaluateUserAchievements,
  recordUserVoiceMessage,
} from "@/lib/db/queries";

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();
    const { action, amount } = body as {
      action: "addXp" | "recordVoice" | "evaluateAchievements";
      amount?: number;
    };

    if (action === "addXp" && typeof amount === "number") {
      const user = await addUserXp(authResult.userId, amount);
      return NextResponse.json({ user });
    }

    if (action === "recordVoice") {
      await recordUserVoiceMessage(authResult.userId);
      return NextResponse.json({ ok: true });
    }

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
