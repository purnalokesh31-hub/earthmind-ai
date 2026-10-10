import { NextRequest, NextResponse } from 'next/server';
import { commanderOnly } from '@/lib/server/auth/middleware.helpers';
import { memoryCityCommandRepository } from '@/lib/server/repositories/city-command.repository';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await commanderOnly(req);

    const { id } = await params;
    const updated = memoryCityCommandRepository.updateCaseStatus(id, 'UNDER_REVIEW', auth.userId, 'Operator initiated review');

    return NextResponse.json({
      success: true,
      data: updated,
      requiresHumanApproval: true,
      advisoryOnly: true,
      autonomousExecution: false,
      provenance: 'GOVERNANCE',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'INTERNAL_ERROR' }, { status: err.statusCode || 400 });
  }
}
