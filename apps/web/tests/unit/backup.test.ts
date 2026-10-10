import { describe, it, expect } from 'vitest';
import container, { TOKENS } from '../../lib/server/container';
import { BackupService } from '../../lib/server/database/backup';

describe('Phase 6.2.10 — Backup & Recovery Foundation Verification', () => {
  it('should resolve BackupService from IoC container', () => {
    const backupService = container.resolve<BackupService>(TOKENS.BackupService);
    expect(backupService).toBeDefined();
    expect(typeof backupService.createBackup).toBe('function');
  });

  it('should create snapshot backup metadata and list history', async () => {
    const mockPrisma: any = {
      department: { findMany: async () => [{ id: 'd1', code: 'INFRA' }] },
      user: { findMany: async () => [{ id: 'u1', email: 'admin@earthmind.gov' }] },
      incident: { findMany: async () => [] },
      evidenceItem: { findMany: async () => [] },
      auditLog: { findMany: async () => [] },
      notification: { findMany: async () => [] },
    };

    const service = new BackupService(mockPrisma);
    const backup = await service.createBackup({ storageProvider: 'local' });

    expect(backup.backupId).toContain('bkp-');
    expect(backup.status).toBe('COMPLETED');
    expect(backup.tableCounts?.departments).toBe(1);

    const history = await service.listBackups();
    expect(history).toHaveLength(1);
    expect(history[0].backupId).toBe(backup.backupId);
  });

  it('should export database tables to JSON and CSV formats', async () => {
    const mockPrisma: any = {
      department: { findMany: async () => [{ id: 'd1', code: 'WATER', name: 'Water Intelligence' }] },
      user: { findMany: async () => [] },
      incident: { findMany: async () => [] },
      evidenceItem: { findMany: async () => [] },
      auditLog: { findMany: async () => [] },
      notification: { findMany: async () => [] },
    };

    const service = new BackupService(mockPrisma);
    const json = await service.exportDatabaseJson();
    expect(json.departments).toHaveLength(1);

    const csv = await service.exportTableCsv('departments');
    expect(csv).toContain('id,code,name');
    expect(csv).toContain('"d1","WATER","Water Intelligence"');
  });
});
