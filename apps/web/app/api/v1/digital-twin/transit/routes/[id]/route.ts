// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/transit/routes/[id]
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryTransitRepository } from '@/lib/server/repositories/transit.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;

    const routes = await memoryTransitRepository.listRoutesByCityId('city-vja');
    const route = routes.find((r) => r.routeId === id);

    if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    return NextResponse.json({ data: route });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
