"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { login, register } = useAuth();
  const { messages: m } = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const result = await register(name.trim(), email.trim(), password);
        if (!result.ok) {
          setError(result.error ?? m.login.error);
          return;
        }
      } else {
        const result = await login(email.trim(), password);
        if (!result.ok) {
          setError(m.login.invalidCredentials);
          return;
        }
      }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{mode === "login" ? m.login.title : m.login.registerTitle}</CardTitle>
          <CardDescription>
            {mode === "login" ? m.login.subtitle : m.login.registerSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex rounded-lg border border-border p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === "login" ? "bg-crimson/10 text-crimson" : "text-muted"
              }`}
            >
              {m.login.title}
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === "register" ? "bg-crimson/10 text-crimson" : "text-muted"
              }`}
            >
              {m.login.registerTitle}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                  {m.login.name}
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={m.login.namePlaceholder}
                  required
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                {m.login.email}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={m.login.emailPlaceholder}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                {m.login.password}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={m.login.passwordPlaceholder}
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-sm text-crimson">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {mode === "login" ? (
                <>
                  <LogIn className="h-4 w-4" />
                  {m.login.continue}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  {m.login.createAccount}
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted">{m.login.dbNote}</p>
        </CardContent>
      </Card>
    </div>
  );
}
