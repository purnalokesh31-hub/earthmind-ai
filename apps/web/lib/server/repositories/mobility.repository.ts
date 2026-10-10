// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.5 Mobility Repository
// ──────────────────────────────────────────────────────────────

import {
  TrafficSegmentEntity,
  IntersectionEntity,
  TrafficSignalEntity,
  MobilityRecommendationDto,
} from '../domain/digital-twin/mobility.domain';

export interface IMobilityRepository {
  listSegmentsByCityId(cityId: string): Promise<TrafficSegmentEntity[]>;
  listIntersectionsByCityId(cityId: string): Promise<IntersectionEntity[]>;
  findSegmentById(id: string): Promise<TrafficSegmentEntity | null>;
  listRecommendationsByCityId(cityId: string): Promise<MobilityRecommendationDto[]>;
  saveRecommendation(rec: MobilityRecommendationDto): Promise<MobilityRecommendationDto>;
}

export class MemoryMobilityRepository implements IMobilityRepository {
  private segments: TrafficSegmentEntity[] = [
    {
      segmentId: 'seg-rd-101',
      name: 'Benz Circle School Arterial Segment (NH-9)',
      cityId: 'city-vja',
      zoneId: 'zone-w12',
      startIntersectionId: 'int-bc-1',
      endIntersectionId: 'int-bc-2',
      lengthMeters: 1400,
      speedLimitKmh: 60,
      averageSpeedKmh: 14,
      vehicleCount: 420,
      occupancyPercent: 88,
      congestionLevel: 'SEVERELY_CONGESTED',
      roadConditionScore: 68.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      segmentId: 'seg-rd-102',
      name: 'MG Road Central Corridor',
      cityId: 'city-vja',
      zoneId: 'zone-w14',
      startIntersectionId: 'int-mg-1',
      endIntersectionId: 'int-mg-2',
      lengthMeters: 2200,
      speedLimitKmh: 50,
      averageSpeedKmh: 34,
      vehicleCount: 210,
      occupancyPercent: 45,
      congestionLevel: 'SLOW',
      roadConditionScore: 84.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private intersections: IntersectionEntity[] = [
    {
      intersectionId: 'int-bc-1',
      name: 'Benz Circle Main Intersection',
      cityId: 'city-vja',
      zoneId: 'zone-w12',
      signalId: 'sig-bc-101',
      connectedSegmentIds: ['seg-rd-101', 'seg-rd-102'],
      averageDelaySeconds: 145,
      queueLengthVehicles: 38,
      congestionLevel: 'SEVERELY_CONGESTED',
    },
  ];

  private recommendations: MobilityRecommendationDto[] = [
    {
      recommendationId: 'mob-rec-101',
      title: 'Extend Benz Circle Northbound Green Phase by +25 Seconds',
      description: 'Adaptive traffic signal adjustment to clear Ward 12 culvert overflow detour queue.',
      targetIntersectionId: 'int-bc-1',
      targetSegmentId: 'seg-rd-101',
      actionType: 'SIGNAL_TIMING_ADJUSTMENT',
      expectedCongestionReductionPercent: 42.0,
      requiresHumanApproval: true,
      approvalStatus: 'PENDING',
    },
  ];

  async listSegmentsByCityId(cityId: string): Promise<TrafficSegmentEntity[]> {
    return this.segments.filter((s) => s.cityId === cityId);
  }

  async listIntersectionsByCityId(cityId: string): Promise<IntersectionEntity[]> {
    return this.intersections.filter((i) => i.cityId === cityId);
  }

  async findSegmentById(id: string): Promise<TrafficSegmentEntity | null> {
    return this.segments.find((s) => s.segmentId === id) || null;
  }

  async listRecommendationsByCityId(cityId: string): Promise<MobilityRecommendationDto[]> {
    return this.recommendations;
  }

  async saveRecommendation(rec: MobilityRecommendationDto): Promise<MobilityRecommendationDto> {
    const idx = this.recommendations.findIndex((r) => r.recommendationId === rec.recommendationId);
    if (idx >= 0) this.recommendations[idx] = rec;
    else this.recommendations.push(rec);
    return rec;
  }
}

export const memoryMobilityRepository = new MemoryMobilityRepository();
