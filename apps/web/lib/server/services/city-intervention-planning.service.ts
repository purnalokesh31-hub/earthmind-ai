// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// Citywide Intervention Planning Service
// ──────────────────────────────────────────────────────────────

import {
  CityInterventionInputDto,
  CityInterventionPlanEntity,
  CityInterventionActionDto,
  CityInterventionSequenceDto,
  CityInterventionSequenceStepDto,
  CityInterventionDomainDto,
  CityInterventionObjectiveDto,
} from '../domain/digital-twin/city-intervention.domain';
import { logger } from '../logger';

export class CityInterventionPlanningService {
  public generateInterventionPlan(input: CityInterventionInputDto): CityInterventionPlanEntity {
    const interventionId = `int-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const targetDomains = input.targetDomains && input.targetDomains.length > 0
      ? input.targetDomains
      : ['CLIMATE', 'UTILITY', 'MOBILITY', 'EMERGENCY'];

    const targetZones = input.targetZones && input.targetZones.length > 0
      ? input.targetZones
      : ['Central Business District', 'Benz Circle Junction', 'Eluru Canal Spillway'];

    const domains: CityInterventionDomainDto[] = targetDomains.map((d) => {
      let risk = 65.0;
      let status = 'ELEVATED';
      if (d === 'CLIMATE') { risk = 78.5; status = 'ELEVATED'; }
      if (d === 'UTILITY') { risk = 72.0; status = 'ELEVATED'; }
      if (d === 'EMERGENCY') { risk = 82.0; status = 'CRITICAL'; }
      if (d === 'MOBILITY') { risk = 68.0; status = 'GUARDED'; }
      return {
        domain: d as any,
        primaryRiskScore: risk,
        vulnerabilityIndex: risk * 0.82,
        impactedAssetsCount: Math.floor(risk / 6),
        status: status as any,
      };
    });

    const objectives: CityInterventionObjectiveDto[] = [
      {
        objectiveId: `obj-${Date.now()}-1`,
        name: 'Minimize Multi-Domain Cascade Risk',
        type: input.optimizationObjective || 'BALANCED',
        targetValue: 35.0,
        currentValue: 78.5,
        unit: 'risk_points',
        priority: 'CRITICAL',
      },
      {
        objectiveId: `obj-${Date.now()}-2`,
        name: 'Maximize Resident Population Benefit',
        type: 'MAXIMIZE_POPULATION_PROTECTION',
        targetValue: 45000,
        currentValue: 12000,
        unit: 'residents',
        priority: 'HIGH',
      },
      {
        objectiveId: `obj-${Date.now()}-3`,
        name: 'Cap Intervention Budget Expenditure',
        type: 'MINIMIZE_COST',
        targetValue: input.budgetConstraintUsd || 15000,
        currentValue: 8800,
        unit: 'USD',
        priority: 'MEDIUM',
      },
    ];

    const actions = this.generateCandidateActions(targetDomains as any, targetZones);
    const sequence = this.generateOrderedSequence(interventionId, actions);

    const totalCostUsd = actions.reduce((acc, a) => acc + a.estimatedCostUsd, 0);
    const totalDurationHours = sequence.totalDurationHours;

    const plan: CityInterventionPlanEntity = {
      interventionId,
      cityId: input.cityId,
      scenarioId: input.scenarioId,
      predictionId: input.predictionId,
      decisionId: input.decisionId,
      title: input.title || `Citywide Intervention Plan for ${input.cityId}`,
      description: input.description || `Generated intervention plan addressing multi-domain risks across ${targetDomains.join(', ')}.`,
      status: 'DRAFT',
      requestedBy: input.requestedBy || 'SYSTEM_OPERATOR',
      createdAt: now,
      updatedAt: now,
      optimizationObjective: input.optimizationObjective || 'BALANCED',
      budgetConstraintUsd: input.budgetConstraintUsd || 15000,
      maxDowntimeHours: input.maxDowntimeHours || 4.0,
      domains,
      objectives,
      actions,
      sequence,
      dependencies: [],
      constraints: [],
      resources: [],
      impacts: [],
      riskReductions: [],
      auditTrail: [
        {
          auditId: `aud-${Date.now()}-1`,
          interventionId,
          eventType: 'CREATED',
          userId: input.requestedBy,
          timestamp: now,
          previousStatus: 'DRAFT',
          newStatus: 'DRAFT',
          summary: `Intervention plan '${interventionId}' created in DRAFT state.`,
          dataSource: 'INTERVENTION_PLANNING',
        },
      ],
      validationStatus: 'REQUIRES_REVIEW',
      validationReasons: ['Plan created; pending analytical pipeline run.'],
      requiresHumanApproval: true,
      dataSource: 'INTERVENTION_PLANNING',
    };

    logger.info(`[CityInterventionPlanningService] Generated draft intervention plan '${interventionId}' with ${actions.length} actions ($${totalCostUsd}, ${totalDurationHours}h)`);
    return plan;
  }

  public generateCandidateActions(
    domains: Array<'CLIMATE' | 'MOBILITY' | 'TRANSIT' | 'UTILITY' | 'EMERGENCY' | 'CITIZEN'>,
    zones: string[]
  ): CityInterventionActionDto[] {
    const actions: CityInterventionActionDto[] = [];
    const zone1 = zones[0] || 'Central Zone';
    const zone2 = zones[1] || 'Corridor Zone';

    if (domains.includes('CLIMATE')) {
      actions.push({
        actionId: 'act-climate-1',
        domain: 'CLIMATE',
        priority: 1,
        title: 'Deploy Heavy-Duty Mobile Flood Drainage Pumps',
        description: 'Position 2 high-capacity diesel pump trucks to remove surface water build-up at key choke points.',
        affectedZones: [zone1],
        estimatedDurationHours: 1.5,
        requiredResources: ['Heavy Pump Truck (2)', 'Drainage Crew Alpha (4)'],
        dependencies: [],
        expectedImpactScore: 88.0,
        riskReductionPoints: 24.5,
        populationBenefitCount: 18500,
        estimatedCostUsd: 3200,
        requiresHumanApproval: true,
        dataSource: 'INTERVENTION_PLANNING',
      });
    }

    if (domains.includes('MOBILITY')) {
      actions.push({
        actionId: 'act-mobility-1',
        domain: 'MOBILITY',
        priority: 2,
        title: 'Reroute Civilian Traffic & Establish Green Emergency Corridor',
        description: 'Divert non-essential vehicles onto elevated bypass and reserve main avenue for emergency vehicles.',
        affectedZones: [zone1, zone2],
        estimatedDurationHours: 0.5,
        requiredResources: ['Traffic Police Detail (4)', 'VMS Display Boards (6)'],
        dependencies: actions.length > 0 ? [actions[0].actionId] : [],
        expectedImpactScore: 82.0,
        riskReductionPoints: 18.2,
        populationBenefitCount: 22000,
        estimatedCostUsd: 1400,
        requiresHumanApproval: true,
        dataSource: 'INTERVENTION_PLANNING',
      });
    }

    if (domains.includes('UTILITY')) {
      actions.push({
        actionId: 'act-utility-1',
        domain: 'UTILITY',
        priority: 3,
        title: 'Execute Thermal Load Transfer at Primary Substation',
        description: 'Shift 35MW grid load away from flooded substation to adjacent substation to prevent transformer failure.',
        affectedZones: [zone1],
        estimatedDurationHours: 1.0,
        requiredResources: ['Electrical Engineering Crew (3)', 'SCADA Switching Controller'],
        dependencies: actions.length > 1 ? [actions[1].actionId] : [],
        expectedImpactScore: 91.0,
        riskReductionPoints: 28.0,
        populationBenefitCount: 34200,
        estimatedCostUsd: 2800,
        requiresHumanApproval: true,
        dataSource: 'INTERVENTION_PLANNING',
      });
    }

    if (domains.includes('EMERGENCY')) {
      actions.push({
        actionId: 'act-emergency-1',
        domain: 'EMERGENCY',
        priority: 4,
        title: 'Pre-position Mobile Emergency & Rescue Units',
        description: 'Stage 3 Advanced Life Support ambulances and 2 flood rescue teams at elevated staging hubs.',
        affectedZones: [zone2],
        estimatedDurationHours: 0.75,
        requiredResources: ['Ambulance Unit (3)', 'Rescue Boat Crew (4)'],
        dependencies: actions.length > 1 ? [actions[1].actionId] : [],
        expectedImpactScore: 86.0,
        riskReductionPoints: 16.0,
        populationBenefitCount: 14000,
        estimatedCostUsd: 1800,
        requiresHumanApproval: true,
        dataSource: 'INTERVENTION_PLANNING',
      });
    }

    return actions;
  }

  public generateOrderedSequence(
    interventionId: string,
    actions: CityInterventionActionDto[]
  ): CityInterventionSequenceDto {
    let currentHour = 0;
    const steps: CityInterventionSequenceStepDto[] = actions.map((act, index) => {
      const stepNumber = index + 1;
      const parallelGroupId = index === 0 ? 'grp-1' : index <= 2 ? 'grp-2' : 'grp-3';

      const duration = act.estimatedDurationHours;
      currentHour += duration * 0.75;

      return {
        sequenceNumber: stepNumber,
        actionId: act.actionId,
        actionTitle: act.title,
        domain: act.domain,
        prerequisites: act.dependencies,
        estimatedDurationHours: duration,
        parallelGroupId,
        dependencyStatus: act.dependencies.length === 0 ? 'SATISFIED' : 'WAITING',
        resourceRequirement: act.requiredResources,
        operationalRationale: `Step ${stepNumber} (${act.domain}): ${act.description}`,
      };
    });

    return {
      sequenceId: `seq-${interventionId}`,
      interventionId,
      totalDurationHours: Math.round(currentHour * 100) / 100,
      parallelGroupCount: Math.min(steps.length, 3),
      steps,
      requiresHumanApproval: true,
      dataSource: 'INTERVENTION_PLANNING',
    };
  }
}

export const cityInterventionPlanningService = new CityInterventionPlanningService();
