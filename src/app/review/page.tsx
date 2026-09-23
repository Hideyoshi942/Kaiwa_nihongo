"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { speakJapanese } from "@/lib/speech";
import { fetchReviewDeck, gradeReview, type ReviewDeck } from "@/lib/data-service";
import { BOX_INTERVAL_DAYS, MAX_BOX, type ReviewCard, type ReviewGrade } from "@/lib/srs";

/** Days until the card is due again if it moves up `step` boxes. */
function intervalAfter(box: number, step: number) {
  return BOX_INTERVAL_DAYS[Math.min(MAX_BOX, box + step)];
}

export default function ReviewPage() {
  const { messages: m } = useLocale();
  const [deck, setDeck] = useState<ReviewDeck | null>(null);
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchReviewDeck().then((d) => {
      if (cancelled) return;
      setDeck(d);
      setQueue(d.cards);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const card = queue[0];

  const grade = (g: ReviewGrade) => {
    if (!card || !deck) return;
    void gradeReview(card.id, g, deck.remote);
    setRevealed(false);
    // "Again" keeps the card in this session, at the back of the queue.
    setQueue((q) => (g === "again" ? [...q.slice(1), q[0]] : q.slice(1)));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">{m.review.title}</h1>
      <p className="mt-1 text-sm text-muted">{m.review.subtitle}</p>

      {deck && (
        <p className="mt-3 text-sm">
          {/* Cards still queued this session plus any due beyond the fetched batch. */}
          <span className="font-semibold text-crimson">
            {queue.length + Math.max(0, deck.dueCount - deck.cards.length)}
          </span>{" "}
          {m.review.due}
        </p>
      )}

      <div className="mt-6">
        {!deck ? (
          <div className="h-56 animate-pulse rounded-xl border border-border bg-surface" />
        ) : deck.total === 0 ? (
          <EmptyState text={m.review.empty} cta={m.review.startPractice} />
        ) : !card ? (
          <div className="rounded-xl border border-border bg-surface-elevated p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-crimson" />
            <p className="mt-3 font-semibold">{m.review.doneTitle}</p>
            <p className="mt-1 text-sm text-muted">{m.review.doneBody}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface-elevated p-6">
            <p className="text-xs uppercase tracking-wide text-muted">{m.review.youSaid}</p>
            <p lang="ja" className="mt-1 text-lg">
              {card.prompt}
            </p>

            {!revealed ? (
              <>
                <p className="mt-6 text-sm text-muted">{m.review.recall}</p>
                <Button className="mt-4 w-full" onClick={() => setRevealed(true)}>
                  {m.review.showAnswer}
                </Button>
              </>
            ) : (
              <>
                <div className="mt-6 rounded-lg bg-crimson/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-crimson">{m.review.better}</p>
                  <div className="mt-1 flex items-start gap-2">
                    <p lang="ja" className="flex-1 text-lg font-medium">
                      {card.answer}
                    </p>
                    <button
                      type="button"
                      onClick={() => speakJapanese(card.answer)}
                      className="text-muted hover:text-crimson"
                      aria-label={m.chat.listen}
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                  </div>
                  {card.note && <p className="mt-2 text-sm text-muted">{card.note}</p>}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <GradeButton label={m.review.again} hint={m.review.againHint} onClick={() => grade("again")} />
                  <GradeButton
                    label={m.review.good}
                    hint={m.review.days.replace("{n}", String(intervalAfter(card.box, 1)))}
                    onClick={() => grade("good")}
                  />
                  <GradeButton
                    label={m.review.easy}
                    hint={m.review.days.replace("{n}", String(intervalAfter(card.box, 2)))}
                    onClick={() => grade("easy")}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {deck && !deck.remote && deck.total > 0 && (
        <p className="mt-4 text-xs text-muted">{m.review.guestNote}</p>
      )}
    </div>
  );
}

function GradeButton({ label, hint, onClick }: { label: string; hint: string; onClick: () => void }) {
  return (
    <Button variant="outline" onClick={onClick} className="flex h-auto flex-col py-2">
      <span>{label}</span>
      <span className="text-xs text-muted">{hint}</span>
    </Button>
  );
}

function EmptyState({ text, cta }: { text: string; cta: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <p className="text-sm text-muted">{text}</p>
      <Link href="/scenarios">
        <Button className="mt-4">{cta}</Button>
      </Link>
    </div>
  );
}
