"use client";

import { Sparkles } from "lucide-react";
import type { AdaptiveLevel } from "@/lib/adaptive-difficulty";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/locale-provider";

export function AdaptiveBadge({ level }: { level: AdaptiveLevel }) {
  const { messages: m } = useLocale();

  return (
    <Badge variant="secondary" className="gap-1">
      <Sparkles className="h-3 w-3 text-crimson" />
      {m.chat.adaptiveLevel}: {level}
    </Badge>
  );
}
