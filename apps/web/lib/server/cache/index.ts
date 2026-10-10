// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Cache Layer Barrel Export
// ──────────────────────────────────────────────────────────────

export * from './cache.interface';
export * from './memory.provider';
export * from './redis.provider';
export * from './cache.service';

import { MemoryCacheProvider } from './memory.provider';
import { CacheService } from './cache.service';

// Default singleton instance using MemoryCacheProvider (swappable to RedisCacheProvider via DI container)
export const defaultCacheProvider = new MemoryCacheProvider();
export const cacheService = new CacheService(defaultCacheProvider);

export default cacheService;
