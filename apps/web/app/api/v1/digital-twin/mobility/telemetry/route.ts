// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/mobility/telemetry
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { mobilityTelemetryService } from '@/lib/server/services/mobility-telemetry.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const segmentId = searchParams.get('segmentId') || 'seg-rd-101';

    const telemetry = await mobilityTelemetryService.getSegmentTelemetry(segmentId);
    return NextResponse.json({ data: telemetry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
