import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityCommandEvidenceService } from '@/lib/server/services/city-command-evidence.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.reason || !body.requiredEvidence || !Array.isArray(body.requiredEvidence)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT: Mandatory reason and array of requiredEvidence are required.' },
        { status: 400 }
      );
    }

    const reqDto = cityCommandEvidenceService.requestEvidence({
      caseId: id,
      requestedBy: auth.userId,
      reason: body.reason,
      requiredEvidence: body.requiredEvidence,
    });

    return NextResponse.json({
      success: true,
      data: reqDto,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'GOVERNANCE',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'EVIDENCE_REQUEST_FAILED' }, { status: 400 });
  }
}
