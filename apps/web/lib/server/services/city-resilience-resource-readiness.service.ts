// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 4/6)
// Resource Readiness Engine Service
// ──────────────────────────────────────────────────────────────

import {
  CityResilienceReadinessEntity,
  CityResourceReadinessDto,
  ResourceAvailabilityStatus,
} from '../domain/digital-twin/city-resilience-readiness.domain';
import { memoryCityResilienceReadinessRepository } from '../repositories/city-resilience-readiness.repository';
import { logger } from '../logger';

export class CityResilienceResourceReadinessService {
  private repo = memoryCityResilienceReadinessRepository;

  public evaluateResourceReadiness(readinessId: string): CityResourceReadinessDto[] {
    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Resilience readiness assessment '${readinessId}' not found.`);
    }

    const defaultResources: CityResourceReadinessDto[] = [
      {
        resourceId: `res-${readinessId}-eng`,
        name: 'Municipal Engineering Crew',
        category: 'ENGINEERING_CREW',
        requiredQuantity: 6,
        knownAvailableQuantity: 4,
        resourceGap: 2,
        availabilityStatus: 'LIMITED',
        readinessPercentage: 66.7,
        isUncertain: false,
      },
      {
        resourceId: `res-${readinessId}-elec`,
        name: 'High-Voltage Electrical Response Crew',
        category: 'ELECTRICAL_CREW',
        requiredQuantity: 4,
        knownAvailableQuantity: 4,
        resourceGap: 0,
        availabilityStatus: 'AVAILABLE',
        readinessPercentage: 100,
        isUncertain: false,
      },
      {
        resourceId: `res-${readinessId}-gen`,
        name: 'Mobile High-Capacity Generator Unit',
        category: 'MOBILE_GENERATOR',
        requiredQuantity: 4,
        knownAvailableQuantity: 0,
        resourceGap: 4,
        availabilityStatus: 'UNKNOWN', // Must NOT be converted to AVAILABLE
        readinessPercentage: 0,
        isUncertain: true,
      },
      {
        resourceId: `res-${readinessId}-water`,
        name: 'Potable Water Tanker Unit',
        category: 'WATER_TANKER',
        requiredQuantity: 5,
        knownAvailableQuantity: 5,
        resourceGap: 0,
        availabilityStatus: 'AVAILABLE',
        readinessPercentage: 100,
        isUncertain: false,
      },
    ];

    entity.resourceReadiness = defaultResources;

    // Check if any resource has UNKNOWN status
    const hasUncertainty = defaultResources.some((r) => r.availabilityStatus === 'UNKNOWN');
    if (hasUncertainty) {
      logger.warn(`[CityResilienceResourceReadinessService] RESOURCE_READINESS_UNCERTAIN detected for assessment '${readinessId}'`);
    }

    logger.info(`[CityResilienceResourceReadinessService] Evaluated ${defaultResources.length} resources for assessment '${readinessId}'`);
    return defaultResources;
  }
}

export const cityResilienceResourceReadinessService = new CityResilienceResourceReadinessService();
