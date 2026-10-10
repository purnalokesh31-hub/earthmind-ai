// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/assets/[id]
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryInfrastructureAssetRepository } from '@/lib/server/repositories/digital-twin.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;
    const asset = await memoryInfrastructureAssetRepository.findById(id);

    if (!asset) {
      return NextResponse.json({ error: 'Infrastructure asset not found' }, { status: 404 });
    }

    return NextResponse.json({ data: asset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
