// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: /api/v1/digital-twin/optimizations
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryDigitalTwinOptimizationRepository } from '@/lib/server/repositories/digital-twin-optimization.repository';
import { digitalTwinOptimizationService } from '@/lib/server/services/digital-twin-optimization.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const scenarios = await memoryDigitalTwinOptimizationRepository.listByCityId(cityId);
    return NextResponse.json({ data: scenarios, total: scenarios.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const scenario = await digitalTwinOptimizationService.createScenario(
      body.title,
      body.description || '',
      body.cityId || 'city-vja',
      body.totalBudgetInr || 1500000,
      user.userId || 'dutycommander@earthmind.gov',
      body.objectives,
      body.simulationScenarioId
    );

    return NextResponse.json({ data: scenario, message: 'Optimization scenario created successfully' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
