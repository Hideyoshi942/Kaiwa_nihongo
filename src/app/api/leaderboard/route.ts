import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDbEnabled } from "@/lib/db";
import { getLeaderboard } from "@/lib/db/queries";

export async function GET() {
  try {
    if (!isDbEnabled()) {
      return NextResponse.json({ entries: [], dbEnabled: false });
    }

    const session = await auth();
    const entries = await getLeaderboard(session?.user?.id);

    return NextResponse.json({ entries, dbEnabled: true });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
