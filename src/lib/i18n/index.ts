import { en, type Messages } from "./en";
import { vi } from "./vi";
import type { Locale } from "./types";

const catalogs: Record<Locale, Messages> = { en, vi };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale];
}

export type { Locale, Messages };
export { LOCALES, DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from "./types";
