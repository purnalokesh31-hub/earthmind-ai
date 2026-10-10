import { describe, it, expect } from 'vitest';
import { aiRiskAssessmentService } from '../../lib/server/ai/ai-risk-assessment.service';

describe('Phase 6.6.5 — AI Risk Assessment & Multi-Factor Scoring Engine', () => {
  // ── Critical Hazard Risk Scoring ──
  describe('P1 Emergency Risk Assessment', () => {
    it('should compute P1 CAT-1 RED EMERGENCY risk score for critical road subsidence near critical infrastructure', () => {
      const assessment = aiRiskAssessmentService.assessRisk({
        detectionConfidence: 0.96,
        objectCount: 3,
        affectedAreaSqMeters: 450,
        historicalIncidentCount: 4,
        populationDensityPerSqKm: 14000,
        criticalInfraProximityMeters: 120, // < 200m
        weatherSeverityIndex: 8,
        terrainSlopeDegrees: 15,
        roadAccessLevel: 'BLOCKED',
        baseSeverity: 'CRITICAL',
        hazardCategory: 'ROAD_SUBSIDENCE',
      });

      expect(assessment.riskScore).toBeGreaterThanOrEqual(80);
      expect(assessment.priority).toBe('P1');
      expect(assessment.emergencyLevel).toBe('CAT-1 RED EMERGENCY');
      expect(assessment.recommendedDepartment).toContain('Public Works');
      expect(assessment.estimatedResponseTime).toContain('2 Hours');
    });

    it('should generate detailed explainability report with weighted factor contributions', () => {
      const assessment = aiRiskAssessmentService.assessRisk({
        detectionConfidence: 0.92,
        objectCount: 1,
        affectedAreaSqMeters: 100,
        historicalIncidentCount: 1,
        populationDensityPerSqKm: 5000,
        criticalInfraProximityMeters: 350,
        weatherSeverityIndex: 4,
        terrainSlopeDegrees: 5,
        roadAccessLevel: 'CLEAR',
        baseSeverity: 'HIGH',
        hazardCategory: 'FLOOD',
      });

      expect(assessment.explainabilityReport.factorContributions.length).toBe(6);
      expect(assessment.explainabilityReport.mitigationDirectives.length).toBe(3);
      expect(assessment.explainabilityReport.overallSummary).toBeDefined();
    });
  });

  // ── Lower Severity Risk Scoring & Routing ──
  describe('P3 & P4 Routine Hazard Assessment', () => {
    it('should compute P3 CAT-3 YELLOW NOTICE for low-density minor hazards', () => {
      const assessment = aiRiskAssessmentService.assessRisk({
        detectionConfidence: 0.85,
        objectCount: 1,
        affectedAreaSqMeters: 20,
        historicalIncidentCount: 0,
        populationDensityPerSqKm: 1200,
        criticalInfraProximityMeters: 1500,
        weatherSeverityIndex: 2,
        terrainSlopeDegrees: 0,
        roadAccessLevel: 'CLEAR',
        baseSeverity: 'LOW',
        hazardCategory: 'GARBAGE',
      });

      expect(assessment.riskScore).toBeLessThan(60);
      expect(assessment.priority).toMatch(/P3|P4/);
      expect(assessment.recommendedDepartment).toContain('Sanitation');
    });

    it('should route water leakage incidents to Water Board', () => {
      const assessment = aiRiskAssessmentService.assessRisk({
        detectionConfidence: 0.90,
        objectCount: 2,
        affectedAreaSqMeters: 80,
        historicalIncidentCount: 2,
        populationDensityPerSqKm: 8000,
        criticalInfraProximityMeters: 400,
        weatherSeverityIndex: 3,
        terrainSlopeDegrees: 2,
        roadAccessLevel: 'CLEAR',
        baseSeverity: 'MEDIUM',
        hazardCategory: 'WATER_LEAKAGE',
      });

      expect(assessment.recommendedDepartment).toContain('Water Supply');
    });

    it('should calculate composite confidence score incorporating detection quality', () => {
      const assessment = aiRiskAssessmentService.assessRisk({
        detectionConfidence: 0.95,
        objectCount: 1,
        affectedAreaSqMeters: 50,
        historicalIncidentCount: 0,
        populationDensityPerSqKm: 3000,
        criticalInfraProximityMeters: 800,
        weatherSeverityIndex: 1,
        terrainSlopeDegrees: 0,
        roadAccessLevel: 'CLEAR',
        baseSeverity: 'LOW',
        hazardCategory: 'POTHOLE',
      });

      expect(assessment.compositeConfidence).toBeGreaterThan(0.90);
    });
  });
});
