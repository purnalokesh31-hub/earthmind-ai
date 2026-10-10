import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { memoryCityGovernanceRepository } from '@/lib/server/repositories/city-governance.repository';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Suspending a governance policy is a high-risk action — requires COMMANDER or above.
    const auth = await commanderOnly(req);

    const { id } = await params;
    const updated = memoryCityGovernanceRepository.setPolicyStatus(id, 'SUSPENDED', auth.userId);

    return NextResponse.json({
      success: true,
      data: updated,
      requiresHumanApproval: true,
      provenance: 'GOVERNANCE',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: err.statusCode || 400 });
  }
}
