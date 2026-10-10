// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/warnings/active
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryWarningRepository } from '@/lib/server/repositories/prediction.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const warnings = await memoryWarningRepository.listActive();
    return NextResponse.json({ data: warnings, total: warnings.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
