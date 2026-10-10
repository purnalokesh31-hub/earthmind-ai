// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/utilities/optimizations/load-balance
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { gridLoadBalancingService } from '@/lib/server/services/grid-load-balancing.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const sourceAssetId = searchParams.get('sourceAssetId') || 'ast-pow-tx-102';
    const targetAssetId = searchParams.get('targetAssetId') || 'ast-pow-tx-105';

    const loadBalance = await gridLoadBalancingService.calculateLoadBalance(sourceAssetId, targetAssetId);
    return NextResponse.json({ data: loadBalance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
