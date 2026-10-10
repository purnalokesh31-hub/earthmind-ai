import { NextResponse } from 'next/server';
import { phase7PipelineBridgeService } from '@/lib/server/services/phase7-pipeline-bridge.service';

export async function GET() {
  const pipelines = phase7PipelineBridgeService.listPipelines();
  return NextResponse.json({
    success: true,
    data: pipelines,
    governance: {
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
    },
  });
}
