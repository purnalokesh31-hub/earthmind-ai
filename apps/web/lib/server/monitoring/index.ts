// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Monitoring Layer Barrel Export
// ──────────────────────────────────────────────────────────────

export * from './health.service';
export * from './readiness.service';
export * from './liveness.service';
export * from './metrics.service';

import { healthService } from './health.service';

export interface SystemHealthProbe {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  uptimeSeconds: number;
  services: {
    database: boolean;
    redis: boolean;
    aiEngine: boolean;
    storage: boolean;
  };
}

export async function getSystemHealthProbe(): Promise<SystemHealthProbe> {
  const report = await healthService.getHealthReport();
  return {
    status: report.status,
    uptimeSeconds: report.uptimeSeconds,
    services: {
      database: report.components.database.status === 'UP',
      redis: report.components.redis.status === 'UP',
      aiEngine: report.components.aiEngine.status === 'UP',
      storage: report.components.storage.status === 'UP',
    },
  };
}
