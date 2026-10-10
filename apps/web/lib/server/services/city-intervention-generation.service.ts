// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 Citywide Candidate Intervention Generation Service
// Ingests Phase 7.8, 7.9.1, and 7.9.2 intelligence and synthesizes candidate intervention options
// ──────────────────────────────────────────────────────────────

import {
  CityDecisionInputDto,
  CityInterventionOptionDto,
  UrbanDomain,
} from '../domain/digital-twin/city-decision-optimization.domain';

export class CityInterventionGenerationService {
  /**
   * Generates candidate intervention options based on decision inputs and simulated risks.
   * Every candidate MUST preserve requiresHumanApproval: true.
   */
  async generateCandidateInterventions(input: CityDecisionInputDto): Promise<CityInterventionOptionDto[]> {
    const primaryDomain = input.targetDomains[0] || 'CLIMATE';

    // Option 1: High Resilience / Targeted Infrastructure Protection
    const option1: CityInterventionOptionDto = {
      optionId: `opt-${primaryDomain.toLowerCase()}-alpha-${Date.now()}`,
      title: `Option Alpha: Targeted ${primaryDomain} Islanding & Mobile Deployment`,
      description: `Deploy mobile isolation units and targeted sector islanding to contain ${primaryDomain.toLowerCase()} cascade propagation.`,
      primaryDomain,
      affectedDomains: [primaryDomain, 'UTILITY', 'EMERGENCY_RESPONSE'],
      objective: `Contain ${primaryDomain.toLowerCase()} cascading failure and protect critical sector assets`,
      expectedRiskReduction: Math.min(38.5, Math.round((input.simulatedPeakRiskScore - input.baseRiskScore) * 0.85 * 10) / 10),
      populationImpact: 28500,
      infrastructureImpact: 82,
      estimatedCostUsd: 145000,
      estimatedDowntimeHours: 2.5,
      resourceRequirementCount: 12,
      confidencePercent: 94.5,
      operationalFeasibilityScore: 91.0,
      constraintsSatisfied: input.constraints.map((c) => c.constraintId),
      constraintsViolated: [],
      decisionScore: 89.2,
      requiresHumanApproval: true,
    };

    // Option 2: Pre-Emptive Transit & Mobility Rerouting
    const option2: CityInterventionOptionDto = {
      optionId: `opt-mobility-beta-${Date.now()}`,
      title: 'Option Beta: Pre-Emptive Transit Rerouting & Pumping Station Surge',
      description: 'Reroute high-density transit corridors to elevated bypass routes while boosting municipal water pump throughput.',
      primaryDomain: 'TRANSIT',
      affectedDomains: ['TRANSIT', 'MOBILITY', 'CLIMATE'],
      objective: 'Maintain urban mobility throughput and reduce flood inundation rate',
      expectedRiskReduction: Math.round((input.simulatedPeakRiskScore - input.baseRiskScore) * 0.65 * 10) / 10,
      populationImpact: 21000,
      infrastructureImpact: 64,
      estimatedCostUsd: 92000,
      estimatedDowntimeHours: 1.8,
      resourceRequirementCount: 8,
      confidencePercent: 91.0,
      operationalFeasibilityScore: 86.5,
      constraintsSatisfied: input.constraints.map((c) => c.constraintId),
      constraintsViolated: [],
      decisionScore: 81.5,
      requiresHumanApproval: true,
    };

    // Option 3: Comprehensive Controlled District Load Shedding
    const option3: CityInterventionOptionDto = {
      optionId: `opt-grid-gamma-${Date.now()}`,
      title: 'Option Gamma: Controlled District Power Isolation & Emergency Spillway Switchover',
      description: 'Controlled power isolation for industrial zone feeder combined with emergency spillway bypass switchover.',
      primaryDomain: 'UTILITY',
      affectedDomains: ['UTILITY', 'CLIMATE', 'MOBILITY'],
      objective: 'Prevent high-voltage transformer explosion at expense of temporary industrial downtime',
      expectedRiskReduction: Math.min(42.0, Math.round((input.simulatedPeakRiskScore - input.baseRiskScore) * 0.95 * 10) / 10),
      populationImpact: 34000,
      infrastructureImpact: 90,
      estimatedCostUsd: 280000,
      estimatedDowntimeHours: 6.5,
      resourceRequirementCount: 22,
      confidencePercent: 88.0,
      operationalFeasibilityScore: 72.0,
      constraintsSatisfied: input.constraints.filter((c) => !c.isHardConstraint).map((c) => c.constraintId),
      constraintsViolated: input.constraints.filter((c) => c.isHardConstraint).map((c) => c.constraintId),
      decisionScore: 74.8,
      requiresHumanApproval: true,
    };

    return [option1, option2, option3];
  }
}

export const cityInterventionGenerationService = new CityInterventionGenerationService();
