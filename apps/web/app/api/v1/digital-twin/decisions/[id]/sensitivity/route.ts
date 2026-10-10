// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Phase 7.9.4 REST API Route
// GET /api/v1/digital-twin/decisions/[id]/sensitivity
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionOptionService } from '@/lib/server/services/city-decision-option.service';
import { cityDecisionSensitivityService } from '@/lib/server/services/city-decision-sensitivity.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const options = cityDecisionOptionService.generateOptions(id, 'city-vja');
    const sensitivityReport = cityDecisionSensitivityService.analyzeSensitivity(id, options);

    return NextResponse.json({
      success: true,
      data: sensitivityReport,
      meta: {
        decisionId: id,
        dataSource: 'SIMULATION',
        requiresHumanApproval: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch decision sensitivity analysis' },
      { status: err.statusCode || 500 }
    );
  }
}
