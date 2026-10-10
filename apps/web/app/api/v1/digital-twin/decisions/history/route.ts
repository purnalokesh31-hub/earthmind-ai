// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.3 GET Decision Audit History API Route
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionOrchestratorService } from '@/lib/server/services/city-decision-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);

    const history = await cityDecisionOrchestratorService.getDecisionHistory();

    return NextResponse.json({
      success: true,
      data: history,
      count: Array.isArray(history) ? history.length : ((history as any)?.auditEvents?.length || 0),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch decision audit history' },
      { status: err.statusCode || 401 }
    );
  }
}
