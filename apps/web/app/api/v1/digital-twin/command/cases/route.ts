import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryCityCommandRepository } from '@/lib/server/repositories/city-command.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || undefined;
    const status = searchParams.get('status') || undefined;

    const cases = memoryCityCommandRepository.listCases(cityId, status as any);

    return NextResponse.json({
      success: true,
      data: cases,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'GOVERNANCE',
    });
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('token') || err.message?.includes('Authentication') || err.message?.includes('UNAUTHORIZED') ? 401 : err.message?.includes('FORBIDDEN') ? 403 : 500);
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.title || !body.cityId || !body.sourceType) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT: title, cityId, and sourceType are required.' },
        { status: 400 }
      );
    }

    const newCase = memoryCityCommandRepository.createCase({
      title: body.title,
      description: body.description || '',
      cityId: body.cityId,
      sourceType: body.sourceType,
      sourceReferenceId: body.sourceReferenceId || 'ref-0',
      riskScore: body.riskScore ?? 50,
      riskTier: body.riskTier || 'ELEVATED',
      confidenceScore: body.confidenceScore ?? 80,
      confidenceLevel: body.confidenceLevel || 'HIGH_CONFIDENCE',
      populationImpact: body.populationImpact,
      serviceImpact: body.serviceImpact,
      financialImpactUsd: body.financialImpactUsd,
      requiredAuthorizationLevel: body.requiredAuthorizationLevel || 'OPERATOR',
      recommendation: body.recommendation,
      metadata: body.metadata,
    });

    return NextResponse.json(
      {
        success: true,
        data: newCase,
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
        provenance: 'GOVERNANCE',
      },
      { status: 201 }
    );
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('token') || err.message?.includes('Authentication') || err.message?.includes('UNAUTHORIZED') ? 401 : err.message?.includes('FORBIDDEN') ? 403 : 500);
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: statusCode });
  }
}
