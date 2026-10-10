import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityResponseOutcomeService } from '@/lib/server/services/city-response-outcome.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const deviation = cityResponseOutcomeService.compareExpectedVsObserved(id);

    return NextResponse.json({
      success: true,
      data: deviation,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'OUTCOME_VALIDATION',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'DEVIATION_ANALYSIS_FAILED' }, { status: 400 });
  }
}
