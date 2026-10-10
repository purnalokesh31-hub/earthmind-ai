import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryCityResponseReadinessRepository } from '@/lib/server/repositories/city-response-readiness.repository';
import { cityResponseHandoffService } from '@/lib/server/services/city-response-handoff.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const handoff = memoryCityResponseReadinessRepository.getHandoff(id);

    if (!handoff) {
      return NextResponse.json({ success: false, error: `Handoff package for readiness '${id}' not found.` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: handoff,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'RESPONSE_READINESS',
    });
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('token') || err.message?.includes('Authentication') || err.message?.includes('UNAUTHORIZED') ? 401 : err.message?.includes('FORBIDDEN') ? 403 : 500);
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: statusCode });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const handoffPackage = cityResponseHandoffService.prepareHandoffPackage({
      readinessId: id,
      assignedOperationalOwner: body.assignedOperationalOwner || auth.userId,
      operatorNotes: body.operatorNotes,
    });

    return NextResponse.json({
      success: true,
      data: handoffPackage,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'RESPONSE_READINESS',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'HANDOFF_FAILED' }, { status: 400 });
  }
}
