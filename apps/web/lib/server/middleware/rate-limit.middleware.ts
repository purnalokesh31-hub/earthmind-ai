// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Rate Limiter Abstraction Layer
// Sliding Window Rate Limiting (Memory & Redis supported)
// ──────────────────────────────────────────────────────────────

import { RateLimitError } from '../errors/app-error';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export interface IRateLimiter {
  checkLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
}

export class MemoryRateLimiter implements IRateLimiter {
  private readonly hits = new Map<string, { count: number; resetTime: number }>();
  private lastCleanup = Date.now();

  private cleanupExpired(now: number) {
    if (now - this.lastCleanup < 5000 && this.hits.size < 500) return;
    this.lastCleanup = now;
    for (const [key, entry] of Array.from(this.hits.entries())) {
      if (now >= entry.resetTime) {
        this.hits.delete(key);
      }
    }
  }

  public reset(): void {
    this.hits.clear();
  }

  public getEntryCount(): number {
    return this.hits.size;
  }

  async checkLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const now = Date.now();
    this.cleanupExpired(now);
    const windowMs = windowSeconds * 1000;
    const entry = this.hits.get(key);

    if (!entry || now >= entry.resetTime) {
      const resetTime = now + windowMs;
      this.hits.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        resetSeconds: windowSeconds,
      };
    }

    entry.count += 1;
    const remaining = Math.max(0, limit - entry.count);
    const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);
    const allowed = entry.count <= limit;

    return {
      allowed,
      limit,
      remaining,
      resetSeconds,
    };
  }
}

export const defaultRateLimiter = new MemoryRateLimiter();

export async function enforceRateLimit(
  req: Request,
  limiter: IRateLimiter = defaultRateLimiter,
  limit = 100,
  windowSeconds = 60
): Promise<RateLimitResult> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const url = new URL(req.url);
  const key = `ratelimit:${ip}:${url.pathname}`;

  const result = await limiter.checkLimit(key, limit, windowSeconds);
  if (!result.allowed) {
    throw new RateLimitError(`Too many requests to ${url.pathname}. Limit is ${limit} reqs per ${windowSeconds}s.`);
  }

  return result;
}
