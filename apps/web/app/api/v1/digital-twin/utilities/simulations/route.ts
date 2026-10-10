// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET/POST /api/v1/digital-twin/utilities/simulations
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { masterUtilitySimulationService } from '@/lib/server/services/utility-simulation.service';
import { memoryUtilitySimulationRepository } from '@/lib/server/repositories/utility-simulation.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const scenarios = await masterUtilitySimulationService.getScenariosByCity(cityId);
    return NextResponse.json({ data: scenarios, total: scenarios.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    const body = await req.json();

    const newScenario = await memoryUtilitySimulationRepository.saveScenario({
      scenarioId: `sim-utl-${Date.now()}`,
      input: {
        title: body.title || 'Custom Utility Failure Simulation',
        scenarioType: body.scenarioType || 'TRANSFORMER_FAILURE',
        cityId: body.cityId || 'city-vja',
        utilityType: body.utilityType || 'ELECTRICITY',
        targetAssetId: body.targetAssetId || 'ast-pow-tx-102',
        severityMultiplier: body.severityMultiplier || 2.0,
        durationHours: body.durationHours || 12,
      },
      status: 'CREATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ data: newScenario }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
