// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Climate Adaptation Recommendation Engine
// ──────────────────────────────────────────────────────────────

import { AdaptationOptionDto } from '../domain/digital-twin/climate-resilience.domain';
import { memoryClimateResilienceRepository } from '../repositories/climate-resilience.repository';

export class ClimateAdaptationService {
  async getAdaptations(cityId: string): Promise<AdaptationOptionDto[]> {
    return memoryClimateResilienceRepository.listAdaptationsByCityId(cityId);
  }

  async approveAdaptation(optionId: string): Promise<AdaptationOptionDto> {
    const list = await memoryClimateResilienceRepository.listAdaptationsByCityId('city-vja');
    const target = list.find((a) => a.optionId === optionId);
    if (!target) throw new Error(`Adaptation option ${optionId} not found`);

    target.approvalStatus = 'APPROVED';
    return memoryClimateResilienceRepository.saveAdaptation(target);
  }
}

export const climateAdaptationService = new ClimateAdaptationService();
