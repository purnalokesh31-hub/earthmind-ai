// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — TASK 3: Explicit Decision State Model Verification Suite
// ──────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as authorizeDecisionRoute } from '@/app/api/v1/digital-twin/decisions/authorize/route';
import { JwtService } from '@/lib/server/auth/jwt.service';

describe('TASK 3 — Decision State Logic Suite', () => {
  const jwtService = new JwtService();

  async function createHeaders(role: 'COMMANDER' | 'ADMIN' = 'COMMANDER') {
    const token = await jwtService.generateAccessToken({
      sub: 'usr-test-commander',
      email: 'commander@earthmind.test',
      role,
      jti: 'jti-dec-301',
    });
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  it('1. APPROVED state remains APPROVED and persists', async () => {
    const headers = await createHeaders();
    const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/authorize', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pipelineExecutionId: 'pipe-exec-101',
        candidateId: 'cand-substation-vja',
        strategy: 'BALANCED',
        decision: 'APPROVED',
        operatorNotes: 'Verified grid capacity',
      }),
    });

    const res = await authorizeDecisionRoute(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('APPROVED');
    expect(json.data.pipelineExecutionId).toBe('pipe-exec-101');
  });

  it('2. REJECTED state remains REJECTED', async () => {
    const headers = await createHeaders();
    const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/authorize', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pipelineExecutionId: 'pipe-exec-102',
        candidateId: 'cand-pump-high-load',
        strategy: 'COST_MINIMIZED',
        decision: 'REJECTED',
        operatorNotes: 'Insufficient municipal budget',
      }),
    });

    const res = await authorizeDecisionRoute(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('REJECTED');
  });

  it('3. REQUEST_REVIEW / REQUESTED_REVIEW state remains REQUESTED_REVIEW', async () => {
    const headers = await createHeaders();
    const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/authorize', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pipelineExecutionId: 'pipe-exec-103',
        candidateId: 'cand-evac-zone-b',
        strategy: 'SAFETY_MAXIMIZED',
        decision: 'REQUEST_REVIEW',
        operatorNotes: 'Awaiting secondary meteorological sweep',
      }),
    });

    const res = await authorizeDecisionRoute(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('REQUESTED_REVIEW');
  });

  it('4. Unknown / invalid decision values return HTTP 400 and are never converted into approval', async () => {
    const headers = await createHeaders();
    const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/authorize', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pipelineExecutionId: 'pipe-exec-104',
        candidateId: 'cand-unknown-act',
        decision: 'AUTO_OVERRIDE_BYPASS_SAFETY',
      }),
    });

    const res = await authorizeDecisionRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('INVALID_DECISION');
  });

  it('5. Backend fails closed on unauthenticated request', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/digital-twin/decisions/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pipelineExecutionId: 'pipe-exec-105',
        candidateId: 'cand-1',
        decision: 'APPROVED',
      }),
    });

    const res = await authorizeDecisionRoute(req);
    expect(res.status).toBe(401);
  });
});
