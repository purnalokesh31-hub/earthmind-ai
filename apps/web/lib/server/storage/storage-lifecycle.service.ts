// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Storage Lifecycle & Retention Engine
// Manages Hot → Warm → Archive tiering, Retention Rules, & Legal Holds
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export type StorageTier = 'HOT' | 'WARM' | 'ARCHIVE' | 'RETENTION_DELETED';

export interface RetentionPolicy {
  hotTierDays: number;
  warmTierDays: number;
  archiveTierDays: number;
  deleteAfterDays: number;
}

export class StorageLifecycleService {
  private readonly defaultPolicy: RetentionPolicy = {
    hotTierDays: 30,
    warmTierDays: 90,
    archiveTierDays: 365,
    deleteAfterDays: 2555, // 7 years retention
  };

  determineTier(createdAt: Date, isLocked = false): StorageTier {
    if (isLocked) return 'ARCHIVE'; // Legal hold overrides retention cleanup

    const ageInDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays <= this.defaultPolicy.hotTierDays) return 'HOT';
    if (ageInDays <= this.defaultPolicy.warmTierDays) return 'WARM';
    if (ageInDays <= this.defaultPolicy.deleteAfterDays) return 'ARCHIVE';
    return 'RETENTION_DELETED';
  }

  async transitionTier(evidenceId: string, currentTier: StorageTier, targetTier: StorageTier): Promise<StorageTier> {
    logger.info(`[StorageLifecycleService] Transitioned evidence '${evidenceId}' from '${currentTier}' to '${targetTier}'`);
    return targetTier;
  }
}

export const storageLifecycleService = new StorageLifecycleService();
