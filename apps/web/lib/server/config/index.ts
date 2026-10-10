// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Centralized Configuration Barrel Export
// ──────────────────────────────────────────────────────────────
// Every backend module imports configuration strictly from this layer.
// Direct process.env access outside this folder is strictly prohibited.
// ──────────────────────────────────────────────────────────────

export * from './env.config';
export * from './database.config';
export * from './jwt.config';
export * from './redis.config';
export * from './storage.config';
export * from './ai.config';

import envConfig from './env.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import redisConfig from './redis.config';
import storageConfig from './storage.config';
import aiConfig from './ai.config';

export const config = {
  env: envConfig,
  database: databaseConfig,
  jwt: jwtConfig,
  redis: redisConfig,
  storage: storageConfig,
  ai: aiConfig,
};

export default config;
