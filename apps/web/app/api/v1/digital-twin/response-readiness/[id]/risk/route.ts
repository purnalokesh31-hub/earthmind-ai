import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityResponseReadinessRiskService } from '@/lib/server/services/city-response-readiness-risk.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const risk = cityResponseReadinessRiskService.evaluateReadinessRisk(id);

    return NextResponse.json({
      success: true,
      data: risk,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'RESPONSE_READINESS',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'RISK_EVALUATION_FAILED' }, { status: 400 });
  }
}
