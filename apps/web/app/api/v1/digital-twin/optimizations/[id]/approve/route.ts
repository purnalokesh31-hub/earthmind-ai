// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/optimizations/[id]/approve
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { digitalTwinOptimizationService } from '@/lib/server/services/digital-twin-optimization.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticate(req);
    const { id } = await params;

    const scenario = await digitalTwinOptimizationService.approveOptimization(
      id,
      user.userId || 'usr-commander-101'
    );

    return NextResponse.json({ data: scenario, message: 'Optimization plan approved by authorized human operator' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
