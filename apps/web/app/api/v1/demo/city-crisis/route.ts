// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — City Crisis Demonstration Scenario REST API
// Scenario: DEMO_CITY_CRISIS_001
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityCrisisDemoService } from '@/lib/server/demo/city-crisis-demo.service';
import { logger } from '@/lib/server/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const result = await cityCrisisDemoService.runDemoScenario();
    return NextResponse.json({ success: true, demo: result }, { status: 200 });
  } catch (error: any) {
    logger.error('[API /demo/city-crisis GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'INTERNAL_SERVER_ERROR' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const body = await req.json().catch(() => ({}));
    const result = await cityCrisisDemoService.runDemoScenario({
      cityId: body.cityId,
      requestedByUserId: user?.userId,
    });
    return NextResponse.json({ success: true, demo: result }, { status: 200 });
  } catch (error: any) {
    logger.error('[API /demo/city-crisis POST] Error:', error);
    return NextResponse.json(
      { error: error.message || 'INTERNAL_SERVER_ERROR' },
      { status: error.statusCode || 500 }
    );
  }
}
