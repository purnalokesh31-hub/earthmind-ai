// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/utilities/telemetry
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { utilityTelemetryService } from '@/lib/server/services/utility-telemetry.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId') || 'ast-pow-tx-102';

    const telemetry = await utilityTelemetryService.getLatestTelemetry(assetId);
    return NextResponse.json({ data: telemetry, total: telemetry.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
