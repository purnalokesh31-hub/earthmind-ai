// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/ai/briefings
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { emergencyBriefingService } from '@/lib/server/ai-agents/emergency-briefing.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get('type') || 'CITY') as any;
    const scopeId = searchParams.get('scopeId') || 'city-vja';

    const briefing = await emergencyBriefingService.generateBriefing(type, scopeId);
    return NextResponse.json({ data: briefing });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
