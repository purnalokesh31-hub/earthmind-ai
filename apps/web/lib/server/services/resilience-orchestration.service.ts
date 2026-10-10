// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Master Resilience Orchestration Service
// Advisory Resilience Planning & State Evaluation Engine
// Zero Physical Action Dispatch
// ──────────────────────────────────────────────────────────────

import {
  ResilienceOrchestrationEntity,
  ResilienceOrchestrationInputDto,
  ResilienceStateDto,
  ResilienceDomainStateDto,
  ResilienceDependencyDto,
  ResilienceThreatDto,
  ResiliencePriorityDto,
  ResilienceClassificationTier,
  ResilienceKpiDto,
} from '../domain/digital-twin/resilience-orchestration.domain';
import { resilienceOrchestrationRepository } from '../repositories/resilience-orchestration.repository';
import { logger } from '../logger';

export class ResilienceOrchestrationService {
  private repo = resilienceOrchestrationRepository;

  async createOrchestration(input: ResilienceOrchestrationInputDto): Promise<ResilienceOrchestrationEntity> {
    const id = `orch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const resilienceState = this.calculateResilienceState(input.cityId);
    const dependencies = this.evaluateStructuralDependencies(input.cityId);
    const priorities = this.generatePriorities(resilienceState);
    const kpis = this.calculateKpis(resilienceState);

    const entity: ResilienceOrchestrationEntity = {
      id,
      cityId: input.cityId,
      status: 'ANALYZING',
      resilienceState,
      dependencies,
      priorities,
      approvals: [],
      outcomes: [],
      kpis,
      requiresHumanApproval: true,
      dataSource: 'SIMULATION',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.repo.create(entity);
  }

  async getOrchestrationById(id: string): Promise<ResilienceOrchestrationEntity | null> {
    return await this.repo.getById(id);
  }

  async listOrchestrations(cityId: string = 'city-vja'): Promise<ResilienceOrchestrationEntity[]> {
    return await this.repo.listByCity(cityId);
  }

  calculateResilienceState(cityId: string): ResilienceStateDto {
    const domainStates: ResilienceDomainStateDto[] = [
      {
        domain: 'CLIMATE',
        riskScore: 78.5,
        resilienceScore: 54.0,
        classification: 'VULNERABLE',
        criticalAssetsCount: 6,
        activeIncidentsCount: 2,
        dependenciesCount: 4,
        resourceRequirementsCount: 12,
        recoveryCapabilityScore: 62.0,
      },
      {
        domain: 'MOBILITY',
        riskScore: 65.0,
        resilienceScore: 68.0,
        classification: 'ELEVATED',
        criticalAssetsCount: 14,
        activeIncidentsCount: 3,
        dependenciesCount: 5,
        resourceRequirementsCount: 8,
        recoveryCapabilityScore: 75.0,
      },
      {
        domain: 'TRANSIT',
        riskScore: 72.0,
        resilienceScore: 58.0,
        classification: 'VULNERABLE',
        criticalAssetsCount: 8,
        activeIncidentsCount: 1,
        dependenciesCount: 3,
        resourceRequirementsCount: 6,
        recoveryCapabilityScore: 65.0,
      },
      {
        domain: 'UTILITY',
        riskScore: 84.0,
        resilienceScore: 42.0,
        classification: 'CRITICAL',
        criticalAssetsCount: 5,
        activeIncidentsCount: 3,
        dependenciesCount: 6,
        resourceRequirementsCount: 15,
        recoveryCapabilityScore: 50.0,
      },
      {
        domain: 'EMERGENCY',
        riskScore: 45.0,
        resilienceScore: 82.0,
        classification: 'GUARDED',
        criticalAssetsCount: 10,
        activeIncidentsCount: 1,
        dependenciesCount: 4,
        resourceRequirementsCount: 10,
        recoveryCapabilityScore: 88.0,
      },
      {
        domain: 'INFRASTRUCTURE',
        riskScore: 60.0,
        resilienceScore: 70.0,
        classification: 'ELEVATED',
        criticalAssetsCount: 18,
        activeIncidentsCount: 0,
        dependenciesCount: 5,
        resourceRequirementsCount: 7,
        recoveryCapabilityScore: 78.0,
      },
      {
        domain: 'CITIZEN_SERVICES',
        riskScore: 35.0,
        resilienceScore: 86.0,
        classification: 'GUARDED',
        criticalAssetsCount: 12,
        activeIncidentsCount: 0,
        dependenciesCount: 2,
        resourceRequirementsCount: 4,
        recoveryCapabilityScore: 92.0,
      },
    ];

    const overallResilienceScore = Math.round(
      domainStates.reduce((acc, d) => acc + d.resilienceScore, 0) / domainStates.length
    );

    let classification: ResilienceClassificationTier = 'GUARDED';
    if (overallResilienceScore < 40) classification = 'CRITICAL';
    else if (overallResilienceScore < 60) classification = 'VULNERABLE';
    else if (overallResilienceScore < 75) classification = 'ELEVATED';
    else if (overallResilienceScore < 90) classification = 'GUARDED';
    else classification = 'RESILIENT';

    const activeThreats: ResilienceThreatDto[] = [
      {
        threatId: 'th-1',
        domain: 'CLIMATE',
        title: 'Severe Coastal Precipitation Flood Vector',
        severity: 'CRITICAL',
        likelihoodPercent: 88,
        timeToImpactHours: 3.5,
        description: '65mm/hr downpour threatening Ward 12 stormwater underpass flooding.',
      },
      {
        threatId: 'th-2',
        domain: 'UTILITY',
        title: 'Substation 4B Thermal Degradation & Inundation Risk',
        severity: 'HIGH',
        likelihoodPercent: 82,
        timeToImpactHours: 2.0,
        description: 'Transformer cooling vault temperature at 98.4°C.',
      },
    ];

    logger.info(`[ResilienceOrchestrationService] Computed overall resilience score ${overallResilienceScore}/100 (${classification}) for city '${cityId}'`);

    return {
      stateId: `state-${Date.now()}`,
      cityId,
      overallResilienceScore,
      classification,
      domainStates,
      criticalVulnerabilities: [
        'Substation 4B auxiliary cooling vault submergence risk',
        'Benz Circle arterial bottleneck delays emergency responder routing',
        'Ward 12 stormwater canal pump station capacity overflow',
      ],
      activeThreats,
      populationExposureCount: 34200,
      serviceDisruptionIndex: 72.5,
      infrastructureExposureIndex: 68.0,
      resourceAvailabilityPercent: 64.0,
      dependencyRiskScore: 78.0,
      recoveryCapacityPercent: 70.0,
      confidencePercent: 94.5,
      dataFreshnessSeconds: 15,
      dataSource: 'SIMULATION',
      evaluatedAt: new Date().toISOString(),
    };
  }

  evaluateStructuralDependencies(cityId: string): ResilienceDependencyDto[] {
    return [
      {
        dependencyId: 'dep-1',
        upstreamDomain: 'CLIMATE',
        downstreamDomain: 'UTILITY',
        dependencyType: 'CASCADE_VECTOR',
        impactMultiplier: 1.8,
        exposureScore: 84.0,
        vulnerabilityDescription: 'Precipitation inundation directly floods Substation 4B underground cooling vaults.',
      },
      {
        dependencyId: 'dep-2',
        upstreamDomain: 'UTILITY',
        downstreamDomain: 'MOBILITY',
        dependencyType: 'CRITICAL_POWER',
        impactMultiplier: 1.5,
        exposureScore: 76.0,
        vulnerabilityDescription: 'Substation outage drops arterial traffic signal grid to emergency battery mode.',
      },
      {
        dependencyId: 'dep-3',
        upstreamDomain: 'MOBILITY',
        downstreamDomain: 'TRANSIT',
        dependencyType: 'TRANSIT_CORRIDOR',
        impactMultiplier: 1.4,
        exposureScore: 72.0,
        vulnerabilityDescription: 'Signal depressurization causes 89% capacity bottleneck on BRT Line 3 corridor.',
      },
      {
        dependencyId: 'dep-4',
        upstreamDomain: 'TRANSIT',
        downstreamDomain: 'EMERGENCY',
        dependencyType: 'TRANSIT_CORRIDOR',
        impactMultiplier: 1.6,
        exposureScore: 88.0,
        vulnerabilityDescription: 'BRT bottleneck delays emergency response ambulances by 17 minutes.',
      },
    ];
  }

  generatePriorities(state: ResilienceStateDto): ResiliencePriorityDto[] {
    return [
      {
        priorityId: 'prio-1',
        domain: 'UTILITY',
        targetAsset: 'Substation 4B & Backup Generators',
        priorityClass: 'CRITICAL',
        urgencyScore: 92.5,
        rationale: 'Protecting power grid prevents downstream cascade across traffic signals and water pumps.',
      },
      {
        priorityId: 'prio-2',
        domain: 'EMERGENCY',
        targetAsset: 'Arterial Emergency Transit Corridor',
        priorityClass: 'HIGH',
        urgencyScore: 84.0,
        rationale: 'Rerouting responder ambulances preserves life-safety SLA response times under 15 mins.',
      },
      {
        priorityId: 'prio-3',
        domain: 'CLIMATE',
        targetAsset: 'Ward 12 Drainage Canal Pumps',
        priorityClass: 'ELEVATED',
        urgencyScore: 76.0,
        rationale: 'Mobilizing mobile diesel pumps mitigates flood depth escalation by 45%.',
      },
    ];
  }

  calculateKpis(state: ResilienceStateDto): ResilienceKpiDto[] {
    return [
      { metricName: 'Citywide Resilience Index', currentValue: state.overallResilienceScore, targetValue: 85.0, unit: 'points', status: 'AT_RISK' },
      { metricName: 'Critical Vulnerabilities Count', currentValue: state.criticalVulnerabilities.length, targetValue: 0, unit: 'items', status: 'CRITICAL' },
      { metricName: 'Resource Availability', currentValue: state.resourceAvailabilityPercent, targetValue: 80.0, unit: '%', status: 'AT_RISK' },
      { metricName: 'Model Ensemble Confidence', currentValue: state.confidencePercent, targetValue: 90.0, unit: '%', status: 'OPTIMAL' },
    ];
  }
}

export const resilienceOrchestrationService = new ResilienceOrchestrationService();
