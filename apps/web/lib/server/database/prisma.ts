// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Prisma Client Singleton
// Prevents connection pool exhaustion in Next.js development
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { envConfig } from '../config';
import { logger } from '../logger';

declare global {
  // Safe global type declaration for Next.js hot module replacement
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

export function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      envConfig.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

  logger.info('[Database] Prisma Client initialized with PostgreSQL connection pool');

  return client;
}

export const prisma: PrismaClient = globalThis.globalPrisma || createPrismaClient();

if (envConfig.NODE_ENV !== 'production') {
  globalThis.globalPrisma = prisma;
}

export default prisma;
