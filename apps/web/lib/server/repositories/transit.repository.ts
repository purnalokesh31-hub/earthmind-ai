// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.6 Transit Repository
// ──────────────────────────────────────────────────────────────

import {
  TransitRouteEntity,
  TransitStopEntity,
  TransitVehicleEntity,
  TransitRecommendationDto,
} from '../domain/digital-twin/transit.domain';

export interface ITransitRepository {
  listRoutesByCityId(cityId: string): Promise<TransitRouteEntity[]>;
  listStopsByCityId(cityId: string): Promise<TransitStopEntity[]>;
  listVehiclesByCityId(cityId: string): Promise<TransitVehicleEntity[]>;
  listRecommendationsByCityId(cityId: string): Promise<TransitRecommendationDto[]>;
  saveRecommendation(rec: TransitRecommendationDto): Promise<TransitRecommendationDto>;
}

export class MemoryTransitRepository implements ITransitRepository {
  private routes: TransitRouteEntity[] = [
    {
      routeId: 'rt-bus-12',
      routeNumber: 'Route 12B',
      name: 'Benz Circle — MG Road Central Express Line',
      cityId: 'city-vja',
      mode: 'BUS',
      startStopId: 'stp-bc-101',
      endStopId: 'stp-mg-102',
      totalStopsCount: 14,
      lengthKm: 12.4,
      averageFrequencyMinutes: 10,
      operationalStatus: 'SEVERELY_DELAYED',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      routeId: 'rt-bus-18',
      routeNumber: 'Route 18A',
      name: 'PNS Bus Station — Bandar Road Feeder',
      cityId: 'city-vja',
      mode: 'BUS',
      startStopId: 'stp-pns-101',
      endStopId: 'stp-bnd-102',
      totalStopsCount: 18,
      lengthKm: 16.8,
      averageFrequencyMinutes: 15,
      operationalStatus: 'ON_TIME',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private stops: TransitStopEntity[] = [
    {
      stopId: 'stp-bc-101',
      name: 'Benz Circle North Bus Terminal',
      cityId: 'city-vja',
      zoneId: 'zone-w12',
      latitude: 16.5062,
      longitude: 80.648,
      passengerAccumulationCount: 145,
      hasShelter: true,
      status: 'OVERCROWDED',
    },
  ];

  private vehicles: TransitVehicleEntity[] = [
    {
      vehicleId: 'vh-bus-101',
      routeId: 'rt-bus-12',
      vehicleNumber: 'AP-16-Z-4501',
      capacityPassengers: 60,
      currentPassengerCount: 58,
      occupancyPercentage: 96.6,
      averageSpeedKmh: 12.5,
      status: 'SEVERELY_DELAYED',
    },
  ];

  private recommendations: TransitRecommendationDto[] = [
    {
      recommendationId: 'tr-rec-101',
      title: 'Dispatch Express Relief Buses for Benz Circle Line (Route 12B)',
      description: 'Reallocate 2 standby electric buses from PNS Station depot to clear 145 passenger surge.',
      targetRouteId: 'rt-bus-12',
      actionType: 'FLEET_REALLOCATION',
      expectedDelayReductionPercent: 48.0,
      requiresHumanApproval: true,
      approvalStatus: 'PENDING',
    },
  ];

  async listRoutesByCityId(cityId: string): Promise<TransitRouteEntity[]> {
    return this.routes.filter((r) => r.cityId === cityId);
  }

  async listStopsByCityId(cityId: string): Promise<TransitStopEntity[]> {
    return this.stops.filter((s) => s.cityId === cityId);
  }

  async listVehiclesByCityId(cityId: string): Promise<TransitVehicleEntity[]> {
    return this.vehicles;
  }

  async listRecommendationsByCityId(cityId: string): Promise<TransitRecommendationDto[]> {
    return this.recommendations;
  }

  async saveRecommendation(rec: TransitRecommendationDto): Promise<TransitRecommendationDto> {
    const idx = this.recommendations.findIndex((r) => r.recommendationId === rec.recommendationId);
    if (idx >= 0) this.recommendations[idx] = rec;
    else this.recommendations.push(rec);
    return rec;
  }
}

export const memoryTransitRepository = new MemoryTransitRepository();
