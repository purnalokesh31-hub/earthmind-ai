// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Database Core Lifecycle Infrastructure Service
// Handles client connection lifecycle, disconnection, and pool status
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';
import { logger } from '../../logger';

export interface IDatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  ping(): Promise<boolean>;
  getClient(): PrismaClient;
}

export class DatabaseService implements IDatabaseService {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
      logger.info('[DatabaseService] Connected to PostgreSQL server successfully.');
    } catch (error) {
      logger.error('[DatabaseService] Connection failure:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect();
      logger.info('[DatabaseService] Disconnected from PostgreSQL server.');
    } catch (error) {
      logger.error('[DatabaseService] Disconnect failure:', error);
    }
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  getClient(): PrismaClient {
    return this.client;
  }
}
