// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/transit/telemetry
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { transitTelemetryService } from '@/lib/server/services/transit-telemetry.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId') || 'vh-bus-101';

    const telemetry = await transitTelemetryService.getVehicleTelemetry(vehicleId);
    return NextResponse.json({ data: telemetry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
