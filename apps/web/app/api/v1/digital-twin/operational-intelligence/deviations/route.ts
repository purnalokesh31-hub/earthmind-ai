import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityResponseOutcomeService } from '@/lib/server/services/city-response-outcome.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const readinessId = searchParams.get('readinessId') || 'resp-readiness-101';

    const deviation = cityResponseOutcomeService.compareExpectedVsObserved(readinessId);

    return NextResponse.json({
      success: true,
      data: deviation,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'OUTCOME_VALIDATION',
    });
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('token') || err.message?.includes('Authentication') || err.message?.includes('UNAUTHORIZED') ? 401 : err.message?.includes('FORBIDDEN') ? 403 : 500);
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: statusCode });
  }
}
