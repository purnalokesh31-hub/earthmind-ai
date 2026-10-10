// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 3/6)
// Operational Handoff Engine Service
// ──────────────────────────────────────────────────────────────

import { CityResponseReadinessHandoffDto } from '../domain/digital-twin/city-response-readiness.domain';
import { memoryCityResponseReadinessRepository } from '../repositories/city-response-readiness.repository';
import { logger } from '../logger';

export interface CreateHandoffInput {
  readinessId: string;
  assignedOperationalOwner: string;
  operatorNotes?: string;
}

export class CityResponseHandoffService {
  private repo = memoryCityResponseReadinessRepository;

  public prepareHandoffPackage(input: CreateHandoffInput): CityResponseReadinessHandoffDto {
    const entity = this.repo.getReadiness(input.readinessId);
    if (!entity) {
      throw new Error(`Response readiness assessment '${input.readinessId}' not found.`);
    }

    // Require human approval state before preparing handoff
    if (entity.status !== 'APPROVED' && entity.status !== 'HANDOFF_READY') {
      throw new Error(`HANDOFF_BLOCKED: Readiness assessment '${input.readinessId}' must be in APPROVED or HANDOFF_READY state before preparing handoff.`);
    }

    const handoffId = `hdf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const handoffPackage: CityResponseReadinessHandoffDto = {
      handoffId,
      readinessId: input.readinessId,
      interventionId: entity.interventionId,
      approvedRecommendationId: `rec-${entity.interventionId}`,
      assignedOperationalOwner: input.assignedOperationalOwner,
      actionSequence: entity.actions.map((a) => a.title),
      dependenciesCount: entity.actions.reduce((acc, a) => acc + a.dependencies.length, 0),
      resourceRequirementsCount: entity.actions.reduce((acc, a) => acc + a.resources.length, 0),
      crewRequirementsCount: entity.actions.reduce((acc, a) => acc + a.crews.length, 0),
      geographicContext: {
        cityId: entity.cityId,
        affectedZones: ['Zone-A', 'Zone-B'],
      },
      timingWindow: {
        recommendedStartWindow: now,
        estimatedDurationMinutes: entity.actions.reduce((acc, a) => acc + a.estimatedDurationMinutes, 0) || 60,
      },
      riskSummary: {
        riskLevel: entity.riskAssessment.riskLevel,
        riskScore: entity.riskAssessment.readinessRiskScore,
      },
      safetyChecklistCompleted: entity.checklist.isFullySatisfied,
      expectedOutcomes: [
        'Mitigate water basin elevation surge',
        'Maintain emergency transit route availability',
      ],
      evidenceRequirements: [
        'Before & After Water Gauge Stream Telemetry',
        'Field Crew Arrival Time Confirmation Log',
      ],
      operatorNotes: input.operatorNotes,
      handoffStatus: 'READY',
      createdTimestamp: now,
      requiresHumanApproval: true,
    };

    entity.handoffPackage = handoffPackage;
    this.repo.saveHandoff(handoffPackage);
    this.repo.updateStatus(input.readinessId, 'HANDOFF_READY', input.assignedOperationalOwner, 'Operational handoff package prepared.');

    logger.info(`[CityResponseHandoffService] Prepared governed handoff '${handoffId}' for readiness '${input.readinessId}' assigned to '${input.assignedOperationalOwner}'`);
    return handoffPackage;
  }
}

export const cityResponseHandoffService = new CityResponseHandoffService();
