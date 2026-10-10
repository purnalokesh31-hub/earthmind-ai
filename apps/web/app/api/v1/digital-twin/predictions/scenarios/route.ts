// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET / POST /api/v1/digital-twin/predictions/scenarios
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityPredictionScenarioService } from '@/lib/server/services/city-prediction-scenario.service';

export const dynamic = 'force-dynamic';

const VALID_DOMAINS = ['CLIMATE', 'MOBILITY', 'TRANSIT', 'UTILITY', 'EMERGENCY_RESPONSE', 'CITIZEN_INTELLIGENCE'];
const VALID_SEVERITIES = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const scenarios = await cityPredictionScenarioService.listScenarios(cityId);
    return NextResponse.json({ data: scenarios, total: scenarios.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    const body = await req.json();

    if (!body.title || !body.cityId || !body.scenarioType || !body.severityLevel || !body.horizon) {
      return NextResponse.json({ error: 'Missing required scenario parameters' }, { status: 400 });
    }

    if (!VALID_SEVERITIES.includes(body.severityLevel)) {
      return NextResponse.json({ error: `Invalid severityLevel: ${body.severityLevel}` }, { status: 400 });
    }

    if (Array.isArray(body.variables)) {
      for (const v of body.variables) {
        if (v.domain && !VALID_DOMAINS.includes(v.domain)) {
          return NextResponse.json({ error: `Invalid domain name: ${v.domain}` }, { status: 400 });
        }
      }
    }

    const scenario = await cityPredictionScenarioService.createScenario(body);
    return NextResponse.json({ data: scenario }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Bad Request' }, { status: err.statusCode || 400 });
  }
}
