// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Disaster Recovery & Automated Failover Service
// Manages RPO / RTO targets, failover execution, & failback recovery
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export interface DisasterRecoveryState {
  activeRegion: string;
  standbyRegion: string;
  isFailoverActive: boolean;
  rpoSeconds: number;
  rtoMinutes: number;
  lastFailoverAt?: Date;
}

export class DisasterRecoveryService {
  private state: DisasterRecoveryState = {
    activeRegion: 'ap-south-1',
    standbyRegion: 'us-east-1',
    isFailoverActive: false,
    rpoSeconds: 30, // 30 seconds RPO target
    rtoMinutes: 15, // 15 minutes RTO target
  };

  async triggerFailover(reason: string): Promise<DisasterRecoveryState> {
    const oldPrimary = this.state.activeRegion;
    this.state.activeRegion = this.state.standbyRegion;
    this.state.standbyRegion = oldPrimary;
    this.state.isFailoverActive = true;
    this.state.lastFailoverAt = new Date();

    logger.error(`[DisasterRecoveryService] FAILOVER TRIGGERED (${reason}). Active Region is now '${this.state.activeRegion}'`);
    return { ...this.state };
  }

  async triggerFailback(): Promise<DisasterRecoveryState> {
    const oldPrimary = this.state.activeRegion;
    this.state.activeRegion = this.state.standbyRegion;
    this.state.standbyRegion = oldPrimary;
    this.state.isFailoverActive = false;

    logger.info(`[DisasterRecoveryService] FAILBACK COMPLETE. Restored Primary Region to '${this.state.activeRegion}'`);
    return { ...this.state };
  }

  getState(): DisasterRecoveryState {
    return { ...this.state };
  }
}

export const disasterRecoveryService = new DisasterRecoveryService();
