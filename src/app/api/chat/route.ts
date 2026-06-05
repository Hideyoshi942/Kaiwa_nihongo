import { NextResponse } from "next/server";
import type { AdaptiveLevel } from "@/lib/adaptive-difficulty";
import type { Locale } from "@/lib/i18n";
import { getScenarioById } from "@/lib/scenarios";
import { generateChatResponse } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenarioId, userMessage, history, locale, voiceMode, adaptiveLevel } = body;
    const resolvedLocale: Locale = locale === "vi" ? "vi" : "en";

    if (!scenarioId || !userMessage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    const result = await generateChatResponse({
      scenario,
      userMessage,
      history: history ?? [],
      locale: resolvedLocale,
      voiceMode: !!voiceMode,
      adaptiveLevel: (["N5", "N4", "N3", "N2", "N1"].includes(adaptiveLevel)
        ? adaptiveLevel
        : "N4") as AdaptiveLevel,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
