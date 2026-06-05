"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Medal, Flame, Trophy, LogIn } from "lucide-react";
import { fetchLeaderboard } from "@/lib/data-service";
import type { LeaderboardEntry } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="w-5 text-center text-sm font-medium text-muted">{rank}</span>;
}

export default function LeaderboardPage() {
  const { messages: m } = useLocale();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [dbEnabled, setDbEnabled] = useState(true);

  useEffect(() => {
    fetchLeaderboard().then((data) => {
      setEntries(data.entries);
      setDbEnabled(data.dbEnabled);
    });
  }, []);

  if (entries === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted">
        {m.common.loading}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-24 md:pb-10">
      <div className="mb-8 text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Trophy className="h-8 w-8 text-crimson" />
          {m.leaderboard.title}
        </h1>
        <p className="mt-2 text-muted">{m.leaderboard.subtitle}</p>
      </div>

      {!dbEnabled ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted">{m.leaderboard.dbRequired}</p>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted mb-4">{m.leaderboard.empty}</p>
            <Link href="/login">
              <Button>
                <LogIn className="h-4 w-4" />
                {m.leaderboard.signInToCompete}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{m.leaderboard.topLearners}</CardTitle>
            <CardDescription>{m.leaderboard.rankedByXp}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4",
                    entry.isCurrentUser && "bg-crimson/5"
                  )}
                >
                  <RankIcon rank={entry.rank} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{entry.name}</span>
                      {entry.isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">
                          {m.leaderboard.you}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted">
                      {m.nav.level}{entry.level}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-crimson">{entry.xp} XP</p>
                    {entry.streak > 0 && (
                      <p className="flex items-center justify-end gap-1 text-xs text-muted">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {entry.streak} {m.dashboard.days}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
