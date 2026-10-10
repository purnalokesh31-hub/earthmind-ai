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

    const summary = memoryCityGovernanceRepository.getSummary();

    return NextResponse.json({
      success: true,
      data: summary,
      requiresHumanApproval: true,
      provenance: 'GOVERNANCE',
    });
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('token') || err.message?.includes('Authentication') || err.message?.includes('UNAUTHORIZED') ? 401 : err.message?.includes('FORBIDDEN') ? 403 : 500);
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: statusCode });
  }
}
