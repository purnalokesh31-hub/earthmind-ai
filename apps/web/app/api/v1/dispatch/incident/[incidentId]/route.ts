// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/dispatch/incident/[incidentId]
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { dispatchService } from '@/lib/server/services/dispatch.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ incidentId: string }> }) {
  try {
    const { incidentId } = await params;
    await authenticate(req);
    const dispatches = await dispatchService.getDispatchesByIncident(incidentId);
    return NextResponse.json({ data: dispatches, total: dispatches.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 401 });
  }
}
