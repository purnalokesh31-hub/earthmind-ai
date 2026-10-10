import { describe, it, expect, beforeEach } from 'vitest';
import { memoryCityResponseReadinessRepository } from '../../lib/server/repositories/city-response-readiness.repository';
import { cityResponseReadinessService } from '../../lib/server/services/city-response-readiness.service';
import { cityResponseMonitoringService } from '../../lib/server/services/city-response-monitoring.service';
import { cityResponseOutcomeService } from '../../lib/server/services/city-response-outcome.service';
import { cityResponseEscalationService } from '../../lib/server/services/city-response-escalation.service';
import { cityResponseReadinessOrchestratorService } from '../../lib/server/services/city-response-readiness-orchestrator.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.11 — Citywide Response Execution Readiness & Outcome Monitoring Intelligence', () => {
  const repo = memoryCityResponseReadinessRepository;

  beforeEach(() => {
    // Repository starts with seeded default assessment
  });

  // 1. Domain Models & Readiness Assessment
  describe('Domain Models & Readiness Assessment Engine', () => {
    it('creates response readiness assessment with safety invariants', () => {
      const created = repo.createReadiness({
        interventionId: 'int-202',
        cityId: 'city-vja',
        title: 'Benz Circle Drainage Barrier Response',
        description: 'Readiness evaluation for high rainfall event.',
      });

      expect(created.status).toBe('DRAFT');
      expect(created.requiresHumanApproval).toBe(true);
      expect(created.advisoryOnly).toBe(true);
      expect(created.autonomousExecution).toBe(false);
      expect(created.provenance).toBe('EXECUTION_READINESS');
    });

    it('evaluates readiness score and classification', () => {
      const evaluated = cityResponseReadinessService.evaluateResponseReadiness('resp-readiness-101');
      expect(evaluated.scores.readinessScore).toBeGreaterThan(0);
      expect(['READY', 'CONDITIONALLY_READY', 'NOT_READY', 'BLOCKED']).toContain(evaluated.scores.classification);
      expect(evaluated.checks.length).toBeGreaterThan(0);
    });

    it('enforces DATA_UNAVAILABLE when resource inventory telemetry is UNKNOWN', () => {
      const evaluated = cityResponseReadinessService.evaluateResponseReadiness('resp-readiness-101');
      const unkCheck = evaluated.checks.find((c) => c.category === 'DATA_UNAVAILABLE');

      expect(unkCheck).toBeDefined();
      expect(unkCheck?.status).toBe('DATA_UNAVAILABLE');
    });
  });

  // 2. Monitoring & Outcome Analysis
  describe('Monitoring Signals & Outcome Analysis', () => {
    it('collects monitoring signals and preserves provenance', () => {
      const signals = cityResponseMonitoringService.collectMonitoringSignals('resp-readiness-101');
      expect(signals.length).toBe(3);
      expect(signals.some((s) => s.provenance === 'LIVE_TELEMETRY')).toBe(true);
      expect(signals.every((s) => s.requiresHumanApproval)).toBe(true);
    });

    it('compares expected vs observed outcomes and classifies deviations', () => {
      const deviation = cityResponseOutcomeService.compareExpectedVsObserved('resp-readiness-101');
      expect(deviation.riskReductionDelta).toBe(-6);
      expect(deviation.serviceRecoveryDeltaMinutes).toBe(35);
      expect(deviation.severity).toBe('MODERATE');
      expect(deviation.requiresHumanApproval).toBe(true);
    });

    it('evaluates escalation recommendations without executing physical operations', () => {
      const escalation = cityResponseEscalationService.evaluateEscalation('resp-readiness-101');
      expect(escalation.escalationLevel).toBe('HIGH');
      expect(escalation.requiresHumanApproval).toBe(true);
      expect(escalation.advisoryOnly).toBe(true);
      expect(escalation.autonomousExecution).toBe(false);
    });
  });

  // 3. Master Orchestrator Pipeline
  describe('Master Readiness Orchestrator Pipeline', () => {
    it('runs master execution readiness pipeline asserting AUTONOMOUS_EXECUTION_FORBIDDEN=true', () => {
      expect(cityResponseReadinessOrchestratorService.AUTONOMOUS_EXECUTION_FORBIDDEN).toBe(true);

      const result = cityResponseReadinessOrchestratorService.runMasterExecutionReadinessPipeline({
        interventionId: 'int-orch-1',
        cityId: 'city-vja',
        title: 'Master Execution Pipeline Run',
        description: 'Testing master orchestrator pipeline.',
      });

      expect(result.status).toBe('OUTCOME_VALIDATING');
      expect(result.validation).toBeDefined();
      expect(result.feedback).toBeDefined();
      expect(result.requiresHumanApproval).toBe(true);
      expect(result.autonomousExecution).toBe(false);
    });

    it('blocks duplicate approval attempts with RESILIENCE_DECISION_ALREADY_DECIDED error', () => {
      const created = repo.createReadiness({
        interventionId: 'int-dup-1',
        cityId: 'city-vja',
        title: 'Duplicate Decision Test',
        description: 'Testing decision duplication protection.',
      });

      repo.saveApproval({
        approvalId: 'appr-resp-dup-1',
        readinessId: created.readinessId,
        interventionId: created.interventionId,
        userId: 'usr-op-1',
        decision: 'APPROVED',
        timestamp: new Date().toISOString(),
        requiresHumanApproval: true,
      });

      repo.updateStatus(created.readinessId, 'AUTHORIZED', 'usr-op-1');

      expect(() =>
        repo.updateStatus(created.readinessId, 'REJECTED', 'usr-op-1')
      ).toThrow(/RESILIENCE_DECISION_ALREADY_DECIDED/);
    });
  });

  // 4. AI Tools & Refusal Verification
  describe('AI Agent Tools & Autonomous Execution Refusal', () => {
    it('verifies AI tools assert safety invariants', async () => {
      const tool = toolRegistry.getTool('city_response_readiness_overview');
      expect(tool).toBeDefined();

      const result = await toolRegistry.invokeTool('city_response_readiness_overview', {});
      const parsed = JSON.parse(result.outputSummary);
      expect(parsed.requiresHumanApproval).toBe(true);
      expect(parsed.advisoryOnly).toBe(true);
      expect(parsed.autonomousExecution).toBe(false);
    });

    it('refuses autonomous execution requests safely', async () => {
      const result = await toolRegistry.invokeTool('city_response_readiness_overview', {
        action: 'execute',
        command: 'execute intervention automatically',
      });
      const parsed = JSON.parse(result.outputSummary);
      expect(parsed.error).toContain('AUTONOMOUS_EXECUTION_FORBIDDEN');
      expect(parsed.autonomousExecution).toBe(false);
    });
  });
});
