import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryCityResilienceReadinessRepository } from '@/lib/server/repositories/city-resilience-readiness.repository';
import { cityResilienceReadinessOrchestratorService } from '@/lib/server/services/city-resilience-readiness-orchestrator.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    const existing = memoryCityResilienceReadinessRepository.getReadiness(id);

    const input = {
      cityId: existing?.cityId || 'city-vja',
      title: existing?.title || 'Resilience Preparedness Run',
      description: existing?.description || 'Run pipeline',
    };

    const result = cityResilienceReadinessOrchestratorService.runMasterReadinessOrchestration(input);

    return NextResponse.json({
      success: true,
      data: result,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'RESILIENCE_PREPAREDNESS',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'ORCHESTRATION_FAILED' }, { status: 400 });
  }
}
