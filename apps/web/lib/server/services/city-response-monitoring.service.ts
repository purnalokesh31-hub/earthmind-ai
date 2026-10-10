// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 5/6)
// Monitoring Intelligence Service
// ──────────────────────────────────────────────────────────────

import {
  CityResponseReadinessEntity,
  CityResponseMonitoringSignalDto,
  ReadinessProvenance,
} from '../domain/digital-twin/city-response-readiness.domain';
import { memoryCityResponseReadinessRepository } from '../repositories/city-response-readiness.repository';
import { logger } from '../logger';

export class CityResponseMonitoringService {
  private repo = memoryCityResponseReadinessRepository;

  public collectMonitoringSignals(readinessId: string): CityResponseMonitoringSignalDto[] {
    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Response execution readiness assessment '${readinessId}' not found.`);
    }

    const now = new Date().toISOString();
    const defaultSignals: CityResponseMonitoringSignalDto[] = [
      {
        signalId: `sig-${readinessId}-util`,
        readinessId,
        domain: 'UTILITY',
        signalType: 'FLOOD_REDUCTION',
        currentValue: 25,
        targetValue: 31,
        unit: 'POINTS',
        confidence: 88,
        provenance: 'LIVE_TELEMETRY',
        timestamp: now,
        requiresHumanApproval: true,
      },
      {
        signalId: `sig-${readinessId}-road`,
        readinessId,
        domain: 'MOBILITY',
        signalType: 'ROAD_REOPENING',
        currentValue: 80,
        targetValue: 100,
        unit: 'PERCENTAGE',
        confidence: 90,
        provenance: 'SIMULATION',
        timestamp: now,
        requiresHumanApproval: true,
      },
      {
        signalId: `sig-${readinessId}-pop`,
        readinessId,
        domain: 'CITIZEN_INTELLIGENCE',
        signalType: 'POPULATION_IMPACT',
        currentValue: 10500,
        targetValue: 12000,
        unit: 'CITIZENS',
        confidence: 85,
        provenance: 'ESTIMATION',
        timestamp: now,
        requiresHumanApproval: true,
      },
    ];

    entity.monitoringSignals = defaultSignals;
    entity.status = 'MONITORING';
    entity.updatedAt = now;

    logger.info(`[CityResponseMonitoringService] Collected ${defaultSignals.length} monitoring signals for assessment '${readinessId}'`);
    return defaultSignals;
  }
}

export const cityResponseMonitoringService = new CityResponseMonitoringService();
