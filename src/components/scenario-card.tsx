"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import type { Scenario } from "@/lib/types";
import { getLocalizedScenario } from "@/lib/scenario-i18n";
import { ADVANCED_UNLOCK_LEVEL, INTERMEDIATE_UNLOCK_LEVEL } from "@/lib/achievements";
import { fetchUser, isScenarioUnlocked } from "@/lib/data-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/locale-provider";

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const { locale, messages: m } = useLocale();
  const localized = getLocalizedScenario(scenario, locale);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    fetchUser().then((u) => setUserLevel(u?.level ?? 1));
  }, []);

  const unlocked = isScenarioUnlocked(scenario.difficulty, userLevel);

  const requiredLevel =
    scenario.difficulty === "advanced"
      ? ADVANCED_UNLOCK_LEVEL
      : scenario.difficulty === "intermediate"
        ? INTERMEDIATE_UNLOCK_LEVEL
        : 1;

  if (!unlocked) {
    return (
      <Card className="h-full opacity-70">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-muted">{localized.title}</CardTitle>
              <p className="mt-1 text-sm text-muted">{scenario.titleJa}</p>
            </div>
            <Lock className="h-5 w-5 text-muted" />
          </div>
          <CardDescription>{localized.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <Badge variant="secondary">{m.categories[scenario.category]}</Badge>
            <span className="text-xs text-muted">
              {m.scenarios.unlockAt} {requiredLevel}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={`/chat/${scenario.id}`}>
      <Card className="group h-full transition-all hover:border-crimson/40 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="group-hover:text-crimson transition-colors">
                {localized.title}
              </CardTitle>
              <p className="mt-1 text-sm text-crimson/80">{scenario.titleJa}</p>
            </div>
            <Badge variant={scenario.difficulty}>{m.difficulties[scenario.difficulty]}</Badge>
          </div>
          <CardDescription>{localized.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <Badge variant="secondary">{m.categories[scenario.category]}</Badge>
            <span className="flex items-center gap-1 text-muted group-hover:text-crimson transition-colors">
              {m.scenarios.start} <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
