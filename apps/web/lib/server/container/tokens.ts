// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dependency Injection Service Tokens
// ──────────────────────────────────────────────────────────────

export const TOKENS = {
  PrismaClient: Symbol.for('PrismaClient'),
  CacheProvider: Symbol.for('ICacheProvider'),
  CacheService: Symbol.for('CacheService'),
  StorageProvider: Symbol.for('IStorageProvider'),
  EventBus: Symbol.for('IEventBus'),
  DatabaseService: Symbol.for('DatabaseService'),
  MigrationService: Symbol.for('MigrationService'),
  SeedService: Symbol.for('SeedService'),
  TransactionService: Symbol.for('TransactionService'),
  DatabaseHealthService: Symbol.for('DatabaseHealthCheckService'),
  BackupService: Symbol.for('BackupService'),
  DatabaseMonitorService: Symbol.for('DatabaseMonitorService'),
  UserRepository: Symbol.for('IUserRepository'),
  DepartmentRepository: Symbol.for('IDepartmentRepository'),
  IncidentRepository: Symbol.for('IIncidentRepository'),
  EvidenceRepository: Symbol.for('IEvidenceRepository'),
  AuditRepository: Symbol.for('IAuditRepository'),
  NotificationRepository: Symbol.for('INotificationRepository'),
  JwtService: Symbol.for('JwtService'),
  TokenService: Symbol.for('ITokenService'),
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  PasswordService: Symbol.for('PasswordService'),
  PasswordHasher: Symbol.for('IPasswordHasher'),
  SessionService: Symbol.for('SessionService'),
  SessionRepository: Symbol.for('ISessionRepository'),
  AuthSecurityService: Symbol.for('AuthSecurityService'),
  UserIdentityService: Symbol.for('UserIdentityService'),
  AuthAuditService: Symbol.for('AuthAuditService'),
  TimelineService: Symbol.for('ITimelineService'),
  AssignmentService: Symbol.for('IAssignmentService'),
  AuthService: Symbol.for('IAuthService'),
  IncidentService: Symbol.for('IIncidentService'),
  AnalyticsService: Symbol.for('IAnalyticsService'),
  EvidenceService: Symbol.for('IEvidenceService'),
  VisionService: Symbol.for('IVisionService'),
} as const;

export type TokenName = keyof typeof TOKENS;
export type DIToken = keyof typeof TOKENS;
