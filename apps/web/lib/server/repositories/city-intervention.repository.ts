// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// City Intervention Repository
// ──────────────────────────────────────────────────────────────

import {
  CityInterventionPlanEntity,
  CityInterventionApprovalDto,
  CityInterventionAuditDto,
  CityInterventionStatus,
} from '../domain/digital-twin/city-intervention.domain';
import { logger } from '../logger';

export class MemoryCityInterventionRepository {
  private interventions = new Map<string, CityInterventionPlanEntity>();
  private approvals = new Map<string, CityInterventionApprovalDto>();
  private auditLogs: CityInterventionAuditDto[] = [];

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const defaultIntervention: CityInterventionPlanEntity = {
      interventionId: 'int-default-1',
      cityId: 'city-vja',
      scenarioId: 'sim-701',
      predictionId: 'pred-801',
      decisionId: 'dec-901',
      title: 'Vijayawada Central Flood & Utility Cascade Response Plan',
      description: 'Coordinated cross-domain intervention plan addressing high-intensity urban inundation, grid substation thermal overload, and emergency corridor preservation.',
      status: 'VALIDATED',
      requestedBy: 'sys-orchestrator',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      optimizationObjective: 'BALANCED',
      budgetConstraintUsd: 15000,
      maxDowntimeHours: 4.0,
      domains: [
        { domain: 'CLIMATE', primaryRiskScore: 78.5, vulnerabilityIndex: 65.0, impactedAssetsCount: 12, status: 'ELEVATED' },
        { domain: 'UTILITY', primaryRiskScore: 72.0, vulnerabilityIndex: 58.0, impactedAssetsCount: 8, status: 'ELEVATED' },
        { domain: 'MOBILITY', primaryRiskScore: 68.0, vulnerabilityIndex: 54.0, impactedAssetsCount: 15, status: 'GUARDED' },
        { domain: 'EMERGENCY', primaryRiskScore: 82.0, vulnerabilityIndex: 71.0, impactedAssetsCount: 5, status: 'CRITICAL' },
      ],
      objectives: [
        { objectiveId: 'obj-1', name: 'Minimize Peak City Risk', type: 'MINIMIZE_RISK', targetValue: 35, currentValue: 78.5, unit: 'points', priority: 'CRITICAL' },
        { objectiveId: 'obj-2', name: 'Protect Resident Population', type: 'MAXIMIZE_POPULATION_PROTECTION', targetValue: 50000, currentValue: 12000, unit: 'residents', priority: 'HIGH' },
        { objectiveId: 'obj-3', name: 'Cap Response Cost', type: 'MINIMIZE_COST', targetValue: 15000, currentValue: 7800, unit: 'USD', priority: 'MEDIUM' },
      ],
      actions: [
        {
          actionId: 'act-1',
          domain: 'CLIMATE',
          priority: 1,
          title: 'Deploy High-Capacity Drainage Pumps at Benz Circle',
          description: 'Deploy 2 Mobile Heavy-Duty Pump Trucks to alleviate 420mm surface water level accumulation.',
          affectedZones: ['Benz Circle Junction', 'Eluru Canal Spillway'],
          estimatedDurationHours: 1.5,
          requiredResources: ['Heavy Pump Truck (2)', 'Drainage Crew Alpha (4)'],
          dependencies: [],
          expectedImpactScore: 88.0,
          riskReductionPoints: 24.5,
          populationBenefitCount: 18500,
          estimatedCostUsd: 3200,
          requiresHumanApproval: true,
          dataSource: 'INTERVENTION_PLANNING',
        },
        {
          actionId: 'act-2',
          domain: 'MOBILITY',
          priority: 2,
          title: 'Activate Traffic Reroute & Emergency Green Corridor',
          description: 'Divert civilian traffic away from flooded Benz Circle onto MG Road Elevated Link and reserve dedicated lane for ambulances.',
          affectedZones: ['Benz Circle Junction', 'MG Road Corridor'],
          estimatedDurationHours: 0.5,
          requiredResources: ['Traffic Police Detail (4)', 'VMS Sign Boards (6)'],
          dependencies: ['act-1'],
          expectedImpactScore: 82.0,
          riskReductionPoints: 18.2,
          populationBenefitCount: 22000,
          estimatedCostUsd: 1400,
          requiresHumanApproval: true,
          dataSource: 'INTERVENTION_PLANNING',
        },
        {
          actionId: 'act-3',
          domain: 'UTILITY',
          priority: 3,
          title: 'Initiate Thermal Load Balancing at Substation #4',
          description: 'Transfer 35MW grid load from flooded Substation #4 to Substation #9 to prevent catastrophic transformer trip.',
          affectedZones: ['Substation #4', 'Substation #9'],
          estimatedDurationHours: 1.0,
          requiredResources: ['Electrical Engineering Crew (3)', 'SCADA Switching Controller'],
          dependencies: ['act-2'],
          expectedImpactScore: 91.0,
          riskReductionPoints: 28.0,
          populationBenefitCount: 34200,
          estimatedCostUsd: 2800,
          requiresHumanApproval: true,
          dataSource: 'INTERVENTION_PLANNING',
        },
        {
          actionId: 'act-4',
          domain: 'EMERGENCY',
          priority: 4,
          title: 'Pre-position Mobile Medical Units & Rescue Boats',
          description: 'Stage 3 Ambulances and 2 Inflatable Rescue Craft at High-Ground Staging Area B.',
          affectedZones: ['Staging Area B', 'Ramavarappadu Corridor'],
          estimatedDurationHours: 0.75,
          requiredResources: ['Ambulance Unit (3)', 'Rescue Boat Crew (4)'],
          dependencies: ['act-2'],
          expectedImpactScore: 86.0,
          riskReductionPoints: 16.0,
          populationBenefitCount: 14000,
          estimatedCostUsd: 1800,
          requiresHumanApproval: true,
          dataSource: 'INTERVENTION_PLANNING',
        },
      ],
      sequence: {
        sequenceId: 'seq-int-default-1',
        interventionId: 'int-default-1',
        totalDurationHours: 2.25,
        parallelGroupCount: 3,
        steps: [
          { sequenceNumber: 1, actionId: 'act-1', actionTitle: 'Deploy High-Capacity Drainage Pumps at Benz Circle', domain: 'CLIMATE', prerequisites: [], estimatedDurationHours: 1.5, parallelGroupId: 'grp-1', dependencyStatus: 'SATISFIED', resourceRequirement: ['Heavy Pump Truck (2)', 'Drainage Crew Alpha (4)'], operationalRationale: 'Drainage pumping at spillway' },
          { sequenceNumber: 2, actionId: 'act-2', actionTitle: 'Activate Traffic Reroute & Emergency Green Corridor', domain: 'MOBILITY', prerequisites: ['act-1'], estimatedDurationHours: 0.5, parallelGroupId: 'grp-2', dependencyStatus: 'SATISFIED', resourceRequirement: ['Traffic Police Detail (4)', 'VMS Sign Boards (6)'], operationalRationale: 'Emergency lane diversion' },
          { sequenceNumber: 3, actionId: 'act-3', actionTitle: 'Initiate Thermal Load Balancing at Substation #4', domain: 'UTILITY', prerequisites: ['act-2'], estimatedDurationHours: 1.0, parallelGroupId: 'grp-2', dependencyStatus: 'SATISFIED', resourceRequirement: ['Electrical Engineering Crew (3)'], operationalRationale: 'Grid load transfer' },
          { sequenceNumber: 4, actionId: 'act-4', actionTitle: 'Pre-position Mobile Medical Units & Rescue Boats', domain: 'EMERGENCY', prerequisites: ['act-2'], estimatedDurationHours: 0.75, parallelGroupId: 'grp-3', dependencyStatus: 'SATISFIED', resourceRequirement: ['Ambulance Unit (3)'], operationalRationale: 'Rescue staging' },
        ],
        requiresHumanApproval: true,
        dataSource: 'INTERVENTION_PLANNING',
      },
      dependencies: [
        { dependencyId: 'dep-1', actionId: 'act-2', dependsOnActionId: 'act-1', dependencyType: 'TEMPORAL', status: 'RESOLVED', explanation: 'Drainage pump deployment must precede traffic corridor activation.' },
        { dependencyId: 'dep-2', actionId: 'act-3', dependsOnActionId: 'act-2', dependencyType: 'OPERATIONAL', status: 'RESOLVED', explanation: 'Emergency green corridor ensures electrical crew unhindered access to Substation #4.' },
        { dependencyId: 'dep-3', actionId: 'act-4', dependsOnActionId: 'act-2', dependencyType: 'SPATIAL', status: 'RESOLVED', explanation: 'Medical pre-positioning relies on cleared traffic route to Staging Area B.' },
      ],
      constraints: [
        { constraintId: 'con-1', type: 'MAX_BUDGET', limitValue: 15000, currentValue: 9200, isViolated: false, severity: 'MODERATE', affectedActionIds: ['act-1', 'act-2', 'act-3', 'act-4'], remediationSuggestion: 'Budget within safe threshold ($9,200 / $15,000).' },
        { constraintId: 'con-2', type: 'MAX_DOWNTIME', limitValue: 4.0, currentValue: 2.25, isViolated: false, severity: 'MODERATE', affectedActionIds: ['act-1', 'act-3'], remediationSuggestion: 'Total sequential downtime (2.25h) is within 4.0h limit.' },
      ],
      resources: [
        { resourceType: 'Heavy Pump Truck', requiredQuantity: 2, availableQuantity: 3, shortageQuantity: 0, assignedActionId: 'act-1', crewCategory: 'Engineering', constraintStatus: 'AVAILABLE', estimatedCostUsd: 3200 },
        { resourceType: 'Traffic Police Detail', requiredQuantity: 4, availableQuantity: 6, shortageQuantity: 0, assignedActionId: 'act-2', crewCategory: 'Public Safety', constraintStatus: 'AVAILABLE', estimatedCostUsd: 1400 },
        { resourceType: 'Electrical Engineering Crew', requiredQuantity: 3, availableQuantity: 3, shortageQuantity: 0, assignedActionId: 'act-3', crewCategory: 'Utility', constraintStatus: 'CONSTRAINED', estimatedCostUsd: 2800 },
        { resourceType: 'Ambulance Unit', requiredQuantity: 3, availableQuantity: 4, shortageQuantity: 0, assignedActionId: 'act-4', crewCategory: 'Emergency', constraintStatus: 'AVAILABLE', estimatedCostUsd: 1800 },
      ],
      impacts: [
        { domain: 'CLIMATE', baselineImpactScore: 78.5, postInterventionImpactScore: 54.0, netImprovementPercent: 31.2, populationProtectedCount: 18500, serviceDisruptionReducedHours: 3.5 },
        { domain: 'UTILITY', baselineImpactScore: 72.0, postInterventionImpactScore: 44.0, netImprovementPercent: 38.9, populationProtectedCount: 34200, serviceDisruptionReducedHours: 5.0 },
        { domain: 'MOBILITY', baselineImpactScore: 68.0, postInterventionImpactScore: 49.8, netImprovementPercent: 26.8, populationProtectedCount: 22000, serviceDisruptionReducedHours: 2.0 },
        { domain: 'EMERGENCY', baselineImpactScore: 82.0, postInterventionImpactScore: 66.0, netImprovementPercent: 19.5, populationProtectedCount: 14000, serviceDisruptionReducedHours: 1.5 },
      ],
      riskReductions: [
        { domain: 'CLIMATE', initialRiskScore: 78.5, residualRiskScore: 54.0, riskPointsReduced: 24.5, confidencePercent: 94.0 },
        { domain: 'UTILITY', initialRiskScore: 72.0, residualRiskScore: 44.0, riskPointsReduced: 28.0, confidencePercent: 92.5 },
        { domain: 'MOBILITY', initialRiskScore: 68.0, residualRiskScore: 49.8, riskPointsReduced: 18.2, confidencePercent: 91.0 },
        { domain: 'EMERGENCY', initialRiskScore: 82.0, residualRiskScore: 66.0, riskPointsReduced: 16.0, confidencePercent: 89.5 },
      ],
      recommendation: {
        recommendationId: 'rec-default-1',
        interventionId: 'int-default-1',
        winningCandidateId: 'cand-opt-1',
        candidateTitle: 'Coordinated Multi-Domain Rapid Surge Response',
        score: 93.4,
        strategy: 'BALANCED',
        rationale: 'Achieves 86.7 aggregate risk reduction points while keeping total operational cost ($9,200) well within the $15,000 budget constraint and sequential duration at 2.25h.',
        expectedRiskReductionPoints: 86.7,
        expectedPopulationProtected: 34200,
        estimatedCostUsd: 9200,
        estimatedDurationHours: 2.25,
        violatedConstraintCount: 0,
        alternatives: [
          { candidateId: 'cand-opt-2', title: 'Maximum Speed Emergency Isolation', score: 87.1, costUsd: 12500, riskReductionPoints: 72.0 },
          { candidateId: 'cand-opt-3', title: 'Low-Cost Utility Load Transfer Only', score: 79.5, costUsd: 4200, riskReductionPoints: 54.5 },
        ],
        requiresHumanApproval: true,
        dataSource: 'INTERVENTION_PLANNING',
      },
      comparison: {
        interventionId: 'int-default-1',
        comparedAt: new Date().toISOString(),
        candidates: [
          { candidateId: 'cand-opt-1', title: 'Coordinated Multi-Domain Rapid Surge Response', rank: 1, overallScore: 93.4, riskReductionPoints: 86.7, responseTimeHours: 2.25, costUsd: 9200, serviceDisruptionPercent: 12.0, populationProtectionCount: 34200, feasibilityStatus: 'FEASIBLE', violatedConstraintsCount: 0 },
          { candidateId: 'cand-opt-2', title: 'Maximum Speed Emergency Isolation', rank: 2, overallScore: 87.1, riskReductionPoints: 72.0, responseTimeHours: 1.25, costUsd: 12500, serviceDisruptionPercent: 18.0, populationProtectionCount: 24000, feasibilityStatus: 'FEASIBLE', violatedConstraintsCount: 0 },
          { candidateId: 'cand-opt-3', title: 'Low-Cost Utility Load Transfer Only', rank: 3, overallScore: 79.5, riskReductionPoints: 54.5, responseTimeHours: 3.50, costUsd: 4200, serviceDisruptionPercent: 32.0, populationProtectionCount: 18000, feasibilityStatus: 'FEASIBLE', violatedConstraintsCount: 0 },
        ],
        bestForRiskReductionCandidateId: 'cand-opt-1',
        bestForCostCandidateId: 'cand-opt-3',
        bestForSpeedCandidateId: 'cand-opt-2',
        requiresHumanApproval: true,
        dataSource: 'INTERVENTION_PLANNING',
      },
      auditTrail: [
        { auditId: 'aud-1', interventionId: 'int-default-1', eventType: 'CREATED', timestamp: new Date(Date.now() - 3600000).toISOString(), previousStatus: 'DRAFT', newStatus: 'DRAFT', summary: 'Intervention plan created from decision priorities.', dataSource: 'INTERVENTION_PLANNING' },
        { auditId: 'aud-2', interventionId: 'int-default-1', eventType: 'ANALYSIS_STARTED', timestamp: new Date(Date.now() - 3300000).toISOString(), previousStatus: 'DRAFT', newStatus: 'ANALYZING', summary: 'Analytical pipeline initiated for multi-domain coordination.', dataSource: 'INTERVENTION_PLANNING' },
        { auditId: 'aud-3', interventionId: 'int-default-1', eventType: 'VALIDATION_COMPLETED', timestamp: new Date(Date.now() - 3000000).toISOString(), previousStatus: 'ANALYZING', newStatus: 'VALIDATED', summary: 'Constraint validation passed with 0 violations.', dataSource: 'INTERVENTION_PLANNING' },
      ],
      validationStatus: 'VALID',
      validationReasons: ['All 4 cross-domain actions passed constraint checks ($9,200 <= $15,000 budget; 2.25h <= 4.0h downtime).'],
      requiresHumanApproval: true,
      dataSource: 'INTERVENTION_PLANNING',
    };

    this.interventions.set(defaultIntervention.interventionId, defaultIntervention);
  }

  public save(intervention: CityInterventionPlanEntity): CityInterventionPlanEntity {
    intervention.updatedAt = new Date().toISOString();
    this.interventions.set(intervention.interventionId, intervention);
    logger.info(`[MemoryCityInterventionRepository] Saved intervention '${intervention.interventionId}' (${intervention.status})`);
    return intervention;
  }

  public findById(id: string): CityInterventionPlanEntity | undefined {
    return this.interventions.get(id);
  }

  public findAll(cityId?: string): CityInterventionPlanEntity[] {
    const list = Array.from(this.interventions.values());
    if (!cityId) return list;
    return list.filter((i) => i.cityId.toLowerCase() === cityId.toLowerCase());
  }

  public saveApproval(arg1: any, arg2?: any): any {
    const approval = arg2 || arg1;
    const scenarioId = arg2 ? arg1 : (approval.interventionId || approval.scenarioId);
    if (scenarioId && this.legacyScenarios.has(scenarioId)) {
      this.legacyApprovals.set(scenarioId, approval);
      const scenario = this.legacyScenarios.get(scenarioId);
      if (scenario) {
        scenario.approval = approval;
        scenario.status = 'APPROVED';
      }
      return scenario;
    }
    this.approvals.set(approval.approvalId || `appr-${Date.now()}`, approval);
    const intervention = this.findById(approval.interventionId);
    if (intervention) {
      intervention.approval = approval;
      intervention.status = approval.newStatus;
      intervention.updatedAt = new Date().toISOString();

      if (approval.decision === 'APPROVED') {
        intervention.execution = {
          executionId: `exec-${Date.now()}`,
          interventionId: approval.interventionId,
          approvalId: approval.approvalId,
          workflowTriggered: 'DISPATCH_MUNICIPAL_WORKFLOW_APPROVAL_GATEWAY',
          executionMode: 'ADVISORY_APPROVED_WORKFLOW',
          initiatedByUserId: approval.userId,
          startedAt: new Date().toISOString(),
          status: 'PENDING_WORKFLOW_DISPATCH',
          notes: 'Advisory intervention plan authorized by operator. Routing to municipal dispatch gateway.',
          requiresHumanApproval: true,
        };
      }

      this.save(intervention);
    }
    logger.info(`[MemoryCityInterventionRepository] Recorded approval '${approval.approvalId}' (${approval.decision}) for intervention '${approval.interventionId}'`);
    return approval;
  }

  public findApprovalById(approvalId: string): CityInterventionApprovalDto | undefined {
    return this.approvals.get(approvalId);
  }

  public findApprovalByInterventionId(interventionId: string): CityInterventionApprovalDto | undefined {
    return Array.from(this.approvals.values()).find((a) => a.interventionId === interventionId);
  }

  public addAuditLog(log: CityInterventionAuditDto): CityInterventionAuditDto {
    this.auditLogs.push(log);
    const intervention = this.findById(log.interventionId);
    if (intervention) {
      if (!intervention.auditTrail) intervention.auditTrail = [];
      intervention.auditTrail.push(log);
    }
    return log;
  }

  public getAuditLogs(interventionId?: string): CityInterventionAuditDto[] {
    if (!interventionId) return [...this.auditLogs];
    return this.auditLogs.filter((l) => l.interventionId === interventionId);
  }
  private legacyScenarios = new Map<string, any>();
  private legacyApprovals = new Map<string, any>();

  public create(entity: any): any {
    this.legacyScenarios.set(entity.scenarioId, entity);
    return entity;
  }

  public getById(id: string): any {
    return this.legacyScenarios.get(id);
  }

  public list(cityId?: string): any[] {
    const all = Array.from(this.legacyScenarios.values());
    if (!cityId) return all;
    return all.filter((s) => s.cityId === cityId);
  }

  public update(id: string, updates: any): any {
    const existing = this.legacyScenarios.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.legacyScenarios.set(id, updated);
    return updated;
  }

  public getApprovalByScenarioId(scenarioId: string): any {
    return this.legacyApprovals.get(scenarioId);
  }
}

export const memoryCityInterventionRepository = new MemoryCityInterventionRepository();
export const cityInterventionRepository = memoryCityInterventionRepository;
