"use client";

import { Globe } from "lucide-react";
import { LOCALES } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
      <Globe className="ml-2 h-3.5 w-3.5 text-muted hidden sm:block" />
      {LOCALES.map((loc) => (
        <Button
          key={loc.code}
          variant="ghost"
          size="sm"
          onClick={() => setLocale(loc.code)}
          className={cn(
            "h-7 px-2 text-xs",
            locale === loc.code && "bg-crimson/10 text-crimson"
          )}
        >
          <span className="mr-1">{loc.flag}</span>
          <span className="hidden sm:inline">{loc.label}</span>
          <span className="sm:hidden">{loc.code.toUpperCase()}</span>
        </Button>
      ))}
    </div>
  );
}
