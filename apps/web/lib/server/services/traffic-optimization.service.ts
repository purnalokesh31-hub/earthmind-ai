// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Traffic Optimization Engine
// ──────────────────────────────────────────────────────────────

import { MobilityRecommendationDto } from '../domain/digital-twin/mobility.domain';
import { memoryMobilityRepository } from '../repositories/mobility.repository';

export class TrafficOptimizationService {
  async getRecommendations(cityId: string): Promise<MobilityRecommendationDto[]> {
    return memoryMobilityRepository.listRecommendationsByCityId(cityId);
  }

  async approveRecommendation(recommendationId: string, approvedBy?: string): Promise<MobilityRecommendationDto> {
    const list = await memoryMobilityRepository.listRecommendationsByCityId('city-vja');
    const rec = list.find((r) => r.recommendationId === recommendationId);
    if (!rec) throw new Error(`Mobility recommendation ${recommendationId} not found`);
    if (rec.approvalStatus === 'APPROVED' || rec.approvalStatus === 'REJECTED') {
      throw new Error(`RECOMMENDATION_ALREADY_DECIDED: Recommendation '${recommendationId}' is already ${rec.approvalStatus}.`);
    }

    rec.approvalStatus = 'APPROVED';
    rec.approvedBy = approvedBy;
    return memoryMobilityRepository.saveRecommendation(rec);
  }
}

export const trafficOptimizationService = new TrafficOptimizationService();
