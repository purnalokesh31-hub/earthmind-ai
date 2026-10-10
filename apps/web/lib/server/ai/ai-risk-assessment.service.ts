// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — AI Risk Assessment & Multi-Factor Scoring Engine
// Evaluates Detection Confidence, Object Count, Critical Infrastructure,
// Population Density, Weather, Terrain, & Historical Hazard Telemetry
// ──────────────────────────────────────────────────────────────

import { logger } from '../logger';

export interface RiskAssessmentInput {
  detectionConfidence: number; // 0.0 to 1.0
  objectCount: number;         // Count of detected hazard objects
  affectedAreaSqMeters: number;// Hazard surface area
  historicalIncidentCount: number; // Past incidents in 1km grid
  populationDensityPerSqKm: number;// Ward population density
  criticalInfraProximityMeters: number; // Distance to hospital/school/grid
  weatherSeverityIndex: number;// 0 to 10 (Rain/Wind severity)
  terrainSlopeDegrees: number; // Slope angle
  roadAccessLevel: 'BLOCKED' | 'RESTRICTED' | 'CLEAR';
  baseSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  hazardCategory: string;      // e.g. 'ROAD_SUBSIDENCE', 'FLOOD', 'FIRE'
}

export interface FactorContribution {
  factor: string;
  weight: number;
  scoreContribution: number;
  explanation: string;
}

export interface RiskAssessmentOutput {
  assessmentId: string;
  riskScore: number; // 0 to 100
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  emergencyLevel: 'CAT-1 RED EMERGENCY' | 'CAT-2 AMBER HAZARD' | 'CAT-3 YELLOW NOTICE' | 'CAT-4 GREEN ROUTINE';
  recommendedDepartment: string;
  estimatedResponseTime: string;
  compositeConfidence: number;
  explainabilityReport: {
    overallSummary: string;
    factorContributions: FactorContribution[];
    mitigationDirectives: string[];
  };
  assessedAt: string;
}

export class AiRiskAssessmentService {
  assessRisk(input: RiskAssessmentInput): RiskAssessmentOutput {
    const assessmentId = `risk-${Date.now()}`;
    const factorContributions: FactorContribution[] = [];

    // 1. Base Severity Weight (0-30 pts)
    const baseSeverityScores = { CRITICAL: 30, HIGH: 22, MEDIUM: 14, LOW: 6 };
    const baseScore = baseSeverityScores[input.baseSeverity] || 10;
    factorContributions.push({
      factor: 'Base Hazard Severity',
      weight: 0.30,
      scoreContribution: baseScore,
      explanation: `Classified as ${input.baseSeverity} hazard type.`,
    });

    // 2. Critical Infrastructure Proximity (0-20 pts)
    let infraScore = 0;
    if (input.criticalInfraProximityMeters < 200) infraScore = 20;
    else if (input.criticalInfraProximityMeters < 500) infraScore = 14;
    else if (input.criticalInfraProximityMeters < 1000) infraScore = 8;
    else infraScore = 2;
    factorContributions.push({
      factor: 'Critical Infrastructure Proximity',
      weight: 0.20,
      scoreContribution: infraScore,
      explanation: `Located ${input.criticalInfraProximityMeters}m from key municipal infrastructure.`,
    });

    // 3. Population Density Impact (0-15 pts)
    let popScore = Math.min(15, Math.round((input.populationDensityPerSqKm / 10000) * 15));
    factorContributions.push({
      factor: 'Population Density',
      weight: 0.15,
      scoreContribution: popScore,
      explanation: `Ward population density: ${input.populationDensityPerSqKm} residents/km².`,
    });

    // 4. Weather & Terrain Vulnerability (0-15 pts)
    let weatherTerrainScore = Math.min(15, Math.round((input.weatherSeverityIndex / 10) * 10 + (input.terrainSlopeDegrees / 45) * 5));
    factorContributions.push({
      factor: 'Weather & Terrain Vulnerability',
      weight: 0.15,
      scoreContribution: weatherTerrainScore,
      explanation: `Weather severity index ${input.weatherSeverityIndex}/10, slope ${input.terrainSlopeDegrees}°.`,
    });

    // 5. Object Count & Affected Surface Area (0-10 pts)
    let areaScore = Math.min(10, input.objectCount * 2 + Math.round(input.affectedAreaSqMeters / 100));
    factorContributions.push({
      factor: 'Hazard Scale & Area',
      weight: 0.10,
      scoreContribution: areaScore,
      explanation: `${input.objectCount} object(s) covering ${input.affectedAreaSqMeters} m² surface area.`,
    });

    // 6. Historical Incident Frequency (0-10 pts)
    let historyScore = Math.min(10, input.historicalIncidentCount * 2);
    factorContributions.push({
      factor: 'Historical Recurrence',
      weight: 0.10,
      scoreContribution: historyScore,
      explanation: `${input.historicalIncidentCount} prior incidents recorded in 1km grid.`,
    });

    // Total Composite Risk Score (0-100)
    const rawScore = baseScore + infraScore + popScore + weatherTerrainScore + areaScore + historyScore;
    const riskScore = Math.min(100, Math.max(0, rawScore));

    // Priority & Emergency Level Classification
    let priority: 'P1' | 'P2' | 'P3' | 'P4' = 'P3';
    let emergencyLevel: RiskAssessmentOutput['emergencyLevel'] = 'CAT-3 YELLOW NOTICE';
    let estimatedResponseTime = '6 Hours';

    if (riskScore >= 80) {
      priority = 'P1';
      emergencyLevel = 'CAT-1 RED EMERGENCY';
      estimatedResponseTime = '2 Hours (Immediate Dispatch)';
    } else if (riskScore >= 60) {
      priority = 'P2';
      emergencyLevel = 'CAT-2 AMBER HAZARD';
      estimatedResponseTime = '4 Hours';
    } else if (riskScore >= 40) {
      priority = 'P3';
      emergencyLevel = 'CAT-3 YELLOW NOTICE';
      estimatedResponseTime = '12 Hours';
    } else {
      priority = 'P4';
      emergencyLevel = 'CAT-4 GREEN ROUTINE';
      estimatedResponseTime = '24 Hours';
    }

    // Recommended Department Routing
    const deptMap: Record<string, string> = {
      ROAD_SUBSIDENCE: 'Public Works Department (PWD)',
      POTHOLE: 'Public Works Department (PWD)',
      FLOOD: 'State Disaster Response Force (SDRF)',
      FIRE: 'Fire & Emergency Services',
      GARBAGE: 'Municipal Sanitation Board',
      WATER_LEAKAGE: 'Municipal Water Supply & Sewerage Board',
      ELECTRIC_POLE_DAMAGE: 'State Power Distribution Corporation',
    };
    const recommendedDepartment = deptMap[input.hazardCategory] || 'Municipal Command & Control';

    const compositeConfidence = Number((input.detectionConfidence * 0.9 + 0.1).toFixed(3));

    logger.info(`[AiRiskAssessment] Assessed ${input.hazardCategory}: Risk Score ${riskScore}/100 [${priority} / ${emergencyLevel}]`);

    return {
      assessmentId,
      riskScore,
      priority,
      emergencyLevel,
      recommendedDepartment,
      estimatedResponseTime,
      compositeConfidence,
      explainabilityReport: {
        overallSummary: `Risk score of ${riskScore}/100 calculated driven by ${input.baseSeverity} hazard classification and ${input.criticalInfraProximityMeters}m proximity to critical infrastructure.`,
        factorContributions,
        mitigationDirectives: [
          `Deploy rapid repair crew from ${recommendedDepartment}.`,
          `Isolate ${input.affectedAreaSqMeters}m² hazard boundary zone.`,
          `Notify emergency dispatchers within ${estimatedResponseTime}.`,
        ],
      },
      assessedAt: new Date().toISOString(),
    };
  }
}

export const aiRiskAssessmentService = new AiRiskAssessmentService();
