// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.1 Digital Twin Repositories
// ──────────────────────────────────────────────────────────────

import {
  InfrastructureAssetEntity,
  TwinTelemetryDto,
  TwinEventDto,
  TwinRelationshipDto,
} from '../domain/digital-twin/digital-twin.domain';

export interface IInfrastructureAssetRepository {
  findById(id: string): Promise<InfrastructureAssetEntity | null>;
  listByCityId(cityId: string): Promise<InfrastructureAssetEntity[]>;
  save(asset: InfrastructureAssetEntity): Promise<InfrastructureAssetEntity>;
}

export class MemoryInfrastructureAssetRepository implements IInfrastructureAssetRepository {
  private assets: InfrastructureAssetEntity[] = [
    {
      assetId: 'ast-rd-101',
      assetType: 'ROAD',
      name: 'Benz Circle School Arterial Segment',
      locationName: 'Ward 12, Benz Circle Junction',
      latitude: 16.5060,
      longitude: 80.6350,
      cityId: 'city-vja',
      zoneId: 'zone-w12',
      installationDate: '2019-04-12',
      operationalStatus: 'DEGRADED',
      conditionScore: 68.5,
      riskScore: 84.0,
      maintenanceStatus: 'REPAIR_REQUIRED',
      responsibleDepartment: 'Public Works Department',
      linkedIncidentIds: ['inc-101'],
      linkedPredictionIds: ['pred-101'],
      linkedEvidenceIds: ['ev-101'],
      linkedSensorIds: ['sns-wtr-101'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      assetId: 'ast-drn-102',
      assetType: 'DRAINAGE',
      name: 'Ward 12 Underground Drainage Culvert',
      locationName: 'Ward 12, Main Canal Feeder',
      latitude: 16.5075,
      longitude: 80.6362,
      cityId: 'city-vja',
      zoneId: 'zone-w12',
      installationDate: '2021-08-20',
      operationalStatus: 'CRITICAL',
      conditionScore: 42.0,
      riskScore: 91.5,
      maintenanceStatus: 'UNDER_REPAIR',
      responsibleDepartment: 'Public Works Department',
      linkedIncidentIds: ['inc-102'],
      linkedPredictionIds: ['pred-102'],
      linkedEvidenceIds: ['ev-102'],
      linkedSensorIds: ['sns-wtr-102'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      assetId: 'ast-trf-103',
      assetType: 'TRANSFORMER',
      name: 'Central Grid Step-Down Transformer 33kV',
      locationName: 'Ward 8, Electricity Substation',
      latitude: 16.5120,
      longitude: 80.6410,
      cityId: 'city-vja',
      zoneId: 'zone-w8',
      installationDate: '2018-11-05',
      operationalStatus: 'OPERATIONAL',
      conditionScore: 89.0,
      riskScore: 35.0,
      maintenanceStatus: 'GOOD',
      responsibleDepartment: 'Electricity Board',
      linkedIncidentIds: [],
      linkedPredictionIds: [],
      linkedEvidenceIds: [],
      linkedSensorIds: ['sns-pwr-103'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findById(id: string): Promise<InfrastructureAssetEntity | null> {
    return this.assets.find((a) => a.assetId === id) || null;
  }

  async listByCityId(cityId: string): Promise<InfrastructureAssetEntity[]> {
    return this.assets.filter((a) => a.cityId === cityId);
  }

  async save(asset: InfrastructureAssetEntity): Promise<InfrastructureAssetEntity> {
    const idx = this.assets.findIndex((a) => a.assetId === asset.assetId);
    if (idx >= 0) this.assets[idx] = asset;
    else this.assets.push(asset);
    return asset;
  }
}

export const memoryInfrastructureAssetRepository = new MemoryInfrastructureAssetRepository();
