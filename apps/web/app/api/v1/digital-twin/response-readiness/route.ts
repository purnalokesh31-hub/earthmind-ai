import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryCityResponseReadinessRepository } from '@/lib/server/repositories/city-response-readiness.repository';

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

    const list = memoryCityResponseReadinessRepository.listReadiness(cityId, status as any);

    return NextResponse.json({
      success: true,
      data: list,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'EXECUTION_READINESS',
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
    if (!body.interventionId || !body.cityId || !body.title) {
      return NextResponse.json({ success: false, error: 'INVALID_INPUT: interventionId, cityId, and title are required.' }, { status: 400 });
    }

    const entity = memoryCityResponseReadinessRepository.createReadiness({
      interventionId: body.interventionId,
      cityId: body.cityId,
      title: body.title,
      description: body.description || '',
      targetSector: body.targetSector,
      actions: body.actions,
      metadata: body.metadata,
    });

    return NextResponse.json(
      {
        success: true,
        data: entity,
        requiresHumanApproval: true,
        advisoryOnly: true,
        autonomousExecution: false,
        provenance: 'EXECUTION_READINESS',
      },
      { status: 201 }
    );
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('token') || err.message?.includes('Authentication') || err.message?.includes('UNAUTHORIZED') ? 401 : err.message?.includes('FORBIDDEN') ? 403 : 500);
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: statusCode });
  }
}
