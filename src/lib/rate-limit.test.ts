import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIp, rateLimit } from "./rate-limit";

afterEach(() => vi.useRealTimers());

describe("rateLimit", () => {
  it("allows up to the limit, then blocks until the window slides", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const key = `test:${Math.random()}`;

    for (let i = 0; i < 3; i++) expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(60);

    vi.setSystemTime(60_001);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
  });

  it("tracks keys independently", () => {
    const a = `a:${Math.random()}`;
    const b = `b:${Math.random()}`;
    expect(rateLimit(a, 1, 60_000).ok).toBe(true);
    expect(rateLimit(a, 1, 60_000).ok).toBe(false);
    expect(rateLimit(b, 1, 60_000).ok).toBe(true);
  });
});

describe("clientIp", () => {
  it("uses the first X-Forwarded-For hop", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } });
    expect(clientIp(req)).toBe("1.2.3.4");
  });
  it("falls back to X-Real-IP, then 'unknown'", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-real-ip": "5.6.7.8" } }))).toBe("5.6.7.8");
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
