// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — API Route: GET /api/v1/digital-twin/simulations/[id]
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/server/auth/middleware.helpers';
import { memoryDigitalTwinSimulationRepository } from '@/lib/server/repositories/digital-twin-simulation.repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authenticate(req);
    const { id } = await params;
    const scenario = await memoryDigitalTwinSimulationRepository.findById(id);

    if (!scenario) {
      return NextResponse.json({ error: 'Simulation scenario not found' }, { status: 404 });
    }

    return NextResponse.json({ data: scenario });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 401 });
  }
}
