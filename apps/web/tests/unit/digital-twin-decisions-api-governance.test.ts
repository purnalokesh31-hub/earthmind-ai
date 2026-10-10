// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 Decision Optimization API, Governance & AI Tools Test Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Inline mock functions to prevent hoisting TDZ errors (vi.mock factories are hoisted above
// module-level const declarations, so the implementation must be defined inside the factory).
// 'COMMANDER' (a real RoleType enum value — see prisma/schema.prisma) is used rather than the
// fictional 'CITY_OPERATOR' string this fixture previously used, since /approve now requires
// commanderOnly() and a non-existent role would incorrectly fail authorization in this test.
vi.mock('@/lib/server/auth/middleware.helpers', () => {
  const mockOperatorContext = (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader.includes('invalid')) {
      const err: any = new Error('Unauthorized');
      err.statusCode = 401;
      throw err;
    }
    return Promise.resolve({
      userId: 'usr-operator-777',
      email: 'operator@earthmind.gov.in',
      role: 'COMMANDER',
    });
  };
  return {
    authenticate: vi.fn().mockImplementation(mockOperatorContext),
    commanderOnly: vi.fn().mockImplementation(mockOperatorContext),
  };
});

import { GET as getDecisions, POST as postDecisions } from '../../app/api/v1/digital-twin/decisions/route';
import { GET as getDecisionById } from '../../app/api/v1/digital-twin/decisions/[id]/route';
import { POST as runDecision } from '../../app/api/v1/digital-twin/decisions/[id]/run/route';
import { GET as getCandidates } from '../../app/api/v1/digital-twin/decisions/[id]/candidates/route';
import { GET as getComparison } from '../../app/api/v1/digital-twin/decisions/[id]/comparison/route';
import { GET as getRecommendation } from '../../app/api/v1/digital-twin/decisions/[id]/recommendation/route';
import { GET as getExplanation } from '../../app/api/v1/digital-twin/decisions/[id]/explanation/route';
import { POST as approveDecision } from '../../app/api/v1/digital-twin/decisions/[id]/approve/route';
import { GET as getHistory } from '../../app/api/v1/digital-twin/decisions/history/route';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';

describe('Phase 7.9.3 — Decision Optimization API, Governance & AI Agent Tools', () => {
  const validHeaders = { authorization: 'Bearer valid-jwt-token', 'content-type': 'application/json' };
  const invalidHeaders = { authorization: 'Bearer invalid-jwt-token' };

  describe('1. Security & RBAC Authorization across Endpoints', () => {
    it('should reject unauthenticated request to GET /decisions', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions', { headers: invalidHeaders });
      const res = await getDecisions(req);
      const json = await res.json();
      expect(res.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should reject unauthenticated request to POST /decisions/[id]/approve', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/dec-scen-101/approve', {
        method: 'POST',
        headers: invalidHeaders,
        body: JSON.stringify({ decision: 'APPROVED', reason: 'Emergency protocol' }),
      });
      const res = await approveDecision(req, { params: Promise.resolve({ id: 'dec-scen-101' }) });
      const json = await res.json();
      expect(res.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });
  });

  describe('2. Required Decision Optimization REST API Endpoints', () => {
    it('GET /api/v1/digital-twin/decisions -> returns decision context', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions?cityId=city-vja&strategy=BALANCED', { headers: validHeaders });
      const res = await getDecisions(req);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.cityId).toBe('city-vja');
      expect(json.data.requiresHumanApproval).toBe(true);
    });

    it('POST /api/v1/digital-twin/decisions -> runs decision pipeline', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify({ cityId: 'city-vja', strategy: 'MINIMIZE_RISK' }),
      });
      const res = await postDecisions(req);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.optimizationStrategy).toBe('MINIMIZE_RISK');
    });

    it('GET /api/v1/digital-twin/decisions/[id] -> fetches decision by id', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/pipe-exec-202', { headers: validHeaders });
      const res = await getDecisionById(req, { params: Promise.resolve({ id: 'pipe-exec-202' }) });
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.pipelineExecutionId).toBeDefined();
    });

    it('POST /api/v1/digital-twin/decisions/[id]/run -> runs decision execution', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/pipe-exec-202/run', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify({ strategy: 'BALANCED' }),
      });
      const res = await runDecision(req, { params: Promise.resolve({ id: 'pipe-exec-202' }) });
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.pipelineExecutionId).toBe('pipe-exec-202');
    });

    it('GET /api/v1/digital-twin/decisions/[id]/candidates -> returns candidate options', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/pipe-exec-202/candidates', { headers: validHeaders });
      const res = await getCandidates(req, { params: Promise.resolve({ id: 'pipe-exec-202' }) });
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.candidates.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/digital-twin/decisions/[id]/comparison -> returns visual candidate comparison', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/pipe-exec-202/comparison', { headers: validHeaders });
      const res = await getComparison(req, { params: Promise.resolve({ id: 'pipe-exec-202' }) });
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.comparison.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/digital-twin/decisions/[id]/recommendation -> returns recommendation with governance fields', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/pipe-exec-202/recommendation', { headers: validHeaders });
      const res = await getRecommendation(req, { params: Promise.resolve({ id: 'pipe-exec-202' }) });
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.recommendation.requiresHumanApproval).toBe(true);
    });

    it('GET /api/v1/digital-twin/decisions/[id]/explanation -> returns 9-part explainability trace', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/pipe-exec-202/explanation', { headers: validHeaders });
      const res = await getExplanation(req, { params: Promise.resolve({ id: 'pipe-exec-202' }) });
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.explainability.whatHappened).toBeDefined();
    });

    it('POST /api/v1/digital-twin/decisions/[id]/approve -> records human operator authorization and creates audit log', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/pipe-exec-202/approve', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify({ decisionStatus: 'APPROVED', justification: 'Verified power isolation risk reduction' }),
      });
      const res = await approveDecision(req, { params: Promise.resolve({ id: 'pipe-exec-202' }) });
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.approvalStatus).toBe('APPROVED');
    });

    it('GET /api/v1/digital-twin/decisions/history -> fetches decision audit ledger history', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/history', { headers: validHeaders });
      const res = await getHistory(req);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
    });
  });

  describe('3. AI Agent Decision Optimization Tools', () => {
    const tools = [
      'city_decision_overview',
      'city_decision_signals',
      'city_decision_candidates',
      'city_decision_comparison',
      'city_decision_resources',
      'city_decision_confidence',
      'city_decision_explanation',
      'city_decision_history',
      'city_decision_approval',
    ];

    it('should have all Phase 7.9.3 AI Agent tools registered in ToolRegistry', () => {
      for (const toolId of tools) {
        const tool = toolRegistry.getTool(toolId);
        expect(tool).toBeDefined();
      }
    });

    it('should execute AI tools and enforce requiresHumanApproval: true safety contract', async () => {
      for (const toolId of tools) {
        const res = await toolRegistry.invokeTool(toolId, { cityId: 'city-vja' });
        expect(res.status).toBe('SUCCESS');
        const output = JSON.parse(res.outputSummary);
        expect(output.requiresHumanApproval).toBe(true);
        expect(output.dataSource).toBe('SIMULATION');
      }
    });
  });
});
