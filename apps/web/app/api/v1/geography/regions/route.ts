// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/geography/regions
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryGeographyRepository } from '@/lib/server/repositories/geography.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const regions = await memoryGeographyRepository.listRegions();
    return NextResponse.json({ data: regions, total: regions.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
