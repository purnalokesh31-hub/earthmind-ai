// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Backup Verification & Integrity Validation Service
// ──────────────────────────────────────────────────────────────

import crypto from 'crypto';
import { logger } from '../logger';

export interface VerificationReport {
  backupId: string;
  isIntegrityValid: boolean;
  computedHash: string;
  expectedHash: string;
  verifiedAt: Date;
}

export class BackupVerificationService {
  async verifyBackupHash(backupId: string, payload: Buffer, expectedHash: string): Promise<VerificationReport> {
    const computedHash = crypto.createHash('sha256').update(payload).digest('hex');
    const isIntegrityValid = computedHash.toLowerCase() === expectedHash.toLowerCase();

    if (!isIntegrityValid) {
      logger.error(`[BackupVerificationService] Integrity verification FAILED for backup '${backupId}'`);
    } else {
      logger.info(`[BackupVerificationService] Backup '${backupId}' integrity verified (SHA256: ${computedHash.slice(0, 8)}...)`);
    }

    return {
      backupId,
      isIntegrityValid,
      computedHash,
      expectedHash,
      verifiedAt: new Date(),
    };
  }
}

export const backupVerificationService = new BackupVerificationService();
