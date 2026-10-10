// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Master Utility Operations Orchestrator Service
// ──────────────────────────────────────────────────────────────

import { UtilityOperationsCycleEntity, UtilityOperationsRecommendationDto, UtilityWorkOrderDto } from '../domain/digital-twin/utility-operations.domain';
import { memoryUtilityOperationsRepository } from '../repositories/utility-operations.repository';
import { utilityAnomalyCorrelationService } from './utility-anomaly-correlation.service';
import { utilityDecisionFusionService } from './utility-decision-fusion.service';
import { utilityWorkOrderService } from './utility-work-order.service';
import { utilityExecutionTrackingService } from './utility-execution-tracking.service';
import { utilityOutcomeValidationService } from './utility-outcome-validation.service';
import { utilityContinuousFeedbackService } from './utility-continuous-feedback.service';

export class UtilityOperationsOrchestratorService {
  async getCyclesByCity(cityId: string): Promise<UtilityOperationsCycleEntity[]> {
    return memoryUtilityOperationsRepository.listCyclesByCityId(cityId);
  }

  async getCycleById(cycleId: string): Promise<UtilityOperationsCycleEntity | null> {
    return memoryUtilityOperationsRepository.findCycleById(cycleId);
  }

  async runCycle(cycleId: string): Promise<UtilityOperationsCycleEntity> {
    const cycle = await memoryUtilityOperationsRepository.findCycleById(cycleId);
    if (!cycle) throw new Error(`Operations cycle ${cycleId} not found`);

    const signals = await utilityAnomalyCorrelationService.correlateAnomalies(cycle.input.primaryTargetAssetId);
    const decision = await utilityDecisionFusionService.fuseDecision(cycle.input.primaryTargetAssetId);

    cycle.signals = signals;
    cycle.decision = decision;
    cycle.status = 'RECOMMENDATION_READY';

    if (!cycle.timeline) cycle.timeline = [];
    cycle.timeline.push({
      eventId: `evt-${Date.now()}`,
      eventType: 'OPTIMIZATION_COMPLETED',
      description: 'Closed-loop intelligence optimization completed advisory recommendation.',
      actor: 'UtilityOperationsOrchestratorService',
      timestamp: new Date().toISOString(),
    });

    await memoryUtilityOperationsRepository.saveCycle(cycle);
    return cycle;
  }

  async approveRecommendation(cycleId: string, userId: string): Promise<{ recommendation: UtilityOperationsRecommendationDto; workOrder: UtilityWorkOrderDto }> {
    const cycle = await memoryUtilityOperationsRepository.findCycleById(cycleId);
    if (!cycle || !cycle.recommendation) {
      throw new Error(`Operations cycle ${cycleId} recommendation not found`);
    }

    cycle.recommendation.approvalStatus = 'APPROVED';
    cycle.recommendation.approvedBy = userId;
    cycle.recommendation.approvedAt = new Date().toISOString();
    cycle.status = 'APPROVED';

    const workOrder = utilityWorkOrderService.createWorkOrder(
      cycle.recommendation.recommendationId,
      cycle.input.primaryTargetAssetId,
      userId
    );
    cycle.workOrder = workOrder;

    const execution = await utilityExecutionTrackingService.getExecutionStatus(workOrder.workOrderId);
    cycle.execution = execution;

    const outcome = await utilityOutcomeValidationService.validateOutcome(cycleId);
    cycle.outcome = outcome;

    const feedback = await utilityContinuousFeedbackService.calculateFeedback(cycleId);
    cycle.feedback = feedback;

    cycle.status = 'COMPLETED';

    if (!cycle.timeline) cycle.timeline = [];
    cycle.timeline.push({
      eventId: `evt-${Date.now()}`,
      eventType: 'APPROVAL_GRANTED',
      description: `Human authorization granted by user ${userId}. Work order ${workOrder.workOrderId} created and executed.`,
      actor: userId,
      timestamp: new Date().toISOString(),
    });

    await memoryUtilityOperationsRepository.saveCycle(cycle);
    return { recommendation: cycle.recommendation, workOrder };
  }
}

export const utilityOperationsOrchestratorService = new UtilityOperationsOrchestratorService();
