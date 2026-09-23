import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getUserConversations } from "@/lib/db/queries";

// Conversations are written by /api/chat, one turn at a time; there is no
// client-side save endpoint so scores can't be submitted directly.
export async function GET() {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const convs = await getUserConversations(authResult.userId);
  return NextResponse.json(convs);
}
