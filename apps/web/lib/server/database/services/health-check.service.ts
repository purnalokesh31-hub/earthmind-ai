// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Database Health Check Infrastructure Service
// Measures query latency, database status, and connectivity health
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';

export interface DatabaseHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  provider: 'postgresql';
  connected: boolean;
  timestamp: string;
}

export interface IDatabaseHealthCheckService {
  checkHealth(): Promise<DatabaseHealthResult>;
}

export class DatabaseHealthCheckService implements IDatabaseHealthCheckService {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async checkHealth(): Promise<DatabaseHealthResult> {
    const start = Date.now();
    try {
      await this.client.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - start;

      return {
        status: latencyMs > 500 ? 'degraded' : 'healthy',
        latencyMs,
        provider: 'postgresql',
        connected: true,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'unhealthy',
        latencyMs: Date.now() - start,
        provider: 'postgresql',
        connected: false,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
