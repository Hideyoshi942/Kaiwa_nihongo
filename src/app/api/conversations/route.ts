import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  getUserConversations,
  saveUserConversation,
} from "@/lib/db/queries";
import type { Conversation } from "@/lib/types";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const convs = await getUserConversations(authResult.userId);
  return NextResponse.json(convs);
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const conversation = (await request.json()) as Conversation;
    const saved = await saveUserConversation(authResult.userId, conversation);
    return NextResponse.json(saved);
  } catch (error) {
    console.error("Save conversation error:", error);
    return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 });
  }
}
