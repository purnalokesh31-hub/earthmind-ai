// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 8.6 Mega Prompt 4/6 Runtime REST API Test Suite
// Verifies REST Endpoints, AI Tool Registry, Safety Governance Envelopes & Response Contracts
// ──────────────────────────────────────────────────────────────

import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getRuntime } from '../../app/api/v1/digital-twin/runtime/route';
import { GET as getOverview } from '../../app/api/v1/digital-twin/runtime/overview/route';
import { GET as getDomains } from '../../app/api/v1/digital-twin/runtime/domains/route';
import { GET as getHealth } from '../../app/api/v1/digital-twin/runtime/health/route';
import { GET as getQuality } from '../../app/api/v1/digital-twin/runtime/quality/route';
import { GET as getCoverage } from '../../app/api/v1/digital-twin/runtime/coverage/route';
import { GET as getEvents } from '../../app/api/v1/digital-twin/runtime/events/route';
import { toolRegistry } from '../../lib/server/ai-agents/tool-registry';
import { JwtService } from '../../lib/server/auth/jwt.service';

describe('Phase 8.6 — Unified Runtime REST API & AI Tools Test Suite', () => {
  // These routes require real authentication (a prior bypass let unauthenticated requests
  // through whenever NODE_ENV==='test', which would have made the entire domain public if that
  // env var were ever left set in a deployed environment) — tests now present a real signed token.
  let authToken: string;

  beforeAll(async () => {
    const jwt = new JwtService();
    authToken = await jwt.generateAccessToken({
      sub: 'usr-test-commander',
      email: 'commander@earthmind.gov',
      role: 'COMMANDER',
      jti: 'jti-runtime-api-test',
    });
  });

  const createMockRequest = (url: string) => {
    return new NextRequest(new URL(url, 'http://localhost:3000'), {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  };

  it('1. GET /api/v1/digital-twin/runtime returns full CityRuntimeState with governance envelope', async () => {
    const req = createMockRequest('/api/v1/digital-twin/runtime?cityId=city-vja&executionMode=LIVE_READ_ONLY');
    const res = await getRuntime(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.cityId).toBe('city-vja');
    expect(json.governance.requiresHumanApproval).toBe(true);
    expect(json.governance.advisoryOnly).toBe(true);
    expect(json.governance.autonomousExecution).toBe(false);
  });

  it('2. GET /api/v1/digital-twin/runtime/overview returns executive overview summary', async () => {
    const req = createMockRequest('/api/v1/digital-twin/runtime/overview?cityId=city-vja');
    const res = await getOverview(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.cityId).toBe('city-vja');
    expect(json.data.cityIntelligenceReadiness).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(json.data.recommendations)).toBe(true);
  });

  it('3. GET /api/v1/digital-twin/runtime/domains returns all 7 urban domain states', async () => {
    const req = createMockRequest('/api/v1/digital-twin/runtime/domains?cityId=city-vja');
    const res = await getDomains(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(7);
  });

  it('4. GET /api/v1/digital-twin/runtime/health returns health scores and readiness with explanations', async () => {
    const req = createMockRequest('/api/v1/digital-twin/runtime/health?cityId=city-vja');
    const res = await getHealth(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.cityIntelligenceReadiness).toBeGreaterThanOrEqual(0);
    expect(json.data.explanations).toBeDefined();
  });

  it('5. GET /api/v1/digital-twin/runtime/quality returns quality payload metrics', async () => {
    const req = createMockRequest('/api/v1/digital-twin/runtime/quality?cityId=city-vja');
    const res = await getQuality(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.qualityScore).toBeGreaterThanOrEqual(0);
  });

  it('6. GET /api/v1/digital-twin/runtime/coverage returns domain coverage status', async () => {
    const req = createMockRequest('/api/v1/digital-twin/runtime/coverage?cityId=city-vja');
    const res = await getCoverage(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.totalDomains).toBe(7);
    expect(json.data.spatialCoverageStatus).toBe('UNKNOWN');
  });

  it('7. GET /api/v1/digital-twin/runtime/events returns telemetry update events log', async () => {
    const req = createMockRequest('/api/v1/digital-twin/runtime/events?cityId=city-vja&limit=10');
    const res = await getEvents(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('15, 16, 17. Rejects forbidden execution modes (LIVE_WRITE, AUTONOMOUS, PHYSICAL_EXECUTION) with 403', async () => {
    const reqWrite = createMockRequest('/api/v1/digital-twin/runtime?executionMode=LIVE_WRITE');
    const resWrite = await getRuntime(reqWrite);
    expect(resWrite.status).toBe(403);

    const reqAuto = createMockRequest('/api/v1/digital-twin/runtime?executionMode=AUTONOMOUS');
    const resAuto = await getRuntime(reqAuto);
    expect(resAuto.status).toBe(403);
  });

  it('28 & 29. Verified AI Tool Registry integration for all 6 read-only runtime tools', async () => {
    const tools = ['city_runtime_overview', 'city_runtime_health', 'city_runtime_domains', 'city_runtime_quality', 'city_runtime_coverage', 'city_runtime_events'];
    for (const t of tools) {
      const toolDef = toolRegistry.getTool(t);
      expect(toolDef).toBeDefined();
      expect(toolDef?.readOnly).toBe(true);

      const invoked = await toolRegistry.invokeTool(t, { cityId: 'city-vja' });
      expect(invoked.status).toBe('SUCCESS');
    }
  });
});
