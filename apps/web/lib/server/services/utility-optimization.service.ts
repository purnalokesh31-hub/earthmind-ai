// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Master Utility Optimization Service
// ──────────────────────────────────────────────────────────────

import { UtilityOptimizationPlanEntity, UtilityOptimizationRecommendationDto } from '../domain/digital-twin/utility-optimization.domain';
import { memoryUtilityOptimizationRepository } from '../repositories/utility-optimization.repository';

export class MasterUtilityOptimizationService {
  async getPlansByCity(cityId: string): Promise<UtilityOptimizationPlanEntity[]> {
    return memoryUtilityOptimizationRepository.listPlansByCityId(cityId);
  }

  async getPlanById(planId: string): Promise<UtilityOptimizationPlanEntity | null> {
    return memoryUtilityOptimizationRepository.findPlanById(planId);
  }

  async approveOptimizationPlan(planId: string): Promise<UtilityOptimizationRecommendationDto> {
    const plan = await memoryUtilityOptimizationRepository.findPlanById(planId);
    if (!plan) throw new Error(`Utility optimization plan ${planId} not found`);

    plan.recommendation.approvalStatus = 'APPROVED';
    plan.status = 'APPROVED';
    await memoryUtilityOptimizationRepository.savePlan(plan);
    return plan.recommendation;
  }
}

export const masterUtilityOptimizationService = new MasterUtilityOptimizationService();
