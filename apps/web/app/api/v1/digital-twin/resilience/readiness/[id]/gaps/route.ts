import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityResilienceGapService } from '@/lib/server/services/city-resilience-gap.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const gaps = cityResilienceGapService.detectCapabilityGaps(id);

    return NextResponse.json({
      success: true,
      data: gaps,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'RESILIENCE_PREPAREDNESS',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'GAP_DETECTION_FAILED' }, { status: 400 });
  }
}
