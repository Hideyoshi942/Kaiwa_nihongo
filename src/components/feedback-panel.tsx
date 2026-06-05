"use client";

import type { MessageFeedback } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/components/locale-provider";

function ScoreRow({
  label,
  score,
  max,
  comment,
  extra,
}: {
  label: string;
  score: number;
  max: number;
  comment: string;
  extra?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted">
          {score}/{max}
        </span>
      </div>
      <Progress value={score} max={max} />
      <p className="text-xs text-muted">{comment}</p>
      {extra && <p className="text-xs text-crimson">{extra}</p>}
    </div>
  );
}

function VoiceScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted">{score}/100</span>
      </div>
      <Progress value={score} max={100} />
    </div>
  );
}

export function FeedbackPanel({ feedback }: { feedback: MessageFeedback }) {
  const { messages: m } = useLocale();
  const { breakdown } = feedback;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{m.feedback.title}</span>
          <span className="text-2xl font-bold text-crimson">{feedback.overall}/100</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreRow
          label={m.feedback.grammar}
          score={breakdown.grammar}
          max={30}
          comment={feedback.grammar.comment}
          extra={feedback.grammar.correction}
        />
        <ScoreRow
          label={m.feedback.vocabulary}
          score={breakdown.vocabulary}
          max={25}
          comment={feedback.vocabulary.comment}
        />
        <ScoreRow
          label={m.feedback.naturalness}
          score={breakdown.naturalness}
          max={25}
          comment={feedback.naturalness.comment}
          extra={feedback.naturalness.alternative}
        />
        <ScoreRow
          label={m.feedback.politeness}
          score={breakdown.politeness}
          max={20}
          comment={feedback.politeness.comment}
        />

        {feedback.voice && (
          <div className="rounded-lg border border-border bg-surface p-3 space-y-3">
            <p className="text-sm font-semibold">🎙️ {m.feedback.voiceTitle}</p>
            <VoiceScoreRow label={m.feedback.pronunciation} score={feedback.voice.pronunciation} />
            <VoiceScoreRow label={m.feedback.fluency} score={feedback.voice.fluency} />
            <VoiceScoreRow label={m.feedback.speed} score={feedback.voice.speed} />
            <p className="text-xs text-muted">{feedback.voice.comment}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
