// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — In-Memory Cache Provider (LRU / TTL Map)
// ──────────────────────────────────────────────────────────────

import { ICacheProvider } from './cache.interface';

interface CacheItem<T> {
  value: T;
  expiresAt: number | null; // epoch ms
}

export class MemoryCacheProvider implements ICacheProvider {
  private readonly cache = new Map<string, CacheItem<any>>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiresAt !== null && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}
