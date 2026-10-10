// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/predictions/feedback
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { predictionFeedbackService } from '@/lib/server/services/prediction-feedback.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const body = await req.json();

    if (!body.predictionId) {
      return NextResponse.json({ error: 'predictionId is required' }, { status: 400 });
    }

    const fb = await predictionFeedbackService.recordFeedback({
      predictionId: body.predictionId,
      actualIncidentsCount: body.actualIncidentsCount || 0,
      reviewedBy: user.email || 'Duty Officer',
      notes: body.notes,
    });

    return NextResponse.json({ data: fb, message: 'Feedback recorded successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
