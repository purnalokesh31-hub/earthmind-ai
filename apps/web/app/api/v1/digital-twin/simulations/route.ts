// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: /api/v1/digital-twin/simulations
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryDigitalTwinSimulationRepository } from '@/lib/server/repositories/digital-twin-simulation.repository';
import { digitalTwinSimulationService } from '@/lib/server/services/digital-twin-simulation.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const scenarios = await memoryDigitalTwinSimulationRepository.listByCityId(cityId);
    return NextResponse.json({ data: scenarios, total: scenarios.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const body = await req.json();

    if (!body.title || !body.type) {
      return NextResponse.json({ error: 'title and type are required' }, { status: 400 });
    }

    const scenario = await digitalTwinSimulationService.createScenario(
      body.title,
      body.description || '',
      body.type,
      body.cityId || 'city-vja',
      user.userId || 'dutycommander@earthmind.gov',
      body.inputs || []
    );

    return NextResponse.json({ data: scenario, message: 'Simulation scenario created successfully' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
