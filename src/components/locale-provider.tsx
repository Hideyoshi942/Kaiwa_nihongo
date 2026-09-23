"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import {
  DEFAULT_LOCALE,
  getMessages,
  LOCALE_STORAGE_KEY,
  type Locale,
  type Messages,
} from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
  ready: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// The saved locale lives in localStorage; React reads it as an external store
// so server render and hydration both use DEFAULT_LOCALE, then switch.
const localeListeners = new Set<() => void>();
// In-memory copy so a locale change still applies if localStorage is unavailable.
let currentLocale: Locale | null = null;

function subscribeLocale(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== LOCALE_STORAGE_KEY) return;
    currentLocale = null; // another tab changed it; re-read
    onChange();
  };
  localeListeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    localeListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function readStoredLocale(): Locale {
  if (currentLocale) return currentLocale;
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    currentLocale = stored === "en" || stored === "vi" ? stored : DEFAULT_LOCALE;
  } catch {
    currentLocale = DEFAULT_LOCALE;
  }
  return currentLocale;
}

function setLocale(next: Locale) {
  currentLocale = next;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* storage unavailable — keep the in-memory value */
  }
  localeListeners.forEach((l) => l());
}

const noopSubscribe = () => () => {};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, readStoredLocale, () => DEFAULT_LOCALE);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, messages: getMessages(locale), ready }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
