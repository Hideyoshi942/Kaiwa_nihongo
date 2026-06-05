"use client";

import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";
import type { AchievementId } from "@/lib/types";
import { getAchievementDef } from "@/lib/achievements";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function AchievementToast({
  achievementIds,
  onDismiss,
}: {
  achievementIds: AchievementId[];
  onDismiss: () => void;
}) {
  const { messages: m } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievementIds.length > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievementIds, onDismiss]);

  if (!visible || achievementIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4">
      <div className="rounded-xl border border-crimson/30 bg-surface-elevated p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-crimson/10">
              <Trophy className="h-5 w-5 text-crimson" />
            </div>
            <div>
              <p className="font-semibold text-crimson">{m.achievements.unlocked}</p>
              {achievementIds.map((id) => {
                const def = getAchievementDef(id);
                const title = m.achievements.items[id]?.title ?? id;
                return (
                  <p key={id} className="text-sm">
                    {def?.icon} {title}
                    <span className="text-muted"> +{def?.xpReward} XP</span>
                  </p>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              onDismiss();
            }}
            className="text-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
