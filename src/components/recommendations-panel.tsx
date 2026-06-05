"use client";

import Link from "next/link";
import { Lightbulb, ArrowRight } from "lucide-react";
import type { Recommendation } from "@/lib/data-service";
import { SCENARIOS } from "@/lib/scenarios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

export function RecommendationsPanel({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const { messages: m } = useLocale();

  if (recommendations.length === 0) return null;

  const getLabel = (rec: Recommendation) => {
    if (rec.type === "scenario") {
      const scenario = SCENARIOS.find((s) => s.id === rec.id);
      return scenario?.title ?? rec.id;
    }
    if (rec.type === "category") {
      return m.categories[rec.id as keyof typeof m.categories] ?? rec.id;
    }
    if (rec.type === "skill") {
      return m.feedback[rec.id as keyof typeof m.feedback] ?? rec.id;
    }
    return m.recommendations.voicePractice;
  };

  const getReason = (rec: Recommendation) => {
    const reasons = m.recommendations.reasons as Record<string, string>;
    return reasons[rec.reason] ?? rec.reason;
  };

  const getHref = (rec: Recommendation) => {
    if (rec.type === "scenario") return `/chat/${rec.id}`;
    return "/scenarios";
  };

  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          {m.recommendations.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={`${rec.type}-${rec.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3"
          >
            <div>
              <p className="font-medium text-sm">{getLabel(rec)}</p>
              <p className="text-xs text-muted">{getReason(rec)}</p>
            </div>
            <Link href={getHref(rec)}>
              <Button variant="outline" size="sm">
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
