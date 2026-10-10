// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET/POST /api/v1/digital-twin/utilities/operations
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { utilityOperationsOrchestratorService } from '@/lib/server/services/utility-operations-orchestrator.service';
import { memoryUtilityOperationsRepository } from '@/lib/server/repositories/utility-operations.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const cycles = await utilityOperationsOrchestratorService.getCyclesByCity(cityId);
    return NextResponse.json({ data: cycles, total: cycles.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    const body = await req.json();

    const newCycle = await memoryUtilityOperationsRepository.saveCycle({
      cycleId: `cyc-utl-${Date.now()}`,
      input: {
        title: body.title || 'Custom Utility Closed-Loop Operational Intelligence',
        cityId: body.cityId || 'city-vja',
        utilityType: body.utilityType || 'ELECTRICITY',
        primaryTargetAssetId: body.primaryTargetAssetId || 'ast-pow-tx-102',
      },
      status: 'OBSERVING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ data: newCycle }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
