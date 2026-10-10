// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Passenger Demand Intelligence Engine
// ──────────────────────────────────────────────────────────────

import { PassengerDemandDto } from '../domain/digital-twin/transit.domain';
import { memoryTransitRepository } from '../repositories/transit.repository';

export class PassengerDemandService {
  async calculatePassengerDemand(cityId: string): Promise<PassengerDemandDto[]> {
    const stops = await memoryTransitRepository.listStopsByCityId(cityId);

    return stops.map((s) => ({
      stopId: s.stopId,
      stopName: s.name,
      demandScore: 94.0,
      demandLevel: 'OVERCAPACITY',
      passengerCount: s.passengerAccumulationCount,
    }));
  }
}

export const passengerDemandService = new PassengerDemandService();
