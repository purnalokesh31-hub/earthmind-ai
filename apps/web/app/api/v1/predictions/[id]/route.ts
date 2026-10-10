// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/predictions/[id]
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryPredictionRepository } from '@/lib/server/repositories/prediction.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;
    const prediction = await memoryPredictionRepository.findById(id);

    if (!prediction) {
      return NextResponse.json({ error: 'Prediction record not found' }, { status: 404 });
    }

    return NextResponse.json({ data: prediction });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
