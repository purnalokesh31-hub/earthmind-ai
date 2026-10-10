import { NextRequest, NextResponse } from 'next/server';
import { phase7PipelineBridgeService } from '@/lib/server/services/phase7-pipeline-bridge.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = phase7PipelineBridgeService.getPipelineContext(id);

  if (!ctx) {
    return NextResponse.json({ error: 'PIPELINE_NOT_FOUND', message: `Pipeline '${id}' not found.` }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: ctx,
    governance: {
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
    },
  });
}
