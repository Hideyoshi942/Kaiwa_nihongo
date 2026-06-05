"use client";

import Link from "next/link";
import { Briefcase, ArrowRight, Building2 } from "lucide-react";
import { getBusinessScenarios } from "@/lib/scenarios";
import { ScenarioCard } from "@/components/scenario-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/components/locale-provider";

export default function BusinessPage() {
  const { messages: m } = useLocale();
  const scenarios = getBusinessScenarios();

  const tips = [m.business.tipKeigo, m.business.tipEmail, m.business.tipMeeting];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-24 md:pb-10">
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-crimson">
          ビジネス日本語
        </p>
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Building2 className="h-8 w-8 text-crimson" />
          {m.business.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted">{m.business.subtitle}</p>
        <div className="mt-6">
          <Link href="/scenarios">
            <Button variant="outline">
              {m.business.allScenarios}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-3">
        {tips.map((tip, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Briefcase className="h-5 w-5 text-crimson" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{tip}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{m.business.scenarioTitle}</CardTitle>
          <CardDescription>
            {scenarios.length} {m.scenarios.available}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
