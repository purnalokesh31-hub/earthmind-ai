import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityOperationalHistoryService } from '@/lib/server/services/city-operational-history.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';
    const timeWindow = searchParams.get('timeWindow') || '24h';

    const history = cityOperationalHistoryService.getHistoricalPerformance(cityId, timeWindow);

    return NextResponse.json({
      success: true,
      data: history,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'EXECUTION_READINESS',
    });
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('token') || err.message?.includes('Authentication') || err.message?.includes('UNAUTHORIZED') ? 401 : err.message?.includes('FORBIDDEN') ? 403 : 500);
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: statusCode });
  }
}
