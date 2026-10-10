import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryCityGovernanceRepository } from '@/lib/server/repositories/city-governance.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;

    const policies = memoryCityGovernanceRepository.listPolicies(status as any, category as any);

    return NextResponse.json({
      success: true,
      data: policies,
      requiresHumanApproval: true,
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
    if (!body.name || !body.category) {
      return NextResponse.json({ success: false, error: 'INVALID_INPUT: name and category are required.' }, { status: 400 });
    }

    const policy = memoryCityGovernanceRepository.createPolicy({
      ...body,
      createdBy: auth.userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: policy,
        requiresHumanApproval: true,
        provenance: 'GOVERNANCE',
      },
      { status: 201 }
    );
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('token') || err.message?.includes('Authentication') || err.message?.includes('UNAUTHORIZED') ? 401 : err.message?.includes('FORBIDDEN') ? 403 : 500);
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: statusCode });
  }
}
