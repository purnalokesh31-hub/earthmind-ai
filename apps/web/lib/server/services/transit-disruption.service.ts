// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Transit Disruption Engine
// ──────────────────────────────────────────────────────────────

import { TransitDisruptionDto } from '../domain/digital-twin/transit.domain';
import { memoryTransitRepository } from '../repositories/transit.repository';

export class TransitDisruptionService {
  async detectDisruptions(cityId: string): Promise<TransitDisruptionDto[]> {
    const routes = await memoryTransitRepository.listRoutesByCityId(cityId);

    return routes
      .filter((r) => r.operationalStatus === 'SEVERELY_DELAYED' || r.operationalStatus === 'DISRUPTED')
      .map((r) => ({
        disruptionId: `dis-${r.routeId}`,
        routeId: r.routeId,
        routeName: r.name,
        state: r.operationalStatus,
        delayMinutes: 24.5,
        cause: 'Severe road congestion & Ward 12 culvert overflow detour volume.',
        affectedPassengersEst: 1450,
        timestamp: new Date().toISOString(),
      }));
  }
}

export const transitDisruptionService = new TransitDisruptionService();
