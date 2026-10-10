// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.10 Mega Prompt 4/6
// Get Resources Allocation API Route
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityInterventionOrchestratorService } from '@/lib/server/services/city-intervention-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authenticate(req);
    const { id } = await params;

    const resources = cityInterventionOrchestratorService.getResources(id);
    return NextResponse.json({
      success: true,
      data: resources,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
      { status: err.statusCode || 401 }
    );
  }
}
