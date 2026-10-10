// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/utilities/predictions/degradation
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { utilityAnomalyTrendService } from '@/lib/server/services/utility-anomaly-trend.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId') || 'ast-pow-tx-102';

    const trends = await utilityAnomalyTrendService.detectAnomalyTrends(assetId);
    return NextResponse.json({ data: trends, total: trends.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
