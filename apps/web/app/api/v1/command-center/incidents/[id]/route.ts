// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/command-center/incidents/[id]
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { commandCenterService } from '@/lib/server/services/command-center.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await authenticate(req);
    const detail = await commandCenterService.getIncidentWorkspaceDetail(id);
    if (!detail) {
      return NextResponse.json({ error: 'Incident workspace detail not found' }, { status: 404 });
    }
    return NextResponse.json({ data: detail });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
