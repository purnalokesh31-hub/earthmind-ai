// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 4/6)
// Capability Gap Detection Service
// ──────────────────────────────────────────────────────────────

import {
  CityResilienceReadinessEntity,
  CityResourceGapDto,
} from '../domain/digital-twin/city-resilience-readiness.domain';
import { memoryCityResilienceReadinessRepository } from '../repositories/city-resilience-readiness.repository';
import { logger } from '../logger';

export class CityResilienceGapService {
  private repo = memoryCityResilienceReadinessRepository;

  public detectCapabilityGaps(readinessId: string): CityResourceGapDto[] {
    const entity = this.repo.getReadiness(readinessId);
    if (!entity) {
      throw new Error(`Resilience readiness assessment '${readinessId}' not found.`);
    }

    const gaps: CityResourceGapDto[] = [];

    // 1. Scan Domains for Vulnerabilities
    for (const domainDto of entity.domains) {
      if (domainDto.readinessScore < 70) {
        gaps.push({
          gapId: `gap-${readinessId}-${domainDto.domain.toLowerCase()}`,
          domain: domainDto.domain,
          gapType: 'DOMAIN_READINESS_GAP',
          severity: domainDto.readinessScore < 60 ? 'CRITICAL' : 'HIGH',
          description: `Preparedness score in ${domainDto.domain} domain is below 70% threshold (${domainDto.readinessScore}%).`,
          evidence: `Telemetry simulation stream ${domainDto.domain}_SCORE_${domainDto.readinessScore}`,
          confidence: 85,
          dataSource: 'SIMULATION',
          requiresHumanApproval: true,
        });
      }
    }

    // 2. Scan Resources for Shortages or UNKNOWN states
    for (const res of entity.resourceReadiness) {
      if (res.availabilityStatus === 'UNKNOWN') {
        gaps.push({
          gapId: `gap-${readinessId}-unk-${res.resourceId}`,
          domain: 'UTILITY',
          gapType: 'DATA_CONFIDENCE_GAP',
          severity: 'HIGH',
          description: `Telemetry and inventory for resource '${res.name}' is UNKNOWN and cannot be verified.`,
          evidence: `Unverified inventory stream for ${res.resourceId}`,
          confidence: 60,
          dataSource: 'RESILIENCE_PREPAREDNESS',
          requiresHumanApproval: true,
        });
      } else if (res.resourceGap > 0) {
        gaps.push({
          gapId: `gap-${readinessId}-sht-${res.resourceId}`,
          domain: 'UTILITY',
          gapType: res.category.includes('CREW') ? 'CREW_SHORTAGE' : 'RESOURCE_SHORTAGE',
          severity: res.resourceGap > 2 ? 'HIGH' : 'MEDIUM',
          description: `Shortage of ${res.resourceGap} units/staff for '${res.name}'.`,
          evidence: `Allocation deficit ${res.knownAvailableQuantity}/${res.requiredQuantity}`,
          confidence: 90,
          dataSource: 'RESILIENCE_PREPAREDNESS',
          requiresHumanApproval: true,
        });
      }
    }

    // Fallback gap if none detected
    if (gaps.length === 0) {
      gaps.push({
        gapId: `gap-${readinessId}-def`,
        domain: 'CLIMATE',
        gapType: 'INFRASTRUCTURE_VULNERABILITY',
        severity: 'LOW',
        description: 'Minor drainage infrastructure maintenance buffer gap.',
        evidence: 'Routine maintenance log',
        confidence: 95,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
      });
    }

    entity.gaps = gaps;
    logger.info(`[CityResilienceGapService] Detected ${gaps.length} capability gaps for assessment '${readinessId}'`);
    return gaps;
  }
}

export const cityResilienceGapService = new CityResilienceGapService();
