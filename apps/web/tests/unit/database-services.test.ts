import { describe, it, expect } from 'vitest';
import container, { TOKENS } from '../../lib/server/container';
import {
  DatabaseService,
  MigrationService,
  SeedService,
  TransactionService,
  DatabaseHealthCheckService,
} from '../../lib/server/database/services';

describe('Phase 6.2.9 — Database Infrastructure Services Verification', () => {
  it('should resolve DatabaseService from IoC container', () => {
    const dbService = container.resolve<DatabaseService>(TOKENS.DatabaseService);
    expect(dbService).toBeDefined();
    expect(typeof dbService.ping).toBe('function');
  });

  it('should resolve MigrationService from IoC container', async () => {
    const migrationService = container.resolve<MigrationService>(TOKENS.MigrationService);
    expect(migrationService).toBeDefined();
    expect(typeof migrationService.checkStatus).toBe('function');
  });

  it('should resolve SeedService from IoC container', async () => {
    const seedService = container.resolve<SeedService>(TOKENS.SeedService);
    expect(seedService).toBeDefined();
    expect(typeof seedService.getSeedStatus).toBe('function');
  });

  it('should resolve TransactionService from IoC container', () => {
    const txService = container.resolve<TransactionService>(TOKENS.TransactionService);
    expect(txService).toBeDefined();
    expect(typeof txService.run).toBe('function');
  });

  it('should resolve DatabaseHealthCheckService from IoC container', async () => {
    const healthService = container.resolve<DatabaseHealthCheckService>(TOKENS.DatabaseHealthService);
    expect(healthService).toBeDefined();
    expect(typeof healthService.checkHealth).toBe('function');
  });
});
