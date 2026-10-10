import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityResponseMonitoringService } from '@/lib/server/services/city-response-monitoring.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const signals = cityResponseMonitoringService.collectMonitoringSignals(id);

    return NextResponse.json({
      success: true,
      data: signals,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'EXECUTION_READINESS',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'MONITORING_FAILED' }, { status: 400 });
  }
}
