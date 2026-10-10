// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Preventive Maintenance Optimization Service
// ──────────────────────────────────────────────────────────────

import { MaintenancePlanDto } from '../domain/digital-twin/optimization.domain';
import { memoryInfrastructureAssetRepository } from '../repositories/digital-twin.repository';

export class PreventiveMaintenanceOptimizationService {
  async calculateMaintenancePriorities(cityId: string): Promise<MaintenancePlanDto[]> {
    const assets = await memoryInfrastructureAssetRepository.listByCityId(cityId);

    return assets.map((a) => {
      // Priority formula = (100 - conditionScore) * 0.5 + predictiveRisk * 0.5
      const predictiveRisk = 88.0;
      const maintenancePriorityScore = Math.min(
        100,
        Number(((100 - a.conditionScore) * 0.5 + predictiveRisk * 0.5).toFixed(1))
      );

      let priorityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (maintenancePriorityScore >= 85) priorityLevel = 'CRITICAL';
      else if (maintenancePriorityScore >= 70) priorityLevel = 'HIGH';
      else if (maintenancePriorityScore >= 50) priorityLevel = 'MEDIUM';

      return {
        planId: `mp-plan-${a.assetId}`,
        targetAssetId: a.assetId,
        targetAssetName: a.name,
        assetConditionScore: a.conditionScore,
        predictiveRiskScore: predictiveRisk,
        maintenancePriorityScore,
        priorityLevel,
        recommendedAction: `Perform urgent preventive maintenance & sensor calibration for ${a.name}`,
        estimatedDurationHours: 4,
        estimatedCostInr: 350000,
      };
    });
  }
}

export const preventiveMaintenanceOptimizationService = new PreventiveMaintenanceOptimizationService();
