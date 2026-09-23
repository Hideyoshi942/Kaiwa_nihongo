// In-memory sliding-window rate limiter. State lives in this server process,
// so limits are per instance — swap for Redis if the app is scaled out.

const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfterSeconds: Math.ceil((recent[0] + windowMs - now) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);
  if (hits.size > MAX_KEYS) prune(windowStart);
  return { ok: true, retryAfterSeconds: 0 };
}

function prune(windowStart: number) {
  for (const [key, times] of hits) {
    if (times.every((t) => t <= windowStart)) hits.delete(key);
  }
}

/** Best-effort client IP. Only trustworthy behind a proxy that sets these headers. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
