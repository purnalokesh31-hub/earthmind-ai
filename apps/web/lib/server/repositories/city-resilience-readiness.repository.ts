// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 4/6)
// City Resilience Coordination & Operational Preparedness Repository
// Deterministic In-Memory Persistence & Append-Only Audit Ledger
// ──────────────────────────────────────────────────────────────

import {
  CityResilienceReadinessEntity,
  CityResilienceReadinessInputDto,
  CityResilienceReadinessStatus,
  CityReadinessApprovalDto,
  CityReadinessAuditDto,
  CityReadinessSummaryDto,
} from '../domain/digital-twin/city-resilience-readiness.domain';
import { logger } from '../logger';

export class MemoryCityResilienceReadinessRepository {
  private entities: Map<string, CityResilienceReadinessEntity> = new Map();
  private approvals: Map<string, CityReadinessApprovalDto> = new Map();
  private auditLedger: CityReadinessAuditDto[] = [];
  private historyLedger: Map<string, any[]> = new Map();

  constructor() {
    this.seedDefaultAssessments();
  }

  private seedDefaultAssessments() {
    const now = new Date().toISOString();
    const seed1: CityResilienceReadinessEntity = {
      id: 'res-readiness-101',
      cityId: 'city-vja',
      title: 'Vijayawada Monsoon Surge Operational Preparedness Assessment',
      description: 'Citywide operational readiness evaluation across urban drainage, power grid, and emergency response.',
      status: 'OPTIONS_GENERATED',
      scores: {
        overallReadinessScore: 74,
        criticalDomainReadiness: 68,
        resourceReadiness: 72,
        operationalReadiness: 78,
        infrastructureReadiness: 70,
        responseReadiness: 80,
        crossDomainReadiness: 76,
      },
      domains: [
        {
          domain: 'CLIMATE',
          readinessScore: 65,
          status: 'VULNERABLE',
          capabilities: [
            { capabilityId: 'cap-clim-1', domain: 'CLIMATE', name: 'Monsoon Flood Monitoring', readinessPercentage: 70, isCritical: true, status: 'ADEQUATE' },
          ],
          dataSource: 'SIMULATION',
        },
        {
          domain: 'UTILITY',
          readinessScore: 72,
          status: 'MODERATE',
          capabilities: [
            { capabilityId: 'cap-util-1', domain: 'UTILITY', name: 'Substation Pump Backups', readinessPercentage: 72, isCritical: true, status: 'ADEQUATE' },
          ],
          dataSource: 'SIMULATION',
        },
        {
          domain: 'EMERGENCY_RESPONSE',
          readinessScore: 82,
          status: 'HIGH',
          capabilities: [
            { capabilityId: 'cap-emg-1', domain: 'EMERGENCY_RESPONSE', name: 'Rapid Evacuation Response', readinessPercentage: 82, isCritical: true, status: 'OPTIMAL' },
          ],
          dataSource: 'SIMULATION',
        },
      ],
      resourceReadiness: [
        {
          resourceId: 'res-eng-1',
          name: 'Municipal Engineering Crew',
          category: 'ENGINEERING_CREW',
          requiredQuantity: 6,
          knownAvailableQuantity: 4,
          resourceGap: 2,
          availabilityStatus: 'LIMITED',
          readinessPercentage: 66.7,
          isUncertain: false,
        },
        {
          resourceId: 'res-gen-1',
          name: 'Mobile Power Generator Unit',
          category: 'MOBILE_GENERATOR',
          requiredQuantity: 4,
          knownAvailableQuantity: 0,
          resourceGap: 4,
          availabilityStatus: 'UNKNOWN',
          readinessPercentage: 0,
          isUncertain: true,
        },
      ],
      gaps: [
        {
          gapId: 'gap-101-1',
          domain: 'ENGINEERING_CREW' as any,
          gapType: 'CREW_SHORTAGE',
          severity: 'HIGH',
          description: 'Deficit of 2 municipal engineering standby crews for Benz Circle.',
          evidence: 'Shift allocation telemetry log 404',
          confidence: 85,
          dataSource: 'RESILIENCE_PREPAREDNESS',
          requiresHumanApproval: true,
        },
        {
          gapId: 'gap-101-2',
          domain: 'UTILITY',
          gapType: 'RESOURCE_SHORTAGE',
          severity: 'MEDIUM',
          description: 'Mobile power generator availability status is UNKNOWN.',
          evidence: 'Unverified telemetry stream',
          confidence: 60,
          dataSource: 'RESILIENCE_PREPAREDNESS',
          requiresHumanApproval: true,
        },
      ],
      operationalRisks: [
        { riskId: 'risk-1', riskName: 'Substation 4B Inundation Risk', impactScore: 80, probabilityScore: 65, combinedRiskScore: 52, category: 'INFRASTRUCTURE' },
      ],
      constraints: [
        { constraintId: 'cnst-1', type: 'BUDGET', description: 'Budget limit $50,000', isViolated: false },
      ],
      options: [
        {
          optionId: 'opt-bal-1',
          strategy: 'BALANCED_READINESS',
          title: 'Balanced Preparedness Pre-positioning',
          description: 'Allocates standby engineering crews and verifies generator availability.',
          estimatedCostUsd: 18500,
          estimatedPreparationTimeMinutes: 90,
          expectedRiskReduction: 68,
          expectedPopulationProtection: 78,
          serviceContinuityScore: 82,
          resourceRequirements: ['2x Engineering Crew', '2x Mobile Generator'],
          constraints: [],
          confidence: 88,
          dataSource: 'RESILIENCE_PREPAREDNESS',
          requiresHumanApproval: true,
        },
      ],
      comparison: {
        readinessId: 'res-readiness-101',
        options: [],
        recommendedOptionId: 'opt-bal-1',
        comparisonMatrix: [
          {
            optionId: 'opt-bal-1',
            strategy: 'BALANCED_READINESS',
            riskReductionLabel: 'High (68%)',
            costLabel: 'Medium ($18,500)',
            preparationTimeLabel: 'Low (90m)',
            populationProtectionLabel: 'High (78%)',
          },
        ],
      },
      recommendation: {
        recommendationId: 'rec-res-101',
        readinessId: 'res-readiness-101',
        recommendedOptionId: 'opt-bal-1',
        title: 'Adopt Balanced Preparedness Pre-positioning Plan',
        summary: 'Pre-positions 2 engineering standby crews and resolves mobile generator telemetry gaps.',
        rationale: 'Provides optimal population protection at reasonable cost.',
        expectedBenefit: '68% risk reduction delta across Substation 4B flood plain.',
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
        provenance: 'RESILIENCE_PREPAREDNESS',
      },
      createdAt: now,
      updatedAt: now,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'RESILIENCE_PREPAREDNESS',
    };

    this.entities.set(seed1.id, seed1);
    this.historyLedger.set(seed1.id, [
      {
        eventId: `acc-res-${Date.now()}-1`,
        readinessId: seed1.id,
        userId: 'SYSTEM_SEEDS',
        action: 'ASSESSMENT_CREATED',
        timestamp: now,
      },
    ]);
  }

  public createReadiness(input: CityResilienceReadinessInputDto): CityResilienceReadinessEntity {
    const id = `res-readiness-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const entity: CityResilienceReadinessEntity = {
      id,
      cityId: input.cityId,
      title: input.title,
      description: input.description,
      status: 'DRAFT',
      scores: {
        overallReadinessScore: 50,
        criticalDomainReadiness: 50,
        resourceReadiness: 50,
        operationalReadiness: 50,
        infrastructureReadiness: 50,
        responseReadiness: 50,
        crossDomainReadiness: 50,
      },
      domains: [],
      resourceReadiness: [],
      gaps: [],
      operationalRisks: [],
      constraints: [],
      options: [],
      createdAt: now,
      updatedAt: now,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'RESILIENCE_PREPAREDNESS',
    };

    this.entities.set(id, entity);
    this.historyLedger.set(id, [
      {
        eventId: `acc-res-${Date.now()}`,
        readinessId: id,
        userId: 'SYSTEM_ORCHESTRATOR',
        action: 'ASSESSMENT_CREATED',
        timestamp: now,
      },
    ]);

    this.recordAudit({
      auditId: `aud-res-${Date.now()}`,
      readinessId: id,
      eventType: 'READINESS_ASSESSMENT_CREATED',
      userId: 'SYSTEM_ORCHESTRATOR',
      summary: `Created resilience readiness assessment '${id}' for '${input.title}'`,
      timestamp: now,
      provenance: 'RESILIENCE_PREPAREDNESS',
    });

    logger.info(`[MemoryCityResilienceReadinessRepository] Created entity '${id}'`);
    return entity;
  }

  public getReadiness(id: string): CityResilienceReadinessEntity | undefined {
    return this.entities.get(id);
  }

  public listReadiness(cityId?: string, status?: CityResilienceReadinessStatus): CityResilienceReadinessEntity[] {
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
    newStatus: CityResilienceReadinessStatus,
    userId: string,
    operatorNotes?: string
  ): CityResilienceReadinessEntity {
    const entity = this.entities.get(id);
    if (!entity) {
      throw new Error(`Resilience readiness assessment '${id}' not found.`);
    }

    // Terminal decision duplicate protection
    if (['APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(entity.status) && ['APPROVED', 'REJECTED'].includes(newStatus)) {
      throw new Error(`RESILIENCE_DECISION_ALREADY_DECIDED: Assessment '${id}' is in terminal state '${entity.status}' and cannot be re-decided.`);
    }

    const previousStatus = entity.status;
    const now = new Date().toISOString();
    entity.status = newStatus;
    entity.updatedAt = now;

    const history = this.historyLedger.get(id) || [];
    history.push({
      eventId: `acc-res-${Date.now()}`,
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
      auditId: `aud-res-${Date.now()}`,
      readinessId: id,
      eventType: `STATUS_${newStatus}`,
      userId,
      summary: `Updated resilience assessment '${id}' status from ${previousStatus} to ${newStatus}`,
      timestamp: now,
      provenance: 'RESILIENCE_PREPAREDNESS',
    });

    return entity;
  }

  public saveApproval(approval: CityReadinessApprovalDto): CityReadinessApprovalDto {
    this.approvals.set(approval.readinessId, approval);
    this.recordAudit({
      auditId: `aud-res-${Date.now()}`,
      readinessId: approval.readinessId,
      eventType: `APPROVAL_${approval.decision}`,
      userId: approval.userId,
      summary: `User '${approval.userId}' recorded decision '${approval.decision}' for resilience readiness '${approval.readinessId}'`,
      timestamp: approval.timestamp,
      provenance: 'RESILIENCE_PREPAREDNESS',
    });
    return approval;
  }

  public recordAudit(audit: CityReadinessAuditDto) {
    this.auditLedger.unshift(audit);
  }

  public getHistory(id: string): any[] {
    return this.historyLedger.get(id) || [];
  }

  public getApproval(id: string): CityReadinessApprovalDto | undefined {
    return this.approvals.get(id);
  }

  public getAuditLedger(): CityReadinessAuditDto[] {
    return this.auditLedger;
  }

  public getSummary(): CityReadinessSummaryDto {
    const all = Array.from(this.entities.values());
    const assessed = all.filter((e) => e.status === 'ASSESSED' || e.status === 'OPTIONS_GENERATED').length;
    const awaitingApproval = all.filter((e) => e.status === 'AWAITING_APPROVAL').length;
    const approved = all.filter((e) => e.status === 'APPROVED' || e.status === 'ACTIVE').length;
    const gapsCount = all.reduce((acc, e) => acc + e.gaps.length, 0);

    const avgScore = all.length > 0
      ? Math.round(all.reduce((acc, e) => acc + e.scores.overallReadinessScore, 0) / all.length)
      : 50;

    return {
      totalAssessments: all.length,
      assessedCount: assessed,
      awaitingApprovalCount: awaitingApproval,
      approvedCount: approved,
      activeGapCount: gapsCount,
      averageReadinessScore: avgScore,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'RESILIENCE_PREPAREDNESS',
      updatedAt: new Date().toISOString(),
    };
  }
}

export const memoryCityResilienceReadinessRepository = new MemoryCityResilienceReadinessRepository();
