// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Traffic Bottleneck Intelligence Engine
// ──────────────────────────────────────────────────────────────

import { IntersectionEntity } from '../domain/digital-twin/mobility.domain';
import { memoryMobilityRepository } from '../repositories/mobility.repository';

export class TrafficBottleneckService {
  async identifyBottlenecks(cityId: string): Promise<IntersectionEntity[]> {
    const intersections = await memoryMobilityRepository.listIntersectionsByCityId(cityId);
    return intersections.filter((i) => i.averageDelaySeconds > 60 || i.queueLengthVehicles > 25);
  }
}

export const trafficBottleneckService = new TrafficBottleneckService();
