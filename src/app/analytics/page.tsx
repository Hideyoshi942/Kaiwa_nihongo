"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, BookOpen, ArrowRight } from "lucide-react";
import { fetchAnalytics } from "@/lib/data-service";
import type { LearningAnalytics } from "@/lib/learning-insights";
import { SkillChart } from "@/components/skill-chart";
import { ScoreTrend } from "@/components/score-trend";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

export default function AnalyticsPage() {
  const { messages: m } = useLocale();
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);

  useEffect(() => {
    fetchAnalytics().then(setAnalytics);
  }, []);

  if (!analytics) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted">
        {m.common.loading}
      </div>
    );
  }

  const hasData = analytics.conversationsAnalyzed > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-24 md:pb-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <BarChart3 className="h-8 w-8 text-crimson" />
            {m.analytics.title}
          </h1>
          <p className="mt-2 text-muted">{m.analytics.subtitle}</p>
        </div>
        <Link href="/drills">
          <Button variant="outline">
            {m.analytics.goToDrills}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted mb-4">{m.analytics.empty}</p>
            <Link href="/scenarios">
              <Button>{m.dashboard.browseScenarios}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{m.analytics.skillBreakdown}</CardTitle>
              <CardDescription>
                {m.analytics.basedOn} {analytics.totalMessages} {m.analytics.messages}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SkillChart skills={analytics.skillAverages} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{m.analytics.scoreTrend}</CardTitle>
              <CardDescription>{m.analytics.recentSessions}</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.scoreTrend.length > 0 ? (
                <ScoreTrend data={analytics.scoreTrend} />
              ) : (
                <p className="text-sm text-muted">{m.dashboard.noScoresYet}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4" />
                {m.analytics.vocabularyLearned}
              </CardTitle>
              <CardDescription>
                {analytics.vocabularyLearned.length} {m.analytics.items}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.vocabularyLearned.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analytics.vocabularyLearned.map((v) => (
                    <span
                      key={v}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-sm"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">{m.analytics.noVocab}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{m.analytics.grammarPatterns}</CardTitle>
              <CardDescription>{m.analytics.patternsPracticed}</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.grammarPatterns.length > 0 ? (
                <div className="space-y-2">
                  {analytics.grammarPatterns.map((p) => (
                    <div key={p.pattern} className="flex items-center justify-between text-sm">
                      <span>{p.pattern}</span>
                      <span className="font-medium text-crimson">{p.count}×</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">{m.analytics.noGrammar}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
