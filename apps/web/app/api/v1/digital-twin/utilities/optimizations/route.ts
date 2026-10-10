// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET/POST /api/v1/digital-twin/utilities/optimizations
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { utilityRecoveryOptimizationService } from '@/lib/server/services/utility-recovery-optimization.service';
import { memoryUtilityOptimizationRepository } from '@/lib/server/repositories/utility-optimization.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const scenarios = await utilityRecoveryOptimizationService.getScenariosByCity(cityId);
    return NextResponse.json({ data: scenarios, total: scenarios.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    const body = await req.json();

    const newScenario = await memoryUtilityOptimizationRepository.saveScenario({
      scenarioId: `opt-utl-${Date.now()}`,
      input: {
        title: body.title || 'Custom Utility Recovery Strategy',
        cityId: body.cityId || 'city-vja',
        utilityType: body.utilityType || 'ELECTRICITY',
        primaryTargetAssetId: body.primaryTargetAssetId || 'ast-pow-tx-102',
        objective: body.objective || 'BALANCED',
        constraints: body.constraints || {
          maxBudgetUsd: 15000,
          maxDowntimeHours: 4.0,
          maxPopulationImpact: 20000,
          maxCrewUsageCount: 10,
          maxEquipmentUsageCount: 5,
        },
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
