import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityDecisionImpactService } from '@/lib/server/services/city-decision-impact.service';
import { cityMitigationCandidateService } from '@/lib/server/services/city-mitigation-candidate.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;
    const candidates = cityMitigationCandidateService.generateCandidates(id, 'city-vja');
    const impact = cityDecisionImpactService.calculateImpact(88.5, candidates[0]);

    return NextResponse.json({
      success: true,
      data: impact,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
      { status: err.statusCode || 401 }
    );
  }
}
