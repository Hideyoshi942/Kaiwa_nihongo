import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getDueReviewCards, gradeReviewCard } from "@/lib/db/queries";
import { dateKey, resolveTimeZone } from "@/lib/dates";
import type { ReviewGrade } from "@/lib/srs";

const GRADES: ReviewGrade[] = ["again", "good", "easy"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const tz = new URL(request.url).searchParams.get("tz");
  const today = dateKey(new Date(), resolveTimeZone(tz));
  try {
    return NextResponse.json(await getDueReviewCards(authResult.userId, today));
  } catch (error) {
    console.error("Review deck error:", error);
    return NextResponse.json({ error: "Failed to load review cards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { cardId, grade, timeZone } = (await request.json()) as Record<string, unknown>;
    if (typeof cardId !== "string" || !UUID_RE.test(cardId) || !GRADES.includes(grade as ReviewGrade)) {
      return NextResponse.json({ error: "Invalid cardId or grade" }, { status: 400 });
    }
    const today = dateKey(new Date(), resolveTimeZone(timeZone));
    const card = await gradeReviewCard(authResult.userId, cardId, grade as ReviewGrade, today);
    if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });
    return NextResponse.json({ card });
  } catch (error) {
    console.error("Review grade error:", error);
    return NextResponse.json({ error: "Failed to grade card" }, { status: 500 });
  }
}
