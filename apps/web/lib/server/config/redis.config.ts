// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Centralized Redis Cache Configuration
// ──────────────────────────────────────────────────────────────

import envConfig from './env.config';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  defaultTtlSeconds: number;
  connectionTimeoutMs: number;
}

export const redisConfig: RedisConfig = {
  host: envConfig.REDIS_HOST,
  port: envConfig.REDIS_PORT,
  password: envConfig.REDIS_PASSWORD,
  db: envConfig.REDIS_DB,
  keyPrefix: 'earthmind:pios:',
  defaultTtlSeconds: 3600, // 1 hour
  connectionTimeoutMs: 5000,
};

export default redisConfig;
