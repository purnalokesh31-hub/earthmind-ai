// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Centralized Cache Service Abstraction
// All domain services & repositories interact ONLY via CacheService.
// Direct driver / Redis instantiation in business logic is prohibited.
// ──────────────────────────────────────────────────────────────

import { ICacheProvider } from './cache.interface';

export class CacheService {
  constructor(private readonly provider: ICacheProvider) {}

  async get<T>(key: string): Promise<T | null> {
    return this.provider.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    return this.provider.set<T>(key, value, ttlSeconds);
  }

  async delete(key: string): Promise<boolean> {
    return this.provider.delete(key);
  }

  async has(key: string): Promise<boolean> {
    return this.provider.has(key);
  }

  async clear(): Promise<void> {
    return this.provider.clear();
  }

  // ── Cache Aside Pattern Wrapper (Get or Compute) ───────────────
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await factory();
    if (fresh !== null && fresh !== undefined) {
      await this.set(key, fresh, ttlSeconds);
    }

    return fresh;
  }
}
