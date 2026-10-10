// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/utilities/optimizations/pressure-regulation
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { waterPressureRegulationService } from '@/lib/server/services/water-pressure-regulation.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const pipelineAssetId = searchParams.get('pipelineAssetId') || 'ast-wtr-pipe-202';

    const regulation = await waterPressureRegulationService.calculatePressureRegulation(pipelineAssetId);
    return NextResponse.json({ data: regulation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
