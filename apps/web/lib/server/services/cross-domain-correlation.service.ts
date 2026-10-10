// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.8 Cross-Domain Correlation Service
// ──────────────────────────────────────────────────────────────

import {
  CrossDomainSignalDto,
  CrossDomainCorrelationDto,
  CorrelationType,
  DomainType,
} from '../domain/digital-twin/cross-domain.domain';

export class CrossDomainCorrelationService {
  correlateSignals(signals: CrossDomainSignalDto[]): CrossDomainCorrelationDto[] {
    if (!signals || signals.length === 0) return [];

    const correlations: CrossDomainCorrelationDto[] = [];
    const domainsPresent = Array.from(new Set(signals.map((s) => s.domain)));

    // 1. Check for Climate + Mobility + Transit + Emergency Cascade
    const climateSignal = signals.find((s) => s.domain === 'CLIMATE');
    const mobilitySignal = signals.find((s) => s.domain === 'MOBILITY');
    const transitSignal = signals.find((s) => s.domain === 'TRANSIT');
    const emergencySignal = signals.find((s) => s.domain === 'EMERGENCY_RESPONSE');

    if (climateSignal && (mobilitySignal || transitSignal)) {
      correlations.push({
        correlationId: `corr-clm-mob-${Date.now()}`,
        sourceSignals: [climateSignal, mobilitySignal, transitSignal, emergencySignal].filter(Boolean) as CrossDomainSignalDto[],
        affectedDomains: ['CLIMATE', 'MOBILITY', 'TRANSIT', 'EMERGENCY_RESPONSE'],
        correlationType: 'CAUSAL',
        confidence: 94.5,
        causalChain: [
          'Extreme Rainfall / Flood Warning',
          'Road Inundation & Closure on Key Arterial Routes',
          'Urban Traffic Congestion & Route Rerouting',
          'Multimodal Bus Fleet Delays (>45 mins)',
          'Emergency Response Vehicle Delay & Increased Population Risk Exposure',
        ],
        affectedAssets: [climateSignal.entityId, mobilitySignal?.entityId, transitSignal?.entityId].filter(Boolean) as string[],
        affectedPopulation: 28500,
        severity: 'CRITICAL',
        explanation: 'Extreme inundation on primary arterial corridors causing cascading transit delays and delayed emergency dispatch access.',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Check for Utility + Water + Transit Cascade
    const utilitySignal = signals.find((s) => s.domain === 'UTILITY' && (s.eventType.includes('TRANSFORMER') || s.eventType.includes('SUBSTATION')));
    const waterSignal = signals.find((s) => s.domain === 'UTILITY' && (s.eventType.includes('PUMP') || s.eventType.includes('PIPELINE')));

    if (utilitySignal) {
      correlations.push({
        correlationId: `corr-utl-wtr-${Date.now()}`,
        sourceSignals: [utilitySignal, waterSignal].filter(Boolean) as CrossDomainSignalDto[],
        affectedDomains: ['UTILITY', 'EMERGENCY_RESPONSE'],
        correlationType: 'OPERATIONAL',
        confidence: 91.2,
        causalChain: [
          'Substation / Transformer Thermal Runaway Failure',
          'Secondary Distribution Feeder Outage',
          'Municipal Water Pumping Station Power Loss',
          'Water Supply Pressure Degradation in Ward 12',
          'Critical Facility Impact: Ward 12 Primary Health Clinic Emergency Power Dependent',
        ],
        affectedAssets: [utilitySignal.entityId, waterSignal?.entityId].filter(Boolean) as string[],
        affectedPopulation: 14200,
        severity: 'HIGH',
        explanation: 'Primary substation transformer failure causing downstream municipal water pump power loss and clinic emergency power switch.',
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Single-Domain or Spatial/Temporal Fallback Correlations
    if (correlations.length === 0 && signals.length > 0) {
      const topSignal = signals[0];
      correlations.push({
        correlationId: `corr-single-${Date.now()}`,
        sourceSignals: [topSignal],
        affectedDomains: [topSignal.domain],
        correlationType: 'SPATIAL',
        confidence: topSignal.confidenceScore || 80.0,
        causalChain: [`Isolated Event: ${topSignal.eventType} on ${topSignal.entityName}`],
        affectedAssets: [topSignal.entityId],
        affectedPopulation: 3500,
        severity: topSignal.severity,
        explanation: `Single-domain signal isolated to ${topSignal.domain} asset ${topSignal.entityName}.`,
        timestamp: new Date().toISOString(),
      });
    }

    return correlations;
  }
}

export const crossDomainCorrelationService = new CrossDomainCorrelationService();
