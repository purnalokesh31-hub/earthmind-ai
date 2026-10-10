// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 1: Human Governance & Approval Flow Verification Suite
// Validates Authentication, RBAC, Validation, Persistence, Audit Ledgers, and Error Gating
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as approveCommandCase } from '@/app/api/v1/digital-twin/command/cases/[id]/approve/route';
import { POST as recordGovernanceOverride } from '@/app/api/v1/digital-twin/governance/overrides/route';
import { POST as approveResilienceReadiness } from '@/app/api/v1/digital-twin/resilience/readiness/[id]/approve/route';
import { POST as approveResponseReadiness } from '@/app/api/v1/digital-twin/response-readiness/[id]/approve/route';
import { POST as approveIntervention } from '@/app/api/v1/digital-twin/interventions/[id]/approve/route';
import { POST as approveOperationalIntel } from '@/app/api/v1/digital-twin/operational-intelligence/[id]/approve/route';
import { POST as authorizeDecision } from '@/app/api/v1/digital-twin/decisions/authorize/route';

import { memoryCityCommandRepository } from '@/lib/server/repositories/city-command.repository';
import { memoryCityGovernanceRepository } from '@/lib/server/repositories/city-governance.repository';
import { memoryCityResilienceReadinessRepository } from '@/lib/server/repositories/city-resilience-readiness.repository';
import { memoryCityResponseReadinessRepository } from '@/lib/server/repositories/city-response-readiness.repository';
import { cityInterventionOrchestratorService } from '@/lib/server/services/city-intervention-orchestrator.service';
import { POST as approvePipelineRun } from '@/app/api/v1/digital-twin/intelligence-pipeline/[id]/approve/route';
import { phase7PipelineBridgeService } from '@/lib/server/services/phase7-pipeline-bridge.service';
import { JwtService } from '@/lib/server/auth/jwt.service';

const jwtService = new JwtService();

async function createAuthHeaders(role: 'COMMANDER' | 'ADMIN' | 'OPERATOR' | 'ANALYST' | 'VIEWER' = 'COMMANDER') {
  const token = await jwtService.generateAccessToken({
    sub: `usr-test-${role.toLowerCase()}`,
    email: `${role.toLowerCase()}@earthmind.test`,
    role,
    jti: `test-jti-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  });
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

describe('TASK 1 — Human Governance & High-Risk Approval Actions', () => {

  describe('1. Command Case Approval Gateway', () => {
    it('successfully authorizes case with COMMANDER role and records in audit ledger', async () => {
      const headers = await createAuthHeaders('COMMANDER');
      const caseId = 'case-cmd-101';

      const req = new NextRequest(`http://localhost:3000/api/v1/digital-twin/command/cases/${caseId}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          reason: 'Authorized tactical intervention plan for stormwater pump deployment.',
          confirmationToken: 'CONFIRM-APPROVE-VALID',
        }),
      });

      const res = await approveCommandCase(req, { params: Promise.resolve({ id: caseId }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.authorizationStatus).toBe('APPROVED_BY_HUMAN_OPERATOR');
      expect(json.requiresHumanApproval).toBe(true);

      // Verify persistence in audit ledger
      const auditLedger = memoryCityCommandRepository.getAuditLedger();
      const entry = auditLedger.find((a) => a.caseId === caseId);
      expect(entry).toBeDefined();
    });

    it('rejects unauthenticated requests with HTTP 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/command/cases/case-cmd-102/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Attempted unauth approval' }),
      });

      const res = await approveCommandCase(req, { params: Promise.resolve({ id: 'case-cmd-102' }) });
      expect(res.status).toBe(401);
    });

    it('rejects non-commander roles (e.g. VIEWER) with HTTP 403 Forbidden', async () => {
      const headers = await createAuthHeaders('VIEWER');
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/command/cases/case-cmd-101/approve', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: 'Viewer unauthorized attempt' }),
      });

      const res = await approveCommandCase(req, { params: Promise.resolve({ id: 'case-cmd-101' }) });
      expect(res.status).toBe(403);
    });
  });

  describe('2. Governance Policy Override Gateway', () => {
    it('successfully records policy override with COMMANDER role and creates real audit record', async () => {
      const headers = await createAuthHeaders('COMMANDER');
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/governance/overrides', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          policyId: 'pol-gov-human-auth',
          reason: 'Emergency dispatch protocol authorized by municipal command supervisor.',
        }),
      });

      const res = await recordGovernanceOverride(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.overrideId).toBeDefined();
      expect(json.data.operatorUserId).toBe('usr-test-commander');

      // Verify persistence
      const overrides = memoryCityGovernanceRepository.getOverrides();
      const found = overrides.find((o) => o.overrideId === json.data.overrideId);
      expect(found).toBeDefined();
    });

    it('rejects policy override without reason with HTTP 400', async () => {
      const headers = await createAuthHeaders('COMMANDER');
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/governance/overrides', {
        method: 'POST',
        headers,
        body: JSON.stringify({ policyId: 'pol-gov-human-auth' }),
      });

      const res = await recordGovernanceOverride(req);
      expect(res.status).toBe(400);
    });
  });

  describe('3. Resilience Readiness Authorization Gateway', () => {
    it('persists strategy approval in memory resilience repository', async () => {
      const headers = await createAuthHeaders('COMMANDER');
      const id = 'res-readiness-101';

      const req = new NextRequest(`http://localhost:3000/api/v1/digital-twin/resilience/readiness/${id}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          decision: 'APPROVED',
          operatorNotes: 'Commander verified balanced readiness profile.',
        }),
      });

      const res = await approveResilienceReadiness(req, { params: Promise.resolve({ id }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.authorizationStatus).toBe('APPROVED_BY_HUMAN_OPERATOR');

      // Verify persistence in repository
      const entity = memoryCityResilienceReadinessRepository.getReadiness(id);
      expect(entity).toBeDefined();
      expect(entity?.status).toBe('APPROVED');
    });

    it('returns 404 for nonexistent resilience readiness assessment', async () => {
      const headers = await createAuthHeaders('COMMANDER');
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/resilience/readiness/nonexistent-999/approve', {
        method: 'POST',
        headers,
        body: JSON.stringify({ decision: 'APPROVED' }),
      });

      const res = await approveResilienceReadiness(req, { params: Promise.resolve({ id: 'nonexistent-999' }) });
      expect(res.status).toBe(404);
    });

    it('rejects operator role with HTTP 403 Forbidden', async () => {
      const headers = await createAuthHeaders('OPERATOR');
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/resilience/readiness/res-readiness-101/approve', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          decision: 'APPROVED',
          operatorNotes: 'Operator attempted commander-only resilience authorization.',
        }),
      });

      const res = await approveResilienceReadiness(req, { params: Promise.resolve({ id: 'res-readiness-101' }) });
      expect(res.status).toBe(403);
    });
  });

  describe('4. Response Readiness Authorization Gateway', () => {
    it('persists response execution readiness authorization in repository', async () => {
      const headers = await createAuthHeaders('OPERATOR');
      const id = 'resp-readiness-101';

      const req = new NextRequest(`http://localhost:3000/api/v1/digital-twin/response-readiness/${id}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          decision: 'APPROVED',
          operatorNotes: 'Authorized by chief operator.',
        }),
      });

      const res = await approveResponseReadiness(req, { params: Promise.resolve({ id }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.authorizationStatus).toBe('APPROVED_BY_HUMAN_OPERATOR');

      // Verify persistence in repository
      const entity = memoryCityResponseReadinessRepository.getReadiness(id);
      expect(entity).toBeDefined();
      expect(entity?.status).toBe('AUTHORIZED');
    });
  });

  describe('5. City Intervention Authorization Gateway', () => {
    it('persists intervention plan approval with validated rationale', async () => {
      const headers = await createAuthHeaders('COMMANDER');
      const id = 'int-default-1';

      const req = new NextRequest(`http://localhost:3000/api/v1/digital-twin/interventions/${id}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          decision: 'APPROVED',
          operatorNotes: 'Approved mobilization of dewatering pumps with secondary transit detour.',
        }),
      });

      const res = await approveIntervention(req, { params: Promise.resolve({ id }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.decision).toBe('APPROVED');
    });

    it('rejects intervention approval if mandatory operator notes are missing', async () => {
      const headers = await createAuthHeaders('COMMANDER');
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/interventions/int-default-1/approve', {
        method: 'POST',
        headers,
        body: JSON.stringify({ decision: 'APPROVED', operatorNotes: '' }),
      });

      const res = await approveIntervention(req, { params: Promise.resolve({ id: 'int-default-1' }) });
      expect(res.status).toBe(400);
    });
  });

  describe('6. Decision Authorization Gateway', () => {
    it('persists multi-objective decision authorization with COMMANDER role', async () => {
      const headers = await createAuthHeaders('COMMANDER');

      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/authorize', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pipelineExecutionId: 'pipe-exec-101',
          decision: 'APPROVED',
          reason: 'Option Beta confirmed based on lowest critical outage risk.',
        }),
      });

      const res = await authorizeDecision(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.approvalStatus).toBe('APPROVED');
      expect(json.requiresHumanApproval).toBe(true);
    });

    it('rejects invalid decision types (e.g. AUTONOMOUS_EXECUTE) with HTTP 400', async () => {
      const headers = await createAuthHeaders('COMMANDER');

      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/authorize', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pipelineExecutionId: 'pipe-exec-101',
          decision: 'AUTONOMOUS_EXECUTE',
          reason: 'Forbidden autonomous execution attempt.',
        }),
      });

      const res = await authorizeDecision(req);
      expect(res.status).toBe(400);
    });
  });

  describe('7. Operational Intelligence Approval Gateway', () => {
    it('records operational decision for authenticated user', async () => {
      const headers = await createAuthHeaders('OPERATOR');
      const opIntelId = `op-test-${Date.now()}`;

      const req = new NextRequest(`http://localhost:3000/api/v1/digital-twin/operational-intelligence/${opIntelId}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ operatorNotes: 'Operational commander approved pump sequence' }),
      });

      const res = await approveOperationalIntel(req, { params: Promise.resolve({ id: opIntelId }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.requiresHumanApproval).toBe(true);
      expect(json.autonomousExecution).toBe(false);
    });

    it('rejects unauthenticated requests with HTTP 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/operational-intelligence/op-test-unauth/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorNotes: 'Unauthenticated attempt' }),
      });

      const res = await approveOperationalIntel(req, { params: Promise.resolve({ id: 'op-test-unauth' }) });
      expect(res.status).toBe(401);
    });
  });

  describe('8. Intelligence Pipeline Phase 7 Bridge Human Approval', () => {
    it('authorizes pipeline run with COMMANDER role and protects against duplicate approvals', async () => {
      const createdRun = await phase7PipelineBridgeService.runUnifiedPipeline('city-vja', 'DEMO');
      const runId = createdRun.pipelineRunId;
      const headers = await createAuthHeaders('COMMANDER');

      const req = new NextRequest(`http://localhost:3000/api/v1/digital-twin/intelligence-pipeline/${runId}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ notes: 'Commander authorized flood mitigation response' }),
      });

      const res = await approvePipelineRun(req, { params: Promise.resolve({ id: runId }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.governance.requiresHumanApproval).toBe(true);
      expect(json.governance.autonomousExecution).toBe(false);

      // Verify duplicate approval protection (409 Conflict)
      const duplicateReq = new NextRequest(`http://localhost:3000/api/v1/digital-twin/intelligence-pipeline/${runId}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ notes: 'Second approval attempt' }),
      });
      const duplicateRes = await approvePipelineRun(duplicateReq, { params: Promise.resolve({ id: runId }) });
      expect(duplicateRes.status).toBe(409);
    });

    it('rejects unauthenticated requests with HTTP 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/intelligence-pipeline/pipe-run-102/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Unauth attempt' }),
      });

      const res = await approvePipelineRun(req, { params: Promise.resolve({ id: 'pipe-run-102' }) });
      expect(res.status).toBe(401);
    });

    it('rejects non-commander roles with HTTP 403 Forbidden', async () => {
      const headers = await createAuthHeaders('VIEWER');
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/intelligence-pipeline/pipe-run-103/approve', {
        method: 'POST',
        headers,
        body: JSON.stringify({ notes: 'Viewer attempt' }),
      });

      const res = await approvePipelineRun(req, { params: Promise.resolve({ id: 'pipe-run-103' }) });
      expect(res.status).toBe(403);
    });
  });
});
