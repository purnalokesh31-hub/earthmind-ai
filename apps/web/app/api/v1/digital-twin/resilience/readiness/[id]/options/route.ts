import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityPreparednessOptionService } from '@/lib/server/services/city-preparedness-option.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const options = cityPreparednessOptionService.generatePreparednessOptions(id);

    return NextResponse.json({
      success: true,
      data: options,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'RESILIENCE_PREPAREDNESS',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'OPTIONS_GENERATION_FAILED' }, { status: 400 });
  }
}
