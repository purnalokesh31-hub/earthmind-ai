// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 Mega Prompt 1/6
// City Governance & Policy Engine Repository
// Deterministic In-Memory Persistence & Policy Ledger
// ──────────────────────────────────────────────────────────────

import {
  GovernancePolicyEntity,
  GovernancePolicyInputDto,
  GovernancePolicyStatus,
  GovernancePolicyEvaluationDto,
  GovernancePolicyViolationDto,
  GovernancePolicyOverrideDto,
  GovernancePolicyAuditDto,
  GovernancePolicyHistoryDto,
  GovernanceGovernanceSummaryDto,
} from '../domain/digital-twin/city-governance.domain';
import { logger } from '../logger';

export class MemoryCityGovernanceRepository {
  private policies: Map<string, GovernancePolicyEntity> = new Map();
  private policyHistory: Map<string, GovernancePolicyHistoryDto[]> = new Map();
  private evaluations: Map<string, GovernancePolicyEvaluationDto> = new Map();
  private violations: Map<string, GovernancePolicyViolationDto> = new Map();
  private escalations: Map<string, GovernancePolicyEvaluationDto> = new Map();
  private overrides: Map<string, GovernancePolicyOverrideDto> = new Map();
  private auditTrail: GovernancePolicyAuditDto[] = [];

  constructor() {
    this.seedDefaultPolicies();
  }

  private seedDefaultPolicies() {
    const defaultPolicies: GovernancePolicyEntity[] = [
      {
        policyId: 'pol-gov-human-auth',
        name: 'Mandatory Human Authorization Safety Policy',
        description: 'Mandates that all consequential physical, municipal, or operational recommendations require human approval.',
        version: 1,
        status: 'ACTIVE',
        category: 'HUMAN_AUTHORIZATION',
        priority: 100,
        scope: { environment: 'ALL' },
        rules: [
          {
            ruleId: 'rule-auth-01',
            name: 'Require Operator Authorization',
            category: 'HUMAN_AUTHORIZATION',
            conditions: [
              {
                field: 'requiresHumanApproval',
                operator: 'EQ',
                targetValue: false,
                explanation: 'requiresHumanApproval MUST NEVER be set to false.',
              },
            ],
            action: {
              actionType: 'BLOCK',
              message: 'Autonomous execution is prohibited by system governance policy.',
            },
            priority: 100,
          },
        ],
        thresholds: {
          lowRiskMax: 20,
          guardedRiskMax: 40,
          elevatedRiskMax: 60,
          highRiskMax: 80,
          criticalRiskMin: 81,
          highConfidenceMin: 85,
          mediumConfidenceMin: 65,
          lowConfidenceMin: 40,
        },
        escalationRules: [
          {
            escalationId: 'esc-auth-01',
            triggerCategory: 'HUMAN_AUTHORIZATION',
            requiredLevel: 'CITY_COMMANDER',
            explanation: 'Critical citywide interventions require City Commander authorization.',
          },
        ],
        authorizationRequirements: [
          {
            actionType: 'INTERVENTION_PLANNING',
            minRiskTier: 'HIGH',
            requiredLevel: 'CITY_COMMANDER',
            requiresDoubleSignOff: true,
          },
        ],
        provenance: 'GOVERNANCE',
        createdBy: 'SYSTEM_ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requiresHumanApproval: true,
      },
      {
        policyId: 'pol-gov-risk-tiering',
        name: 'Enterprise Risk Threshold & Classification Policy',
        description: 'Establishes risk tier boundaries (Low, Guarded, Elevated, High, Critical) for citywide multi-domain intelligence.',
        version: 1,
        status: 'ACTIVE',
        category: 'RISK',
        priority: 90,
        scope: { environment: 'ALL' },
        rules: [],
        thresholds: {
          lowRiskMax: 20,
          guardedRiskMax: 40,
          elevatedRiskMax: 60,
          highRiskMax: 80,
          criticalRiskMin: 81,
          highConfidenceMin: 85,
          mediumConfidenceMin: 65,
          lowConfidenceMin: 40,
        },
        escalationRules: [
          {
            escalationId: 'esc-risk-critical',
            triggerCategory: 'RISK',
            requiredLevel: 'EMERGENCY_COMMANDER',
            explanation: 'Critical risk scores (>=81) trigger Emergency Commander advisory escalation.',
          },
        ],
        authorizationRequirements: [],
        provenance: 'GOVERNANCE',
        createdBy: 'SYSTEM_ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requiresHumanApproval: true,
      },
    ];

    for (const pol of defaultPolicies) {
      this.policies.set(pol.policyId, pol);
      this.policyHistory.set(pol.policyId, [
        {
          policyId: pol.policyId,
          version: 1,
          status: 'ACTIVE',
          changedBy: 'SYSTEM_ADMIN',
          timestamp: pol.createdAt,
          changeSummary: 'Seeded default governance policy.',
        },
      ]);
    }
  }

  public createPolicy(input: GovernancePolicyInputDto): GovernancePolicyEntity {
    const policyId = `pol-gov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const entity: GovernancePolicyEntity = {
      policyId,
      name: input.name,
      description: input.description,
      version: 1,
      status: 'DRAFT',
      category: input.category,
      priority: input.priority || 50,
      scope: input.scope || { environment: 'ALL' },
      rules: input.rules || [],
      thresholds: {
        lowRiskMax: input.thresholds?.lowRiskMax ?? 20,
        guardedRiskMax: input.thresholds?.guardedRiskMax ?? 40,
        elevatedRiskMax: input.thresholds?.elevatedRiskMax ?? 60,
        highRiskMax: input.thresholds?.highRiskMax ?? 80,
        criticalRiskMin: input.thresholds?.criticalRiskMin ?? 81,
        highConfidenceMin: input.thresholds?.highConfidenceMin ?? 85,
        mediumConfidenceMin: input.thresholds?.mediumConfidenceMin ?? 65,
        lowConfidenceMin: input.thresholds?.lowConfidenceMin ?? 40,
      },
      escalationRules: input.escalationRules || [],
      authorizationRequirements: [],
      provenance: 'GOVERNANCE',
      createdBy: input.createdBy || 'SYSTEM_OPERATOR',
      createdAt: now,
      updatedAt: now,
      requiresHumanApproval: true,
    };

    this.policies.set(policyId, entity);
    this.policyHistory.set(policyId, [
      {
        policyId,
        version: 1,
        status: 'DRAFT',
        changedBy: entity.createdBy,
        timestamp: now,
        changeSummary: 'Created draft governance policy.',
      },
    ]);

    this.recordAudit({
      auditId: `aud-${Date.now()}`,
      eventType: 'POLICY_CREATED',
      policyId,
      userId: entity.createdBy,
      summary: `Created draft governance policy '${entity.name}'`,
      timestamp: now,
      provenance: 'GOVERNANCE',
    });

    logger.info(`[MemoryCityGovernanceRepository] Created policy '${policyId}' (${entity.name})`);
    return entity;
  }

  public getPolicy(policyId: string): GovernancePolicyEntity | undefined {
    return this.policies.get(policyId);
  }

  public listPolicies(status?: GovernancePolicyStatus, category?: string): GovernancePolicyEntity[] {
    let list = Array.from(this.policies.values());
    if (status) {
      list = list.filter((p) => p.status === status);
    }
    if (category) {
      list = list.filter((p) => p.category === category);
    }
    return list;
  }

  public setPolicyStatus(policyId: string, status: GovernancePolicyStatus, userId: string): GovernancePolicyEntity {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error(`Governance policy '${policyId}' not found`);
    }

    // Validate lifecycle transition rules
    const validTransitions: Record<GovernancePolicyStatus, GovernancePolicyStatus[]> = {
      DRAFT: ['ACTIVE', 'ARCHIVED'],
      ACTIVE: ['SUSPENDED', 'DEPRECATED', 'ARCHIVED'],
      SUSPENDED: ['ACTIVE', 'ARCHIVED'],
      DEPRECATED: ['ARCHIVED'],
      ARCHIVED: [],
    };

    if (!validTransitions[policy.status].includes(status)) {
      throw new Error(`Invalid policy lifecycle transition from '${policy.status}' to '${status}'`);
    }

    const now = new Date().toISOString();
    policy.status = status;
    policy.updatedAt = now;

    const history = this.policyHistory.get(policyId) || [];
    history.push({
      policyId,
      version: policy.version,
      status,
      changedBy: userId,
      timestamp: now,
      changeSummary: `Status transitioned from ${policy.status} to ${status}`,
    });
    this.policyHistory.set(policyId, history);

    this.recordAudit({
      auditId: `aud-${Date.now()}`,
      eventType: `POLICY_STATUS_${status}`,
      policyId,
      userId,
      summary: `Updated policy '${policyId}' status to ${status}`,
      timestamp: now,
      provenance: 'GOVERNANCE',
    });

    return policy;
  }

  public createVersion(policyId: string, updates: Partial<GovernancePolicyInputDto>, userId: string): GovernancePolicyEntity {
    const existing = this.policies.get(policyId);
    if (!existing) {
      throw new Error(`Policy '${policyId}' not found`);
    }

    const now = new Date().toISOString();
    existing.version += 1;
    existing.name = updates.name || existing.name;
    existing.description = updates.description || existing.description;
    existing.priority = updates.priority || existing.priority;
    existing.updatedAt = now;

    const history = this.policyHistory.get(policyId) || [];
    history.push({
      policyId,
      version: existing.version,
      status: existing.status,
      changedBy: userId,
      timestamp: now,
      changeSummary: `Bumped version to ${existing.version}`,
    });
    this.policyHistory.set(policyId, history);

    return existing;
  }

  public recordEvaluation(evaluation: GovernancePolicyEvaluationDto): GovernancePolicyEvaluationDto {
    this.evaluations.set(evaluation.evaluationId, evaluation);
    if (evaluation.escalationLevel !== 'NONE') {
      this.escalations.set(evaluation.evaluationId, evaluation);
    }
    evaluation.violations.forEach((v) => {
      this.violations.set(v.violationId, v);
    });

    this.recordAudit({
      auditId: `aud-${Date.now()}`,
      eventType: 'POLICY_EVALUATION',
      evaluationId: evaluation.evaluationId,
      summary: `Evaluated governance decision '${evaluation.governanceDecision}' for target '${evaluation.targetId}'`,
      timestamp: evaluation.evaluatedAt,
      provenance: 'GOVERNANCE',
    });

    return evaluation;
  }

  public recordOverride(override: GovernancePolicyOverrideDto): GovernancePolicyOverrideDto {
    this.overrides.set(override.overrideId, override);
    this.recordAudit({
      auditId: `aud-${Date.now()}`,
      eventType: 'POLICY_OVERRIDE',
      policyId: override.policyId,
      evaluationId: override.evaluationId,
      userId: override.operatorUserId,
      summary: `Recorded controlled policy override for policy '${override.policyId}' by user '${override.operatorUserId}'`,
      timestamp: override.timestamp,
      provenance: 'GOVERNANCE',
    });
    return override;
  }

  public recordAudit(audit: GovernancePolicyAuditDto) {
    this.auditTrail.unshift(audit);
  }

  public getHistory(policyId: string): GovernancePolicyHistoryDto[] {
    return this.policyHistory.get(policyId) || [];
  }

  public getEvaluations(): GovernancePolicyEvaluationDto[] {
    return Array.from(this.evaluations.values());
  }

  public getViolations(): GovernancePolicyViolationDto[] {
    return Array.from(this.violations.values());
  }

  public getEscalations(): GovernancePolicyEvaluationDto[] {
    return Array.from(this.escalations.values());
  }

  public getOverrides(): GovernancePolicyOverrideDto[] {
    return Array.from(this.overrides.values());
  }

  public getAuditTrail(): GovernancePolicyAuditDto[] {
    return this.auditTrail;
  }

  public getSummary(): GovernanceGovernanceSummaryDto {
    const activePolicies = Array.from(this.policies.values()).filter((p) => p.status === 'ACTIVE');
    const violations = Array.from(this.violations.values());
    const escalations = Array.from(this.escalations.values());
    const overrides = Array.from(this.overrides.values());

    const riskDistribution: Record<string, number> = {
      LOW: 0,
      GUARDED: 0,
      ELEVATED: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    Array.from(this.evaluations.values()).forEach((e) => {
      if (e.riskTier in riskDistribution) {
        riskDistribution[e.riskTier] += 1;
      }
    });

    const isCriticalBlocked = violations.some((v) => v.severity === 'CRITICAL' && v.blocking);

    return {
      activePolicyCount: activePolicies.length,
      totalEvaluations: this.evaluations.size,
      activeViolationsCount: violations.length,
      pendingEscalationsCount: escalations.length,
      activeOverridesCount: overrides.length,
      riskDistribution: riskDistribution as any,
      governanceStatus: isCriticalBlocked ? 'CRITICAL_GOVERNANCE_BLOCKED' : violations.length > 0 ? 'WARNING' : 'HEALTHY',
      updatedAt: new Date().toISOString(),
      requiresHumanApproval: true,
      provenance: 'GOVERNANCE',
    };
  }
}

export const memoryCityGovernanceRepository = new MemoryCityGovernanceRepository();
