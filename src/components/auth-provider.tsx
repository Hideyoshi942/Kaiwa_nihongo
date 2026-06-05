"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import type { UserProfile } from "@/lib/types";
import { fetchUser } from "@/lib/data-service";
import { getUser, logoutUser } from "@/lib/storage";

interface AuthContextValue {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  ready: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthContextInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  const loadUser = useCallback(async () => {
    const profile = await fetchUser();
    setUser(profile);
    setReady(true);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    loadUser();
  }, [status, session, loadUser]);

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      return { ok: false, error: result.error };
    }
    await loadUser();
    return { ok: true };
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Registration failed" };
    }
    return login(email, password);
  };

  const logout = async () => {
    await signOut({ redirect: false });
    logoutUser();
    setUser(getUser());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        ready,
        isAuthenticated: !!session?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextInner>{children}</AuthContextInner>
    </SessionProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
