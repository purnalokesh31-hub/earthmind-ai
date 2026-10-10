// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.1 Digital Twin State Engine
// Validates State Transitions & Maintains Asset Condition History
// ──────────────────────────────────────────────────────────────

import { memoryInfrastructureAssetRepository } from '../repositories/digital-twin.repository';
import { InfrastructureAssetEntity, TwinOperationalStatus } from '../domain/digital-twin/digital-twin.domain';

export class DigitalTwinStateService {
  async updateAssetStatus(
    assetId: string,
    newStatus: TwinOperationalStatus,
    reason: string
  ): Promise<InfrastructureAssetEntity> {
    const asset = await memoryInfrastructureAssetRepository.findById(assetId);
    if (!asset) throw new Error(`Infrastructure asset ${assetId} not found`);

    // State transition validation rule: Cannot transition directly from CRITICAL to OPERATIONAL without REPAIR
    if (asset.operationalStatus === 'CRITICAL' && newStatus === 'OPERATIONAL') {
      asset.maintenanceStatus = 'UNDER_REPAIR';
      newStatus = 'DEGRADED';
    }

    asset.operationalStatus = newStatus;
    asset.updatedAt = new Date();

    return memoryInfrastructureAssetRepository.save(asset);
  }
}

export const digitalTwinStateService = new DigitalTwinStateService();
