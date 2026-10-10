// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Centralized Database Configuration
// ──────────────────────────────────────────────────────────────

import envConfig from './env.config';

export interface DatabaseConfig {
  url: string;
  poolSize: number;
  connectionTimeoutMs: number;
  enablePostGIS: boolean;
  logQueries: boolean;
}

export const databaseConfig: DatabaseConfig = {
  url: envConfig.DATABASE_URL,
  poolSize: envConfig.DATABASE_POOL_SIZE,
  connectionTimeoutMs: 10000,
  enablePostGIS: true,
  logQueries: envConfig.NODE_ENV === 'development',
};

export default databaseConfig;
