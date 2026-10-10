// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/command-center/analytics
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { commandCenterAnalyticsService } from '@/lib/server/services/command-center-analytics.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const timeframe = (searchParams.get('timeframe') || '7_DAYS') as 'TODAY' | '7_DAYS' | '30_DAYS';

    const analytics = await commandCenterAnalyticsService.getOperationalAnalytics(timeframe);
    return NextResponse.json({ data: analytics });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
