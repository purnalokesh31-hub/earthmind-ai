// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/predictions/simulations/[id]/approve
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityPredictionSimulationService } from '@/lib/server/services/city-prediction-simulation.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authContext = await authenticate(req);
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    const scenario = await cityPredictionSimulationService.approveRecommendation(
      id,
      authContext.userId,
      body.notes
    );

    return NextResponse.json({ data: scenario });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Approval failed' }, { status: 400 });
  }
}
