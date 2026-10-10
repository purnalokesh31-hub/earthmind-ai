// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Climate Impact Propagation Engine
// ──────────────────────────────────────────────────────────────

import { ClimateImpactDto, ClimateHazardType } from '../domain/digital-twin/climate-resilience.domain';

export class ClimateImpactPropagationService {
  async calculateImpactPropagation(hazardType: ClimateHazardType, cityId: string): Promise<ClimateImpactDto[]> {
    return [
      {
        impactId: 'clm-imp-1',
        sourceHazard: hazardType,
        targetAssetId: 'ast-drn-102',
        targetAssetName: 'Ward 12 Underground Drainage Culvert',
        impactType: 'DIRECT',
        propagationChain: ['Cloudburst Rainfall (84mm/h)', 'Runoff Overflow', 'Culvert Siltation'],
        explanation: 'Extreme precipitation exceeds design culvert flow rate by 42%.',
        estimatedDamageInr: 1200000,
      },
      {
        impactId: 'clm-imp-2',
        sourceHazard: hazardType,
        targetAssetId: 'ast-rd-101',
        targetAssetName: 'Benz Circle School Arterial Segment',
        impactType: 'PROPAGATED',
        propagationChain: ['Culvert Siltation', 'Road Surface Inundation', 'Arterial Traffic Stagnation'],
        explanation: 'Culvert overflow floods road surface causing pothole collapse & 25-min transit latency.',
        estimatedDamageInr: 450000,
      },
    ];
  }
}

export const climateImpactPropagationService = new ClimateImpactPropagationService();
