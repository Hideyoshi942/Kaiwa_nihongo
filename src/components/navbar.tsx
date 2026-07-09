"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  LayoutDashboard,
  History,
  LogIn,
  LogOut,
  BookOpen,
  Trophy,
  GraduationCap,
  BarChart3,
  Building2,
  Medal,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useLocale } from "@/components/locale-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { messages: m } = useLocale();

  const links = [
    { href: "/scenarios", label: m.nav.scenarios, icon: BookOpen },
    { href: "/forms", label: m.nav.forms, icon: ScrollText },
    { href: "/business", label: m.nav.business, icon: Building2 },
    { href: "/dashboard", label: m.nav.dashboard, icon: LayoutDashboard },
    { href: "/drills", label: m.nav.drills, icon: GraduationCap },
    { href: "/analytics", label: m.nav.analytics, icon: BarChart3 },
    { href: "/leaderboard", label: m.nav.leaderboard, icon: Medal },
    { href: "/achievements", label: m.nav.achievements, icon: Trophy },
    { href: "/history", label: m.nav.history, icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <MessageCircle className="h-6 w-6 text-crimson" />
          <span>
            会話 <span className="text-muted font-normal">Kaiwa</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-crimson/10 text-crimson"
                  : "text-muted hover:bg-surface-elevated hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <>
              <span className="hidden text-sm text-muted sm:inline">
                {m.nav.level}{user.level} · {user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={logout} title={m.nav.signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                <LogIn className="h-4 w-4" />
                {m.nav.signIn}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
