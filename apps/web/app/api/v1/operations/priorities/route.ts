// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/operations/priorities
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { priorityIntelligenceService } from '@/lib/server/services/priority-intelligence.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const priorities = await priorityIntelligenceService.getRankedPriorities();
    return NextResponse.json({ data: priorities, total: priorities.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
