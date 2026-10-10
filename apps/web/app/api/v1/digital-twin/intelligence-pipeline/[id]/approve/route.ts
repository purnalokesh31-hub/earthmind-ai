import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { phase7PipelineBridgeService } from '@/lib/server/services/phase7-pipeline-bridge.service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // This route had no authentication at all — approving a pipeline run is a high-risk action
    // and requires COMMANDER or above.
    const auth = await commanderOnly(req);
    const body = await req.json().catch(() => ({}));
    const notes = body.notes || 'Human command authorization granted';

    const ctx = phase7PipelineBridgeService.recordHumanApproval(id, auth.userId, notes);
    return NextResponse.json({
      success: true,
      data: ctx,
      governance: {
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
      },
    });
  } catch (err: any) {
    if (err.statusCode) {
      return NextResponse.json({ error: err.errorCode || 'APPROVAL_FAILED', message: err.message }, { status: err.statusCode });
    }
    const status = err.message.includes('DUPLICATE') ? 409 : err.message.includes('NOT_FOUND') ? 404 : 400;
    return NextResponse.json({ error: 'APPROVAL_FAILED', message: err.message }, { status });
  }
}
