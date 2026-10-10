// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Resilience Action Candidate Service
// Deterministic Cross-Domain Action Candidate Generator
// ──────────────────────────────────────────────────────────────

import { ResilienceActionCandidateDto } from '../domain/digital-twin/resilience-action-planning.domain';
import { ResilienceStateDto } from '../domain/digital-twin/resilience-orchestration.domain';
import { logger } from '../logger';

export class ResilienceActionCandidateService {
  generateCandidates(state: ResilienceStateDto): ResilienceActionCandidateDto[] {
    const candidates: ResilienceActionCandidateDto[] = [];

    // Rule 1: Utility Isolation & Substation Generator Backup
    const utilityState = state.domainStates.find((d) => d.domain === 'UTILITY');
    if (utilityState && utilityState.riskScore > 70) {
      candidates.push({
        actionId: 'act-util-iso-1',
        category: 'UTILITY_ISOLATION',
        domain: 'UTILITY',
        title: 'Isolate Flood-Exposed Substation 4B Sub-Bus',
        description: 'Disconnect flooded transformer vault 4B to prevent high-voltage ground short circuits.',
        targetAsset: 'Substation 4B Electrical Bus',
        reason: 'Utility domain risk score 84.0/100 triggers mandatory electrical isolation.',
        riskReductionPoints: 34.0,
        estimatedCostUsd: 1200,
        estimatedDurationHours: 0.5,
        populationProtected: 18500,
        requiredResourcesCount: 2,
        confidencePercent: 96.0,
        dataSource: 'SIMULATION',
      });

      candidates.push({
        actionId: 'act-gen-dep-1',
        category: 'GENERATOR_DEPLOYMENT',
        domain: 'UTILITY',
        title: 'Deploy Mobile Diesel Generators to Ward 12 Pumping Station',
        description: 'Provide 500kVA auxiliary mobile power to stormwater drainage pumps.',
        targetAsset: 'Ward 12 Drainage Pump Station',
        reason: 'Prevents storm pump shutdown during Substation 4B isolation.',
        riskReductionPoints: 28.0,
        estimatedCostUsd: 3500,
        estimatedDurationHours: 1.0,
        populationProtected: 12000,
        requiredResourcesCount: 3,
        confidencePercent: 94.0,
        dataSource: 'SIMULATION',
      });
    }

    // Rule 2: Climate & Flood Response
    const climateState = state.domainStates.find((d) => d.domain === 'CLIMATE');
    if (climateState && climateState.riskScore > 65) {
      candidates.push({
        actionId: 'act-fld-rsp-1',
        category: 'FLOOD_RESPONSE',
        domain: 'CLIMATE',
        title: 'Mobilize Auxiliary De-watering Pumps at Benz Circle Canal',
        description: 'Deploy 4 high-capacity mobile diesel de-watering pumps along arterial underpass.',
        targetAsset: 'Benz Circle Arterial Underpass',
        reason: 'Precipitation flood vector threatens arterial road submerged bottleneck.',
        riskReductionPoints: 26.0,
        estimatedCostUsd: 4800,
        estimatedDurationHours: 1.5,
        populationProtected: 24000,
        requiredResourcesCount: 4,
        confidencePercent: 92.0,
        dataSource: 'SIMULATION',
      });
    }

    // Rule 3: Mobility Road Closure & Transit Rerouting
    candidates.push({
      actionId: 'act-rd-cls-1',
      category: 'ROAD_CLOSURE',
      domain: 'MOBILITY',
      title: 'Close Flooded Benz Circle Eastbound Lane & Divert Traffic',
      description: 'Implement temporary barricades to prevent civilian vehicle inundation.',
      targetAsset: 'Benz Circle Eastbound Arterial',
      reason: 'Prevents vehicle stalls and maintains clear emergency ambulance corridor.',
      riskReductionPoints: 22.0,
      estimatedCostUsd: 800,
      estimatedDurationHours: 0.5,
      populationProtected: 15000,
      requiredResourcesCount: 2,
      confidencePercent: 98.0,
      dataSource: 'SIMULATION',
    });

    candidates.push({
      actionId: 'act-trns-rerout-1',
      category: 'TRANSIT_REROUTING',
      domain: 'TRANSIT',
      title: 'Reroute BRT Line 3 Buses to Bypass Inundated Underpass',
      description: 'Divert public transit buses along High-Road Elevated Corridor.',
      targetAsset: 'BRT Line 3 Corridor',
      reason: 'Bypasses arterial waterlogging and maintains public transit continuity.',
      riskReductionPoints: 18.0,
      estimatedCostUsd: 1500,
      estimatedDurationHours: 0.75,
      populationProtected: 28000,
      requiredResourcesCount: 2,
      confidencePercent: 95.0,
      dataSource: 'SIMULATION',
    });

    // Rule 4: Emergency Resource Staging & Public Alert
    candidates.push({
      actionId: 'act-emg-stg-1',
      category: 'EMERGENCY_RESOURCE_STAGING',
      domain: 'EMERGENCY',
      title: 'Stage Rescue Ambulances at High-Ground Transit Hub B',
      description: 'Pre-position 6 Advanced Life Support ambulances outside flood boundary.',
      targetAsset: 'Transit Hub B Medical Staging',
      reason: 'Ensures responder ambulance dispatch time remains under 12 minutes.',
      riskReductionPoints: 30.0,
      estimatedCostUsd: 2200,
      estimatedDurationHours: 0.5,
      populationProtected: 34000,
      requiredResourcesCount: 6,
      confidencePercent: 97.0,
      dataSource: 'SIMULATION',
    });

    candidates.push({
      actionId: 'act-pub-alrt-1',
      category: 'PUBLIC_ALERT',
      domain: 'CITIZEN_SERVICES',
      title: 'Broadcast Emergency SMS & VMS Road Caution Advisory',
      description: 'Send geo-targeted SMS warning citizens to avoid Ward 12 underpass.',
      targetAsset: 'Citywide Emergency VMS & SMS Broadcast',
      reason: 'Informs citizens of active flood hazards and reduces traffic volume.',
      riskReductionPoints: 15.0,
      estimatedCostUsd: 500,
      estimatedDurationHours: 0.25,
      populationProtected: 50000,
      requiredResourcesCount: 1,
      confidencePercent: 99.0,
      dataSource: 'SIMULATION',
    });

    logger.info(`[ResilienceActionCandidateService] Generated ${candidates.length} candidate actions for resilience state`);
    return candidates;
  }
}

export const resilienceActionCandidateService = new ResilienceActionCandidateService();
