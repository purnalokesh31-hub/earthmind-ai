// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/operations/health
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { operationalHealthService } from '@/lib/server/services/operational-health.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const health = await operationalHealthService.getHealthSummary();
    return NextResponse.json({ data: health });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
