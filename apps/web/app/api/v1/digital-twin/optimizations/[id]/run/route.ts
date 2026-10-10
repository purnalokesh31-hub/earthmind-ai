// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/optimizations/[id]/run
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { digitalTwinOptimizationService } from '@/lib/server/services/digital-twin-optimization.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const recommendation = await digitalTwinOptimizationService.runOptimization(id);
    return NextResponse.json({ data: recommendation, message: 'Optimization algorithm executed successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
