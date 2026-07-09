"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, MessageSquareQuote, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";
import { verbForms } from "@/lib/verb-forms";

export default function FormsPage() {
  const { locale } = useLocale();
  const studyLocale = locale === "vi" ? "vi" : "en";

  const copy = {
    vi: {
      eyebrow: "Sidebar học ngữ pháp hội thoại",
      title: "Các thể tiếng Nhật dùng thật trong kaiwa",
      subtitle:
        "Ôn từ nền tảng đến nâng cao: công thức ngắn, ví dụ thực chiến và bài tập nói sát tình huống đời sống lẫn công việc.",
      quickStart: "Lộ trình nhanh",
      quickStartDesc:
        "Bắt đầu từ ます形 -> thể thường -> て形 -> た形 rồi mới đẩy lên khả năng, bị động và sai khiến.",
      practicalNote: "Mẹo luyện nói",
      practicalNoteDesc:
        "Mỗi mục bên dưới đều có một bài tập kaiwa ngắn. Đừng chỉ đọc, hãy nói thành tiếng như đang đối thoại thật.",
      totalForms: "12 nhóm thể trọng yếu",
      scenarioCta: "Mở kịch bản hội thoại",
      drillCta: "Làm bài drills",
      sidebarTitle: "Menu học",
      sidebarDesc: "Chọn thể muốn ôn",
      level: "Trình độ",
      pattern: "Công thức",
      usage: "Dùng khi nào",
      example: "Ví dụ",
      kaiwaTip: "Mẹo kaiwa thực tế",
      exercise: "Bài tập kaiwa",
      situation: "Tình huống",
      prompt: "Yêu cầu",
      target: "Mục tiêu",
    },
    en: {
      eyebrow: "Conversation grammar sidebar",
      title: "Japanese forms you actually use in kaiwa",
      subtitle:
        "Review the core forms from beginner to advanced with compact patterns, practical examples, and speaking drills grounded in daily and workplace situations.",
      quickStart: "Fast path",
      quickStartDesc:
        "Start with masu -> plain -> te -> ta, then move into potential, passive, and causative patterns.",
      practicalNote: "Speaking note",
      practicalNoteDesc:
        "Every section includes a short kaiwa prompt. Do not just read it. Say it out loud like a real exchange.",
      totalForms: "12 essential form groups",
      scenarioCta: "Open scenarios",
      drillCta: "Practice drills",
      sidebarTitle: "Study menu",
      sidebarDesc: "Pick a form",
      level: "Level",
      pattern: "Pattern",
      usage: "When to use it",
      example: "Example",
      kaiwaTip: "Real kaiwa tip",
      exercise: "Kaiwa exercise",
      situation: "Situation",
      prompt: "Prompt",
      target: "Target",
    },
  }[studyLocale];

  return (
    <div className="hero-pattern">
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
          <Card className="border-crimson/20 bg-gradient-to-br from-crimson/10 via-surface to-surface-elevated">
            <CardHeader className="gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-crimson">
                {copy.eyebrow}
              </p>
              <CardTitle className="max-w-3xl text-3xl leading-tight md:text-5xl">
                {copy.title}
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 text-muted">
                {copy.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <div className="rounded-xl border border-border bg-surface/90 px-4 py-3 text-sm text-muted">
                <div className="font-semibold text-foreground">{copy.totalForms}</div>
                <div>{copy.quickStartDesc}</div>
              </div>
              <div className="flex gap-3">
                <Link href="/scenarios">
                  <Button>
                    {copy.scenarioCta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/drills">
                  <Button variant="outline">{copy.drillCta}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-crimson/10 text-crimson">
                  <ScrollText className="h-5 w-5" />
                </div>
                <CardTitle>{copy.quickStart}</CardTitle>
                <CardDescription>{copy.quickStartDesc}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-crimson/10 text-crimson">
                  <MessageSquareQuote className="h-5 w-5" />
                </div>
                <CardTitle>{copy.practicalNote}</CardTitle>
                <CardDescription>{copy.practicalNoteDesc}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{copy.sidebarTitle}</CardTitle>
                <CardDescription>{copy.sidebarDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {verbForms.map((form, index) => (
                  <a
                    key={form.id}
                    href={`#${form.id}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-3 text-sm transition-colors hover:border-crimson/30 hover:bg-crimson/5"
                  >
                    <span className="font-medium text-foreground">
                      {index + 1}. {form.shortLabel[studyLocale]}
                    </span>
                    <span className="text-xs text-muted">{form.level}</span>
                  </a>
                ))}
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-5">
            {verbForms.map((form) => (
              <Card
                key={form.id}
                id={form.id}
                className="scroll-mt-24 border-border/80 shadow-[0_18px_40px_rgba(0,0,0,0.04)]"
              >
                <CardHeader className="gap-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-2 inline-flex rounded-full bg-crimson/10 px-3 py-1 text-xs font-semibold text-crimson">
                        {copy.level} {form.level}
                      </div>
                      <CardTitle className="text-2xl">{form.title[studyLocale]}</CardTitle>
                      <CardDescription className="mt-2 text-base leading-7">
                        {form.nuance[studyLocale]}
                      </CardDescription>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
                      <div className="mb-1 font-semibold text-foreground">{copy.pattern}</div>
                      <div className="font-mono text-[13px] text-muted">{form.formation}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <section className="rounded-2xl border border-border bg-surface px-4 py-4">
                      <h3 className="mb-2 text-sm font-semibold text-foreground">{copy.usage}</h3>
                      <p className="text-sm leading-7 text-muted">{form.whenToUse[studyLocale]}</p>
                    </section>

                    <section className="rounded-2xl border border-border bg-surface px-4 py-4">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BookOpenCheck className="h-4 w-4 text-crimson" />
                        {copy.example}
                      </h3>
                      <p className="text-lg font-semibold text-foreground">{form.example.japanese}</p>
                      <p className="mt-1 text-sm text-muted">{form.example.romaji}</p>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        {form.example.translation[studyLocale]}
                      </p>
                    </section>
                  </div>

                  <div className="space-y-4">
                    <section className="rounded-2xl border border-crimson/20 bg-crimson/5 px-4 py-4">
                      <h3 className="mb-2 text-sm font-semibold text-foreground">{copy.kaiwaTip}</h3>
                      <p className="text-sm leading-7 text-muted">{form.kaiwaTip[studyLocale]}</p>
                    </section>

                    <section className="rounded-2xl border border-border bg-surface-elevated px-4 py-4">
                      <h3 className="mb-3 text-sm font-semibold text-foreground">{copy.exercise}</h3>
                      <div className="space-y-3 text-sm text-muted">
                        <div>
                          <div className="font-semibold text-foreground">{copy.situation}</div>
                          <p className="mt-1 leading-7">{form.exercise.situation[studyLocale]}</p>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{copy.prompt}</div>
                          <p className="mt-1 leading-7">{form.exercise.prompt[studyLocale]}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-surface px-3 py-3 text-foreground">
                          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-crimson">
                            {copy.target}
                          </span>
                          <p className="mt-2 text-sm leading-7 text-muted">
                            {form.exercise.target[studyLocale]}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
