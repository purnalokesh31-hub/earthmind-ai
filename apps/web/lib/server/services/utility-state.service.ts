// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Utility State Engine
// ──────────────────────────────────────────────────────────────

import { UtilityAssetHealthDto } from '../domain/digital-twin/utility.domain';
import { memoryUtilityRepository } from '../repositories/utility.repository';

export class UtilityStateService {
  async evaluateAssetHealth(assetId: string): Promise<UtilityAssetHealthDto> {
    const asset = await memoryUtilityRepository.findAssetById(assetId);
    if (!asset) throw new Error(`Utility asset ${assetId} not found`);

    return {
      assetId: asset.assetId,
      assetName: asset.name,
      utilityType: asset.utilityType,
      state: asset.state,
      conditionScore: asset.conditionScore,
      contributingFactors: [
        `Operational State: ${asset.state}`,
        `Condition Score: ${asset.conditionScore}%`,
        `Responsible Department: ${asset.responsibleDepartment}`,
      ],
      recommendedAction: asset.conditionScore < 50 ? 'Immediate preventive maintenance dispatch recommended.' : undefined,
    };
  }
}

export const utilityStateService = new UtilityStateService();
