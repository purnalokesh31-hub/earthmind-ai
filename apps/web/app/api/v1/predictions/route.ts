// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/predictions
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryPredictionRepository } from '@/lib/server/repositories/prediction.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const scopeId = searchParams.get('scopeId') || undefined;

    const predictions = await memoryPredictionRepository.listActive(scopeId);
    return NextResponse.json({ data: predictions, total: predictions.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
