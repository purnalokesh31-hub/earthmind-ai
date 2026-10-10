// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Mega Prompt 5/6
// Municipal Resource-Aware Decision Service
// Planning and allocation modeling only — Zero operational dispatch
// ──────────────────────────────────────────────────────────────

import { UrbanDomain } from '../domain/digital-twin/city-intervention.domain';
import { logger } from '../logger';

export type MunicipalResourceType =
  | 'EMERGENCY_CREW'
  | 'UTILITY_CREW'
  | 'ROAD_CREW'
  | 'TRANSIT_TEAM'
  | 'MEDICAL_RESPONSE_TEAM'
  | 'EMERGENCY_VEHICLE'
  | 'GENERATOR'
  | 'TRAFFIC_CONTROL_UNIT'
  | 'COMMUNICATION_TEAM';

export interface MunicipalResourceDto {
  resourceId: string;
  resourceType: MunicipalResourceType;
  name: string;
  availableCount: number;
  allocatedCount: number;
  remainingCount: number;
  utilizationPercent: number;
  location: string;
  availability: 'AVAILABLE' | 'PARTIALLY_ALLOCATED' | 'DEPRECIATED' | 'UNAVAILABLE';
  estimatedDeploymentTimeMinutes: number;
  unitCostUsd: number;
}

export interface ResourceDemandAnalysisDto {
  candidateId: string;
  demands: {
    resourceType: MunicipalResourceType;
    requiredCount: number;
    availableCount: number;
    shortage: number;
    utilizationAfterAllocationPercent: number;
    hasShortage: boolean;
  }[];
  totalDemandCount: number;
  totalShortageCount: number;
  overallResourceFeasibility: 'FEASIBLE' | 'PARTIAL_SHORTAGE' | 'CRITICAL_SHORTAGE';
  estimatedTotalDeploymentTimeMinutes: number;
}

export class CityResourceDecisionService {
  getMunicipalResourceInventory(): MunicipalResourceDto[] {
    return [
      {
        resourceId: 'res-em-crew-01',
        resourceType: 'EMERGENCY_CREW',
        name: 'Rapid Response Rescue Crews',
        availableCount: 12,
        allocatedCount: 8,
        remainingCount: 4,
        utilizationPercent: 66.7,
        location: 'Sector 4 Emergency Base',
        availability: 'AVAILABLE',
        estimatedDeploymentTimeMinutes: 25,
        unitCostUsd: 1500,
      },
      {
        resourceId: 'res-ut-crew-02',
        resourceType: 'UTILITY_CREW',
        name: 'Electrical & Grid Technicians',
        availableCount: 10,
        allocatedCount: 6,
        remainingCount: 4,
        utilizationPercent: 60.0,
        location: 'Substation Operations Depot',
        availability: 'AVAILABLE',
        estimatedDeploymentTimeMinutes: 30,
        unitCostUsd: 2000,
      },
      {
        resourceId: 'res-rd-crew-03',
        resourceType: 'ROAD_CREW',
        name: 'Public Works Barrier Teams',
        availableCount: 15,
        allocatedCount: 10,
        remainingCount: 5,
        utilizationPercent: 66.7,
        location: 'Municipal Yard East',
        availability: 'AVAILABLE',
        estimatedDeploymentTimeMinutes: 20,
        unitCostUsd: 1200,
      },
      {
        resourceId: 'res-tr-team-04',
        resourceType: 'TRANSIT_TEAM',
        name: 'BRT Operations & Signal Control',
        availableCount: 8,
        allocatedCount: 4,
        remainingCount: 4,
        utilizationPercent: 50.0,
        location: 'Central Transit Control Center',
        availability: 'AVAILABLE',
        estimatedDeploymentTimeMinutes: 15,
        unitCostUsd: 1000,
      },
      {
        resourceId: 'res-em-veh-05',
        resourceType: 'EMERGENCY_VEHICLE',
        name: 'High-Water Ambulances & Rescues',
        availableCount: 6,
        allocatedCount: 4,
        remainingCount: 2,
        utilizationPercent: 66.7,
        location: 'District Health Center',
        availability: 'AVAILABLE',
        estimatedDeploymentTimeMinutes: 15,
        unitCostUsd: 3000,
      },
      {
        resourceId: 'res-gen-06',
        resourceType: 'GENERATOR',
        name: 'Mobile High-Capacity Diesel Generators',
        availableCount: 8,
        allocatedCount: 5,
        remainingCount: 3,
        utilizationPercent: 62.5,
        location: 'Utility Storage Facility Ward 12',
        availability: 'AVAILABLE',
        estimatedDeploymentTimeMinutes: 45,
        unitCostUsd: 2500,
      },
      {
        resourceId: 'res-tc-unit-07',
        resourceType: 'TRAFFIC_CONTROL_UNIT',
        name: 'Adaptive Signal Controllers & VMS',
        availableCount: 20,
        allocatedCount: 14,
        remainingCount: 6,
        utilizationPercent: 70.0,
        location: 'Smart Mobility Command Center',
        availability: 'AVAILABLE',
        estimatedDeploymentTimeMinutes: 10,
        unitCostUsd: 800,
      },
      {
        resourceId: 'res-com-team-08',
        resourceType: 'COMMUNICATION_TEAM',
        name: 'Hyper-Local Alert & Broadcast Team',
        availableCount: 4,
        allocatedCount: 2,
        remainingCount: 2,
        utilizationPercent: 50.0,
        location: 'Municipal Media Center',
        availability: 'AVAILABLE',
        estimatedDeploymentTimeMinutes: 10,
        unitCostUsd: 500,
      },
    ];
  }

  evaluateResourceDemand(candidateId: string, requiredRequirements: Record<string, number>): ResourceDemandAnalysisDto {
    const inventory = this.getMunicipalResourceInventory();
    const demands: ResourceDemandAnalysisDto['demands'] = [];

    let totalShortageCount = 0;
    let totalDemandCount = 0;
    let maxDeploymentTimeMinutes = 0;

    const resourceMapping: Record<string, MunicipalResourceType> = {
      emergencyCrews: 'EMERGENCY_CREW',
      engineeringCrews: 'UTILITY_CREW',
      utilityTechnicians: 'UTILITY_CREW',
      roadBarriers: 'ROAD_CREW',
      trafficPersonnel: 'TRAFFIC_CONTROL_UNIT',
      mobileGenerators: 'GENERATOR',
      emergencyVehicles: 'EMERGENCY_VEHICLE',
      transitControlOperators: 'TRANSIT_TEAM',
      pumpingTechnicians: 'ROAD_CREW',
      dieselPumps: 'GENERATOR',
      alertDispatchers: 'COMMUNICATION_TEAM',
    };

    for (const [key, required] of Object.entries(requiredRequirements)) {
      const resourceType = resourceMapping[key] || 'EMERGENCY_CREW';
      const item = inventory.find((r) => r.resourceType === resourceType);

      const available = item ? item.remainingCount : 5;
      const shortage = Math.max(0, required - available);
      const utilizationAfter = Math.min(100, Math.round(((item?.allocatedCount || 0) + required) / (item?.availableCount || 10) * 100));

      demands.push({
        resourceType,
        requiredCount: required,
        availableCount: available,
        shortage,
        utilizationAfterAllocationPercent: utilizationAfter,
        hasShortage: shortage > 0,
      });

      totalDemandCount += required;
      totalShortageCount += shortage;
      maxDeploymentTimeMinutes = Math.max(maxDeploymentTimeMinutes, item?.estimatedDeploymentTimeMinutes || 30);
    }

    let overallResourceFeasibility: ResourceDemandAnalysisDto['overallResourceFeasibility'] = 'FEASIBLE';
    if (totalShortageCount > 5) {
      overallResourceFeasibility = 'CRITICAL_SHORTAGE';
    } else if (totalShortageCount > 0) {
      overallResourceFeasibility = 'PARTIAL_SHORTAGE';
    }

    logger.info(`[CityResourceDecisionService] Resource analysis for candidate '${candidateId}': Demand=${totalDemandCount}, Shortage=${totalShortageCount}, Feasibility=${overallResourceFeasibility}`);

    return {
      candidateId,
      demands,
      totalDemandCount,
      totalShortageCount,
      overallResourceFeasibility,
      estimatedTotalDeploymentTimeMinutes: maxDeploymentTimeMinutes,
    };
  }
}

export const cityResourceDecisionService = new CityResourceDecisionService();
