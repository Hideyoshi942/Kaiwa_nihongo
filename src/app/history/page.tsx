"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MessageSquare } from "lucide-react";
import { fetchConversations } from "@/lib/data-service";
import type { Conversation } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

export default function HistoryPage() {
  const { messages: m } = useLocale();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations().then((data) => {
      setConversations(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted">
        {m.common.loading}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{m.history.title}</h1>
        <p className="mt-2 text-muted">{m.history.subtitle}</p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted" />
            <p className="text-muted">{m.history.empty}</p>
            <Link href="/scenarios">
              <Button>{m.history.chooseScenario}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <Card key={conv.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{conv.scenarioTitle}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(conv.updatedAt).toLocaleString()}
                  </CardDescription>
                </div>
                {conv.overallScore !== undefined && (
                  <Badge className="text-base px-3 py-1">
                    {conv.overallScore}/100
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted mb-3">
                  {conv.messages.length} {m.history.messages}
                </p>
                <div className="rounded-lg bg-surface border border-border p-3 text-sm max-h-32 overflow-y-auto space-y-2">
                  {conv.messages.slice(-4).map((msg) => (
                    <p key={msg.id}>
                      <span className="font-medium text-crimson">
                        {msg.role === "user" ? m.history.you : m.history.ai}:
                      </span>{" "}
                      {msg.content}
                    </p>
                  ))}
                </div>
                <Link href={`/chat/${conv.scenarioId}`} className="mt-3 inline-block">
                  <Button variant="outline" size="sm">
                    {m.history.practiceAgain}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
