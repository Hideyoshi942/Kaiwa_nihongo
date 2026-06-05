"use client";

import Link from "next/link";
import { MessageCircle, Sparkles, BarChart3, BookOpen, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";

export default function Home() {
  const { messages: m } = useLocale();

  const features = [
    { icon: MessageCircle, ...m.home.features.scenario },
    { icon: Sparkles, ...m.home.features.feedback },
    { icon: BarChart3, ...m.home.features.dashboard },
    { icon: BookOpen, ...m.home.features.structured },
    { icon: GraduationCap, ...m.home.features.drills },
  ];

  const levels = [
    m.home.levels.beginner,
    m.home.levels.intermediate,
    m.home.levels.advanced,
  ];

  return (
    <div className="hero-pattern">
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-crimson">
          日本語会話シミュレーター
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {m.home.title}{" "}
          <span className="text-crimson">{m.home.titleHighlight}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{m.home.subtitle}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/scenarios">
            <Button size="lg" className="min-w-[200px]">
              {m.home.startPracticing}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              {m.home.viewDashboard}
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">{m.home.builtForEveryLevel}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {levels.map((level) => (
            <Card key={level.label}>
              <CardHeader>
                <CardTitle>{level.label}</CardTitle>
                <CardDescription>{level.jlpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted">{level.examples}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">{m.home.coreFeatures}</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-crimson/10">
                  <Icon className="h-5 w-5 text-crimson" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Card className="border-crimson/20 bg-crimson/5">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <h2 className="text-2xl font-bold">{m.home.scoringSystem}</h2>
            <p className="max-w-lg text-muted">{m.home.scoringDesc}</p>
            <Link href="/scenarios">
              <Button>
                {m.home.tryScenario}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
