// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Cross-City Resource Intelligence & Dispatch Service
// Evaluates City Workload Imbalances & Recommends Inter-City Support
// ──────────────────────────────────────────────────────────────

import { RegionalDispatchRecommendation } from '../domain/geography.domain';

export interface CityWorkloadDto {
  cityId: string;
  cityName: string;
  activeIncidents: number;
  criticalIncidents: number;
  availableTeams: number;
  workloadIndex: number; // 0 - 100
  needsSupport: boolean;
}

export class RegionalResourceService {
  async getCityWorkloads(): Promise<CityWorkloadDto[]> {
    return [
      {
        cityId: 'city-vja',
        cityName: 'Vijayawada',
        activeIncidents: 14,
        criticalIncidents: 4,
        availableTeams: 2,
        workloadIndex: 92,
        needsSupport: true,
      },
      {
        cityId: 'city-gtr',
        cityName: 'Guntur',
        activeIncidents: 4,
        criticalIncidents: 1,
        availableTeams: 8,
        workloadIndex: 32,
        needsSupport: false,
      },
      {
        cityId: 'city-vzg',
        cityName: 'Visakhapatnam',
        activeIncidents: 8,
        criticalIncidents: 2,
        availableTeams: 6,
        workloadIndex: 55,
        needsSupport: false,
      },
    ];
  }

  async generateCrossCityDispatchRecommendations(): Promise<RegionalDispatchRecommendation[]> {
    return [
      {
        incidentId: 'inc-101',
        sourceCityId: 'city-vja',
        recommendedSupportCityId: 'city-gtr',
        agencyName: 'Public Works Emergency Squad',
        estimatedTravelTimeMinutes: 35,
        resourceType: 'Heavy Excavator & Drainage Unit',
        confidence: 0.94,
        reasoning: 'Vijayawada Public Works workload index (92/100) exceeds threshold. Guntur has 8 surplus teams available within 35-min transit corridor.',
      },
    ];
  }
}

export const regionalResourceService = new RegionalResourceService();
