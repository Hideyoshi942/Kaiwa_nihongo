import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isDbEnabled } from "@/lib/db";

export async function requireAuth() {
  if (!isDbEnabled()) {
    return { error: NextResponse.json({ error: "Database not configured" }, { status: 503 }) };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { userId: session.user.id, session };
}
