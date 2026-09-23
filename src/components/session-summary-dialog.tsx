"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/components/locale-provider";
import type { SessionSummary, Skill } from "@/lib/session-summary";

const SKILLS: Skill[] = ["grammar", "vocabulary", "naturalness", "politeness"];

export function SessionSummaryDialog({
  summary,
  onContinue,
  onViewHistory,
}: {
  summary: SessionSummary;
  onContinue: () => void;
  onViewHistory: () => void;
}) {
  const { messages: m } = useLocale();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onContinue();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onContinue]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onContinue}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-summary-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface-elevated p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="session-summary-title" className="text-lg font-semibold">
            {m.summary.title}
          </h2>
          <button type="button" onClick={onContinue} className="text-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3 text-center">
          <Stat label={m.summary.turns} value={summary.turns} />
          <Stat label={m.summary.average} value={summary.averageScore} highlight />
          <Stat label={m.summary.best} value={summary.bestScore} />
        </div>

        <h3 className="mb-2 text-sm font-medium">{m.summary.skills}</h3>
        <div className="mb-5 space-y-2">
          {SKILLS.map((skill) => (
            <div key={skill} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{m.feedback[skill]}</span>
                <span className="text-muted">{summary.skills[skill]}%</span>
              </div>
              <Progress value={summary.skills[skill]} max={100} />
            </div>
          ))}
        </div>

        <div className="mb-5 rounded-lg bg-crimson/5 p-3 text-sm">
          <p className="font-medium text-crimson">
            {m.summary.focus}: {m.feedback[summary.weakestSkill]}
          </p>
          <p className="mt-1 text-muted">{m.summary.tips[summary.weakestSkill]}</p>
        </div>

        <h3 className="mb-2 text-sm font-medium">{m.summary.corrections}</h3>
        {summary.corrections.length === 0 ? (
          <p className="mb-5 text-sm text-muted">{m.summary.noCorrections}</p>
        ) : (
          <>
            <ul className="mb-2 space-y-2">
              {summary.corrections.map((c) => (
                <li key={c.better} className="rounded-lg border border-border p-3 text-sm">
                  <p className="text-muted">
                    {m.summary.youSaid}: <span lang="ja">{c.said}</span>
                  </p>
                  <p className="mt-1">
                    {m.summary.better}: <span lang="ja" className="font-medium">{c.better}</span>
                  </p>
                </li>
              ))}
            </ul>
            <Link href="/review" className="mb-5 block text-xs text-crimson hover:underline">
              {m.summary.reviewHint} →
            </Link>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onContinue}>
            {m.summary.continue}
          </Button>
          <Button onClick={onViewHistory}>{m.summary.viewHistory}</Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className={highlight ? "text-2xl font-bold text-crimson" : "text-2xl font-bold"}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
