// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.2 Cross-Domain Cascade Engine Service
// ──────────────────────────────────────────────────────────────

import { DomainType } from '../domain/digital-twin/cross-domain.domain';
import { PredictionScenarioVariableDto } from '../domain/digital-twin/city-prediction-simulation.domain';

export interface ScenarioCascadeHopDto {
  stepIndex: number;
  sourceDomain: DomainType;
  targetDomain: DomainType;
  relationshipType: 'TEMPORAL' | 'SPATIAL' | 'CAUSAL' | 'OPERATIONAL' | 'RESOURCE' | 'SERVICE_IMPACT';
  propagationDepth: number;
  riskContribution: number; // 0 - 100
  confidence: number; // 0 - 100
  triggerEvent: string;
  cascadingImpactDescription: string;
  timeDelayMinutes: number;
  affectedServices: string[];
  additionalAffectedPopulation: number;
}

export class CityPredictionCascadeService {
  simulateCascadePropagation(variables: PredictionScenarioVariableDto[]): ScenarioCascadeHopDto[] {
    const hops: ScenarioCascadeHopDto[] = [];
    let currentDepth = 1;

    // Check for Climate signals
    const climateVar = variables.find((v) => v.domain === 'CLIMATE');
    if (climateVar && climateVar.simulatedValue > climateVar.baseValue) {
      hops.push({
        stepIndex: currentDepth++,
        sourceDomain: 'CLIMATE',
        targetDomain: 'MOBILITY',
        relationshipType: 'SPATIAL',
        propagationDepth: 1,
        riskContribution: 35.0,
        confidence: 94.0,
        triggerEvent: `Climate Variable ${climateVar.variableName} escalated to ${climateVar.simulatedValue} ${climateVar.unit}`,
        cascadingImpactDescription: 'Precipitation inundation causing primary arterial corridor closure',
        timeDelayMinutes: 15,
        affectedServices: ['Arterial Traffic Flow', 'Drainage Pumps'],
        additionalAffectedPopulation: 12000,
      });

      hops.push({
        stepIndex: currentDepth++,
        sourceDomain: 'MOBILITY',
        targetDomain: 'TRANSIT',
        relationshipType: 'CAUSAL',
        propagationDepth: 2,
        riskContribution: 25.0,
        confidence: 91.5,
        triggerEvent: 'Arterial Road Closure',
        cascadingImpactDescription: 'BRT and feeder bus routes delayed >35 mins due to detour congestion',
        timeDelayMinutes: 30,
        affectedServices: ['BRT Route 12', 'Municipal Transit'],
        additionalAffectedPopulation: 8500,
      });
    }

    // Check for Utility signals
    const utilityVar = variables.find((v) => v.domain === 'UTILITY');
    if (utilityVar && utilityVar.simulatedValue > 80) {
      hops.push({
        stepIndex: currentDepth++,
        sourceDomain: 'UTILITY',
        targetDomain: 'EMERGENCY_RESPONSE',
        relationshipType: 'OPERATIONAL',
        propagationDepth: currentDepth,
        riskContribution: 28.0,
        confidence: 92.0,
        triggerEvent: `Utility Variable ${utilityVar.variableName} load reached ${utilityVar.simulatedValue} ${utilityVar.unit}`,
        cascadingImpactDescription: 'Substation thermal trip causing auxiliary power transfer to generators',
        timeDelayMinutes: 45,
        affectedServices: ['Dispatch Telemetry', 'Ward Clinic Emergency Power'],
        additionalAffectedPopulation: 13700,
      });
    }

    // Default multi-hop fallback if no specific variable matched
    if (hops.length === 0) {
      hops.push({
        stepIndex: 1,
        sourceDomain: 'CLIMATE',
        targetDomain: 'MOBILITY',
        relationshipType: 'CAUSAL',
        propagationDepth: 1,
        riskContribution: 20.0,
        confidence: 88.0,
        triggerEvent: 'Baseline Risk Escalation',
        cascadingImpactDescription: 'Minor localized traffic congestion build-up',
        timeDelayMinutes: 10,
        affectedServices: ['Local Feeder Roads'],
        additionalAffectedPopulation: 3500,
      });
    }

    return hops;
  }
}

export const cityPredictionCascadeService = new CityPredictionCascadeService();
