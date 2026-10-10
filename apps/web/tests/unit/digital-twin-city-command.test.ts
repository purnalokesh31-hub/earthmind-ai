import { describe, it, expect, beforeEach } from 'vitest';
import { memoryCityCommandRepository } from '../../lib/server/repositories/city-command.repository';
import { cityCommandQueueService } from '../../lib/server/services/city-command-queue.service';
import { cityCommandEvidenceService } from '../../lib/server/services/city-command-evidence.service';
import { cityCommandEscalationService } from '../../lib/server/services/city-command-escalation.service';
import { cityCommandDecisionService } from '../../lib/server/services/city-command-decision.service';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.11 — Human Command & Authorization Center', () => {
  const repo = memoryCityCommandRepository;

  beforeEach(() => {
    // Repository starts with default seeded command cases
  });

  // 1. Command Case Creation & Repository
  describe('Command Case Creation & Repository', () => {
    it('seeds default command review cases on initialization', () => {
      const cases = repo.listCases();
      expect(cases.length).toBeGreaterThanOrEqual(2);
      expect(cases.some((c) => c.caseId === 'case-cmd-101')).toBe(true);
    });

    it('creates a new command review case with advisory safety invariants', () => {
      const created = repo.createCase({
        title: 'Emergency Storm Drain Clearance',
        description: 'Clear primary storm drains prior to heavy rainfall event.',
        cityId: 'city-vja',
        sourceType: 'INTERVENTION_PLANNING',
        sourceReferenceId: 'int-new-99',
        riskScore: 72,
        riskTier: 'HIGH',
        confidenceScore: 85,
        confidenceLevel: 'HIGH_CONFIDENCE',
        populationImpact: 18000,
        requiredAuthorizationLevel: 'CITY_COMMANDER',
      });

      expect(created.status).toBe('PENDING_REVIEW');
      expect(created.requiresHumanApproval).toBe(true);
      expect(created.advisoryOnly).toBe(true);
      expect(created.autonomousExecution).toBe(false);

      const fetched = repo.getCase(created.caseId);
      expect(fetched?.title).toBe('Emergency Storm Drain Clearance');
    });
  });

  // 2. Queue Prioritization Engine
  describe('Queue Prioritization Engine', () => {
    it('generates prioritized review queue ranked by risk score and population exposure', () => {
      const queue = cityCommandQueueService.getPrioritizedQueue('city-vja');
      expect(queue.length).toBeGreaterThan(0);
      expect(queue[0].queuePriority).toBe(1);
      expect(queue[0].priorityFactors.length).toBeGreaterThan(0);
      expect(queue[0].requiresHumanApproval).toBe(true);
    });
  });

  // 3. Human Decision Engine & Authorization Controls
  describe('Human Decision Engine', () => {
    it('processes valid operator APPROVE decision with server confirmation token', () => {
      const created = repo.createCase({
        title: 'Routine Maintenance Case',
        description: 'Low-risk culvert maintenance.',
        cityId: 'city-vja',
        sourceType: 'DECISION_INTELLIGENCE',
        sourceReferenceId: 'dec-1',
        riskScore: 15,
        riskTier: 'LOW',
        confidenceScore: 90,
        confidenceLevel: 'HIGH_CONFIDENCE',
        requiredAuthorizationLevel: 'OPERATOR',
      });

      const result = cityCommandDecisionService.processOperatorDecision(
        {
          userId: 'usr-operator-1',
          userName: 'Commander Operator',
          role: 'ANALYST',
          authorizationLevel: 'OPERATOR',
        },
        {
          caseId: created.caseId,
          decision: 'APPROVE',
          reason: 'Verified routine risk bounds.',
          confirmationToken: 'CONFIRM-1234',
        }
      );

      expect(result.decision.decision).toBe('APPROVE');
      expect(result.caseEntity.status).toBe('APPROVED');
      expect(result.requiresHumanApproval).toBe(true);
      expect(result.advisoryOnly).toBe(true);
      expect(result.autonomousExecution).toBe(false);
    });

    it('rejects APPROVE decision if server confirmation token is missing', () => {
      const created = repo.createCase({
        title: 'Confirmation Token Test',
        description: 'Test case',
        cityId: 'city-vja',
        sourceType: 'GOVERNANCE',
        sourceReferenceId: 'ref-1',
        riskScore: 25,
        riskTier: 'GUARDED',
        confidenceScore: 80,
        confidenceLevel: 'HIGH_CONFIDENCE',
        requiredAuthorizationLevel: 'OPERATOR',
      });

      expect(() =>
        cityCommandDecisionService.processOperatorDecision(
          {
            userId: 'usr-operator-1',
            role: 'ANALYST',
            authorizationLevel: 'OPERATOR',
          },
          {
            caseId: created.caseId,
            decision: 'APPROVE',
            reason: 'Missing confirmation token',
            confirmationToken: '', // Empty token
          }
        )
      ).toThrow(/MISSING_CONFIRMATION_TOKEN/);
    });

    it('rejects decision if operator authorization level is insufficient', () => {
      expect(() =>
        cityCommandDecisionService.processOperatorDecision(
          {
            userId: 'usr-junior-op',
            role: 'ANALYST', // OPERATOR level
            authorizationLevel: 'OPERATOR',
          },
          {
            caseId: 'case-cmd-101', // Requires CITY_COMMANDER level
            decision: 'APPROVE',
            reason: 'Attempted approval with insufficient level',
            confirmationToken: 'CONFIRM-TOKEN',
          }
        )
      ).toThrow(/AUTHORIZATION_LEVEL_INSUFFICIENT/);
    });

    it('prevents duplicate decision modification on terminal cases (COMMAND_CASE_ALREADY_DECIDED)', () => {
      const created = repo.createCase({
        title: 'Terminal State Test',
        description: 'Test case',
        cityId: 'city-vja',
        sourceType: 'GOVERNANCE',
        sourceReferenceId: 'ref-2',
        riskScore: 10,
        riskTier: 'LOW',
        confidenceScore: 90,
        confidenceLevel: 'HIGH_CONFIDENCE',
        requiredAuthorizationLevel: 'OPERATOR',
      });

      // First decision: APPROVE
      cityCommandDecisionService.processOperatorDecision(
        { userId: 'usr-operator-1', role: 'ANALYST', authorizationLevel: 'OPERATOR' },
        { caseId: created.caseId, decision: 'APPROVE', reason: 'Initial approval', confirmationToken: 'CONFIRM-TOKEN' }
      );

      // Second decision attempt: REJECT (Should fail)
      expect(() =>
        cityCommandDecisionService.processOperatorDecision(
          { userId: 'usr-operator-1', role: 'ANALYST', authorizationLevel: 'OPERATOR' },
          { caseId: created.caseId, decision: 'REJECT', reason: 'Attempted duplicate decision' }
        )
      ).toThrow(/COMMAND_CASE_ALREADY_DECIDED/);
    });
  });

  // 4. Evidence Request & Escalation Workflows
  describe('Evidence Request & Escalation Workflows', () => {
    it('creates evidence request and updates case status to EVIDENCE_REQUESTED', () => {
      const reqDto = cityCommandEvidenceService.requestEvidence({
        caseId: 'case-cmd-102',
        requestedBy: 'usr-operator-1',
        reason: 'Insufficient river telemetry stream accuracy.',
        requiredEvidence: ['Water Level Gauge Sensor 12', 'Upstream Rainfall Telemetry'],
      });

      expect(reqDto.status).toBe('OPEN');
      const caseEntity = repo.getCase('case-cmd-102');
      expect(caseEntity?.status).toBe('EVIDENCE_REQUESTED');
    });

    it('escalates command case authorization level and records escalation entity', () => {
      const result = cityCommandEscalationService.escalateCase({
        caseId: 'case-cmd-101',
        requestedBy: 'usr-senior-op',
        targetAuthorizationLevel: 'EMERGENCY_COMMANDER',
        reason: 'Severe weather surge requires Emergency Commander sign-off.',
      });

      expect(result.escalation.toAuthorizationLevel).toBe('EMERGENCY_COMMANDER');
      expect(result.caseEntity.requiredAuthorizationLevel).toBe('EMERGENCY_COMMANDER');
      expect(result.caseEntity.status).toBe('ESCALATED');
    });
  });

  // 5. AI Safety & Non-Negotiable Governance Invariants
  describe('AI Agent Security & Safety Invariants', () => {
    it('verifies AI tools are strictly read-only advisory and require human action', async () => {
      const tool = toolRegistry.getTool('city_command_overview');
      expect(tool).toBeDefined();
      expect(tool?.readOnly).toBe(true);

      const res = await toolRegistry.invokeTool('city_command_overview', {});
      const parsed = JSON.parse(res.outputSummary);
      expect(parsed.requiresHumanApproval).toBe(true);
      expect(parsed.humanActionRequired).toBe(true);
      expect(parsed.advisoryOnly).toBe(true);
      expect(parsed.autonomousExecution).toBe(false);
    });

    it('asserts summary metrics enforce requiresHumanApproval=true, advisoryOnly=true, autonomousExecution=false', () => {
      const summary = repo.getSummary();
      expect(summary.requiresHumanApproval).toBe(true);
      expect(summary.advisoryOnly).toBe(true);
      expect(summary.autonomousExecution).toBe(false);
      expect(summary.provenance).toBe('GOVERNANCE');
    });
  });
});
