// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Database Telemetry & Monitoring Infrastructure
// Tracks query latency, slow queries, failed queries, & transaction rollbacks
// ──────────────────────────────────────────────────────────────

import { envConfig } from '../../config';
import { logger } from '../../logger';

export interface DatabaseMetrics {
  totalQueries: number;
  slowQueries: number;
  failedQueries: number;
  successfulTransactions: number;
  rolledBackTransactions: number;
  avgQueryLatencyMs: number;
  maxQueryLatencyMs: number;
  activePoolConnections: number;
  maxPoolSize: number;
  uptimeSeconds: number;
  lastHealthCheckAt: string;
}

export interface SlowQueryLog {
  querySnippet: string;
  durationMs: number;
  timestamp: string;
}

export interface IDatabaseMonitorService {
  trackQuery(durationMs: number, success: boolean, sqlSnippet?: string): void;
  trackTransaction(success: boolean, durationMs: number): void;
  getMetrics(): DatabaseMetrics;
  getSlowQueryLogs(): SlowQueryLog[];
  resetMetrics(): void;
}

export class DatabaseMonitorService implements IDatabaseMonitorService {
  private totalQueries = 0;
  private slowQueries = 0;
  private failedQueries = 0;
  private successfulTransactions = 0;
  private rolledBackTransactions = 0;
  private totalQueryLatencyMs = 0;
  private maxQueryLatencyMs = 0;
  private readonly slowQueryThresholdMs = 200;
  private slowQueryLogs: SlowQueryLog[] = [];
  private readonly startTime = Date.now();

  trackQuery(durationMs: number, success: boolean, sqlSnippet?: string): void {
    this.totalQueries++;
    this.totalQueryLatencyMs += durationMs;

    if (durationMs > this.maxQueryLatencyMs) {
      this.maxQueryLatencyMs = durationMs;
    }

    if (!success) {
      this.failedQueries++;
      logger.warn(`[DB Monitor] Query failure detected (${durationMs}ms)`);
    }

    if (durationMs >= this.slowQueryThresholdMs) {
      this.slowQueries++;
      const logEntry: SlowQueryLog = {
        querySnippet: sqlSnippet ? sqlSnippet.slice(0, 150) : 'RAW_QUERY',
        durationMs,
        timestamp: new Date().toISOString(),
      };

      this.slowQueryLogs.unshift(logEntry);
      if (this.slowQueryLogs.length > 50) {
        this.slowQueryLogs.pop();
      }

      logger.warn(`[DB Monitor Slow Query Alert] Query took ${durationMs}ms (threshold: ${this.slowQueryThresholdMs}ms)`, {
        querySnippet: logEntry.querySnippet,
      });
    }
  }

  trackTransaction(success: boolean, durationMs: number): void {
    if (success) {
      this.successfulTransactions++;
    } else {
      this.rolledBackTransactions++;
      logger.error(`[DB Monitor Transaction Rollback] Transaction failed and rolled back after ${durationMs}ms`);
    }
  }

  getMetrics(): DatabaseMetrics {
    const avgQueryLatencyMs = this.totalQueries > 0
      ? Math.round((this.totalQueryLatencyMs / this.totalQueries) * 100) / 100
      : 0;

    return {
      totalQueries: this.totalQueries,
      slowQueries: this.slowQueries,
      failedQueries: this.failedQueries,
      successfulTransactions: this.successfulTransactions,
      rolledBackTransactions: this.rolledBackTransactions,
      avgQueryLatencyMs,
      maxQueryLatencyMs: this.maxQueryLatencyMs,
      activePoolConnections: Math.min(this.totalQueries, envConfig.DATABASE_POOL_SIZE),
      maxPoolSize: envConfig.DATABASE_POOL_SIZE,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      lastHealthCheckAt: new Date().toISOString(),
    };
  }

  getSlowQueryLogs(): SlowQueryLog[] {
    return [...this.slowQueryLogs];
  }

  resetMetrics(): void {
    this.totalQueries = 0;
    this.slowQueries = 0;
    this.failedQueries = 0;
    this.successfulTransactions = 0;
    this.rolledBackTransactions = 0;
    this.totalQueryLatencyMs = 0;
    this.maxQueryLatencyMs = 0;
    this.slowQueryLogs = [];
  }
}

export const dbMonitor = new DatabaseMonitorService();
