// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// Comprehensive Vitest Suite for Citywide Intervention Planning
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mock Auth Middleware to bypass JWT in route tests ──
vi.mock('@/lib/server/auth/middleware.helpers', () => ({
  authenticate: vi.fn().mockResolvedValue({
    userId: 'usr-operator-1',
    role: 'COMMAND_CENTER_OPERATOR',
    permissions: ['simulation:read', 'simulation:create', 'simulation:run', 'simulation:approve'],
  }),
}));

import { cityInterventionPlanningService } from '@/lib/server/services/city-intervention-planning.service';
import { cityInterventionCoordinationService } from '@/lib/server/services/city-intervention-coordination.service';
import { cityInterventionResourceService } from '@/lib/server/services/city-intervention-resource.service';
import { cityInterventionOptimizationService } from '@/lib/server/services/city-intervention-optimization.service';
import { cityInterventionValidationService } from '@/lib/server/services/city-intervention-validation.service';
import { cityInterventionOrchestratorService } from '@/lib/server/services/city-intervention-orchestrator.service';
import { memoryCityInterventionRepository } from '@/lib/server/repositories/city-intervention.repository';

// Route Imports
import { GET as getInterventions, POST as createIntervention } from '@/app/api/v1/digital-twin/interventions/route';
import { GET as getHistory } from '@/app/api/v1/digital-twin/interventions/history/route';
import { GET as getSingleIntervention } from '@/app/api/v1/digital-twin/interventions/[id]/route';
import { POST as runAnalysis } from '@/app/api/v1/digital-twin/interventions/[id]/run/route';
import { GET as getActions } from '@/app/api/v1/digital-twin/interventions/[id]/actions/route';
import { GET as getSequence } from '@/app/api/v1/digital-twin/interventions/[id]/sequence/route';
import { GET as getDependencies } from '@/app/api/v1/digital-twin/interventions/[id]/dependencies/route';
import { GET as getResources } from '@/app/api/v1/digital-twin/interventions/[id]/resources/route';
import { GET as getComparison } from '@/app/api/v1/digital-twin/interventions/[id]/comparison/route';
import { GET as getValidation } from '@/app/api/v1/digital-twin/interventions/[id]/validation/route';
import { GET as getRecommendation } from '@/app/api/v1/digital-twin/interventions/[id]/recommendation/route';
import { POST as approveIntervention } from '@/app/api/v1/digital-twin/interventions/[id]/approve/route';

describe('Phase 7.10 — Citywide Intervention Planning & Governance Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Planning Service Tests
  describe('CityInterventionPlanningService', () => {
    it('generates candidate actions for target domains with requiresHumanApproval=true', () => {
      const actions = cityInterventionPlanningService.generateCandidateActions(
        ['CLIMATE', 'MOBILITY', 'UTILITY', 'EMERGENCY'],
        ['Zone A', 'Zone B']
      );

      expect(actions).toHaveLength(4);
      actions.forEach((act) => {
        expect(act.requiresHumanApproval).toBe(true);
        expect(act.dataSource).toBe('INTERVENTION_PLANNING');
        expect(act.estimatedCostUsd).toBeGreaterThan(0);
        expect(act.riskReductionPoints).toBeGreaterThan(0);
      });
    });

    it('generates ordered action sequences with prerequisites and parallel groups', () => {
      const actions = cityInterventionPlanningService.generateCandidateActions(
        ['CLIMATE', 'MOBILITY', 'UTILITY'],
        ['Zone A']
      );
      const sequence = cityInterventionPlanningService.generateOrderedSequence('int-test-1', actions);

      expect(sequence.interventionId).toBe('int-test-1');
      expect(sequence.steps).toHaveLength(3);
      expect(sequence.totalDurationHours).toBeGreaterThan(0);
      expect(sequence.requiresHumanApproval).toBe(true);
      expect(sequence.dataSource).toBe('INTERVENTION_PLANNING');
    });

    it('creates a full draft intervention plan entity', () => {
      const plan = cityInterventionPlanningService.generateInterventionPlan({
        cityId: 'city-vja',
        title: 'Test Storm Plan',
        requestedBy: 'operator-1',
        targetDomains: ['CLIMATE', 'UTILITY'],
        budgetConstraintUsd: 20000,
      });

      expect(plan.interventionId).toBeDefined();
      expect(plan.status).toBe('DRAFT');
      expect(plan.actions.length).toBeGreaterThan(0);
      expect(plan.requiresHumanApproval).toBe(true);
      expect(plan.dataSource).toBe('INTERVENTION_PLANNING');
    });
  });

  // 2. Coordination Service Tests
  describe('CityInterventionCoordinationService', () => {
    it('analyzes multi-domain dependencies and resolves temporal & spatial relationships', () => {
      const actions = cityInterventionPlanningService.generateCandidateActions(
        ['CLIMATE', 'MOBILITY', 'UTILITY', 'EMERGENCY'],
        ['Zone A', 'Zone B']
      );
      const result = cityInterventionCoordinationService.analyzeDependencies(actions);

      expect(result.dependencies.length).toBeGreaterThan(0);
      const tempDep = result.dependencies.find((d) => d.dependencyType === 'TEMPORAL');
      expect(tempDep).toBeDefined();
      expect(tempDep?.status).toBe('RESOLVED');
    });
  });

  // 3. Resource Allocation Service Tests
  describe('CityInterventionResourceService', () => {
    it('allocates resources and detects shortages without fabricating availability', () => {
      const actions = cityInterventionPlanningService.generateCandidateActions(
        ['CLIMATE', 'MOBILITY', 'UTILITY'],
        ['Zone A']
      );
      const result = cityInterventionResourceService.allocateResources(actions);

      expect(result.resources.length).toBeGreaterThan(0);
      expect(result.totalCostUsd).toBeGreaterThan(0);
      expect(result.hasResourceShortage).toBe(false);
    });
  });

  // 4. Optimization Service Tests
  describe('CityInterventionOptimizationService', () => {
    it('generates multi-candidate optimization matrix under specified strategy', () => {
      const actions = cityInterventionPlanningService.generateCandidateActions(
        ['CLIMATE', 'MOBILITY', 'UTILITY'],
        ['Zone A']
      );
      const comparison = cityInterventionOptimizationService.optimizeIntervention(
        'int-opt-test',
        actions,
        'BALANCED',
        15000,
        4.0
      );

      expect(comparison.candidates).toHaveLength(3);
      expect(comparison.candidates[0].rank).toBe(1);
      expect(comparison.requiresHumanApproval).toBe(true);
      expect(comparison.dataSource).toBe('INTERVENTION_PLANNING');
    });
  });

  // 5. Validation Service Tests
  describe('CityInterventionValidationService', () => {
    it('validates plan constraints and returns explainable validation status', () => {
      const plan = cityInterventionPlanningService.generateInterventionPlan({
        cityId: 'city-vja',
        title: 'Validation Test Plan',
        requestedBy: 'operator-1',
        budgetConstraintUsd: 15000,
        maxDowntimeHours: 4.0,
      });

      const report = cityInterventionValidationService.validatePlan(plan);
      expect(report.validationStatus).toBe('VALID');
      expect(report.constraints.length).toBeGreaterThan(0);
      expect(report.validationReasons.length).toBeGreaterThan(0);
    });
  });

  // 6. Master Orchestrator Tests
  describe('CityInterventionOrchestratorService', () => {
    it('runs analytical planning pipeline and transitions status to AWAITING_APPROVAL', () => {
      const draft = cityInterventionOrchestratorService.createIntervention({
        cityId: 'city-vja',
        title: 'Orchestrated Surge Plan',
        requestedBy: 'usr-operator-1',
      });

      expect(draft.status).toBe('DRAFT');

      const analyzed = cityInterventionOrchestratorService.runInterventionAnalysis(draft.interventionId);
      expect(analyzed.status).toBe('AWAITING_APPROVAL');
      expect(analyzed.recommendation).toBeDefined();
      expect(analyzed.recommendation?.requiresHumanApproval).toBe(true);
      expect(analyzed.auditTrail.length).toBeGreaterThan(1);
    });

    it('records operator human approval decision and updates approval entity', () => {
      const draft = cityInterventionOrchestratorService.createIntervention({
        cityId: 'city-vja',
        title: 'Approval Gate Test Plan',
        requestedBy: 'usr-operator-1',
      });
      cityInterventionOrchestratorService.runInterventionAnalysis(draft.interventionId);

      const approval = cityInterventionOrchestratorService.approveIntervention(
        draft.interventionId,
        'usr-operator-1',
        'APPROVED',
        'Authorized after multi-domain safety review.'
      );

      expect(approval.decision).toBe('APPROVED');
      expect(approval.interventionId).toBe(draft.interventionId);

      const updated = cityInterventionOrchestratorService.getIntervention(draft.interventionId);
      expect(updated?.status).toBe('APPROVED');
      expect(updated?.execution).toBeDefined();
      expect(updated?.execution?.requiresHumanApproval).toBe(true);
    });

    it('rejects duplicate approval requests with duplicate safety error', () => {
      const draft = cityInterventionOrchestratorService.createIntervention({
        cityId: 'city-vja',
        title: 'Duplicate Safety Test Plan',
        requestedBy: 'usr-operator-1',
      });
      cityInterventionOrchestratorService.runInterventionAnalysis(draft.interventionId);

      cityInterventionOrchestratorService.approveIntervention(
        draft.interventionId,
        'usr-operator-1',
        'APPROVED',
        'First approval'
      );

      expect(() =>
        cityInterventionOrchestratorService.approveIntervention(
          draft.interventionId,
          'usr-operator-1',
          'APPROVED',
          'Second approval'
        )
      ).toThrow('INTERVENTION_ALREADY_DECIDED');
    });
  });

  // 7. REST API Endpoints Tests
  describe('Phase 7.10 REST API Endpoints', () => {
    it('GET /api/v1/digital-twin/interventions returns list of interventions', async () => {
      const req = new Request('http://localhost/api/v1/digital-twin/interventions');
      const res = await getInterventions(req as any);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('POST /api/v1/digital-twin/interventions creates a new intervention', async () => {
      const req = new Request('http://localhost/api/v1/digital-twin/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: 'city-vja',
          title: 'API Created Intervention Plan',
          targetDomains: ['CLIMATE', 'UTILITY'],
        }),
      });

      const res = await createIntervention(req as any);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.interventionId).toBeDefined();
      expect(body.data.requiresHumanApproval).toBe(true);
    });

    it('GET /api/v1/digital-twin/interventions/history returns audit history', async () => {
      const req = new Request('http://localhost/api/v1/digital-twin/interventions/history');
      const res = await getHistory(req as any);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('GET /api/v1/digital-twin/interventions/[id] returns default intervention', async () => {
      const req = new Request('http://localhost/api/v1/digital-twin/interventions/int-default-1');
      const res = await getSingleIntervention(req as any, { params: Promise.resolve({ id: 'int-default-1' }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.interventionId).toBe('int-default-1');
      expect(body.data.requiresHumanApproval).toBe(true);
    });

    it('POST /api/v1/digital-twin/interventions/[id]/run executes analytical pipeline', async () => {
      const req = new Request('http://localhost/api/v1/digital-twin/interventions/int-default-1/run', { method: 'POST' });
      const res = await runAnalysis(req as any, { params: Promise.resolve({ id: 'int-default-1' }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('AWAITING_APPROVAL');
    });

    it('GET sub-resource endpoints (actions, sequence, dependencies, resources, comparison, validation, recommendation)', async () => {
      const params = Promise.resolve({ id: 'int-default-1' });

      const actRes = await getActions(new Request('http://localhost') as any, { params });
      expect((await actRes.json()).success).toBe(true);

      const seqRes = await getSequence(new Request('http://localhost') as any, { params });
      expect((await seqRes.json()).success).toBe(true);

      const depRes = await getDependencies(new Request('http://localhost') as any, { params });
      expect((await depRes.json()).success).toBe(true);

      const resRes = await getResources(new Request('http://localhost') as any, { params });
      expect((await resRes.json()).success).toBe(true);

      const compRes = await getComparison(new Request('http://localhost') as any, { params });
      expect((await compRes.json()).success).toBe(true);

      const valRes = await getValidation(new Request('http://localhost') as any, { params });
      expect((await valRes.json()).success).toBe(true);

      const recRes = await getRecommendation(new Request('http://localhost') as any, { params });
      expect((await recRes.json()).success).toBe(true);
    });

    it('POST /api/v1/digital-twin/interventions/[id]/approve records human approval decision', async () => {
      // Create a fresh plan for approval test
      const plan = cityInterventionOrchestratorService.createIntervention({
        cityId: 'city-vja',
        title: 'API Approval Test Plan',
        requestedBy: 'usr-operator-1',
      });
      cityInterventionOrchestratorService.runInterventionAnalysis(plan.interventionId);

      const req = new Request(`http://localhost/api/v1/digital-twin/interventions/${plan.interventionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'APPROVED',
          operatorNotes: 'Approved via API integration test.',
        }),
      });

      const res = await approveIntervention(req as any, { params: Promise.resolve({ id: plan.interventionId }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.decision).toBe('APPROVED');
    });
  });

  // 8. Mandatory Non-Negotiable Safety Invariants
  describe('Safety & Governance Invariants', () => {
    it('enforces requiresHumanApproval=true on all entities and endpoints', () => {
      const plan = memoryCityInterventionRepository.findById('int-default-1');
      expect(plan?.requiresHumanApproval).toBe(true);
      expect(plan?.recommendation?.requiresHumanApproval).toBe(true);
      expect(plan?.comparison?.requiresHumanApproval).toBe(true);
      plan?.actions.forEach((a) => {
        expect(a.requiresHumanApproval).toBe(true);
      });
    });

    it('preserves data provenance as INTERVENTION_PLANNING and never mislabels as live telemetry', () => {
      const plan = memoryCityInterventionRepository.findById('int-default-1');
      expect(plan?.dataSource).toBe('INTERVENTION_PLANNING');
      expect(plan?.recommendation?.dataSource).toBe('INTERVENTION_PLANNING');
      expect(plan?.comparison?.dataSource).toBe('INTERVENTION_PLANNING');
    });

    it('records operator rejection decision correctly with audit event', () => {
      const plan = cityInterventionOrchestratorService.createIntervention({
        cityId: 'city-vja',
        title: 'Rejection Test Plan',
        requestedBy: 'usr-operator-1',
      });
      cityInterventionOrchestratorService.runInterventionAnalysis(plan.interventionId);

      const approval = cityInterventionOrchestratorService.approveIntervention(
        plan.interventionId,
        'usr-operator-1',
        'REJECTED',
        'Rejected due to resource allocation constraints.'
      );

      expect(approval.decision).toBe('REJECTED');
      const updated = cityInterventionOrchestratorService.getIntervention(plan.interventionId);
      expect(updated?.status).toBe('REJECTED');
      expect(updated?.requiresHumanApproval).toBe(true);
    });

    it('detects circular dependencies and flags conflict status in coordination engine', () => {
      const cyclicDeps = [
        { dependencyId: 'd1', actionId: 'act-2', dependsOnActionId: 'act-1', dependencyType: 'TEMPORAL' as const, status: 'RESOLVED' as const, explanation: 'act-1 before act-2' },
        { dependencyId: 'd2', actionId: 'act-3', dependsOnActionId: 'act-2', dependencyType: 'TEMPORAL' as const, status: 'RESOLVED' as const, explanation: 'act-2 before act-3' },
        { dependencyId: 'd3', actionId: 'act-1', dependsOnActionId: 'act-3', dependencyType: 'TEMPORAL' as const, status: 'RESOLVED' as const, explanation: 'act-3 before act-1' },
      ];

      const isCyclic = cityInterventionCoordinationService.detectCircularDependencies(cyclicDeps);
      expect(isCyclic).toBe(true);
    });

    it('validates plan with budget violation as INVALID status', () => {
      const plan = cityInterventionPlanningService.generateInterventionPlan({
        cityId: 'city-vja',
        title: 'Budget Violation Test',
        requestedBy: 'usr-operator-1',
        budgetConstraintUsd: 100, // Very low budget
      });

      const report = cityInterventionValidationService.validatePlan(plan);
      expect(report.validationStatus).toBe('INVALID');
      expect(report.validationReasons.some((r) => r.includes('BUDGET_CONSTRAINT'))).toBe(true);
    });
  });
});
