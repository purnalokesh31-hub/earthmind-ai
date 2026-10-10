// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Congestion Detection Engine
// ──────────────────────────────────────────────────────────────

import { CongestionEventDto, CongestionLevel } from '../domain/digital-twin/mobility.domain';
import { memoryMobilityRepository } from '../repositories/mobility.repository';

export class CongestionDetectionService {
  async detectCongestionEvents(cityId: string): Promise<CongestionEventDto[]> {
    const segments = await memoryMobilityRepository.listSegmentsByCityId(cityId);

    return segments.map((s) => {
      let level: CongestionLevel = s.congestionLevel;
      let severityScore = 85.0;

      if (s.averageSpeedKmh < 15) {
        level = 'SEVERELY_CONGESTED';
        severityScore = 92.0;
      } else if (s.averageSpeedKmh < 30) {
        level = 'SLOW';
        severityScore = 55.0;
      }

      return {
        eventId: `cong-evt-${s.segmentId}`,
        segmentId: s.segmentId,
        segmentName: s.name,
        congestionLevel: level,
        severityScore,
        estimatedDelayMinutes: Math.round((s.lengthMeters / (s.averageSpeedKmh * 1000 / 60)) - (s.lengthMeters / (s.speedLimitKmh * 1000 / 60))),
        causeSummary: `High vehicle occupancy (${s.occupancyPercent}%) & slow average speed (${s.averageSpeedKmh} km/h).`,
        timestamp: new Date().toISOString(),
      };
    });
  }
}

export const congestionDetectionService = new CongestionDetectionService();
