// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 5/6)
// Response Execution Readiness, Monitoring & Outcome Intelligence Repository
// ──────────────────────────────────────────────────────────────

import {
  CityResponseReadinessEntity,
  CityResponseReadinessInputDto,
  CityResponseReadinessStatus,
  CityResponseReadinessApprovalDto,
  CityResponseAuditDto,
  CityResponseReadinessSummaryDto,
  CityResponseMonitoringSignalDto,
  CityResponseOutcomeObservationDto,
  CityResponseDeviationDto,
  CityResponseEscalationDto,
  CityResponseFeedbackDto,
  CityResponseReadinessHandoffDto,
} from '../domain/digital-twin/city-response-readiness.domain';
import { logger } from '../logger';

export class MemoryCityResponseReadinessRepository {
  private entities: Map<string, CityResponseReadinessEntity> = new Map();
  private approvals: Map<string, CityResponseReadinessApprovalDto> = new Map();
  private auditLedger: CityResponseAuditDto[] = [];
  private historyLedger: Map<string, any[]> = new Map();

  constructor() {
    this.seedDefaultAssessments();
  }

  private seedDefaultAssessments() {
    const now = new Date().toISOString();
    const seed1: CityResponseReadinessEntity = {
      readinessId: 'resp-readiness-101',
      interventionId: 'int-101',
      cityId: 'city-vja',
      title: 'Substation 4B Drainage Barrier Response Execution Readiness',
      description: 'Execution readiness assessment & outcome monitoring for Substation 4B flood mitigation.',
      status: 'MONITORING',
      readinessState: 'CONDITIONALLY_READY',
      scores: {
        readinessScore: 85,
        classification: 'CONDITIONALLY_READY',
        resourceReadinessScore: 80,
        dependencyReadinessScore: 90,
        safetyReadinessScore: 85,
        budgetReadinessScore: 100,
        dataAvailabilityScore: 70,
        authorizationStateScore: 100,
        reasons: ['Crew allocation verified', 'Mobile pump telemetry status UNKNOWN'],
        requiresHumanApproval: true,
        dataSource: 'EXECUTION_READINESS',
      },
      checks: [
        { checkId: 'chk-1', category: 'RESOURCE_READY', title: 'Crew Allocation Check', status: 'PASSED', description: 'Engineering standby crew assigned', requiresHumanApproval: true },
        { checkId: 'chk-2', category: 'DATA_UNAVAILABLE', title: 'Generator Telemetry Check', status: 'DATA_UNAVAILABLE', description: 'Mobile generator telemetry unverified', requiresHumanApproval: true },
      ],
      blockingReasons: ['UNKNOWN_RESOURCE_STATE'],
      actions: [
        {
          actionId: 'act-1',
          title: 'Deploy Drainage Barrier',
          description: 'Erect temporary flood barriers at Benz Circle substation.',
          targetSector: 'UTILITY',
          estimatedDurationMinutes: 60,
          readinessState: 'READY',
          blockingReasons: [],
          dependencies: [],
          resources: [
            { resourceId: 'res-1', name: 'Barrier Panels', category: 'INFRASTRUCTURE', requiredQuantity: 20, allocatedQuantity: 20, availabilityStatus: 'AVAILABLE', isUncertain: false },
            { resourceId: 'res-gen-1', name: 'Mobile Power Generator Unit', category: 'MOBILE_GENERATOR', requiredQuantity: 2, allocatedQuantity: 0, availabilityStatus: 'UNKNOWN', isUncertain: true },
          ],
          crews: [
            { crewId: 'crw-1', teamName: 'Utility Alpha', specialization: 'DRAINAGE', requiredStaffCount: 4, assignedStaffCount: 4, readinessStatus: 'STANDBY' },
          ],
          requiresHumanApproval: true,
        },
      ],
      checklist: {
        readinessId: 'resp-readiness-101',
        items: [
          { itemId: 'chk-item-1', category: 'PRE_ACTION_CHECKS', title: 'Substation Power Isolation', description: 'Verify main switch gear isolation', isCompleted: true, requiredForReadiness: true },
        ],
        totalCount: 1,
        completedCount: 1,
        isFullySatisfied: true,
        requiresHumanApproval: true,
      },
      monitoringSignals: [
        {
          signalId: 'sig-1',
          readinessId: 'resp-readiness-101',
          domain: 'UTILITY',
          signalType: 'FLOOD_REDUCTION',
          currentValue: 25,
          targetValue: 31,
          unit: 'POINTS',
          confidence: 88,
          provenance: 'LIVE_TELEMETRY',
          timestamp: now,
          requiresHumanApproval: true,
        },
      ],
      expectedOutcome: {
        interventionId: 'int-101',
        expectedRiskReduction: 31,
        expectedPopulationBenefit: 12000,
        expectedServiceRecoveryMinutes: 90,
        expectedDowntimeMinutes: 45,
        expectedCostUsd: 18500,
      },
      observedOutcome: {
        observationId: 'obs-1',
        readinessId: 'resp-readiness-101',
        observedRiskReduction: 25,
        observedPopulationBenefit: 10500,
        observedServiceRecoveryMinutes: 125,
        observedDowntimeMinutes: 60,
        observedCostUsd: 19200,
        provenance: 'LIVE_TELEMETRY',
        timestamp: now,
        recordedByUserId: 'usr-op-1',
      },
      deviation: {
        deviationId: 'dev-1',
        readinessId: 'resp-readiness-101',
        severity: 'MODERATE',
        affectedDomain: 'UTILITY',
        riskReductionDelta: -6,
        populationBenefitDelta: -1500,
        serviceRecoveryDeltaMinutes: 35,
        downtimeDeltaMinutes: 15,
        costDeltaUsd: 700,
        explanation: 'Observed risk reduction is 6 points below expected target due to unexpected stormwater inflow rate.',
        timestamp: now,
        requiresHumanApproval: true,
      },
      escalation: {
        escalationId: 'esc-1',
        readinessId: 'resp-readiness-101',
        escalationLevel: 'MEDIUM',
        reason: 'Service recovery time exceeded expected target by 35 minutes.',
        recommendedAction: 'Operator review required for auxiliary pump deployment.',
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
        timestamp: now,
      },
      riskAssessment: {
        readinessId: 'resp-readiness-101',
        readinessRiskScore: 35,
        riskLevel: 'ELEVATED',
        contributingFactors: [{ factor: 'STORMWATER_INFLOW', impactScore: 35, description: 'Elevated basin water level' }],
        requiresHumanApproval: true,
        advisoryOnly: true,
      },
      createdAt: now,
      updatedAt: now,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'EXECUTION_READINESS',
    };

    this.entities.set(seed1.readinessId, seed1);
    this.historyLedger.set(seed1.readinessId, [
      {
        eventId: `acc-resp-${Date.now()}-1`,
        readinessId: seed1.readinessId,
        userId: 'SYSTEM_SEEDS',
        action: 'READINESS_ASSESSMENT_CREATED',
        timestamp: now,
      },
    ]);
  }

  public createReadiness(input: CityResponseReadinessInputDto): CityResponseReadinessEntity {
    const id = `resp-readiness-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const entity: CityResponseReadinessEntity = {
      readinessId: id,
      interventionId: input.interventionId,
      cityId: input.cityId,
      title: input.title,
      description: input.description,
      status: 'DRAFT',
      readinessState: 'NOT_READY',
      scores: {
        readinessScore: 50,
        classification: 'NOT_READY',
        resourceReadinessScore: 50,
        dependencyReadinessScore: 50,
        safetyReadinessScore: 50,
        budgetReadinessScore: 50,
        dataAvailabilityScore: 50,
        authorizationStateScore: 50,
        reasons: ['Assessment initialized'],
        requiresHumanApproval: true,
        dataSource: 'EXECUTION_READINESS',
      },
      checks: [],
      blockingReasons: [],
      actions: [],
      checklist: {
        readinessId: id,
        items: [],
        totalCount: 0,
        completedCount: 0,
        isFullySatisfied: false,
        requiresHumanApproval: true,
      },
      monitoringSignals: [],
      riskAssessment: {
        readinessId: id,
        readinessRiskScore: 50,
        riskLevel: 'GUARDED',
        contributingFactors: [],
        requiresHumanApproval: true,
        advisoryOnly: true,
      },
      createdAt: now,
      updatedAt: now,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'EXECUTION_READINESS',
    };

    this.entities.set(id, entity);
    this.historyLedger.set(id, [
      {
        eventId: `acc-resp-${Date.now()}`,
        readinessId: id,
        userId: 'SYSTEM_ORCHESTRATOR',
        action: 'ASSESSMENT_CREATED',
        timestamp: now,
      },
    ]);

    this.recordAudit({
      auditId: `aud-resp-${Date.now()}`,
      readinessId: id,
      eventType: 'RESPONSE_READINESS_CREATED',
      userId: 'SYSTEM_ORCHESTRATOR',
      summary: `Created response execution readiness assessment '${id}' for '${input.title}'`,
      timestamp: now,
      provenance: 'EXECUTION_READINESS',
    });

    logger.info(`[MemoryCityResponseReadinessRepository] Created entity '${id}'`);
    return entity;
  }

  public getReadiness(id: string): CityResponseReadinessEntity | undefined {
    return this.entities.get(id);
  }

  public listReadiness(cityId?: string, status?: CityResponseReadinessStatus): CityResponseReadinessEntity[] {
    let list = Array.from(this.entities.values());
    if (cityId) {
      list = list.filter((e) => e.cityId === cityId);
    }
    if (status) {
      list = list.filter((e) => e.status === status);
    }
    return list;
  }

  public updateStatus(
    id: string,
    newStatus: CityResponseReadinessStatus,
    userId: string,
    operatorNotes?: string
  ): CityResponseReadinessEntity {
    const entity = this.entities.get(id);
    if (!entity) {
      throw new Error(`Response execution readiness assessment '${id}' not found.`);
    }

    // Terminal decision duplicate protection
    if (['APPROVED', 'AUTHORIZED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(entity.status) && ['APPROVED', 'AUTHORIZED', 'REJECTED'].includes(newStatus)) {
      throw new Error(`RESILIENCE_DECISION_ALREADY_DECIDED: Assessment '${id}' is in terminal state '${entity.status}' and cannot be re-decided.`);
    }

    const previousStatus = entity.status;
    const now = new Date().toISOString();
    entity.status = newStatus;
    entity.updatedAt = now;

    const history = this.historyLedger.get(id) || [];
    history.push({
      eventId: `acc-resp-${Date.now()}`,
      readinessId: id,
      userId,
      action: `STATUS_CHANGED_TO_${newStatus}`,
      previousStatus,
      newStatus,
      operatorNotes,
      timestamp: now,
    });
    this.historyLedger.set(id, history);

    this.recordAudit({
      auditId: `aud-resp-${Date.now()}`,
      readinessId: id,
      eventType: `STATUS_${newStatus}`,
      userId,
      summary: `Updated response execution readiness '${id}' status from ${previousStatus} to ${newStatus}`,
      timestamp: now,
      provenance: 'EXECUTION_READINESS',
    });

    return entity;
  }

  public saveApproval(approval: CityResponseReadinessApprovalDto): CityResponseReadinessApprovalDto {
    this.approvals.set(approval.readinessId, approval);
    this.recordAudit({
      auditId: `aud-resp-${Date.now()}`,
      readinessId: approval.readinessId,
      eventType: `APPROVAL_${approval.decision}`,
      userId: approval.userId,
      summary: `User '${approval.userId}' recorded decision '${approval.decision}' for readiness assessment '${approval.readinessId}'`,
      timestamp: approval.timestamp,
      provenance: 'EXECUTION_READINESS',
    });
    return approval;
  }

  public recordAudit(audit: CityResponseAuditDto) {
    this.auditLedger.unshift(audit);
  }

  public getHistory(id: string): any[] {
    return this.historyLedger.get(id) || [];
  }

  public getApproval(id: string): CityResponseReadinessApprovalDto | undefined {
    return this.approvals.get(id);
  }

  public getHandoff(id: string) {
    const entity = this.entities.get(id);
    return entity?.handoffPackage;
  }

  public saveHandoff(handoff: CityResponseReadinessHandoffDto) {
    const entity = this.entities.get(handoff.readinessId);
    if (entity) {
      entity.handoffPackage = handoff;
    }
    return handoff;
  }

  public getAuditLedger(): CityResponseAuditDto[] {
    return this.auditLedger;
  }

  public getSummary(): CityResponseReadinessSummaryDto {
    const all = Array.from(this.entities.values());
    const readyForHandoff = all.filter((e) => e.status === 'HANDOFF_READY' || e.status === 'READY').length;
    const blocked = all.filter((e) => e.readinessState === 'BLOCKED' || e.status === 'NOT_READY').length;
    const awaitingApproval = all.filter((e) => e.status === 'AWAITING_APPROVAL' || e.status === 'AWAITING_HUMAN_AUTHORIZATION').length;
    const handedOff = all.filter((e) => e.status === 'HANDED_OFF' || e.status === 'AUTHORIZED').length;
    const outcomesValidated = all.filter((e) => e.status === 'VALIDATED' || e.status === 'OUTCOME_VALIDATING').length;

    return {
      totalAssessments: all.length,
      readyForHandoffCount: readyForHandoff,
      blockedCount: blocked,
      awaitingApprovalCount: awaitingApproval,
      handedOffCount: handedOff,
      outcomesValidatedCount: outcomesValidated,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'EXECUTION_READINESS',
      updatedAt: new Date().toISOString(),
    };
  }
}

export const memoryCityResponseReadinessRepository = new MemoryCityResponseReadinessRepository();
