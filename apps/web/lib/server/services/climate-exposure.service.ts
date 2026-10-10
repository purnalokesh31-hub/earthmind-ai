// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Infrastructure Climate Exposure Service
// ──────────────────────────────────────────────────────────────

import { ClimateExposureDto } from '../domain/digital-twin/climate-resilience.domain';
import { memoryInfrastructureAssetRepository } from '../repositories/digital-twin.repository';

export class ClimateExposureService {
  async calculateExposedAssets(scenarioId: string, cityId: string): Promise<ClimateExposureDto[]> {
    const assets = await memoryInfrastructureAssetRepository.listByCityId(cityId);

    return assets.map((a) => ({
      exposureId: `exp-${a.assetId}`,
      scenarioId,
      targetAssetId: a.assetId,
      targetAssetName: a.name,
      assetCategory: a.assetType,
      exposureLevel: a.conditionScore < 50 ? 'EXTREME' : 'HIGH',
      hazardProximityKm: 0.35,
      criticalityScore: 88.0,
      affectedPopulationEst: 14500,
    }));
  }
}

export const climateExposureService = new ClimateExposureService();
