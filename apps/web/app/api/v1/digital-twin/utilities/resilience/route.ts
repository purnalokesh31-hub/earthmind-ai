// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/utilities/resilience
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { utilityResilienceService } from '@/lib/server/services/utility-resilience.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId') || 'ast-pow-tx-102';

    const resilience = await utilityResilienceService.calculateResilienceScore(assetId);
    return NextResponse.json({ data: resilience });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
