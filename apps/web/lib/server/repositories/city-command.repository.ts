// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 2/6
// City Command & Authorization Center Repository
// Deterministic In-Memory Persistence & Append-Only Audit Ledger
// ──────────────────────────────────────────────────────────────

import {
  CityCommandCaseEntity,
  CityCommandCaseInputDto,
  CityCommandCaseStatus,
  CityCommandApprovalDecisionDto,
  CityCommandAuthorizationDto,
  CityCommandEvidenceDto,
  CityCommandEscalationDto,
  CityCommandAuditDto,
  CityCommandHistoryDto,
  CityCommandSummaryDto,
} from '../domain/digital-twin/city-command.domain';
import { logger } from '../logger';

export class MemoryCityCommandRepository {
  private cases: Map<string, CityCommandCaseEntity> = new Map();
  private decisions: Map<string, CityCommandApprovalDecisionDto> = new Map();
  private authorizations: Map<string, CityCommandAuthorizationDto> = new Map();
  private evidenceRequests: Map<string, CityCommandEvidenceDto> = new Map();
  private escalations: Map<string, CityCommandEscalationDto> = new Map();
  private auditLedger: CityCommandAuditDto[] = [];
  private historyLedger: Map<string, CityCommandHistoryDto[]> = new Map();

  constructor() {
    this.seedDefaultCases();
  }

  private seedDefaultCases() {
    const now = new Date().toISOString();
    const defaultCases: CityCommandCaseEntity[] = [
      {
        caseId: 'case-cmd-101',
        title: 'Benz Circle Substation 4B Flood Protection Plan',
        description: 'Multi-domain intervention request to deploy emergency flood barriers and reroute traffic around Substation 4B.',
        cityId: 'city-vja',
        sourceType: 'INTERVENTION_PLANNING',
        sourceReferenceId: 'int-default-1',
        riskScore: 78,
        riskTier: 'HIGH',
        confidenceScore: 88,
        confidenceLevel: 'HIGH_CONFIDENCE',
        populationImpact: 25000,
        serviceImpact: 4500,
        financialImpactUsd: 45000,
        requiredAuthorizationLevel: 'CITY_COMMANDER',
        status: 'PENDING_REVIEW',
        recommendation: {
          recommendationId: 'rec-101',
          title: 'Deploy Substation 4B Flood Protection & Traffic Bypass',
          summary: 'Pre-positions high-capacity mobile pumps and diverts transit routes around flood plain.',
          targetId: 'substation-4b',
          expectedRiskReductionDelta: 86.5,
          estimatedCostUsd: 14500,
          estimatedDurationHours: 3.5,
          requiresHumanApproval: true,
          provenance: 'INTERVENTION_PLANNING',
        },
        createdAt: now,
        updatedAt: now,
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
        provenance: 'GOVERNANCE',
      },
      {
        caseId: 'case-cmd-102',
        title: 'Kishna River Water Level Spike Early Warning Review',
        description: 'Predictive intelligence warning triggering advisory operator review for water gate pressure regulation.',
        cityId: 'city-vja',
        sourceType: 'PREDICTION',
        sourceReferenceId: 'pred-krishna-01',
        riskScore: 62,
        riskTier: 'HIGH',
        confidenceScore: 74,
        confidenceLevel: 'MEDIUM_CONFIDENCE',
        populationImpact: 12000,
        serviceImpact: 2100,
        financialImpactUsd: 18000,
        requiredAuthorizationLevel: 'CITY_COMMANDER',
        status: 'UNDER_REVIEW',
        createdAt: now,
        updatedAt: now,
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
        provenance: 'PREDICTION',
      },
    ];

    for (const c of defaultCases) {
      this.cases.set(c.caseId, c);
      this.historyLedger.set(c.caseId, [
        {
          eventId: `evt-${Date.now()}-1`,
          caseId: c.caseId,
          eventType: 'CASE_CREATED',
          userId: 'SYSTEM_SEEDS',
          timestamp: c.createdAt,
          newStatus: c.status,
          reason: 'Initial command case creation.',
          provenance: c.provenance,
        },
      ]);
    }
  }

  public createCase(input: CityCommandCaseInputDto): CityCommandCaseEntity {
    const caseId = `case-cmd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const entity: CityCommandCaseEntity = {
      caseId,
      title: input.title,
      description: input.description,
      cityId: input.cityId,
      sourceType: input.sourceType,
      sourceReferenceId: input.sourceReferenceId,
      riskScore: input.riskScore,
      riskTier: input.riskTier,
      confidenceScore: input.confidenceScore,
      confidenceLevel: input.confidenceLevel,
      populationImpact: input.populationImpact || 0,
      serviceImpact: input.serviceImpact || 0,
      financialImpactUsd: input.financialImpactUsd || 0,
      requiredAuthorizationLevel: input.requiredAuthorizationLevel || 'OPERATOR',
      status: 'PENDING_REVIEW',
      recommendation: input.recommendation,
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'GOVERNANCE',
    };

    this.cases.set(caseId, entity);
    this.historyLedger.set(caseId, [
      {
        eventId: `evt-${Date.now()}`,
        caseId,
        eventType: 'CASE_CREATED',
        userId: 'SYSTEM_ORCHESTRATOR',
        timestamp: now,
        newStatus: 'PENDING_REVIEW',
        reason: 'Created command review case.',
        provenance: 'GOVERNANCE',
      },
    ]);

    this.recordAudit({
      auditId: `aud-${Date.now()}`,
      caseId,
      eventType: 'CASE_CREATED',
      summary: `Created command case '${caseId}' (${entity.title})`,
      timestamp: now,
      provenance: 'GOVERNANCE',
    });

    logger.info(`[MemoryCityCommandRepository] Created case '${caseId}' (${entity.title})`);
    return entity;
  }

  public getCase(caseId: string): CityCommandCaseEntity | undefined {
    return this.cases.get(caseId);
  }

  public listCases(cityId?: string, status?: CityCommandCaseStatus): CityCommandCaseEntity[] {
    let list = Array.from(this.cases.values());
    if (cityId) {
      list = list.filter((c) => c.cityId === cityId);
    }
    if (status) {
      list = list.filter((c) => c.status === status);
    }
    return list;
  }

  public updateCaseStatus(
    caseId: string,
    newStatus: CityCommandCaseStatus,
    userId: string,
    reason?: string
  ): CityCommandCaseEntity {
    const caseEntity = this.cases.get(caseId);
    if (!caseEntity) {
      throw new Error(`Command case '${caseId}' not found.`);
    }

    // Duplicate / Terminal state protection
    const terminalStates: CityCommandCaseStatus[] = ['APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'ARCHIVED'];
    if (terminalStates.includes(caseEntity.status) && terminalStates.includes(newStatus)) {
      throw new Error(`COMMAND_CASE_ALREADY_DECIDED: Command case '${caseId}' is in terminal state '${caseEntity.status}' and cannot be modified.`);
    }

    const previousStatus = caseEntity.status;
    const now = new Date().toISOString();
    caseEntity.status = newStatus;
    caseEntity.updatedAt = now;

    const history = this.historyLedger.get(caseId) || [];
    history.push({
      eventId: `evt-${Date.now()}`,
      caseId,
      eventType: `STATUS_CHANGED_TO_${newStatus}`,
      userId,
      timestamp: now,
      previousStatus,
      newStatus,
      reason,
      provenance: 'GOVERNANCE',
    });
    this.historyLedger.set(caseId, history);

    this.recordAudit({
      auditId: `aud-${Date.now()}`,
      caseId,
      eventType: `STATUS_${newStatus}`,
      operatorUserId: userId,
      previousStatus,
      newStatus,
      summary: `Updated case '${caseId}' status from ${previousStatus} to ${newStatus}`,
      timestamp: now,
      provenance: 'GOVERNANCE',
    });

    return caseEntity;
  }

  public recordDecision(decision: CityCommandApprovalDecisionDto): CityCommandApprovalDecisionDto {
    this.decisions.set(decision.decisionId, decision);
    this.recordAudit({
      auditId: `aud-${Date.now()}`,
      caseId: decision.caseId,
      eventType: `DECISION_${decision.decision}`,
      operatorUserId: decision.operator.userId,
      operatorRole: decision.operator.role,
      summary: `Operator '${decision.operator.userId}' (${decision.operator.role}) recorded decision '${decision.decision}' on case '${decision.caseId}'`,
      timestamp: decision.decidedAt,
      provenance: 'GOVERNANCE',
    });
    return decision;
  }

  public recordAuthorization(auth: CityCommandAuthorizationDto): CityCommandAuthorizationDto {
    this.authorizations.set(auth.authorizationId, auth);
    return auth;
  }

  public recordEvidenceRequest(req: CityCommandEvidenceDto): CityCommandEvidenceDto {
    this.evidenceRequests.set(req.evidenceRequestId, req);
    this.recordAudit({
      auditId: `aud-${Date.now()}`,
      caseId: req.caseId,
      eventType: 'EVIDENCE_REQUESTED',
      operatorUserId: req.requestedBy,
      summary: `Operator '${req.requestedBy}' requested more evidence for case '${req.caseId}'`,
      timestamp: req.timestamp,
      provenance: 'GOVERNANCE',
    });
    return req;
  }

  public recordEscalation(esc: CityCommandEscalationDto): CityCommandEscalationDto {
    this.escalations.set(esc.escalationId, esc);
    this.recordAudit({
      auditId: `aud-${Date.now()}`,
      caseId: esc.caseId,
      eventType: 'CASE_ESCALATED',
      operatorUserId: esc.requestedBy,
      summary: `Escalated case '${esc.caseId}' from ${esc.fromAuthorizationLevel} to ${esc.toAuthorizationLevel}`,
      timestamp: esc.timestamp,
      provenance: 'GOVERNANCE',
    });
    return esc;
  }

  public recordAudit(audit: CityCommandAuditDto) {
    // Append-only ledger
    this.auditLedger.unshift(audit);
  }

  public getHistory(caseId: string): CityCommandHistoryDto[] {
    return this.historyLedger.get(caseId) || [];
  }

  public getDecisions(): CityCommandApprovalDecisionDto[] {
    return Array.from(this.decisions.values());
  }

  public getEvidenceRequests(): CityCommandEvidenceDto[] {
    return Array.from(this.evidenceRequests.values());
  }

  public getEscalations(): CityCommandEscalationDto[] {
    return Array.from(this.escalations.values());
  }

  public getAuditLedger(): CityCommandAuditDto[] {
    return this.auditLedger;
  }

  public getSummary(): CityCommandSummaryDto {
    const all = Array.from(this.cases.values());
    const pending = all.filter((c) => c.status === 'PENDING_REVIEW').length;
    const underReview = all.filter((c) => c.status === 'UNDER_REVIEW').length;
    const evidenceReq = all.filter((c) => c.status === 'EVIDENCE_REQUESTED').length;
    const approved = all.filter((c) => c.status === 'APPROVED').length;
    const rejected = all.filter((c) => c.status === 'REJECTED').length;
    const escalated = all.filter((c) => c.status === 'ESCALATED').length;

    return {
      totalCases: all.length,
      pendingReviewCount: pending,
      underReviewCount: underReview,
      evidenceRequestedCount: evidenceReq,
      approvedCount: approved,
      rejectedCount: rejected,
      escalatedCount: escalated,
      activeQueueItems: pending + underReview + evidenceReq,
      averageDecisionTimeMinutes: 4.2,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'GOVERNANCE',
      updatedAt: new Date().toISOString(),
    };
  }
}

export const memoryCityCommandRepository = new MemoryCityCommandRepository();
