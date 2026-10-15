// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Master IoC Container Registration & Barrel Export
// ──────────────────────────────────────────────────────────────

export * from './tokens';
export * from './container';

import container from './container';
import { TOKENS } from './tokens';

// Infrastructure Providers
import { MemoryCacheProvider, RedisCacheProvider, CacheService } from '../cache';
import { getStorageProvider } from '../storage';
import { eventBus } from '../events';
import { envConfig } from '../config';
import { prisma } from '../database/prisma';
import {
  DatabaseService,
  MigrationService,
  SeedService,
  TransactionService,
  DatabaseHealthCheckService,
  BackupService,
  DatabaseMonitorService,
} from '../database';

// Repository Implementations
import { PrismaUserRepository, MemoryUserRepository } from '../repositories/user.repository';
import { PrismaDepartmentRepository } from '../repositories/department.repository';
import { PrismaIncidentRepository } from '../repositories/incident.repository';
import { PrismaEvidenceRepository, MemoryEvidenceRepository } from '../repositories/evidence.repository';
import { PrismaAuditRepository } from '../repositories/audit.repository';
import { PrismaNotificationRepository } from '../repositories/notification.repository';

// Domain Services & Auth Subsystem
import { JwtService, TokenService, AuthMiddleware, PasswordService, SessionService, AuthSecurityService, UserIdentityService, AuthAuditService } from '../auth';
import { AuthService, IncidentService, AssignmentService, TimelineService, AnalyticsService } from '../services/index';

export class EvidenceDomainService {
  constructor(public readonly repo?: any, public readonly auditRepo?: any) {}
}

export class VisionDomainService {
  constructor(public readonly evidenceRepo?: any, public readonly incidentRepo?: any) {}
}

// ── 0. REGISTER INFRASTRUCTURE PROVIDERS (Swappable via DI) ──────
container.registerFactory(TOKENS.CacheProvider, () => {
  return envConfig.NODE_ENV === 'production'
    ? new RedisCacheProvider()
    : new MemoryCacheProvider();
});

container.registerFactory(TOKENS.CacheService, () => {
  return new CacheService(container.resolve(TOKENS.CacheProvider));
});

container.registerFactory(TOKENS.StorageProvider, () => {
  return getStorageProvider();
});

container.registerFactory(TOKENS.EventBus, () => {
  return eventBus;
});

// Database Infrastructure Services
container.registerValue(TOKENS.PrismaClient, prisma);
container.registerFactory(TOKENS.DatabaseService, () => new DatabaseService());
container.registerFactory(TOKENS.MigrationService, () => new MigrationService());
container.registerFactory(TOKENS.SeedService, () => new SeedService());
container.registerFactory(TOKENS.TransactionService, () => new TransactionService());
container.registerFactory(TOKENS.DatabaseHealthService, () => new DatabaseHealthCheckService());
container.registerFactory(TOKENS.BackupService, () => new BackupService());
container.registerFactory(TOKENS.DatabaseMonitorService, () => new DatabaseMonitorService());

// ── 1. REGISTER REPOSITORY BINDINGS ──────────────────────────
container.registerFactory(TOKENS.UserRepository, () => {
  return envConfig.NODE_ENV === 'test' || envConfig.REPOSITORY_DRIVER === 'memory'
    ? new MemoryUserRepository()
    : new PrismaUserRepository();
});
container.registerFactory(TOKENS.DepartmentRepository, () => new PrismaDepartmentRepository());
container.registerFactory(TOKENS.IncidentRepository, () => new PrismaIncidentRepository());
container.registerFactory(TOKENS.EvidenceRepository, () => {
  return envConfig.NODE_ENV === 'test' || envConfig.REPOSITORY_DRIVER === 'memory'
    ? new MemoryEvidenceRepository()
    : new PrismaEvidenceRepository();
});
container.registerFactory(TOKENS.AuditRepository, () => new PrismaAuditRepository());
container.registerFactory(TOKENS.NotificationRepository, () => new PrismaNotificationRepository());

// ── 1.5 REGISTER AUTH SUBSYSTEM, TIMELINE & ASSIGNMENT ENGINE ────
container.registerFactory(TOKENS.JwtService, () => new JwtService());
container.registerFactory(
  TOKENS.TokenService,
  () => new TokenService(
    container.resolve(TOKENS.JwtService),
    container.resolve(TOKENS.CacheProvider),
    container.resolve(TOKENS.UserRepository)
  )
);
container.registerFactory(
  TOKENS.AuthMiddleware,
  () => new AuthMiddleware(
    container.resolve(TOKENS.JwtService),
    container.resolve(TOKENS.TokenService)
  )
);
container.registerFactory(TOKENS.PasswordService, () => new PasswordService());
container.registerFactory(
  TOKENS.SessionService,
  () => new SessionService(container.resolve(TOKENS.CacheProvider))
);
container.registerFactory(
  TOKENS.AuthSecurityService,
  () => new AuthSecurityService(container.resolve(TOKENS.CacheProvider))
);
container.registerFactory(
  TOKENS.UserIdentityService,
  () => new UserIdentityService(
    container.resolve(TOKENS.UserRepository),
    container.resolve(TOKENS.DepartmentRepository),
    container.resolve(TOKENS.IncidentRepository),
    container.resolve(TOKENS.AuditRepository)
  )
);
container.registerFactory(
  TOKENS.AuthAuditService,
  () => new AuthAuditService(container.resolve(TOKENS.AuditRepository))
);
container.registerFactory(
  TOKENS.TimelineService,
  () => new TimelineService()
);
container.registerFactory(
  TOKENS.AssignmentService,
  () => new AssignmentService(
    container.resolve(TOKENS.IncidentRepository),
    container.resolve(TOKENS.AuditRepository),
    container.resolve(TOKENS.NotificationRepository),
    container.resolve(TOKENS.TimelineService)
  )
);

// ── 2. REGISTER DOMAIN SERVICES ──────────────────────────────
container.registerFactory(
  TOKENS.AuthService,
  () => new AuthService(
    container.resolve(TOKENS.UserRepository),
    container.resolve(TOKENS.TokenService),
    container.resolve(TOKENS.JwtService),
    container.resolve(TOKENS.AuthSecurityService)
  )
);

container.registerFactory(
  TOKENS.IncidentService,
  () => new IncidentService(
    container.resolve(TOKENS.IncidentRepository),
    container.resolve(TOKENS.EvidenceRepository),
    container.resolve(TOKENS.AuditRepository),
    container.resolve(TOKENS.NotificationRepository),
    container.resolve(TOKENS.TimelineService)
  )
);

container.registerFactory(
  TOKENS.AnalyticsService,
  () => new AnalyticsService(
    container.resolve(TOKENS.IncidentRepository),
    container.resolve(TOKENS.EventBus)
  )
);

container.registerFactory(
  TOKENS.EvidenceService,
  () => new EvidenceDomainService(
    container.resolve(TOKENS.EvidenceRepository),
    container.resolve(TOKENS.AuditRepository),
  )
);

container.registerFactory(
  TOKENS.VisionService,
  () => new VisionDomainService(
    container.resolve(TOKENS.EvidenceRepository),
    container.resolve(TOKENS.IncidentRepository),
  )
);

export default container;
