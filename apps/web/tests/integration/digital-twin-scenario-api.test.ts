// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.2 Scenario API Integration Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeAll } from 'vitest';
import { GET as listScenarios, POST as createScenario } from '../../app/api/v1/digital-twin/predictions/scenarios/route';
import { GET as getScenario } from '../../app/api/v1/digital-twin/predictions/scenarios/[id]/route';
import { POST as runScenario } from '../../app/api/v1/digital-twin/predictions/scenarios/[id]/run/route';
import { GET as getResult } from '../../app/api/v1/digital-twin/predictions/scenarios/[id]/result/route';
import { GET as getCascade } from '../../app/api/v1/digital-twin/predictions/scenarios/[id]/cascade/route';
import { GET as getImpact } from '../../app/api/v1/digital-twin/predictions/scenarios/[id]/impact/route';
import { GET as getComparison } from '../../app/api/v1/digital-twin/predictions/scenarios/[id]/comparison/route';
import { GET as getRecommendation } from '../../app/api/v1/digital-twin/predictions/scenarios/[id]/recommendation/route';
import { POST as approveRecommendation } from '../../app/api/v1/digital-twin/predictions/scenarios/[id]/approve/route';
import { GET as getHistory } from '../../app/api/v1/digital-twin/predictions/scenarios/history/route';
import { JwtService } from '../../lib/server/auth/jwt.service';
import { NextRequest } from 'next/server';

let validAuthToken: string;

function createMockAuthRequest(url: string, method: string = 'GET', body?: any): NextRequest {
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${validAuthToken}`);
  headers.set('Content-Type', 'application/json');

  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

function createUnauthRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'GET' });
}

describe('Phase 7.9.2 — Predictive Scenario REST API Matrix Suite', () => {
  let createdId: string = 'sim-scen-501';

  beforeAll(async () => {
    const jwtService = new JwtService();
    validAuthToken = await jwtService.generateAccessToken({
      sub: 'usr-commander-101',
      email: 'commander@earthmind.gov',
      role: 'COMMANDER',
      jti: 'jti-scenario-api-test',
    });
  });

  // ── 1. Unauthenticated Security Validation ──
  it('should return 401 Unauthorized when Bearer token is missing', async () => {
    const req = createUnauthRequest('http://localhost:3000/api/v1/digital-twin/predictions/scenarios');
    const res = await listScenarios(req);
    expect(res.status).toBe(401);
  });

  // ── 2. Parameter Validation ──
  it('should reject scenario creation with missing parameters (400)', async () => {
    const req = createMockAuthRequest('http://localhost:3000/api/v1/digital-twin/predictions/scenarios', 'POST', { title: 'Incomplete' });
    const res = await createScenario(req);
    expect(res.status).toBe(400);
  });

  it('should reject invalid severity level (400)', async () => {
    const req = createMockAuthRequest('http://localhost:3000/api/v1/digital-twin/predictions/scenarios', 'POST', {
      title: 'Invalid Severity',
      cityId: 'city-vja',
      scenarioType: 'CLIMATE_ESCALATION',
      severityLevel: 'ULTRA_EXTREME',
      horizon: '6h',
    });
    const res = await createScenario(req);
    expect(res.status).toBe(400);
  });

  it('should reject invalid domain name (400)', async () => {
    const req = createMockAuthRequest('http://localhost:3000/api/v1/digital-twin/predictions/scenarios', 'POST', {
      title: 'Invalid Domain',
      cityId: 'city-vja',
      scenarioType: 'CLIMATE_ESCALATION',
      severityLevel: 'HIGH',
      horizon: '6h',
      variables: [{ domain: 'INVALID_DOMAIN' }],
    });
    const res = await createScenario(req);
    expect(res.status).toBe(400);
  });

  // ── 3. Scenario Lifecycle APIs ──
  it('should create valid scenario (201)', async () => {
    const req = createMockAuthRequest('http://localhost:3000/api/v1/digital-twin/predictions/scenarios', 'POST', {
      title: 'API Cyclone & Drainage Test',
      description: 'API test scenario',
      cityId: 'city-vja',
      scenarioType: 'CLIMATE_ESCALATION',
      severityLevel: 'HIGH',
      horizon: '6h',
      variables: [
        { variableId: 'v1', variableName: 'Precipitation', domain: 'CLIMATE', baseValue: 40, simulatedValue: 120, unit: 'mm/hr', changePercentage: 200 },
      ],
    });
    const res = await createScenario(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.scenarioId).toBeDefined();
    createdId = json.data.scenarioId;
  });

  it('should run scenario simulation (200)', async () => {
    const params = Promise.resolve({ id: createdId });
    const req = createMockAuthRequest(`http://localhost:3000/api/v1/digital-twin/predictions/scenarios/${createdId}/run`, 'POST');
    const res = await runScenario(req, { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.status).toBe('COMPLETED');
  });

  it('should get scenario detail, result, cascade, impact, and comparison (200)', async () => {
    const params = Promise.resolve({ id: createdId });

    const reqDetail = createMockAuthRequest(`http://localhost:3000/api/v1/digital-twin/predictions/scenarios/${createdId}`);
    const resDetail = await getScenario(reqDetail, { params });
    expect(resDetail.status).toBe(200);

    const reqRes = createMockAuthRequest(`http://localhost:3000/api/v1/digital-twin/predictions/scenarios/${createdId}/result`);
    const resRes = await getResult(reqRes, { params });
    expect(resRes.status).toBe(200);

    const reqCas = createMockAuthRequest(`http://localhost:3000/api/v1/digital-twin/predictions/scenarios/${createdId}/cascade`);
    const resCas = await getCascade(reqCas, { params });
    expect(resCas.status).toBe(200);

    const reqImp = createMockAuthRequest(`http://localhost:3000/api/v1/digital-twin/predictions/scenarios/${createdId}/impact`);
    const resImp = await getImpact(reqImp, { params });
    expect(resImp.status).toBe(200);

    const reqComp = createMockAuthRequest(`http://localhost:3000/api/v1/digital-twin/predictions/scenarios/${createdId}/comparison`);
    const resComp = await getComparison(reqComp, { params });
    expect(resComp.status).toBe(200);
  });

  // ── 4. Operator Authorization & Audit Logging ──
  it('should record operator authorization and audit log (200)', async () => {
    const params = Promise.resolve({ id: createdId });
    const req = createMockAuthRequest(`http://localhost:3000/api/v1/digital-twin/predictions/scenarios/${createdId}/approve`, 'POST', {
      notes: 'Approved via integration API test suite',
    });
    const res = await approveRecommendation(req, { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.approvalStatus).toBe('APPROVED');
    expect(json.data.approvalAudit.userId).toBeDefined();
  });

  it('should prevent duplicate approval attempt (409)', async () => {
    const params = Promise.resolve({ id: createdId });
    const req = createMockAuthRequest(`http://localhost:3000/api/v1/digital-twin/predictions/scenarios/${createdId}/approve`, 'POST', {
      notes: 'Duplicate attempt',
    });
    const res = await approveRecommendation(req, { params });
    expect(res.status).toBe(409);
  });

  // ── 5. History API ──
  it('should retrieve completed scenario history (200)', async () => {
    const req = createMockAuthRequest('http://localhost:3000/api/v1/digital-twin/predictions/scenarios/history');
    const res = await getHistory(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });
});
