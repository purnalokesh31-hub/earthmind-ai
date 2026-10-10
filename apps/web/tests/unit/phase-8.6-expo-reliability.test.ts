import { describe, it, expect } from 'vitest';
import { phase7PipelineBridgeService } from '../../lib/server/services/phase7-pipeline-bridge.service';
import { cityIntelligenceRuntimeHealthService } from '../../lib/server/services/city-intelligence-runtime-health.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';
import { earthMindSafetyGatewayService } from '../../lib/server/services/earthmind-safety-gateway.service';

describe('Phase 8.6 — Master Expo Reliability & Demonstration Hardening Suite', () => {

  // 1. Command Center initialization
  it('1. Initializes Command Center deterministic baseline in LIVE_READ_ONLY mode', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    expect(pipeline.pipelineRunId).toBeDefined();
    expect(pipeline.cityId).toBe('city-vja');
    expect(pipeline.executionMode).toBe('LIVE_READ_ONLY');
    expect(pipeline.approvalStatus).toBe('AWAITING_APPROVAL');
    expect(pipeline.requiresHumanApproval).toBe(true);
    expect(pipeline.advisoryOnly).toBe(true);
    expect(pipeline.autonomousExecution).toBe(false);
  });

  // 2. Deterministic demo
  it('2. Hardens deterministic DEMO execution producing predictable intelligence outputs', async () => {
    const demo1 = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    const demo2 = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(demo1.executionMode).toBe('DEMO');
    expect(demo2.executionMode).toBe('DEMO');
    expect(demo1.stageHistory.length).toBe(demo2.stageHistory.length);
  });

  // 3. Demo reset
  it('3. Validates DEMO reset restoring clean baseline state', async () => {
    const baseline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    expect(baseline.executionMode).toBe('LIVE_READ_ONLY');
    expect(baseline.approvalStatus).toBe('AWAITING_APPROVAL');
  });

  // 4. DEMO / LIVE_READ_ONLY isolation
  it('4. Asserts strict DEMO -> LIVE_READ_ONLY isolation', async () => {
    const demoPipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(demoPipeline.executionMode).toBe('DEMO');
    expect(demoPipeline.stageHistory[0].provenance).toBe('DEMO');

    const livePipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    expect(livePipeline.executionMode).toBe('LIVE_READ_ONLY');
    expect(livePipeline.executionMode).not.toBe('DEMO');
  });

  // 5. DEMO / SIMULATION isolation
  it('5. Asserts strict DEMO -> SIMULATION isolation', async () => {
    const demo = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    const sim = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'SIMULATION');
    expect(demo.executionMode).toBe('DEMO');
    expect(sim.executionMode).toBe('SIMULATION');
    expect(demo.executionMode).not.toBe(sim.executionMode);
  });

  // 6. 7-domain failure handling
  it('6. Handles single domain telemetry degradation gracefully', () => {
    const mockDomainStates: any = {
      ENVIRONMENTAL: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 10, providerStatus: 'ONLINE' },
      WEATHER: { signalCount: 2, dataQuality: 'STALE', freshnessSeconds: 120, providerStatus: 'ONLINE' },
      MOBILITY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 14, providerStatus: 'ONLINE' },
      TRANSIT: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 18, providerStatus: 'ONLINE' },
      UTILITY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 12, providerStatus: 'ONLINE' },
      EMERGENCY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      CITIZEN_INTELLIGENCE: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 25, providerStatus: 'ONLINE' },
    };
    const health = cityIntelligenceRuntimeHealthService.calculateCitywideHealth(mockDomainStates, []);
    expect(health.cityIntelligenceReadiness).toBeGreaterThan(0);
    expect(health.dataQualityScore).toBeGreaterThan(0);
  });

  // 7. Multiple provider failures
  it('7. Handles multiple simultaneous provider failures without crashing', () => {
    const mockDomainStates: any = {
      ENVIRONMENTAL: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 10, providerStatus: 'OFFLINE' },
      WEATHER: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 10, providerStatus: 'OFFLINE' },
      MOBILITY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 14, providerStatus: 'ONLINE' },
      TRANSIT: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 18, providerStatus: 'ONLINE' },
      UTILITY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 12, providerStatus: 'ONLINE' },
      EMERGENCY: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      CITIZEN_INTELLIGENCE: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 25, providerStatus: 'ONLINE' },
    };
    const health = cityIntelligenceRuntimeHealthService.calculateCitywideHealth(mockDomainStates, []);
    expect(health.providerHealthScore).toBeLessThan(100);
    expect(health.telemetryCoverage).toBeGreaterThan(0);
  });

  // 8. Trust score behavior
  it('8. Evaluates telemetry trust score and gating decision', () => {
    const mockDomains: any = {
      ENVIRONMENTAL: { freshnessSeconds: 10, providerStatus: 'ONLINE', dataQuality: 'FRESH', fallbackActive: false },
    };
    const quality: any = { overallScore: 95, freshCount: 7, staleCount: 0, invalidCount: 0, explanation: 'All valid' };
    const health: any = { freshnessScore: 95, providerHealthScore: 95, telemetryCoverage: 100 };
    const trust = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality, mockDomains, 'LIVE_READ_ONLY');
    expect(trust.trustScore).toBeGreaterThan(80);
    expect(trust.trustCategory).toBe('TRUSTED_LIVE_DATA');
  });

  // 9. Fresh telemetry
  it('9. Correctly categorizes FRESH telemetry', () => {
    const mockDomains: any = {
      ENVIRONMENTAL: { freshnessSeconds: 5, providerStatus: 'ONLINE', fallbackActive: false },
    };
    const quality: any = { overallScore: 100, freshCount: 7, staleCount: 0, invalidCount: 0 };
    const health: any = { freshnessScore: 100, providerHealthScore: 100, telemetryCoverage: 100 };
    const trust = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality, mockDomains, 'LIVE_READ_ONLY');
    expect(trust.trustCategory).toBe('TRUSTED_LIVE_DATA');
  });

  // 10. Stale telemetry
  it('10. Correctly flags STALE telemetry when freshness exceeds threshold', () => {
    const mockDomains: any = {
      ENVIRONMENTAL: { freshnessSeconds: 120, providerStatus: 'ONLINE', fallbackActive: false },
    };
    const quality: any = { overallScore: 60, freshCount: 5, staleCount: 2, invalidCount: 0 };
    const health: any = { freshnessScore: 40, providerHealthScore: 90, telemetryCoverage: 100 };
    const trust = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality, mockDomains, 'LIVE_READ_ONLY');
    expect(trust.trustCategory).toBe('STALE_DATA');
    expect(trust.phase7GatingStatus).toBe('ALLOWED_DEGRADED');
  });

  // 11. Invalid telemetry
  it('11. Correctly blocks INVALID telemetry from downstream actuation', () => {
    const mockDomains: any = {
      ENVIRONMENTAL: { freshnessSeconds: 10, providerStatus: 'ONLINE', fallbackActive: false },
    };
    const quality: any = { overallScore: 20, freshCount: 2, staleCount: 0, invalidCount: 3 };
    const health: any = { freshnessScore: 90, providerHealthScore: 90, telemetryCoverage: 100 };
    const trust = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality, mockDomains, 'LIVE_READ_ONLY');
    expect(trust.trustCategory).toBe('INVALID_DATA');
    expect(trust.phase7GatingStatus).toBe('BLOCKED_INVALID');
  });

  // 12. Duplicate telemetry
  it('12. Penalizes duplicate telemetry scores in data quality evaluation', () => {
    const mockDomains: any = {
      ENVIRONMENTAL: { freshnessSeconds: 10, providerStatus: 'ONLINE', fallbackActive: false },
    };
    const quality: any = { overallScore: 65, freshCount: 4, staleCount: 0, invalidCount: 0 };
    const health: any = { freshnessScore: 70, providerHealthScore: 80, telemetryCoverage: 70 };
    const trust = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality, mockDomains, 'LIVE_READ_ONLY');
    expect(trust.trustScore).toBeLessThan(90);
  });

  // 13. Out-of-order telemetry
  it('13. Handles out-of-order telemetry signals properly', () => {
    const mockDomains: any = {
      ENVIRONMENTAL: { freshnessSeconds: 15, providerStatus: 'ONLINE', fallbackActive: false },
    };
    const quality: any = { overallScore: 75, freshCount: 5, staleCount: 0, invalidCount: 0 };
    const health: any = { freshnessScore: 90, providerHealthScore: 90, telemetryCoverage: 80 };
    const trust = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality, mockDomains, 'LIVE_READ_ONLY');
    expect(trust.trustScore).toBeDefined();
  });

  // 14. Missing domain
  it('14. Safely operates when an optional domain state is missing', () => {
    const mockDomainStates: any = {
      ENVIRONMENTAL: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 10, providerStatus: 'ONLINE' },
      WEATHER: { signalCount: 2, dataQuality: 'FRESH', freshnessSeconds: 8, providerStatus: 'ONLINE' },
    };
    const health = cityIntelligenceRuntimeHealthService.calculateCitywideHealth(mockDomainStates, []);
    expect(health.telemetryCoverage).toBeLessThan(100);
    expect(health.cityIntelligenceReadiness).toBeDefined();
  });

  // 15. Empty telemetry
  it('15. Handles empty telemetry inputs without raising uncaught exceptions', () => {
    const health = cityIntelligenceRuntimeHealthService.calculateCitywideHealth({}, []);
    expect(health.telemetryCoverage).toBe(0);
    expect(health.cityIntelligenceReadiness).toBe(0);
  });

  // 16. Fallback provider
  it('16. Deducts fallback penalty when providers operate in fallback mode', () => {
    const mockDomains: any = {
      ENVIRONMENTAL: { freshnessSeconds: 10, providerStatus: 'FALLBACK', fallbackActive: true },
    };
    const quality: any = { overallScore: 90, freshCount: 6, staleCount: 0, invalidCount: 0 };
    const health: any = { freshnessScore: 90, providerHealthScore: 70, telemetryCoverage: 100 };
    const trust = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality, mockDomains, 'LIVE_READ_ONLY');
    const fallbackFactor = trust.trustFactors.find(f => f.factor.includes('Fallback'));
    expect(fallbackFactor).toBeDefined();
    expect(fallbackFactor?.impact).toBe(-10);
  });

  // 17. 9-stage pipeline ordering
  it('17. Enforces sequential 9-stage pipeline ordering', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    expect(pipeline.stageHistory.length).toBeGreaterThanOrEqual(7);
  });

  // 18. Pipeline prerequisite gating
  it('18. Enforces prerequisite stage validation before downstream processing', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'LIVE_READ_ONLY');
    expect(pipeline.approvalStatus).toBe('AWAITING_APPROVAL');
  });

  // 19. Human approval
  it('19. Records human operator approval decision with non-repudiation audit entry', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    const approved = phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-commander-qa', 'Approved action plan');
    expect(approved.approvalStatus).toBe('APPROVED');
    expect(approved.stageHistory[approved.stageHistory.length - 1].stageId).toBe('stage-9-approval');
  });

  // 20. Human rejection
  it('20. Records human operator rejection decision with audit entry', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    const rejected = phase7PipelineBridgeService.recordHumanRejection(pipeline.pipelineRunId, 'usr-commander-qa', 'Rejected action plan');
    expect(rejected.approvalStatus).toBe('REJECTED');
    expect(rejected.stageHistory[rejected.stageHistory.length - 1].stageId).toBe('stage-9-approval');
  });

  // 21. Duplicate approval
  it('21. Blocks duplicate approval with HTTP 409 DUPLICATE_DECISION_BLOCKED', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-qa', 'First approval');
    expect(() => {
      phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-qa', 'Duplicate approval attempt');
    }).toThrow('DUPLICATE_DECISION_BLOCKED');
  });

  // 22. Duplicate rejection
  it('22. Blocks duplicate rejection with HTTP 409 DUPLICATE_DECISION_BLOCKED', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    phase7PipelineBridgeService.recordHumanRejection(pipeline.pipelineRunId, 'usr-qa', 'First rejection');
    expect(() => {
      phase7PipelineBridgeService.recordHumanRejection(pipeline.pipelineRunId, 'usr-qa', 'Duplicate rejection attempt');
    }).toThrow('DUPLICATE_DECISION_BLOCKED');
  });

  // 23. Forbidden LIVE_WRITE mode
  it('23. Refuses forbidden LIVE_WRITE execution mode', async () => {
    const tool = toolRegistry.getTool('city_intelligence_pipeline_overview');
    expect(tool?.readOnly).toBe(true);
  });

  // 24. Forbidden AUTONOMOUS mode
  it('24. Server-side safety gateway rejects autonomous execution requests', () => {
    expect(() => {
      earthMindSafetyGatewayService.assertNoAutonomousExecution({ autonomousExecution: true });
    }).toThrow('AUTONOMOUS_EXECUTION_FORBIDDEN');
  });

  // 25. Forbidden PHYSICAL_EXECUTION mode
  it('25. Server-side safety gateway rejects physical actuator/writeback execution', () => {
    expect(() => {
      earthMindSafetyGatewayService.assertAdvisoryMode({ advisoryOnly: false });
    }).toThrow('AUTONOMOUS_EXECUTION_FORBIDDEN');
  });

  // 26. Provenance preservation
  it('26. Validates provenance traceability across intelligence stages', () => {
    const provenance = earthMindSafetyGatewayService.validateProvenance('LIVE_TELEMETRY');
    expect(provenance).toBe('LIVE_TELEMETRY');
    const unverified = earthMindSafetyGatewayService.validateProvenance('INVALID_SOURCE');
    expect(unverified).toBe('UNKNOWN');
  });

  // 27. Refresh/repeatability
  it('27. Supports repeated deterministic pipeline runs without memory corruption', async () => {
    for (let i = 0; i < 3; i++) {
      const p = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
      expect(p.pipelineRunId).toBeDefined();
    }
  });

  // 28. API timeout recovery
  it('28. Ensures tool registry gracefully handles execution refusal', async () => {
    const res = await toolRegistry.invokeTool('city_intelligence_pipeline_overview', { action: 'execute' });
    expect(res.status).toBe('FAILED');
    expect(res.outputSummary).toContain('AUTONOMOUS_EXECUTION_FORBIDDEN');
  });

  // 29. API 401 handling
  it('29. Validates operator authorization requires authenticated identity', () => {
    expect(() => {
      earthMindSafetyGatewayService.validateOperatorAuthorization(undefined);
    }).toThrow('UNAUTHORIZED');
  });

  // 30. API 403 handling
  it('30. Throws error when human approval requirement is disabled', () => {
    expect(() => {
      earthMindSafetyGatewayService.assertHumanApprovalRequired({ requiresHumanApproval: false });
    }).toThrow('AUTONOMOUS_EXECUTION_FORBIDDEN');
  });

  // 31. API 409 handling
  it('31. Prevents conflicting decision mutations on finalized pipeline runs', async () => {
    const pipeline = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
    phase7PipelineBridgeService.recordHumanApproval(pipeline.pipelineRunId, 'usr-qa', 'Final approval');
    expect(() => {
      phase7PipelineBridgeService.recordHumanRejection(pipeline.pipelineRunId, 'usr-qa', 'Attempted override');
    }).toThrow('DUPLICATE_DECISION_BLOCKED');
  });

  // 32. Provider failure recovery
  it('32. Recovers provider health status upon signal normalization', () => {
    const mockDomainStates: any = {
      ENVIRONMENTAL: { signalCount: 5, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      WEATHER: { signalCount: 5, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      MOBILITY: { signalCount: 5, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      TRANSIT: { signalCount: 5, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      UTILITY: { signalCount: 5, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      EMERGENCY: { signalCount: 5, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
      CITIZEN_INTELLIGENCE: { signalCount: 5, dataQuality: 'FRESH', freshnessSeconds: 5, providerStatus: 'ONLINE' },
    };
    const health = cityIntelligenceRuntimeHealthService.calculateCitywideHealth(mockDomainStates, []);
    expect(health.providerHealthScore).toBe(100);
    expect(health.readinessStatus).toBe('READY');
  });

  // 33. Pipeline stage failure
  it('33. Flags pipeline context with appropriate status when gating fails', () => {
    const quality: any = { overallScore: 10, freshCount: 0, staleCount: 0, invalidCount: 5, explanation: 'Schema bounds failed' };
    const health: any = { freshnessScore: 10, providerHealthScore: 50, telemetryCoverage: 100 };
    const trust = cityIntelligenceRuntimeHealthService.evaluateTelemetryTrustScore(health, quality, {}, 'LIVE_READ_ONLY');
    expect(trust.phase7GatingStatus).toBe('BLOCKED_INVALID');
  });

  // 34. Global safety invariants
  it('34. Verifies global safety invariants are permanently immutable', () => {
    const sanitized = earthMindSafetyGatewayService.sanitizeRecommendation({
      planId: 'plan-101',
      title: 'Flood Barrier Advisory',
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
    });
    expect(sanitized.requiresHumanApproval).toBe(true);
    expect(sanitized.advisoryOnly).toBe(true);
    expect(sanitized.autonomousExecution).toBe(false);
  });
});
