import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityResponseReadinessService } from '@/lib/server/services/city-response-readiness.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const evaluated = cityResponseReadinessService.evaluateResponseReadiness(id);

    return NextResponse.json({
      success: true,
      data: evaluated,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'EXECUTION_READINESS',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'ASSESSMENT_FAILED' }, { status: 400 });
  }
}
