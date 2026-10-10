// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/regional/risk
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { regionalRiskEngine } from '@/lib/server/services/regional-risk.engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const scopeLevel = (searchParams.get('scopeLevel') || 'REGION') as any;
    const scopeId = searchParams.get('scopeId') || 'reg-ap-central';

    const assessment = await regionalRiskEngine.assessRegionalRisk(scopeLevel, scopeId);
    return NextResponse.json({ data: assessment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
