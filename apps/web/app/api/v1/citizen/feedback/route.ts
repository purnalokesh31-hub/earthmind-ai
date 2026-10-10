// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: POST /api/v1/citizen/feedback
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { citizenFeedbackService } from '@/lib/server/services/citizen-feedback.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const body = await req.json();

    if (!body.reportId || !body.satisfactionScore) {
      return NextResponse.json({ error: 'reportId and satisfactionScore are required' }, { status: 400 });
    }

    const fb = await citizenFeedbackService.recordFeedback({
      reportId: body.reportId,
      citizenId: user.userId || 'usr-cit-101',
      satisfactionScore: body.satisfactionScore,
      resolutionQualityScore: body.resolutionQualityScore || body.satisfactionScore,
      responseSpeedScore: body.responseSpeedScore || body.satisfactionScore,
      communicationQualityScore: body.communicationQualityScore || body.satisfactionScore,
      comments: body.comments,
    });

    return NextResponse.json({ data: fb, message: 'Citizen feedback recorded successfully' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
