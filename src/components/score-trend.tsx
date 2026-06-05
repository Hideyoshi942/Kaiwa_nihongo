"use client";

import { cn } from "@/lib/utils";

export function ScoreTrend({
  data,
}: {
  data: { date: string; score: number }[];
}) {
  if (data.length === 0) return null;

  const max = 100;

  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((point, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={cn(
              "w-full rounded-t-md transition-all",
              point.score >= 80
                ? "bg-emerald-500"
                : point.score >= 60
                  ? "bg-amber-500"
                  : "bg-crimson/70"
            )}
            style={{ height: `${(point.score / max) * 100}%`, minHeight: 4 }}
            title={`${point.date}: ${point.score}`}
          />
          <span className="text-[9px] text-muted truncate w-full text-center">
            {point.date.split("/")[0]}
          </span>
        </div>
      ))}
    </div>
  );
}
