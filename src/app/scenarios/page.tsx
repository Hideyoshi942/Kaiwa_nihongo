"use client";

import { useMemo, useState } from "react";
import { SCENARIOS, filterScenarios } from "@/lib/scenarios";
import type { Difficulty, ScenarioCategory } from "@/lib/types";
import { ScenarioCard } from "@/components/scenario-card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

export default function ScenariosPage() {
  const { messages: m } = useLocale();
  const [category, setCategory] = useState<ScenarioCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");

  const filtered = useMemo(
    () => filterScenarios(category, difficulty),
    [category, difficulty]
  );

  const categories = Object.keys(m.categories) as ScenarioCategory[];
  const difficulties = Object.keys(m.difficulties) as Difficulty[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{m.scenarios.title}</h1>
        <p className="mt-2 text-muted">
          {m.scenarios.subtitle} {SCENARIOS.length} {m.scenarios.available}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            {m.scenarios.category}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={category === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("all")}
            >
              {m.scenarios.all}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
              >
                {m.categories[cat]}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            {m.scenarios.difficulty}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={difficulty === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficulty("all")}
            >
              {m.scenarios.all}
            </Button>
            {difficulties.map((diff) => (
              <Button
                key={diff}
                variant={difficulty === diff ? "default" : "outline"}
                size="sm"
                onClick={() => setDifficulty(diff)}
              >
                {m.difficulties[diff]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted py-12">{m.scenarios.noMatch}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  );
}
