// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Centralized Environment Variables Validator
// ──────────────────────────────────────────────────────────────
// Validates all process.env variables and provides safe defaults.
// ──────────────────────────────────────────────────────────────

export interface RawEnvironment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  DATABASE_POOL_SIZE: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;
  STORAGE_DRIVER: 'local' | 's3' | 'gcs';
  LOCAL_STORAGE_PATH: string;
  S3_BUCKET_NAME?: string;
  S3_REGION?: string;
  S3_ACCESS_KEY_ID?: string;
  S3_SECRET_ACCESS_KEY?: string;
  AI_ENGINE_URL: string;
  AI_INFERENCE_TIMEOUT_MS: number;
  AI_MIN_CONFIDENCE_THRESHOLD: number;
  REPOSITORY_DRIVER: 'prisma' | 'memory';
  EMAIL_DRIVER: 'smtp' | 'console';
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
  OTP_TTL_SECONDS: number;
  OTP_MAX_ATTEMPTS: number;
  OTP_RESEND_COOLDOWN_SECONDS: number;
}

const INSECURE_DEFAULT_JWT_SECRET = 'earthmind-pios-default-secret-key-32chars-min';
const INSECURE_DEFAULT_JWT_REFRESH_SECRET = 'earthmind-pios-dev-refresh-secret';

function parseEnv(): RawEnvironment {
  const env = process.env.NODE_ENV || 'development';
  const isProd = env === 'production';

  const jwtSecret = process.env.JWT_SECRET || INSECURE_DEFAULT_JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || INSECURE_DEFAULT_JWT_REFRESH_SECRET;
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/earthmind';
  const repositoryDriver = (process.env.EARTHMIND_REPOSITORY_DRIVER as RawEnvironment['REPOSITORY_DRIVER']) || 'prisma';
  const isOfflinePrototype = repositoryDriver === 'memory';

  if (isProd) {
    if (!jwtSecret || jwtSecret === INSECURE_DEFAULT_JWT_SECRET || jwtSecret.length < 32) {
      throw new Error(
        'FATAL: JWT_SECRET must be set to a unique production value of at least 32 characters. ' +
        'Refusing to start with missing or default signing secret in NODE_ENV=production.'
      );
    }
    if (!jwtRefreshSecret || jwtRefreshSecret === INSECURE_DEFAULT_JWT_REFRESH_SECRET || jwtRefreshSecret.length < 32) {
      throw new Error(
        'FATAL: JWT_REFRESH_SECRET must be set to a unique production value of at least 32 characters. ' +
        'Refusing to start with missing or default refresh signing secret in NODE_ENV=production.'
      );
    }
    if (jwtSecret === jwtRefreshSecret) {
      throw new Error(
        'FATAL: JWT_SECRET and JWT_REFRESH_SECRET must not be identical in NODE_ENV=production.'
      );
    }
  }

  // Email delivery. Defaults to the console driver outside production or during build phase so local development
  // and builds never fail on unconfigured SMTP credentials; production runtime must use real SMTP.
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build';
  const emailDriver = (process.env.EMAIL_DRIVER || (isProd && !isOfflinePrototype && !isBuildPhase ? 'smtp' : 'console')) as 'smtp' | 'console';
  const smtpHost = process.env.SMTP_HOST || '';
  const smtpUser = process.env.SMTP_USER || undefined;
  const smtpPassword = process.env.SMTP_PASSWORD || undefined;
  const emailFrom = process.env.EMAIL_FROM || 'no-reply@earthmind.local';

  if (isProd && !isOfflinePrototype && !isBuildPhase) {
    if (emailDriver !== 'smtp') {
      throw new Error(
        'FATAL: EMAIL_DRIVER must be "smtp" in NODE_ENV=production. ' +
        'Refusing to start with the console email driver, which would print one-time passcodes to logs instead of delivering them.'
      );
    }
    if (!smtpHost || !smtpUser || !smtpPassword) {
      throw new Error(
        'FATAL: SMTP_HOST, SMTP_USER and SMTP_PASSWORD must all be set in NODE_ENV=production. ' +
        'Refusing to start without a working email transport: OTP login would be undeliverable.'
      );
    }
    if (!process.env.EMAIL_FROM) {
      throw new Error(
        'FATAL: EMAIL_FROM must be set to a verified sender address in NODE_ENV=production.'
      );
    }
  }

  return {
    NODE_ENV: (env as any) || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    DATABASE_URL: dbUrl,
    DATABASE_POOL_SIZE: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    JWT_REFRESH_SECRET: jwtRefreshSecret,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
    REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),
    STORAGE_DRIVER: (process.env.STORAGE_DRIVER as any) || 'local',
    LOCAL_STORAGE_PATH: process.env.LOCAL_STORAGE_PATH || './uploads',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_REGION: process.env.S3_REGION || 'ap-south-1',
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    AI_ENGINE_URL: process.env.AI_ENGINE_URL || 'http://localhost:8000',
    AI_INFERENCE_TIMEOUT_MS: parseInt(process.env.AI_INFERENCE_TIMEOUT_MS || '15000', 10),
    AI_MIN_CONFIDENCE_THRESHOLD: parseFloat(process.env.AI_MIN_CONFIDENCE_THRESHOLD || '0.45'),
    REPOSITORY_DRIVER: repositoryDriver,
    EMAIL_DRIVER: emailDriver,
    SMTP_HOST: smtpHost,
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: smtpUser,
    SMTP_PASSWORD: smtpPassword,
    EMAIL_FROM: emailFrom,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'EarthMind PIOS',
    OTP_TTL_SECONDS: parseInt(process.env.OTP_TTL_SECONDS || '600', 10),
    OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),
    OTP_RESEND_COOLDOWN_SECONDS: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10),
  };
}

export const envConfig: RawEnvironment = parseEnv();
export default envConfig;
