"use client";

import { useMemo, useState } from "react";
import type { AdaptiveLevel } from "@/lib/adaptive-difficulty";
import type { DrillType } from "@/lib/drills";
import { DRILLS, filterDrills } from "@/lib/drills";
import { DrillQuiz } from "@/components/drill-quiz";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

const LEVELS: (AdaptiveLevel | "all")[] = ["all", "N4", "N3", "N2", "N1"];
const TYPES: (DrillType | "all")[] = [
  "all",
  "sonkeigo",
  "kenjougo",
  "bikago",
  "double-keigo",
  "usage",
  "keigo-conversion",
  "cushion",
  "email",
  "service",
  "situation",
];

export default function DrillsPage() {
  const { messages: m } = useLocale();
  const [level, setLevel] = useState<AdaptiveLevel | "all">("all");
  const [type, setType] = useState<DrillType | "all">("all");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => filterDrills(level, type), [level, type]);
  const activeDrill = filtered[activeIndex] ?? filtered[0];

  const handleFilterChange = (newLevel: AdaptiveLevel | "all", newType: DrillType | "all") => {
    setLevel(newLevel);
    setType(newType);
    setActiveIndex(0);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-24 md:pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{m.drills.title}</h1>
        <p className="mt-2 text-muted">{m.drills.subtitle}</p>
        <p className="mt-1 text-sm text-muted">
          {filtered.length} / {DRILLS.length} {m.drills.available}
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            {m.drills.level}
          </p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <Button
                key={l}
                variant={level === l ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(l, type)}
              >
                {l === "all" ? m.scenarios.all : l}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            {m.drills.type}
          </p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <Button
                key={t}
                variant={type === t ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(level, t)}
              >
                {t === "all" ? m.scenarios.all : m.drills.types[t]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {activeDrill ? (
        <>
          <DrillQuiz key={activeDrill.id} drill={activeDrill} />
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((i) => i - 1)}
            >
              {m.drills.previous}
            </Button>
            <span className="text-sm text-muted">
              {activeIndex + 1} / {filtered.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={activeIndex >= filtered.length - 1}
              onClick={() => setActiveIndex((i) => i + 1)}
            >
              {m.drills.next}
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center text-muted py-12">{m.drills.noMatch}</p>
      )}
    </div>
  );
}
