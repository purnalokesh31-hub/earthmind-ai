// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Traffic Prediction Engine
// ──────────────────────────────────────────────────────────────

import { MobilityRiskDto, TrafficPredictionHorizon } from '../domain/digital-twin/mobility.domain';
import { memoryMobilityRepository } from '../repositories/mobility.repository';

export class TrafficPredictionService {
  async predictCongestion(cityId: string, horizon: TrafficPredictionHorizon = 'NEXT_1_HOUR'): Promise<MobilityRiskDto[]> {
    const segments = await memoryMobilityRepository.listSegmentsByCityId(cityId);

    return segments.map((s) => ({
      segmentId: s.segmentId,
      predictedCongestion: 'GRIDLOCK',
      riskScore: 94.0,
      predictionHorizon: horizon,
      contributingFactors: [
        'Ward 12 culvert overflow detour volume',
        'Peak hour school zone congestion (Benz Circle)',
        'Monsoon runoff surface water accumulation',
      ],
    }));
  }
}

export const trafficPredictionService = new TrafficPredictionService();
