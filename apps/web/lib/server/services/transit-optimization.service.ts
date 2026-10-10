// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Multimodal Transit Optimization Engine
// ──────────────────────────────────────────────────────────────

import { TransitRecommendationDto } from '../domain/digital-twin/transit.domain';
import { memoryTransitRepository } from '../repositories/transit.repository';

export class TransitOptimizationService {
  async getRecommendations(cityId: string): Promise<TransitRecommendationDto[]> {
    return memoryTransitRepository.listRecommendationsByCityId(cityId);
  }

  async approveRecommendation(recommendationId: string): Promise<TransitRecommendationDto> {
    const list = await memoryTransitRepository.listRecommendationsByCityId('city-vja');
    const rec = list.find((r) => r.recommendationId === recommendationId);
    if (!rec) throw new Error(`Transit recommendation ${recommendationId} not found`);

    rec.approvalStatus = 'APPROVED';
    return memoryTransitRepository.saveRecommendation(rec);
  }
}

export const transitOptimizationService = new TransitOptimizationService();
