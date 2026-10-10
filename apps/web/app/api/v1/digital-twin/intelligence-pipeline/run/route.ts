import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrPrototypeUser, commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { envConfig } from '@/lib/server/config';
import { phase7PipelineBridgeService } from '@/lib/server/services/phase7-pipeline-bridge.service';

export async function POST(req: NextRequest) {
  try {
    // This route had no authentication at all despite executing real pipeline logic against a
    // client-supplied cityId/executionMode — requires COMMANDER or above.
    if (envConfig.REPOSITORY_DRIVER === 'memory') {
      await authenticateOrPrototypeUser(req);
    } else {
      await commanderOnly(req);
    }
    const body = await req.json().catch(() => ({}));
    const cityId = body.cityId || 'city-vja';
    const mode = body.executionMode || 'LIVE_READ_ONLY';

    if (['LIVE_WRITE', 'AUTONOMOUS', 'PHYSICAL_EXECUTION'].includes(mode)) {
      return NextResponse.json(
        {
          error: 'AUTONOMOUS_EXECUTION_FORBIDDEN',
          message: `Execution mode '${mode}' is strictly forbidden. Real-world physical writeback is not permitted.`,
        },
        { status: 403 }
      );
    }

    const context = await phase7PipelineBridgeService.runUnifiedPipeline(cityId, mode);
    return NextResponse.json({
      success: true,
      data: context,
      governance: {
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
      },
    });
  } catch (err: any) {
    if (err.statusCode) {
      return NextResponse.json({ error: err.errorCode || 'PIPELINE_RUN_FAILED', message: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'PIPELINE_RUN_FAILED', message: err.message }, { status: 500 });
  }
}
