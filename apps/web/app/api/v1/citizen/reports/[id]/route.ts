// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/citizen/reports/[id]
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryCitizenReportRepository } from '@/lib/server/repositories/citizen-report.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;
    const report = await memoryCitizenReportRepository.findById(id);

    if (!report) {
      return NextResponse.json({ error: 'Citizen report not found' }, { status: 404 });
    }

    return NextResponse.json({ data: report });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
