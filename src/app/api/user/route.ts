import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { dbUserToProfile, getUserById } from "@/lib/db/queries";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const user = await getUserById(authResult.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(dbUserToProfile(user));
}
