// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.11 (Mega Prompt 6/6)
// Provenance Governance Service
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export type EarthMindProvenanceSource =
  | 'LIVE'
  | 'SIMULATION'
  | 'DEMO'
  | 'LIVE_TELEMETRY'
  | 'PREDICTION'
  | 'DECISION_INTELLIGENCE'
  | 'INTERVENTION_PLANNING'
  | 'EXECUTION_READINESS'
  | 'OUTCOME_VALIDATION'
  | 'OPERATOR_INPUT'
  | 'ESTIMATION'
  | 'UNKNOWN';

export interface EarthMindProvenanceObject {
  dataSource: EarthMindProvenanceSource;
  confidence: number;
  generatedAt: string;
  sourceReference: string;
  isVerifiedLive: boolean;
}

export class EarthMindProvenanceService {
  public verifyProvenance(source: EarthMindProvenanceSource, confidence: number, sourceRef?: string): EarthMindProvenanceObject {
    const validSources: EarthMindProvenanceSource[] = [
      'LIVE',
      'SIMULATION',
      'DEMO',
      'LIVE_TELEMETRY',
      'PREDICTION',
      'DECISION_INTELLIGENCE',
      'INTERVENTION_PLANNING',
      'EXECUTION_READINESS',
      'OUTCOME_VALIDATION',
      'OPERATOR_INPUT',
      'ESTIMATION',
    ];

    if (!source || !validSources.includes(source)) {
      logger.warn(`[ProvenanceService] Unverified provenance source '${source}'. Setting UNKNOWN.`);
      return {
        dataSource: 'UNKNOWN',
        confidence: 0,
        generatedAt: new Date().toISOString(),
        sourceReference: sourceRef || 'PROVENANCE_UNVERIFIED',
        isVerifiedLive: false,
      };
    }

    const isVerifiedLive = source === 'LIVE_TELEMETRY';

    return {
      dataSource: source,
      confidence: isVerifiedLive ? Math.min(confidence, 100) : confidence,
      generatedAt: new Date().toISOString(),
      sourceReference: sourceRef || `${source}_STREAM`,
      isVerifiedLive,
    };
  }

  public preventSilentPromotion(currentSource: EarthMindProvenanceSource, targetSource: EarthMindProvenanceSource): EarthMindProvenanceSource {
    // Never allow promotion to LIVE_TELEMETRY if origin was SIMULATION, ESTIMATION, or PREDICTION
    if (targetSource === 'LIVE_TELEMETRY' && ['SIMULATION', 'ESTIMATION', 'PREDICTION'].includes(currentSource)) {
      logger.error(`[ProvenanceService] Blocked silent promotion from '${currentSource}' to 'LIVE_TELEMETRY'`);
      throw new Error(`PROVENANCE_UNVERIFIED: Cannot silently promote '${currentSource}' data to 'LIVE_TELEMETRY'.`);
    }
    return targetSource;
  }
}

export const earthMindProvenanceService = new EarthMindProvenanceService();
