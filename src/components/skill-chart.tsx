"use client";

import type { SkillAverages } from "@/lib/learning-insights";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/components/locale-provider";

export function SkillChart({ skills }: { skills: SkillAverages }) {
  const { messages: m } = useLocale();

  const rows = [
    { key: "grammar" as const, label: m.feedback.grammar, value: skills.grammar },
    { key: "vocabulary" as const, label: m.feedback.vocabulary, value: skills.vocabulary },
    { key: "naturalness" as const, label: m.feedback.naturalness, value: skills.naturalness },
    { key: "politeness" as const, label: m.feedback.politeness, value: skills.politeness },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{row.label}</span>
            <span className="text-muted">{row.value}%</span>
          </div>
          <Progress value={row.value} max={100} />
        </div>
      ))}
    </div>
  );
}
