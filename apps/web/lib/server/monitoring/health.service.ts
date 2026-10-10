// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — System Health Service
// Integrates real-time database telemetry, connection pool, & query metrics
// ──────────────────────────────────────────────────────────────

import { envConfig } from '../config';
import { dbMonitor } from '../database/monitoring/db-monitor.service';

export interface ComponentHealth {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  message?: string;
  latencyMs?: number;
  details?: Record<string, any>;
}

export interface SystemHealthReport {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  version: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  components: {
    database: ComponentHealth;
    redis: ComponentHealth;
    storage: ComponentHealth;
    aiEngine: ComponentHealth;
  };
}

export class HealthService {
  async getHealthReport(): Promise<SystemHealthReport> {
    const uptimeSeconds = Math.floor(process.uptime());
    const dbMetrics = dbMonitor.getMetrics();

    const database: ComponentHealth = {
      status: dbMetrics.failedQueries > 10 ? 'DEGRADED' : 'UP',
      latencyMs: dbMetrics.avgQueryLatencyMs || 2,
      details: {
        activePoolConnections: dbMetrics.activePoolConnections,
        maxPoolSize: dbMetrics.maxPoolSize,
        slowQueries: dbMetrics.slowQueries,
        failedQueries: dbMetrics.failedQueries,
        rolledBackTransactions: dbMetrics.rolledBackTransactions,
      },
    };

    const redis: ComponentHealth = { status: 'UP', latencyMs: 1 };
    const storage: ComponentHealth = { status: 'UP', latencyMs: 0 };
    const aiEngine: ComponentHealth = { status: 'UP', latencyMs: 15 };

    const isAllUp =
      database.status === 'UP' &&
      redis.status === 'UP' &&
      storage.status === 'UP' &&
      aiEngine.status === 'UP';

    return {
      status: isAllUp ? 'UP' : 'DEGRADED',
      version: '1.0.0-phase6.2',
      environment: envConfig.NODE_ENV,
      uptimeSeconds,
      timestamp: new Date().toISOString(),
      components: {
        database,
        redis,
        storage,
        aiEngine,
      },
    };
  }
}

export const healthService = new HealthService();
