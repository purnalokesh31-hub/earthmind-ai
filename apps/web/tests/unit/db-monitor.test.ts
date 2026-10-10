import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseMonitorService } from '../../lib/server/database/monitoring/db-monitor.service';
import container, { TOKENS } from '../../lib/server/container';

describe('Phase 6.2.11 — Database Monitoring Verification', () => {
  let monitor: DatabaseMonitorService;

  beforeEach(() => {
    monitor = new DatabaseMonitorService();
  });

  it('should resolve DatabaseMonitorService from IoC container', () => {
    const resolved = container.resolve<DatabaseMonitorService>(TOKENS.DatabaseMonitorService);
    expect(resolved).toBeDefined();
    expect(typeof resolved.trackQuery).toBe('function');
  });

  it('should track queries, calculate average latency, and record failed queries', () => {
    monitor.trackQuery(50, true);
    monitor.trackQuery(150, true);
    monitor.trackQuery(100, false);

    const metrics = monitor.getMetrics();
    expect(metrics.totalQueries).toBe(3);
    expect(metrics.failedQueries).toBe(1);
    expect(metrics.avgQueryLatencyMs).toBe(100);
    expect(metrics.maxQueryLatencyMs).toBe(150);
  });

  it('should log slow queries exceeding threshold (200ms)', () => {
    monitor.trackQuery(250, true, 'SELECT * FROM incidents WHERE status = ACTIVE');
    const metrics = monitor.getMetrics();
    expect(metrics.slowQueries).toBe(1);

    const slowLogs = monitor.getSlowQueryLogs();
    expect(slowLogs).toHaveLength(1);
    expect(slowLogs[0].durationMs).toBe(250);
    expect(slowLogs[0].querySnippet).toContain('SELECT * FROM incidents');
  });

  it('should track successful and rolled back transactions', () => {
    monitor.trackTransaction(true, 45);
    monitor.trackTransaction(false, 120);

    const metrics = monitor.getMetrics();
    expect(metrics.successfulTransactions).toBe(1);
    expect(metrics.rolledBackTransactions).toBe(1);
  });
});
