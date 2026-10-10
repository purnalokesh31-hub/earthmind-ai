// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 Mega Prompt 5/6 Unit & Integration Tests
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cityResourceDecisionService } from '@/lib/server/services/city-resource-decision.service';
import { cityDecisionTradeOffService } from '@/lib/server/services/city-decision-tradeoff.service';
import { cityDecisionSensitivityService } from '@/lib/server/services/city-decision-sensitivity.service';
import { cityDecisionThresholdService } from '@/lib/server/services/city-decision-threshold.service';
import { toolRegistry } from '@/lib/server/ai-agents/tool-registry';

describe('Phase 7.9.4 Citywide Advanced Decision Intelligence', () => {
  describe('Municipal Resource Decision Service', () => {
    it('should return complete municipal resource inventory', () => {
      const inventory = cityResourceDecisionService.getMunicipalResourceInventory();
      expect(inventory.length).toBeGreaterThanOrEqual(8);
      const emergencyCrew = inventory.find((r) => r.resourceType === 'EMERGENCY_CREW');
      expect(emergencyCrew).toBeDefined();
      expect(emergencyCrew?.availableCount).toBe(12);
      expect(emergencyCrew?.remainingCount).toBe(4);
    });

    it('should evaluate resource demand and calculate shortages correctly', () => {
      const demand = cityResourceDecisionService.evaluateResourceDemand('OPTION_A', {
        emergencyCrews: 8,
        mobileGenerators: 4,
        pneumaticBarriers: 20,
      });

      expect(demand.candidateId).toBe('OPTION_A');
      expect(demand.demands.length).toBe(3);
      expect(demand.overallResourceFeasibility).toBeDefined();
      expect(demand.estimatedTotalDeploymentTimeMinutes).toBeGreaterThan(0);
    });

    it('should report shortage when required resources exceed remaining inventory', () => {
      const demand = cityResourceDecisionService.evaluateResourceDemand('OPTION_HEAVY', {
        emergencyCrews: 25,
      });

      expect(demand.totalShortageCount).toBeGreaterThan(0);
      expect(demand.overallResourceFeasibility).toBe('CRITICAL_SHORTAGE');
    });
  });

  describe('Intervention Trade-Off Analysis Service', () => {
    const candidateA = {
      optionId: 'OPTION_A',
      name: 'Protect Substation',
      description: 'Pneumatic barriers & backup power',
      affectedDomains: ['UTILITY', 'CLIMATE'] as any,
      estimatedCost: 85000,
      estimatedDowntime: 1.5,
      estimatedPopulationBenefit: 28500,
      estimatedRiskReduction: 32.5,
      resourceRequirement: { emergencyCrews: 4, mobileGenerators: 2 },
      implementationTime: 2.0,
      confidence: 94.5,
      priorityScore: 89.2,
      requiresHumanApproval: true as const,
    };

    const candidateB = {
      optionId: 'OPTION_B',
      name: 'Transit Corridor Reroute',
      description: 'Clear arterial roads',
      affectedDomains: ['MOBILITY'] as any,
      estimatedCost: 35000,
      estimatedDowntime: 0.5,
      estimatedPopulationBenefit: 19000,
      estimatedRiskReduction: 22.0,
      resourceRequirement: { emergencyCrews: 2, mobileGenerators: 0 },
      implementationTime: 1.0,
      confidence: 91.0,
      priorityScore: 81.4,
      requiresHumanApproval: true as const,
    };

    it('should calculate trade-offs across cost, risk, population, and deployment dimensions', () => {
      const analysis = cityDecisionTradeOffService.analyzeTradeOffs(candidateA, [candidateB]);
      expect(analysis.candidateId).toBe('OPTION_A');
      expect(analysis.tradeOffs.length).toBe(4);
      expect(analysis.overallTradeOffRating).toBeDefined();
    });

    it('should generate scorecards for all 5 weight profiles', () => {
      const profiles = ['LIFE_SAFETY_FIRST', 'SERVICE_CONTINUITY', 'COST_EFFICIENCY', 'RAPID_RESPONSE', 'BALANCED'] as const;

      for (const profile of profiles) {
        const scorecard = cityDecisionTradeOffService.generateScorecard(candidateA, profile);
        expect(scorecard.candidateId).toBe('OPTION_A');
        expect(scorecard.strategyProfile).toBe(profile);
        expect(scorecard.scores.overallScore).toBeGreaterThanOrEqual(0);
        expect(scorecard.scores.overallScore).toBeLessThanOrEqual(100);
        expect(scorecard.priorityTier).toBeDefined();
      }
    });
  });

  describe('Decision Sensitivity Service', () => {
    const candidates = [
      {
        optionId: 'OPTION_A',
        name: 'Protect Substation',
        description: 'Pneumatic barriers',
        affectedDomains: ['UTILITY'] as any,
        estimatedCost: 85000,
        estimatedDowntime: 1.5,
        estimatedPopulationBenefit: 28500,
        estimatedRiskReduction: 32.5,
        resourceRequirement: { emergencyCrews: 4, mobileGenerators: 2 },
        implementationTime: 2.0,
        confidence: 94.5,
        priorityScore: 89.2,
        requiresHumanApproval: true as const,
      },
      {
        optionId: 'OPTION_B',
        name: 'Transit Corridor Reroute',
        description: 'Clear arterial roads',
        affectedDomains: ['MOBILITY'] as any,
        estimatedCost: 35000,
        estimatedDowntime: 0.5,
        estimatedPopulationBenefit: 19000,
        estimatedRiskReduction: 22.0,
        resourceRequirement: { emergencyCrews: 2, mobileGenerators: 0 },
        implementationTime: 1.0,
        confidence: 91.0,
        priorityScore: 81.4,
        requiresHumanApproval: true as const,
      },
    ];

    it('should evaluate 5 sensitivity perturbations and report overall robustness', () => {
      const report = cityDecisionSensitivityService.analyzeSensitivity('scen-101', candidates);
      expect(report.scenarioId).toBe('scen-101');
      expect(report.perturbations.length).toBe(5);
      expect(report.overallRobustnessLevel).toBeDefined();
      expect(report.overallSensitivityScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Decision Threshold Engine', () => {
    it('should evaluate threshold triggers and compute advisory escalation states', () => {
      const report = cityDecisionThresholdService.evaluateThresholds('scen-101', {
        riskScore: 88.4,
        populationExposed: 34200,
        cascadeProbability: 0.82,
        confidence: 94.5,
        resourceShortageCount: 2,
        timeToImpactHours: 2.5,
        serviceDisruptionIndex: 78.0,
      });

      expect(report.scenarioId).toBe('scen-101');
      expect(report.evaluations.length).toBe(7);
      expect(report.requiresHumanApproval).toBe(true);
      expect(report.advisoryEscalationState).toBe('CRITICAL_REVIEW');
      expect(report.urgencyLevel).toBe('EXTREME');
    });

    it('should report LOW urgency when no thresholds are triggered', () => {
      const report = cityDecisionThresholdService.evaluateThresholds('scen-102', {
        riskScore: 40.0,
        populationExposed: 5000,
        cascadeProbability: 0.20,
        confidence: 95.0,
        resourceShortageCount: 0,
        timeToImpactHours: 12.0,
        serviceDisruptionIndex: 20.0,
      });

      expect(report.advisoryEscalationState).toBe('MONITOR');
      expect(report.urgencyLevel).toBe('LOW');
      expect(report.triggeredThresholdsCount).toBe(0);
    });
  });

  describe('AI Agent Tool Registry Section 18 Tools', () => {
    const newToolIds = [
      'city_decision_resource_analysis',
      'city_decision_constraint_analysis',
      'city_decision_tradeoff_analysis',
      'city_decision_sensitivity_analysis',
      'city_decision_scorecard',
      'city_decision_threshold_analysis',
      'city_decision_audit_analysis',
    ];

    it('should have all 7 Mega Prompt 5 tools registered', () => {
      for (const toolId of newToolIds) {
        const tool = toolRegistry.getTool(toolId);
        expect(tool).toBeDefined();
        expect(tool?.readOnly).toBe(true);
      }
    });

    it('should invoke tools and return structured data with human authorization flag', async () => {
      for (const toolId of newToolIds) {
        const res = await toolRegistry.invokeTool(toolId, { scenarioId: 'scen-101' });
        expect(res.status).toBe('SUCCESS');
        const output = JSON.parse(res.outputSummary);
        expect(output.dataSource).toBe('SIMULATION');
        expect(output.requiresHumanApproval).toBe(true);
      }
    });
  });
});
