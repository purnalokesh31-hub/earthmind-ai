import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { cityGovernanceEvaluationService } from '@/lib/server/services/city-governance-evaluation.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.targetId || typeof body.riskScore !== 'number') {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT: targetId and numeric riskScore are required.' },
        { status: 400 }
      );
    }

    const evaluation = cityGovernanceEvaluationService.evaluateGovernancePipeline({
      targetId: body.targetId,
      cityId: body.cityId || 'city-vja',
      riskScore: body.riskScore,
      confidenceScorePercent: body.confidenceScorePercent ?? 85,
      availableEvidenceCount: body.availableEvidenceCount,
      requiredEvidenceCount: body.requiredEvidenceCount,
      impactedDomains: body.impactedDomains,
      populationImpactCount: body.populationImpactCount,
      financialImpactUsd: body.financialImpactUsd,
      requiresHumanApproval: body.requiresHumanApproval ?? true,
      metadata: body.metadata,
      provenance: body.provenance || 'GOVERNANCE',
    });

    return NextResponse.json({
      success: true,
      data: evaluation,
      requiresHumanApproval: true,
      provenance: 'GOVERNANCE',
    });
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('token') || err.message?.includes('Authentication') || err.message?.includes('UNAUTHORIZED') ? 401 : err.message?.includes('FORBIDDEN') ? 403 : 500);
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: statusCode });
  }
}
