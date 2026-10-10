// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.7.1 Utility Repository
// ──────────────────────────────────────────────────────────────

import {
  UtilityAssetEntity,
  UtilityZoneEntity,
  UtilityEventDto,
  UtilityType,
} from '../domain/digital-twin/utility.domain';

export interface IUtilityRepository {
  listAssetsByCityId(cityId: string, utilityType?: UtilityType): Promise<UtilityAssetEntity[]>;
  findAssetById(assetId: string): Promise<UtilityAssetEntity | null>;
  listZonesByCityId(cityId: string): Promise<UtilityZoneEntity[]>;
  listEventsByCityId(cityId: string): Promise<UtilityEventDto[]>;
  saveAsset(asset: UtilityAssetEntity): Promise<UtilityAssetEntity>;
  logEvent(event: UtilityEventDto): Promise<UtilityEventDto>;
}

export class MemoryUtilityRepository implements IUtilityRepository {
  private assets: UtilityAssetEntity[] = [
    {
      assetId: 'ast-pow-sub-101',
      name: 'Benz Circle 33kV Main Power Substation',
      utilityType: 'ELECTRICITY',
      assetType: 'POWER_SUBSTATION',
      cityId: 'city-vja',
      zoneId: 'zone-w12',
      locationName: 'Benz Circle Power Yard',
      latitude: 16.5062,
      longitude: 80.648,
      state: 'DEGRADED',
      conditionScore: 68.5,
      installationDate: '2018-04-12',
      lastMaintenanceDate: '2026-02-10',
      responsibleDepartment: 'Electricity Grid Operations',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      assetId: 'ast-pow-tx-102',
      name: 'Ward 12 Distribution Transformer TX-4',
      utilityType: 'ELECTRICITY',
      assetType: 'DISTRIBUTION_TRANSFORMER',
      cityId: 'city-vja',
      zoneId: 'zone-w12',
      locationName: 'Ward 12 Residential Feeder',
      latitude: 16.507,
      longitude: 80.649,
      state: 'CRITICAL',
      conditionScore: 42.0,
      installationDate: '2015-09-20',
      lastMaintenanceDate: '2025-11-15',
      responsibleDepartment: 'Electricity Grid Operations',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      assetId: 'ast-wtr-pmp-201',
      name: 'Krishna River Intake Pumping Station 1',
      utilityType: 'WATER',
      assetType: 'WATER_PUMP_STATION',
      cityId: 'city-vja',
      zoneId: 'zone-w14',
      locationName: 'Prakasam Barrage Bank',
      latitude: 16.504,
      longitude: 80.612,
      state: 'OPERATIONAL',
      conditionScore: 92.0,
      installationDate: '2020-01-15',
      lastMaintenanceDate: '2026-06-01',
      responsibleDepartment: 'Municipal Water Works',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      assetId: 'ast-wtr-pipe-202',
      name: 'Ward 12 Main Water Feeder Pipeline 600mm',
      utilityType: 'WATER',
      assetType: 'DISTRIBUTION_PIPELINE',
      cityId: 'city-vja',
      zoneId: 'zone-w12',
      locationName: 'Ward 12 Sub-Surface Corridor',
      latitude: 16.5065,
      longitude: 80.6485,
      state: 'CRITICAL',
      conditionScore: 38.0,
      installationDate: '2012-06-10',
      lastMaintenanceDate: '2025-08-20',
      responsibleDepartment: 'Municipal Water Works',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private zones: UtilityZoneEntity[] = [
    {
      zoneId: 'zone-w12',
      name: 'Ward 12 Central Utility Sector',
      cityId: 'city-vja',
      utilityType: 'ELECTRICITY',
      overallHealthScore: 58.4,
      criticalAssetsCount: 2,
      offlineAssetsCount: 0,
    },
  ];

  private events: UtilityEventDto[] = [
    {
      eventId: 'evt-utl-101',
      assetId: 'ast-pow-tx-102',
      assetName: 'Ward 12 Distribution Transformer TX-4',
      utilityType: 'ELECTRICITY',
      eventType: 'TELEMETRY_ANOMALY',
      severity: 'CRITICAL',
      description: 'Transformer core temperature exceeded 88°C threshold under peak load.',
      timestamp: new Date().toISOString(),
    },
  ];

  async listAssetsByCityId(cityId: string, utilityType?: UtilityType): Promise<UtilityAssetEntity[]> {
    let filtered = this.assets.filter((a) => a.cityId === cityId);
    if (utilityType) filtered = filtered.filter((a) => a.utilityType === utilityType);
    return filtered;
  }

  async findAssetById(assetId: string): Promise<UtilityAssetEntity | null> {
    return this.assets.find((a) => a.assetId === assetId) || null;
  }

  async listZonesByCityId(cityId: string): Promise<UtilityZoneEntity[]> {
    return this.zones.filter((z) => z.cityId === cityId);
  }

  async listEventsByCityId(cityId: string): Promise<UtilityEventDto[]> {
    return this.events;
  }

  async saveAsset(asset: UtilityAssetEntity): Promise<UtilityAssetEntity> {
    const idx = this.assets.findIndex((a) => a.assetId === asset.assetId);
    if (idx >= 0) this.assets[idx] = asset;
    else this.assets.push(asset);
    return asset;
  }

  async logEvent(event: UtilityEventDto): Promise<UtilityEventDto> {
    this.events.unshift(event);
    return event;
  }
}

export const memoryUtilityRepository = new MemoryUtilityRepository();
