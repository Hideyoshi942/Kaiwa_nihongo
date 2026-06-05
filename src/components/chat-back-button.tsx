"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

export function ChatBackButton() {
  const { messages: m } = useLocale();

  return (
    <Link href="/scenarios" className="mb-6 inline-block">
      <Button variant="ghost" size="sm">
        <ArrowLeft className="h-4 w-4" />
        {m.chat.backToScenarios}
      </Button>
    </Link>
  );
}
