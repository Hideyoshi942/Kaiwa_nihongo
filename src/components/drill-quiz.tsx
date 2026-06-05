"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import type { Drill } from "@/lib/drills";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function DrillQuiz({ drill }: { drill: Drill }) {
  const { locale, messages: m } = useLocale();
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const question = locale === "vi" ? drill.questionVi : drill.questionEn;
  const explanation = locale === "vi" ? drill.explanationVi : drill.explanationEn;
  const isCorrect = selected === drill.correctIndex;

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
  };

  const reset = () => {
    setSelected(null);
    setAnswered(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{drill.level}</Badge>
          <Badge variant="default">{m.drills.types[drill.type]}</Badge>
        </div>
        <CardTitle className="text-base mt-2">{question}</CardTitle>
        <p className="text-xl font-medium text-crimson mt-2">{drill.promptJa}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          {drill.options.map((option, i) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={cn(
                "rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                answered && i === drill.correctIndex && "border-emerald-500 bg-emerald-500/10",
                answered && selected === i && i !== drill.correctIndex && "border-crimson bg-crimson/10",
                !answered && "hover:border-crimson hover:bg-crimson/5",
                selected === i && !answered && "border-crimson bg-crimson/5"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {answered && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg p-3 text-sm",
              isCorrect ? "bg-emerald-500/10 text-emerald-700" : "bg-crimson/10 text-crimson"
            )}
          >
            {isCorrect ? (
              <CheckCircle className="h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {isCorrect ? m.drills.correct : m.drills.incorrect}
              </p>
              <p className="mt-1 text-muted">{explanation}</p>
            </div>
          </div>
        )}

        {answered && (
          <Button variant="outline" size="sm" onClick={reset}>
            {m.drills.tryAgain}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
