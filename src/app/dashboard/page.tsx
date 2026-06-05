"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, MessageSquare, Target, TrendingUp, ArrowRight, Trophy, BarChart3, GraduationCap, Medal, Building2 } from "lucide-react";
import type { Recommendation } from "@/lib/data-service";
import { fetchDashboard, fetchRecommendations } from "@/lib/data-service";
import type { AchievementId, DashboardStats, UserProfile } from "@/lib/types";
import { AchievementsGrid } from "@/components/achievements-grid";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { useAuth } from "@/components/auth-provider";

export default function DashboardPage() {
  const { messages: m } = useLocale();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchDashboard();
      if (data) {
        setUser(data.user);
        setStats(data.stats);
        setUnlocked(data.user?.unlockedAchievements ?? []);
      }
      if (isAuthenticated) {
        const recs = await fetchRecommendations();
        setRecommendations(recs);
      }
    }
    load();
  }, [isAuthenticated]);

  if (!stats) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted">
        {m.dashboard.loading}
      </div>
    );
  }

  const xpInLevel = user ? user.xp % 100 : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-24 md:pb-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{m.dashboard.title}</h1>
          <p className="mt-2 text-muted">{m.dashboard.subtitle}</p>
        </div>
        <Link href="/scenarios">
          <Button>
            {m.dashboard.practiceNow}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {user && (
        <Card className="mb-6 border-crimson/20">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted">{m.dashboard.welcomeBack}</p>
              <p className="text-xl font-semibold">{user.name}</p>
              <p className="text-sm text-muted">
                {m.dashboard.level} {user.level} · {user.xp} XP
              </p>
            </div>
            <div className="w-full sm:w-64">
              <p className="mb-1 text-xs text-muted">{m.dashboard.progressToNext}</p>
              <Progress value={xpInLevel} max={100} />
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <div className="mb-6">
          <RecommendationsPanel recommendations={recommendations} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" /> {m.dashboard.conversations}
            </CardDescription>
            <CardTitle className="text-3xl">{stats.totalConversations}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Target className="h-4 w-4" /> {m.dashboard.averageScore}
            </CardDescription>
            <CardTitle className="text-3xl text-crimson">
              {stats.averageScore || "—"}
              {stats.averageScore > 0 && <span className="text-lg text-muted">/100</span>}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Flame className="h-4 w-4" /> {m.dashboard.studyStreak}
            </CardDescription>
            <CardTitle className="text-3xl">
              {stats.streak} {m.dashboard.days}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> {m.dashboard.recentScores}
            </CardDescription>
            <CardTitle className="text-lg">
              {stats.recentScores.length > 0
                ? stats.recentScores.join(", ")
                : m.dashboard.noScoresYet}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/analytics">
          <Card className="h-full transition-shadow hover:shadow-md hover:border-crimson/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-crimson" />
                {m.analytics.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{m.analytics.subtitle}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/drills">
          <Card className="h-full transition-shadow hover:shadow-md hover:border-crimson/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-5 w-5 text-crimson" />
                {m.drills.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{m.drills.subtitle}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/leaderboard">
          <Card className="h-full transition-shadow hover:shadow-md hover:border-crimson/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Medal className="h-5 w-5 text-crimson" />
                {m.leaderboard.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{m.leaderboard.subtitle}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/business">
          <Card className="h-full transition-shadow hover:shadow-md hover:border-crimson/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-crimson" />
                {m.business.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{m.business.subtitle}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{m.dashboard.strongestArea}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-600">
              {stats.strongestCategory !== "—"
                ? m.categories[stats.strongestCategory as keyof typeof m.categories] ?? stats.strongestCategory
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{m.dashboard.needsPractice}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-600">
              {stats.weakestCategory !== "—"
                ? m.categories[stats.weakestCategory as keyof typeof m.categories] ?? stats.weakestCategory
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Trophy className="h-5 w-5 text-crimson" />
            {m.dashboard.achievements}
            <span className="text-sm font-normal text-muted">
              ({stats.unlockedAchievements}/{stats.totalAchievements})
            </span>
          </h2>
          <Link href="/achievements">
            <Button variant="outline" size="sm">
              {m.achievements.viewAll}
            </Button>
          </Link>
        </div>
        <AchievementsGrid unlocked={unlocked} compact />
      </div>

      {stats.totalConversations === 0 && (
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <p className="text-muted mb-4">{m.dashboard.emptyHint}</p>
            <Link href="/scenarios">
              <Button>{m.dashboard.browseScenarios}</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
