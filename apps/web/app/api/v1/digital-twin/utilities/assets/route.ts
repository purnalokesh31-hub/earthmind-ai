// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/utilities/assets
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryUtilityRepository } from '@/lib/server/repositories/utility.repository';
import { UtilityType } from '@/lib/server/domain/digital-twin/utility.domain';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticate(req);
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || 'city-vja';
    const utilityType = searchParams.get('utilityType') as UtilityType | undefined;

    const assets = await memoryUtilityRepository.listAssetsByCityId(cityId, utilityType);
    return NextResponse.json({ data: assets, total: assets.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
