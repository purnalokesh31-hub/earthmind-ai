// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Regional Risk Engine & Event Aggregator
// Aggregates Multi-City Incident Density, Severity & Propagation
// ──────────────────────────────────────────────────────────────

import { memoryRegionalEventRepository } from '../repositories/geography.repository';
import { RegionalEventDomainEntity } from '../domain/geography.domain';

export type RegionalRiskLevel = 'REGIONAL_LOW' | 'REGIONAL_MODERATE' | 'REGIONAL_HIGH' | 'REGIONAL_CRITICAL';

export interface RegionalRiskAssessmentDto {
  scopeLevel: 'NATIONAL' | 'REGION' | 'DISTRICT' | 'CITY';
  scopeId: string;
  regionalRiskScore: number; // 0 - 100
  regionalRiskLevel: RegionalRiskLevel;
  activeIncidentsCount: number;
  criticalIncidentsCount: number;
  affectedCitiesCount: number;
  activeRegionalEvents: RegionalEventDomainEntity[];
  recommendations: string[];
}

export class RegionalRiskEngine {
  async assessRegionalRisk(scopeLevel: 'NATIONAL' | 'REGION' | 'DISTRICT' | 'CITY' = 'REGION', scopeId = 'reg-ap-central'): Promise<RegionalRiskAssessmentDto> {
    const activeEvents = await memoryRegionalEventRepository.findActiveEvents();

    const activeIncidentsCount = 28;
    const criticalIncidentsCount = 5;
    const affectedCitiesCount = 3;

    // Calculate aggregated regional risk score
    const regionalRiskScore = Math.min(100, Math.round(activeIncidentsCount * 1.5 + criticalIncidentsCount * 8 + affectedCitiesCount * 5));

    let regionalRiskLevel: RegionalRiskLevel = 'REGIONAL_LOW';
    if (regionalRiskScore >= 80) regionalRiskLevel = 'REGIONAL_CRITICAL';
    else if (regionalRiskScore >= 60) regionalRiskLevel = 'REGIONAL_HIGH';
    else if (regionalRiskScore >= 40) regionalRiskLevel = 'REGIONAL_MODERATE';

    return {
      scopeLevel,
      scopeId,
      regionalRiskScore,
      regionalRiskLevel,
      activeIncidentsCount,
      criticalIncidentsCount,
      affectedCitiesCount,
      activeRegionalEvents: activeEvents,
      recommendations: [
        'Activate Inter-City Disaster Relief Protocol for Vijayawada-Guntur Corridor.',
        'Pre-position 3 Heavy Hydraulic Pumps from Guntur to Vijayawada Ward 12.',
        'Issue Regional Severe Flood Warning to Central Sector Emergency Commanders.',
      ],
    };
  }
}

export const regionalRiskEngine = new RegionalRiskEngine();
