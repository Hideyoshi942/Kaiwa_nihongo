"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import type { AchievementId } from "@/lib/types";
import { fetchUser } from "@/lib/data-service";
import { AchievementsGrid } from "@/components/achievements-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/components/locale-provider";

export default function AchievementsPage() {
  const { messages: m } = useLocale();
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    fetchUser().then((user) => {
      setUnlocked(user?.unlockedAchievements ?? []);
      setXp(user?.xp ?? 0);
    });
  }, []);

  const progress = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Trophy className="h-8 w-8 text-crimson" />
            {m.achievements.title}
          </h1>
          <p className="mt-2 text-muted">{m.achievements.subtitle}</p>
        </div>
        <Link href="/scenarios">
          <Button>
            {m.dashboard.practiceNow}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Card className="mb-8 border-crimson/20">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-2xl font-bold text-crimson">
                {unlocked.length}/{ACHIEVEMENTS.length}
              </p>
              <p className="text-sm text-muted">{m.achievements.collected}</p>
            </div>
            <div className="w-full sm:w-72">
              <p className="mb-1 text-xs text-muted">{m.achievements.totalXp}: {xp}</p>
              <Progress value={progress} max={100} />
            </div>
          </div>
        </CardContent>
      </Card>

      <AchievementsGrid unlocked={unlocked} />
    </div>
  );
}
