// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Transaction Infrastructure Service
// Wraps Prisma ACID transactions into an injectable service layer
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';
import { executeInTransaction, PrismaTransactionClient } from '../transaction';

export interface ITransactionService {
  run<T>(fn: (tx: PrismaTransactionClient) => Promise<T>): Promise<T>;
}

export class TransactionService implements ITransactionService {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async run<T>(fn: (tx: PrismaTransactionClient) => Promise<T>): Promise<T> {
    return executeInTransaction(fn, this.client);
  }
}
