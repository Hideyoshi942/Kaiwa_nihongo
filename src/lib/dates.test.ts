import { describe, expect, it } from "vitest";
import { dateKey, nextStreak, previousDateKey, resolveTimeZone } from "./dates";

describe("dateKey", () => {
  it("uses the learner's time zone, not UTC", () => {
    // 06:30 on the 23rd in Vietnam is still the 22nd in UTC.
    const d = new Date("2026-09-22T23:30:00Z");
    expect(dateKey(d, "UTC")).toBe("2026-09-22");
    expect(dateKey(d, "Asia/Ho_Chi_Minh")).toBe("2026-09-23");
  });
});

describe("previousDateKey", () => {
  it.each([
    ["2026-03-01", "2026-02-28"],
    ["2024-03-01", "2024-02-29"],
    ["2026-01-01", "2025-12-31"],
  ])("%s -> %s", (key, expected) => {
    expect(previousDateKey(key)).toBe(expected);
  });
});

describe("nextStreak", () => {
  it("keeps the streak when studying twice on the same day", () => {
    expect(nextStreak(5, "2026-09-23", "2026-09-23")).toBe(5);
  });
  it("extends the streak after studying yesterday", () => {
    expect(nextStreak(5, "2026-09-22", "2026-09-23")).toBe(6);
  });
  it("resets after a gap or on first study", () => {
    expect(nextStreak(5, "2026-09-20", "2026-09-23")).toBe(1);
    expect(nextStreak(0, undefined, "2026-09-23")).toBe(1);
  });
});

describe("resolveTimeZone", () => {
  it("accepts valid IANA zones and falls back otherwise", () => {
    expect(resolveTimeZone("Asia/Tokyo")).toBe("Asia/Tokyo");
    expect(resolveTimeZone("Not/AZone")).toBe("Asia/Ho_Chi_Minh");
    expect(resolveTimeZone(42)).toBe("Asia/Ho_Chi_Minh");
  });
});
