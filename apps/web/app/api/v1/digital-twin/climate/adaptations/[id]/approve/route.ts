// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/digital-twin/climate/adaptations/[id]/approve
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { climateAdaptationService } from '@/lib/server/services/climate-adaptation.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const approved = await climateAdaptationService.approveAdaptation(id);
    return NextResponse.json({ data: approved, message: 'Climate adaptation recommendation approved by human operator' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
