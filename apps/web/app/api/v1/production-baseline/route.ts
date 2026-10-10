// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Production Baseline & System Readiness API Route
// Exposes central version manifest and live production readiness check
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { earthMindProductionReadinessService } from '@/lib/server/services/earthmind-production-readiness.service';
import { EARTHMIND_PRODUCTION_BASELINE_MANIFEST } from '@/lib/server/config/earthmind-production-baseline.manifest';
import { logger } from '@/lib/server/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'full';

    if (mode === 'manifest') {
      return NextResponse.json({
        success: true,
        manifest: EARTHMIND_PRODUCTION_BASELINE_MANIFEST,
      }, { status: 200 });
    }

    const report = earthMindProductionReadinessService.validateProductionReadiness();

    return NextResponse.json({
      success: true,
      report,
    }, { status: 200 });
  } catch (error: any) {
    logger.error('[API /production-baseline GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'INTERNAL_SERVER_ERROR' },
      { status: error.statusCode || 500 }
    );
  }
}
