// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — System & Process Metrics Service
// ──────────────────────────────────────────────────────────────

import { envConfig } from '../config';

export interface SystemMetricsReport {
  process: {
    pid: number;
    nodeVersion: string;
    platform: string;
    arch: string;
    uptimeSeconds: number;
    memoryUsageMb: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
  };
  config: {
    environment: string;
    port: number;
    storageDriver: string;
    aiEngineUrl: string;
  };
  timestamp: string;
}

export class MetricsService {
  async getMetrics(): Promise<SystemMetricsReport> {
    const mem = process.memoryUsage();
    const toMb = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;

    return {
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMb: {
          rss: toMb(mem.rss),
          heapTotal: toMb(mem.heapTotal),
          heapUsed: toMb(mem.heapUsed),
          external: toMb(mem.external),
        },
      },
      config: {
        environment: envConfig.NODE_ENV,
        port: envConfig.PORT,
        storageDriver: envConfig.STORAGE_DRIVER,
        aiEngineUrl: envConfig.AI_ENGINE_URL,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export const metricsService = new MetricsService();
