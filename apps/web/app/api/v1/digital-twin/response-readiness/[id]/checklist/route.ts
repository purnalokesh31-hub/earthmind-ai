import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityResponseChecklistService } from '@/lib/server/services/city-response-checklist.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const checklist = cityResponseChecklistService.generateChecklist(id);

    return NextResponse.json({
      success: true,
      data: checklist,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'RESPONSE_READINESS',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'CHECKLIST_FAILED' }, { status: 400 });
  }
}
