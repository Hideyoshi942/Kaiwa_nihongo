import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getUserRecommendations } from "@/lib/db/queries";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const recommendations = await getUserRecommendations(authResult.userId);
  return NextResponse.json(recommendations);
}
