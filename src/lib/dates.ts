export const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

/** Returns `tz` if it is a valid IANA time zone, otherwise the app default. */
export function resolveTimeZone(tz: unknown): string {
  if (typeof tz === "string" && tz.length > 0 && tz.length <= 64) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: tz });
      return tz;
    } catch {
      /* invalid zone — fall through */
    }
  }
  return process.env.APP_TIME_ZONE || DEFAULT_TIME_ZONE;
}

/** Calendar date (YYYY-MM-DD) of `date` as seen in `timeZone`. */
export function dateKey(date: Date, timeZone?: string): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** The calendar day before a YYYY-MM-DD key. */
export function previousDateKey(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Streak after studying on `today`, given the previous study date. */
export function nextStreak(streak: number, lastStudyDate: string | null | undefined, today: string) {
  if (lastStudyDate === today) return streak;
  return lastStudyDate === previousDateKey(today) ? streak + 1 : 1;
}
