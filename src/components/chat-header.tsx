"use client";

import type { Scenario } from "@/lib/types";
import { getLocalizedScenario } from "@/lib/scenario-i18n";
import { useLocale } from "@/components/locale-provider";

export function ChatHeader({ scenario }: { scenario: Scenario }) {
  const { locale } = useLocale();
  const localized = getLocalizedScenario(scenario, locale);

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{localized.title}</h1>
      <p className="text-crimson">{scenario.titleJa}</p>
      <p className="mt-1 text-sm text-muted">{localized.description}</p>
    </div>
  );
}
