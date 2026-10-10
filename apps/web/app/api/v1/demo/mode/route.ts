// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Dedicated Demo Mode REST API
// Interactive controls: START, RESET, REPLAY, AUDIT
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { demoModeService } from '@/lib/server/demo/demo-mode.service';
import { logger } from '@/lib/server/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');

    if (mode === 'audit') {
      const audit = demoModeService.getAuditTrail();
      return NextResponse.json({ success: true, audit }, { status: 200 });
    }

    const demoState = demoModeService.getDemoState();
    return NextResponse.json({ success: true, demo: demoState }, { status: 200 });
  } catch (error: any) {
    logger.error('[API /demo/mode GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'INTERNAL_SERVER_ERROR' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'START';
    const scenarioId = body.scenarioId || 'CITY_FLOOD_CASCADE_DEMO';

    let result;

    switch (action) {
      case 'START':
        result = await demoModeService.startDemo(scenarioId);
        break;
      case 'RESET':
        result = demoModeService.resetDemo();
        break;
      case 'REPLAY':
        result = await demoModeService.replayDemo();
        break;
      case 'EXIT':
        result = demoModeService.resetDemo();
        break;
      default:
        result = demoModeService.getDemoState();
    }

    return NextResponse.json({ success: true, action, demo: result }, { status: 200 });
  } catch (error: any) {
    logger.error('[API /demo/mode POST] Error:', error);
    return NextResponse.json(
      { error: error.message || 'INTERNAL_SERVER_ERROR' },
      { status: error.statusCode || 500 }
    );
  }
}
