// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/citizen/reports/[id]/verify
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { citizenFeedbackService } from '@/lib/server/services/citizen-feedback.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticate(req);
    const { id } = await params;
    const body = await req.json();

    if (!body.verificationOption) {
      return NextResponse.json({ error: 'verificationOption is required' }, { status: 400 });
    }

    const updated = await citizenFeedbackService.processVerification({
      reportId: id,
      citizenId: user.userId || 'usr-cit-101',
      verificationOption: body.verificationOption,
      note: body.note,
    });

    return NextResponse.json({ data: updated, message: 'Resolution verification recorded' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
