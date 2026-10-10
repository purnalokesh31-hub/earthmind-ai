// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Master Digital Twin Optimization Engine
// Human-in-the-Loop Enforced Optimization Orchestration
// ──────────────────────────────────────────────────────────────

import { memoryDigitalTwinOptimizationRepository } from '../repositories/digital-twin-optimization.repository';
import { infrastructureBudgetOptimizationService } from './infrastructure-budget-optimization.service';
import { optimizationComparisonService } from './optimization-comparison.service';
import { preventiveMaintenanceOptimizationService } from './preventive-maintenance-optimization.service';
import { resourceAllocationOptimizationService } from './resource-allocation-optimization.service';
import {
  OptimizationScenarioEntity,
  OptimizationRecommendationDto,
} from '../domain/digital-twin/optimization.domain';

export class DigitalTwinOptimizationService {
  async createScenario(
    title: string,
    description: string,
    cityId: string,
    totalBudgetInr: number,
    createdBy: string,
    objectives?: OptimizationScenarioEntity['objectives'],
    simulationScenarioId?: string
  ): Promise<OptimizationScenarioEntity> {
    const scenario: OptimizationScenarioEntity = {
      scenarioId: `opt-sc-${Date.now()}`,
      title,
      description,
      cityId,
      simulationScenarioId,
      status: 'CONFIGURED',
      totalBudgetInr,
      objectives: objectives || {
        type: 'BALANCED_MULTI_OBJECTIVE',
        riskWeight: 0.4,
        costWeight: 0.2,
        responseTimeWeight: 0.2,
        availabilityWeight: 0.2,
      },
      constraints: [
        {
          constraintId: `c-${Date.now()}`,
          type: 'MAX_BUDGET',
          limitValue: totalBudgetInr,
          unit: 'INR',
          isHardConstraint: true,
        },
      ],
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return memoryDigitalTwinOptimizationRepository.save(scenario);
  }

  async runOptimization(scenarioId: string): Promise<OptimizationRecommendationDto> {
    const scenario = await memoryDigitalTwinOptimizationRepository.findById(scenarioId);
    if (!scenario) throw new Error(`Optimization scenario ${scenarioId} not found`);

    scenario.status = 'OPTIMIZING';

    // 1. Calculate candidate plans from budget engine
    const candidatePlans = infrastructureBudgetOptimizationService.generateBudgetPlans(scenario.totalBudgetInr);

    // 2. Calculate maintenance priorities & resource allocations
    const maintenancePlans = await preventiveMaintenanceOptimizationService.calculateMaintenancePriorities(scenario.cityId);
    const resourceAllocations = await resourceAllocationOptimizationService.calculateOptimalAllocations(scenario.cityId);

    for (const plan of candidatePlans) {
      plan.maintenancePlans = maintenancePlans;
      plan.resourceAllocations = resourceAllocations;
    }

    // 3. Compare plans and select best recommendation
    const comparison = optimizationComparisonService.comparePlans(candidatePlans);
    const selectedPlan = comparison.recommendedPlan;
    const alternativePlans = candidatePlans.filter((p) => p.planId !== selectedPlan.planId);

    const recommendation: OptimizationRecommendationDto = {
      recommendationId: `rec-opt-${Date.now()}`,
      scenarioId: scenario.scenarioId,
      type: 'PREVENTIVE_MAINTENANCE',
      title: selectedPlan.title,
      description: `Optimized plan achieves ${selectedPlan.riskReductionPercent}% risk reduction with ₹${selectedPlan.estimatedCostInr.toLocaleString()} investment.`,
      targetJurisdiction: scenario.cityId,
      selectedPlan,
      alternativePlans,
      scoringFactors: {
        riskReduction: 82,
        slaImprovement: 71,
        costEfficiency: 64,
        resourceEfficiency: 78,
        finalScore: selectedPlan.normalizedScore,
      },
      requiresHumanApproval: true, // Mandatory Human-in-the-Loop Safety Rule
      approvalStatus: 'PENDING',
    };

    scenario.recommendation = recommendation;
    scenario.status = 'AWAITING_APPROVAL';
    scenario.updatedAt = new Date();
    await memoryDigitalTwinOptimizationRepository.save(scenario);

    return recommendation;
  }

  async approveOptimization(scenarioId: string, approvedBy: string): Promise<OptimizationScenarioEntity> {
    const scenario = await memoryDigitalTwinOptimizationRepository.findById(scenarioId);
    if (!scenario || !scenario.recommendation) throw new Error(`Scenario or recommendation not found for ID ${scenarioId}`);

    scenario.status = 'APPROVED';
    scenario.approvedBy = approvedBy;
    scenario.approvedAt = new Date().toISOString();
    scenario.recommendation.approvalStatus = 'APPROVED';
    scenario.updatedAt = new Date();

    return memoryDigitalTwinOptimizationRepository.save(scenario);
  }

  async rejectOptimization(scenarioId: string, rejectionReason: string): Promise<OptimizationScenarioEntity> {
    const scenario = await memoryDigitalTwinOptimizationRepository.findById(scenarioId);
    if (!scenario || !scenario.recommendation) throw new Error(`Scenario or recommendation not found for ID ${scenarioId}`);

    scenario.status = 'REJECTED';
    scenario.rejectionReason = rejectionReason;
    scenario.recommendation.approvalStatus = 'REJECTED';
    scenario.updatedAt = new Date();

    return memoryDigitalTwinOptimizationRepository.save(scenario);
  }
}

export const digitalTwinOptimizationService = new DigitalTwinOptimizationService();
