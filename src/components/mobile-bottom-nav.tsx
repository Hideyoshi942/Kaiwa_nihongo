"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  History,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { messages: m } = useLocale();

  const tabs = [
    { href: "/scenarios", label: m.nav.scenarios, icon: BookOpen },
    { href: "/forms", label: m.nav.forms, icon: ScrollText },
    { href: "/dashboard", label: m.nav.dashboard, icon: LayoutDashboard },
    { href: "/drills", label: m.nav.drills, icon: GraduationCap },
    { href: "/analytics", label: m.nav.analytics, icon: BarChart3 },
    { href: "/history", label: m.nav.history, icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md md:hidden safe-bottom">
      <div className="grid grid-cols-6 items-center px-1 py-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg py-2 text-[10px] font-medium transition-colors",
                active ? "text-crimson" : "text-muted"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-crimson")} />
              <span className="truncate max-w-[64px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
