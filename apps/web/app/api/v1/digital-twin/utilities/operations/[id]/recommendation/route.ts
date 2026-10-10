// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/utilities/operations/[id]/recommendation
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { utilityOperationsOrchestratorService } from '@/lib/server/services/utility-operations-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const cycle = await utilityOperationsOrchestratorService.getCycleById(id);
    if (!cycle || !cycle.recommendation) {
      return NextResponse.json({ error: 'Operations recommendation not found' }, { status: 404 });
    }

    return NextResponse.json({ data: cycle.recommendation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
