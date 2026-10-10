// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/utilities/optimizations/[id]/recommendation
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { utilityRecoveryOptimizationService } from '@/lib/server/services/utility-recovery-optimization.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const scenario = await utilityRecoveryOptimizationService.getScenarioById(id);
    if (!scenario || !scenario.recommendation) {
      return NextResponse.json({ error: 'Optimization recommendation not found' }, { status: 404 });
    }

    return NextResponse.json({ data: scenario.recommendation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
