// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/cross-domain/priority-queue
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityIntelligenceService } from '@/lib/server/services/city-intelligence.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';

    const intel = await cityIntelligenceService.getCitywideIntelligence(cityId);
    return NextResponse.json({ data: intel.priorityQueue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
