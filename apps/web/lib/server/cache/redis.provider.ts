// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Redis Cache Provider via 'ioredis'
// Production Redis driver with automatic connection error fallback
// ──────────────────────────────────────────────────────────────

import Redis from 'ioredis';
import { ICacheProvider } from './cache.interface';
import { MemoryCacheProvider } from './memory.provider';
import { envConfig } from '../config';

export class RedisCacheProvider implements ICacheProvider {
  private client: Redis | null = null;
  private fallbackMemory: MemoryCacheProvider = new MemoryCacheProvider();
  private isConnected = false;

  constructor() {
    try {
      this.client = new Redis({
        host: envConfig.REDIS_HOST,
        port: envConfig.REDIS_PORT,
        password: envConfig.REDIS_PASSWORD || undefined,
        db: envConfig.REDIS_DB,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        connectTimeout: 2000,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
      });

      this.client.on('error', () => {
        this.isConnected = false;
      });
    } catch {
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return this.fallbackMemory.get<T>(key);
    }
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return this.fallbackMemory.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected || !this.client) {
      return this.fallbackMemory.set(key, value, ttlSeconds);
    }
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch {
      await this.fallbackMemory.set(key, value, ttlSeconds);
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return this.fallbackMemory.delete(key);
    }
    try {
      const res = await this.client.del(key);
      return res > 0;
    } catch {
      return this.fallbackMemory.delete(key);
    }
  }

  async has(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return this.fallbackMemory.has(key);
    }
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch {
      return this.fallbackMemory.has(key);
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return this.fallbackMemory.clear();
    }
    try {
      await this.client.flushdb();
    } catch {
      await this.fallbackMemory.clear();
    }
  }
}
