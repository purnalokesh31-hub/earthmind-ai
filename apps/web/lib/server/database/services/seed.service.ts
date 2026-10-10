// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Seed Infrastructure Service
// Programmatic database seeding trigger and dataset status checker
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';
import { logger } from '../../logger';

export interface SeedStatus {
  isSeeded: boolean;
  departmentCount: number;
  userCount: number;
  incidentCount: number;
}

export interface ISeedService {
  getSeedStatus(): Promise<SeedStatus>;
  resetData(): Promise<void>;
}

export class SeedService implements ISeedService {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async getSeedStatus(): Promise<SeedStatus> {
    try {
      const [departmentCount, userCount, incidentCount] = await Promise.all([
        this.client.department.count(),
        this.client.user.count(),
        this.client.incident.count(),
      ]);

      return {
        isSeeded: departmentCount > 0 && userCount > 0,
        departmentCount,
        userCount,
        incidentCount,
      };
    } catch {
      return {
        isSeeded: false,
        departmentCount: 0,
        userCount: 0,
        incidentCount: 0,
      };
    }
  }

  async resetData(): Promise<void> {
    logger.warn('[SeedService] Resetting database tables for re-seeding...');
    await this.client.boundingBox.deleteMany();
    await this.client.visionAnalysis.deleteMany();
    await this.client.oCRResult.deleteMany();
    await this.client.sensorTelemetry.deleteMany();
    await this.client.evidenceItem.deleteMany();
    await this.client.incidentTimeline.deleteMany();
    await this.client.assignment.deleteMany();
    await this.client.earthImpact.deleteMany();
    await this.client.riskAssessment.deleteMany();
    await this.client.incident.deleteMany();
    await this.client.notification.deleteMany();
    await this.client.auditLog.deleteMany();
    await this.client.user.deleteMany();
    await this.client.department.deleteMany();
    logger.info('[SeedService] All database tables cleared.');
  }
}
