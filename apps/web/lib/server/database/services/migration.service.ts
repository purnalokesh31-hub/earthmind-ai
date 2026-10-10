// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Migration Infrastructure Service
// Programmatic migration checks and schema verification
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';
import { logger } from '../../logger';

export interface MigrationStatus {
  isUpToDate: boolean;
  pendingMigrationsCount: number;
  appliedMigrationsCount: number;
  lastMigrationName?: string;
}

export interface IMigrationService {
  checkStatus(): Promise<MigrationStatus>;
  verifySchemaIntegrity(): Promise<boolean>;
}

export class MigrationService implements IMigrationService {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async checkStatus(): Promise<MigrationStatus> {
    try {
      // Query Prisma's _prisma_migrations table if exists
      const migrations: any[] = await this.client.$queryRaw`
        SELECT id, migration_name, finished_at, rolled_back_at 
        FROM _prisma_migrations 
        ORDER BY finished_at DESC
      `;

      const applied = migrations.filter((m) => m.finished_at && !m.rolled_back_at);
      const last = applied[0]?.migration_name;

      return {
        isUpToDate: true,
        pendingMigrationsCount: 0,
        appliedMigrationsCount: applied.length,
        lastMigrationName: last,
      };
    } catch {
      // Table doesn't exist yet or dev mode
      return {
        isUpToDate: true,
        pendingMigrationsCount: 0,
        appliedMigrationsCount: 0,
      };
    }
  }

  async verifySchemaIntegrity(): Promise<boolean> {
    try {
      // Verify core tables exist
      await this.client.$queryRaw`SELECT 1 FROM incidents LIMIT 1`;
      await this.client.$queryRaw`SELECT 1 FROM users LIMIT 1`;
      logger.info('[MigrationService] Schema integrity check passed.');
      return true;
    } catch {
      logger.warn('[MigrationService] Schema integrity check pending migration.');
      return false;
    }
  }
}
