"use client";

import { ACHIEVEMENTS } from "@/lib/achievements";
import type { AchievementId } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function AchievementsGrid({
  unlocked,
  compact = false,
}: {
  unlocked: AchievementId[];
  compact?: boolean;
}) {
  const { messages: m } = useLocale();
  const unlockedSet = new Set(unlocked);

  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-2 sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {ACHIEVEMENTS.map((achievement) => {
        const isUnlocked = unlockedSet.has(achievement.id);
        const meta = m.achievements.items[achievement.id];

        return (
          <Card
            key={achievement.id}
            className={cn(
              "transition-all",
              isUnlocked
                ? "border-crimson/30 bg-crimson/5"
                : "opacity-60 grayscale"
            )}
          >
            <CardHeader className={compact ? "p-4 pb-2" : undefined}>
              <div className="flex items-start justify-between">
                <span className="text-2xl">{achievement.icon}</span>
                {isUnlocked ? (
                  <Badge>{m.achievements.unlockedBadge}</Badge>
                ) : (
                  <Badge variant="secondary">{m.achievements.locked}</Badge>
                )}
              </div>
              <CardTitle className={compact ? "text-sm" : "text-base"}>
                {meta?.title ?? achievement.id}
              </CardTitle>
              <CardDescription className="text-xs">
                {meta?.description}
              </CardDescription>
            </CardHeader>
            {!compact && (
              <CardContent>
                <p className="text-xs text-muted">
                  +{achievement.xpReward} XP · {m.achievements.categories[achievement.category]}
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
