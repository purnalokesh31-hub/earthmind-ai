// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.4 Climate Resilience Unit Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { climateDataService } from '../../lib/server/services/climate-data.service';
import { climateScenarioService } from '../../lib/server/services/climate-scenario.service';
import { climateExposureService } from '../../lib/server/services/climate-exposure.service';
import { infrastructureVulnerabilityService } from '../../lib/server/services/infrastructure-vulnerability.service';
import { climateImpactPropagationService } from '../../lib/server/services/climate-impact-propagation.service';
import { climateResilienceScoreService } from '../../lib/server/services/climate-resilience-score.service';
import { climateAdaptationService } from '../../lib/server/services/climate-adaptation.service';
import { climateInvestmentPriorityService } from '../../lib/server/services/climate-investment-priority.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.4 — Climate Resilience & Infrastructure Adaptation Suite', () => {
  // ── 1. Climate Data Provider Abstraction ──
  it('should retrieve climate indicators tagged as SIMULATION', async () => {
    const indicators = await climateDataService.getClimateIndicators('city-vja');
    expect(indicators.dataSource).toBe('SIMULATION');
    expect(indicators.floodRiskIndex).toBeGreaterThan(0);
  });

  // ── 2. Scenario Creation ──
  it('should create and store climate hazard scenarios', async () => {
    const scenario = await climateScenarioService.createScenario(
      'Test Extreme Rainfall',
      'Test 100mm/h precipitation event',
      'city-vja',
      'HEAVY_RAINFALL',
      'EXTREME',
      'NEXT_30_DAYS',
      'dutycommander@earthmind.gov'
    );

    expect(scenario.scenarioId).toBeDefined();
    expect(scenario.status).toBe('READY');
  });

  // ── 3. Exposure, Vulnerability & Resilience Score ──
  it('should calculate exposed assets, vulnerabilities, and city resilience score', async () => {
    const exposed = await climateExposureService.calculateExposedAssets('clm-scn-101', 'city-vja');
    expect(exposed.length).toBeGreaterThan(0);

    const vulnerabilities = await infrastructureVulnerabilityService.calculateVulnerabilities('city-vja');
    expect(vulnerabilities.length).toBeGreaterThan(0);
    expect(vulnerabilities[0].vulnerabilityClass).toBeDefined();

    const score = await climateResilienceScoreService.calculateResilienceScore('city-vja');
    expect(score.overallResilienceScore).toBeGreaterThan(0);
    expect(score.resilienceCategory).toBe('VULNERABLE');
  });

  // ── 4. Impact Propagation & Adaptation Approval ──
  it('should calculate impact propagation chains and approve adaptation options', async () => {
    const impacts = await climateImpactPropagationService.calculateImpactPropagation('FLOOD', 'city-vja');
    expect(impacts.length).toBeGreaterThan(0);

    const approved = await climateAdaptationService.approveAdaptation('adp-101');
    expect(approved.approvalStatus).toBe('APPROVED');
    expect(approved.requiresHumanApproval).toBe(true);

    const investments = await climateInvestmentPriorityService.calculateInvestmentPriorities('city-vja');
    expect(investments.length).toBeGreaterThan(0);
  });

  // ── 5. AI Agent Tool Registry Integration ──
  it('should possess registered climate intelligence tools in AI Agent tool registry', () => {
    const tools = toolRegistry.listTools();
    const climateTools = tools.filter((t) => t.toolId.startsWith('climate_'));
    expect(climateTools.length).toBeGreaterThanOrEqual(7);
  });
});
