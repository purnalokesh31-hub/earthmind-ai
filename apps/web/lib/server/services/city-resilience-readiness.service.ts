// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 4/6)
// City Resilience Readiness Assessment Service
// ──────────────────────────────────────────────────────────────

import {
  CityResilienceReadinessEntity,
  CityPreparednessDomainDto,
  CityReadinessScoreDto,
  PreparednessDomainType,
} from '../domain/digital-twin/city-resilience-readiness.domain';
import { memoryCityResilienceReadinessRepository } from '../repositories/city-resilience-readiness.repository';
import { logger } from '../logger';

export class CityResilienceReadinessService {
  private repo = memoryCityResilienceReadinessRepository;

  public evaluateCityPreparedness(readinessId: string): CityResilienceReadinessEntity {
    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Resilience readiness assessment '${readinessId}' not found.`);
    }

    const domainTypes: PreparednessDomainType[] = [
      'CLIMATE',
      'MOBILITY',
      'TRANSIT',
      'UTILITY',
      'EMERGENCY_RESPONSE',
      'CITIZEN_INTELLIGENCE',
    ];

    const domains: CityPreparednessDomainDto[] = domainTypes.map((domain) => {
      let readinessScore = 75; // Default score base
      let status: 'HIGH' | 'MODERATE' | 'VULNERABLE' | 'CRITICAL' = 'HIGH';

      if (domain === 'CLIMATE') readinessScore = 65;
      else if (domain === 'UTILITY') readinessScore = 70;
      else if (domain === 'EMERGENCY_RESPONSE') readinessScore = 85;
      else if (domain === 'MOBILITY') readinessScore = 78;
      else if (domain === 'TRANSIT') readinessScore = 80;
      else if (domain === 'CITIZEN_INTELLIGENCE') readinessScore = 82;

      if (readinessScore < 60) status = 'CRITICAL';
      else if (readinessScore < 70) status = 'VULNERABLE';
      else if (readinessScore < 80) status = 'MODERATE';

      return {
        domain,
        readinessScore,
        status,
        capabilities: [
          {
            capabilityId: `cap-${domain.toLowerCase()}-1`,
            domain,
            name: `${domain} Standard Operational Capability`,
            readinessPercentage: readinessScore,
            isCritical: true,
            status: readinessScore >= 75 ? 'OPTIMAL' : 'ADEQUATE',
          },
        ],
        dataSource: 'SIMULATION',
      };
    });

    const overall = Math.round(domains.reduce((acc, d) => acc + d.readinessScore, 0) / domains.length);
    const critical = Math.round(
      domains.filter((d) => ['CLIMATE', 'UTILITY', 'EMERGENCY_RESPONSE'].includes(d.domain))
        .reduce((acc, d) => acc + d.readinessScore, 0) / 3
    );

    const scores: CityReadinessScoreDto = {
      overallReadinessScore: overall,
      criticalDomainReadiness: critical,
      resourceReadiness: 72,
      operationalReadiness: 78,
      infrastructureReadiness: 70,
      responseReadiness: 82,
      crossDomainReadiness: 76,
    };

    entity.domains = domains;
    entity.scores = scores;
    entity.status = 'ASSESSED';
    entity.updatedAt = new Date().toISOString();

    logger.info(`[CityResilienceReadinessService] Evaluated city preparedness for '${readinessId}': Overall Score ${overall}%`);
    return entity;
  }
}

export const cityResilienceReadinessService = new CityResilienceReadinessService();
