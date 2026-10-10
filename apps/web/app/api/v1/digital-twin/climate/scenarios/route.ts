// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: /api/v1/digital-twin/climate/scenarios
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryClimateResilienceRepository } from '@/lib/server/repositories/climate-resilience.repository';
import { climateScenarioService } from '@/lib/server/services/climate-scenario.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const list = await memoryClimateResilienceRepository.listScenariosByCityId(cityId);
    return NextResponse.json({ data: list, total: list.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const body = await req.json();

    if (!body.title || !body.hazardType) {
      return NextResponse.json({ error: 'title and hazardType are required' }, { status: 400 });
    }

    const scenario = await climateScenarioService.createScenario(
      body.title,
      body.description || '',
      body.cityId || 'city-vja',
      body.hazardType,
      body.intensityLevel || 'SEVERE',
      body.horizon || 'NEXT_30_DAYS',
      user.userId || 'dutycommander@earthmind.gov',
      body.assumptions || []
    );

    return NextResponse.json({ data: scenario, message: 'Climate hazard scenario created successfully' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
