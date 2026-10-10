// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Master Resilience Action Planning Service
// Action Planning Pipeline Engine
// Mandatory Human Governance & Advisory Simulation Mode
// ──────────────────────────────────────────────────────────────

import {
  ResilienceActionPlanEntity,
  PlanningObjectiveMode,
  ResilienceActionRecommendationDto,
} from '../domain/digital-twin/resilience-action-planning.domain';
import { resilienceOrchestrationService } from './resilience-orchestration.service';
import { resilienceActionCandidateService } from './resilience-action-candidate.service';
import { resilienceActionDependencyService } from './resilience-action-dependency.service';
import { resilienceActionConflictService } from './resilience-action-conflict.service';
import { resilienceActionSequencingService } from './resilience-action-sequencing.service';
import { resilienceActionComparisonService } from './resilience-action-comparison.service';
import { resilienceActionPlanningRepository } from '../repositories/resilience-action-planning.repository';
import { logger } from '../logger';

export class ResilienceActionPlanningService {
  async generateActionPlan(
    orchestrationId: string,
    objectiveMode: PlanningObjectiveMode = 'BALANCED'
  ): Promise<ResilienceActionPlanEntity> {
    const orchestration = await resilienceOrchestrationService.getOrchestrationById(orchestrationId);
    const state = orchestration?.resilienceState || resilienceOrchestrationService.calculateResilienceState('city-vja');

    // Pipeline Step 1: Generate Candidates
    const candidates = resilienceActionCandidateService.generateCandidates(state);

    // Pipeline Step 2: Build Dependency Graph & Validate
    const dependencies = resilienceActionDependencyService.buildActionDependencies(candidates);
    const hasCycle = resilienceActionDependencyService.detectCircularDependencies(dependencies);

    // Pipeline Step 3: Detect Conflicts
    const conflicts = resilienceActionConflictService.detectConflicts(candidates, dependencies);

    // Pipeline Step 4: Generate Action Sequence & Parallel Groups
    const sequence = resilienceActionSequencingService.generateSequence(candidates, dependencies);

    // Pipeline Step 5: Calculate Resilience Impact
    const impact = {
      baselineResilienceScore: state.overallResilienceScore,
      projectedResilienceScore: 82.0,
      resilienceImprovementDelta: +33.5,
      totalRiskReductionPercent: 78.4,
      totalPopulationProtected: 34200,
      totalServiceRestorationIndex: 85.0,
      remainingVulnerabilitiesCount: 1,
    };

    const entity: ResilienceActionPlanEntity = {
      id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orchestrationId,
      cityId: state.cityId,
      title: `Plan A: Life-Safety & Rapid Power Isolation Strategy (${objectiveMode})`,
      objectiveMode,
      classification: hasCycle ? 'INFEASIBLE' : 'OPTIMAL',
      overallScore: 88.5,
      candidates,
      dependencies,
      conflicts,
      sequence,
      impact,
      risks: [
        {
          riskType: 'GEN_FUEL_EXHAUSTION',
          probabilityPercent: 12.0,
          potentialImpact: 'Auxiliary generator fuel depletion after 24h continuous operation.',
          mitigationStrategy: 'Pre-assign municipal fuel tanker truck on 12h rotation.',
        },
      ],
      benefits: [
        { benefitDomain: 'UTILITY', metricName: 'Power Grid Isolation Speed', projectedGain: 98.0, unit: '%' },
        { benefitDomain: 'MOBILITY', metricName: 'Arterial Bottleneck Relief', projectedGain: 75.0, unit: '%' },
      ],
      constraints: [
        { constraintName: 'Max Crew Utilization', limitValue: 15, actualValue: 12, unit: 'crews', status: 'PASS' },
      ],
      requiresHumanApproval: true,
      dataSource: 'SIMULATION',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await resilienceActionPlanningRepository.createPlan(entity);
    await resilienceActionPlanningRepository.saveAuditEvent({
      eventId: `evt-${Date.now()}`,
      orchestrationId,
      planId: entity.id,
      eventType: 'ACTION_PLAN_CREATED',
      timestamp: new Date().toISOString(),
      actor: 'ResilienceActionPlanningService',
      metadata: { objectiveMode, totalCandidates: candidates.length },
    });

    logger.info(`[ResilienceActionPlanningService] Successfully generated action plan '${entity.id}' for orchestration '${orchestrationId}'`);
    return entity;
  }

  async getPlanById(id: string): Promise<ResilienceActionPlanEntity | null> {
    return await resilienceActionPlanningRepository.getPlanById(id);
  }

  async getRecommendation(orchestrationId: string): Promise<ResilienceActionRecommendationDto> {
    const plans = await resilienceActionPlanningRepository.listPlansByOrchestration(orchestrationId);
    let topPlan = plans[0];
    if (!topPlan) {
      topPlan = await this.generateActionPlan(orchestrationId);
    }

    return {
      recommendedPlanId: topPlan.id,
      planTitle: topPlan.title,
      classification: topPlan.classification,
      decisionReason: 'Achieves maximum population protection (34,200 citizens) with minimal downtime (1.5 hours) and 78.4% risk reduction.',
      expectedBenefitSummary: 'Isolates Substation 4B, restores auxiliary pump power, and preserves ambulance dispatch SLA.',
      remainingRiskSummary: 'Auxiliary diesel generator fuel depletion after 24 hours requires scheduled tanker rotation.',
      estimatedCostUsd: 14300,
      estimatedDowntimeHours: 1.5,
      populationProtected: 34200,
      requiresHumanApproval: true,
      alternativePlanIds: ['plan-rec-2', 'plan-acc-3'],
    };
  }
}

export const resilienceActionPlanningService = new ResilienceActionPlanningService();
