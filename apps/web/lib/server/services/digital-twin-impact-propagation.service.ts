// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Digital Twin Impact Propagation Engine
// Models Asset Relationship Dependency Chains
// ──────────────────────────────────────────────────────────────

import { SimulationImpactDto, SimulationInputDto } from '../domain/digital-twin/simulation.domain';
import { memoryInfrastructureAssetRepository } from '../repositories/digital-twin.repository';

export class DigitalTwinImpactPropagationService {
  async calculateImpacts(inputs: SimulationInputDto[], cityId: string): Promise<SimulationImpactDto[]> {
    const assets = await memoryInfrastructureAssetRepository.listByCityId(cityId);
    const impacts: SimulationImpactDto[] = [];

    for (const input of inputs) {
      const targetAsset = assets.find((a) => a.assetId === input.assetId);
      if (!targetAsset) continue;

      // 1. Direct Impact
      impacts.push({
        impactId: `imp-dir-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        targetAssetId: targetAsset.assetId,
        targetAssetName: targetAsset.name,
        impactType: 'DIRECT',
        baselineStatus: targetAsset.operationalStatus,
        simulatedStatus: 'OFFLINE',
        baselineConditionScore: targetAsset.conditionScore,
        simulatedConditionScore: 0.0,
        propagationPath: [targetAsset.name],
        explanation: `Simulated input '${input.inputType}' directly forces offline hardware state.`,
      });

      // 2. Propagated Impact to neighboring assets in same zone
      const neighboringAssets = assets.filter((a) => a.zoneId === targetAsset.zoneId && a.assetId !== targetAsset.assetId);

      for (const neighbor of neighboringAssets) {
        impacts.push({
          impactId: `imp-prop-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          targetAssetId: neighbor.assetId,
          targetAssetName: neighbor.name,
          impactType: 'PROPAGATED',
          baselineStatus: neighbor.operationalStatus,
          simulatedStatus: 'DEGRADED',
          baselineConditionScore: neighbor.conditionScore,
          simulatedConditionScore: Math.max(0, neighbor.conditionScore - 35),
          propagationPath: [targetAsset.name, `${neighbor.name} Risk Chain`],
          explanation: `Failure of ${targetAsset.name} propagates hydro-structural stress to ${neighbor.name}.`,
        });
      }
    }

    return impacts;
  }
}

export const digitalTwinImpactPropagationService = new DigitalTwinImpactPropagationService();
