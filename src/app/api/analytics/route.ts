import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { analyzeConversations } from "@/lib/learning-insights";
import { getUserConversations } from "@/lib/db/queries";
import { isDbEnabled } from "@/lib/db";

export async function GET() {
  try {
    if (!isDbEnabled()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;

    const conversations = await getUserConversations(authResult.userId);
    const analytics = analyzeConversations(conversations);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
